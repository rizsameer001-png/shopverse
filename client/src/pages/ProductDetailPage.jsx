import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingCart, Star, Truck, RefreshCw, Shield, ZoomIn, Minus, Plus, Share2, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { fetchProduct, fetchProducts } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toggleWishlist, selectIsWishlisted } from '../store/slices/wishlistSlice';
import { toggleCart } from '../store/slices/uiSlice';
import { Spinner, StarRating } from '../components/common';
import ProductCard from '../components/product/ProductCard';
import { formatPrice, formatDate } from '../utils/helpers';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: product, loading, error, items: related } = useSelector(s => s.products);
  const isWishlisted = useSelector(selectIsWishlisted(product?._id));
  const { user } = useSelector(s => s.auth);

  const [selectedImage, setSelectedImage] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [quantity, setQuantity] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [copied, setCopied] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    dispatch(fetchProduct(slug));
    window.scrollTo(0, 0);
  }, [slug, dispatch]);

  useEffect(() => {
    setSelectedImage(0);
    setSelectedVariants({});
    setQuantity(1);
  }, [product?._id]);

  useEffect(() => {
    if (product?.category?._id) {
      dispatch(fetchProducts({ category: product.category._id, limit: 5 }));
    }
  }, [product?.category?._id, dispatch]);

  if (loading) return <div className="flex justify-center items-center py-40"><Spinner size="lg" /></div>;
  if (error || !product) return (
    <div className="page-container py-20 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h2 className="font-heading text-2xl font-bold text-gray-700 mb-2">Product Not Found</h2>
      <p className="text-gray-400 mb-6">{error || "This product doesn't exist or has been removed."}</p>
      <div className="flex gap-3 justify-center">
        <button onClick={() => navigate(-1)} className="btn-outline px-6">← Go Back</button>
        <Link to="/shop" className="btn-primary px-6">Browse Products</Link>
      </div>
    </div>
  );

  // Compute price correctly, matching admin data
  const rawPrice = product.price || 0;
  const discount = product.discount || 0;
  const displayPrice = discount > 0 ? +(rawPrice * (1 - discount / 100)).toFixed(2) : rawPrice;
  const comparePrice = product.comparePrice || (discount > 0 ? rawPrice : null);

  const images = product.images?.length ? product.images : [];

  const handleMouseMove = (e) => {
    if (!zoom) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPos({ x, y });
  };

  const handleAddToCart = () => {
    const variantStr = Object.entries(selectedVariants).map(([k, v]) => `${k}: ${v}`).join(' | ');
    dispatch(addToCart({ product: { ...product, price: rawPrice, discount }, quantity, variant: variantStr }));
    dispatch(toggleCart());
  };

  const handleWishlist = () => {
    if (!user) { toast.error('Please sign in'); navigate('/login'); return; }
    dispatch(toggleWishlist(product._id));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to review'); return; }
    if (!reviewForm.comment.trim()) { toast.error('Please write a comment'); return; }
    try {
      setSubmittingReview(true);
      await api.post(`/products/${product._id}/reviews`, reviewForm);
      toast.success('Review submitted!');
      dispatch(fetchProduct(slug));
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    } finally { setSubmittingReview(false); }
  };

  const currentImg = images[selectedImage]?.url || 'https://placehold.co/600x600?text=No+Image';

  return (
    <div className="page-container py-8 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8 flex-wrap">
        <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <span className="text-gray-300">/</span>
        <Link to="/shop" className="hover:text-primary-600 transition-colors">Shop</Link>
        {product.category && (
          <>
            <span className="text-gray-300">/</span>
            <Link to={`/shop/${product.category.slug}`} className="hover:text-primary-600 transition-colors">{product.category.name}</Link>
          </>
        )}
        <span className="text-gray-300">/</span>
        <span className="text-gray-800 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 gap-12 mb-16">
        {/* === IMAGE GALLERY === */}
        <div className="space-y-3">
          {/* Main image with zoom */}
          <div
            ref={imgRef}
            className="relative rounded-2xl overflow-hidden bg-gray-50 cursor-crosshair select-none"
            style={{ aspectRatio: '1/1' }}
            onMouseEnter={() => setZoom(true)}
            onMouseLeave={() => setZoom(false)}
            onMouseMove={handleMouseMove}
          >
            <img
              src={currentImg}
              alt={product.name}
              className="w-full h-full object-cover"
              style={zoom ? {
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                transform: 'scale(2.2)',
                transition: 'transform 0.08s ease-out',
              } : { transform: 'scale(1)', transition: 'transform 0.3s ease' }}
              onError={e => e.target.src = 'https://placehold.co/600x600?text=No+Image'}
            />
            {!zoom && (
              <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur rounded-lg p-1.5 pointer-events-none">
                <ZoomIn size={14} className="text-gray-500" />
              </div>
            )}
            {/* Prev / Next arrows */}
            {images.length > 1 && (
              <>
                <button onClick={() => setSelectedImage(p => (p - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition z-10">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setSelectedImage(p => (p + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow hover:bg-white transition z-10">
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === i ? 'border-primary-500 shadow-md scale-105' : 'border-gray-200 hover:border-primary-300 opacity-70 hover:opacity-100'}`}>
                  <img src={img.url} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover"
                    onError={e => e.target.src = 'https://placehold.co/100x100?text=?'} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* === PRODUCT INFO === */}
        <div className="space-y-5">
          {/* Brand */}
          {product.brand && (
            <Link to={`/shop?brand=${product.brand._id}`} className="inline-block text-sm text-primary-600 font-semibold hover:underline">
              {product.brand.name}
            </Link>
          )}

          <h1 className="font-heading text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
            {product.name}
          </h1>

          {/* Rating row */}
          <div className="flex items-center gap-3 flex-wrap">
            <StarRating rating={product.ratings || 0} />
            <span className="text-sm text-gray-500">{(product.ratings || 0).toFixed(1)} · {product.numReviews || 0} reviews</span>
            <span className="text-gray-300">|</span>
            <span className="text-sm text-green-600 font-medium">{product.soldCount || 0} sold</span>
            {product.sku && <span className="text-xs text-gray-400">SKU: {product.sku}</span>}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-gray-900">{formatPrice(displayPrice)}</span>
            {comparePrice && comparePrice > rawPrice && (
              <span className="text-xl text-gray-400 line-through">{formatPrice(comparePrice)}</span>
            )}
            {discount > 0 && (
              <span className="badge bg-red-100 text-red-700 font-bold text-sm px-2.5 py-1">{discount}% OFF</span>
            )}
          </div>

          {/* Short description */}
          {product.shortDescription && (
            <p className="text-gray-600 leading-relaxed border-l-4 border-primary-100 pl-4 py-1">
              {product.shortDescription}
            </p>
          )}

          {/* Variants */}
          {product.variants?.map(variant => (
            <div key={variant.name}>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                {variant.name}
                {selectedVariants[variant.name] && <span className="ml-2 text-primary-600 font-normal">: {selectedVariants[variant.name]}</span>}
              </p>
              <div className="flex gap-2 flex-wrap">
                {variant.options.map(opt => (
                  <button key={opt} onClick={() => setSelectedVariants(p => ({ ...p, [variant.name]: opt }))}
                    className={`px-4 py-2 rounded-xl text-sm border-2 font-medium transition-all ${selectedVariants[variant.name] === opt ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600'}`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity + stock */}
          <div className="flex items-center gap-5 flex-wrap">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Quantity</p>
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden w-fit">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2.5 hover:bg-gray-100 transition-colors disabled:opacity-40" disabled={quantity <= 1}>
                  <Minus size={14} />
                </button>
                <span className="px-4 py-2.5 font-semibold text-gray-800 min-w-[3rem] text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="px-3 py-2.5 hover:bg-gray-100 transition-colors disabled:opacity-40" disabled={quantity >= product.stock}>
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <div className="pt-6">
              {product.stock === 0 ? (
                <span className="text-red-600 font-semibold text-sm">Out of Stock</span>
              ) : product.stock <= (product.lowStockThreshold || 5) ? (
                <span className="text-orange-500 font-medium text-sm">⚠️ Only {product.stock} left!</span>
              ) : (
                <span className="text-green-600 font-medium text-sm">✓ {product.stock} in stock</span>
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3 pt-2">
            <button onClick={handleAddToCart} disabled={product.stock === 0}
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-3.5 text-base disabled:opacity-50 disabled:cursor-not-allowed">
              <ShoppingCart size={18} />
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button onClick={handleWishlist}
              className={`p-3.5 rounded-xl border-2 transition-all ${isWishlisted ? 'bg-rose-500 border-rose-500 text-white' : 'border-gray-200 text-gray-500 hover:border-rose-400 hover:text-rose-500'}`}>
              <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>
            <button onClick={handleShare}
              className="p-3.5 rounded-xl border-2 border-gray-200 text-gray-500 hover:border-gray-300 transition-all">
              {copied ? <Check size={20} className="text-green-500" /> : <Share2 size={20} />}
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
            {[
              { icon: Truck, label: 'Free Shipping', sub: 'Orders over $50' },
              { icon: RefreshCw, label: 'Easy Returns', sub: '30 days' },
              { icon: Shield, label: 'Secure Pay', sub: '100% safe' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex flex-col items-center text-center p-3 rounded-xl bg-gray-50">
                <Icon size={18} className="text-primary-600 mb-1" />
                <span className="text-xs font-semibold text-gray-700">{label}</span>
                <span className="text-[10px] text-gray-400">{sub}</span>
              </div>
            ))}
          </div>

          {/* Category/Tags */}
          <div className="flex flex-wrap gap-2 pt-2 text-xs text-gray-500">
            {product.category && <span>Category: <Link to={`/shop/${product.category.slug}`} className="text-primary-600 hover:underline">{product.category.name}</Link></span>}
            {product.tags?.length > 0 && (
              <span>Tags: {product.tags.map(t => <span key={t} className="inline-block bg-gray-100 rounded px-1.5 py-0.5 mr-1">#{t}</span>)}</span>
            )}
          </div>
        </div>
      </div>

      {/* === TABS === */}
      <div className="border-b border-gray-200 mb-8">
        <div className="flex gap-1 overflow-x-auto">
          {[
            { key: 'description', label: 'Description' },
            { key: 'specifications', label: 'Specifications' },
            { key: 'reviews', label: `Reviews (${product.numReviews || 0})` },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`pb-3 px-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${activeTab === tab.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      {activeTab === 'description' && (
        <div className="max-w-3xl prose prose-sm prose-gray leading-relaxed text-gray-700"
          dangerouslySetInnerHTML={{ __html: (product.description || 'No description available.').replace(/\n/g, '<br/>') }} />
      )}

      {/* Specifications */}
      {activeTab === 'specifications' && (
        <div className="max-w-2xl">
          {product.specifications?.length > 0 ? (
            <div className="rounded-2xl overflow-hidden border border-gray-200">
              <table className="w-full">
                <tbody>
                  {product.specifications.map((spec, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-5 py-3 text-sm font-semibold text-gray-700 w-2/5">{spec.key}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-gray-400 text-sm">No specifications available.</p>}
        </div>
      )}

      {/* Reviews */}
      {activeTab === 'reviews' && (
        <div className="max-w-3xl space-y-8">
          {product.numReviews > 0 && (
            <div className="flex items-center gap-6 p-6 bg-gray-50 rounded-2xl">
              <div className="text-center">
                <div className="text-5xl font-black text-gray-900">{(product.ratings || 0).toFixed(1)}</div>
                <StarRating rating={product.ratings || 0} />
                <p className="text-sm text-gray-500 mt-1">{product.numReviews} reviews</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5,4,3,2,1].map(star => {
                  const count = product.reviews?.filter(r => Math.round(r.rating) === star).length || 0;
                  const pct = product.numReviews ? Math.round((count / product.numReviews) * 100) : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="w-4 text-right">{star}</span>
                      <Star size={10} className="text-amber-400 fill-amber-400" />
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-6">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {product.reviews?.map(review => (
              <div key={review._id} className="p-5 border border-gray-100 rounded-2xl hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-sm font-bold text-primary-600">
                      {review.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{review.name}</p>
                      <StarRating rating={review.rating} size={12} />
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mt-2">{review.comment}</p>
              </div>
            ))}
            {(!product.reviews || product.reviews.length === 0) && (
              <p className="text-gray-400 text-center py-8">No reviews yet. Be the first to review!</p>
            )}
          </div>

          {/* Write review form */}
          {user ? (
            <div className="p-6 border-2 border-dashed border-gray-200 rounded-2xl">
              <h4 className="font-bold text-gray-800 mb-4">Write a Review</h4>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Your Rating</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(star => (
                      <button key={star} type="button" onClick={() => setReviewForm(p => ({ ...p, rating: star }))}>
                        <Star size={28} className={star <= reviewForm.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-300'} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Your Review</label>
                  <textarea required rows={4} placeholder="Share your experience with this product..."
                    value={reviewForm.comment} onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                    className="input-field resize-none" />
                </div>
                <button type="submit" disabled={submittingReview} className="btn-primary px-8">
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-6 border border-gray-200 rounded-2xl">
              <p className="text-gray-500 text-sm mb-3">Sign in to leave a review</p>
              <Link to="/login" className="btn-primary px-6">Sign In</Link>
            </div>
          )}
        </div>
      )}

      {/* Related Products */}
      {related.filter(p => p._id !== product._id).length > 0 && (
        <section className="mt-16">
          <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {related.filter(p => p._id !== product._id).slice(0, 5).map(p => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
