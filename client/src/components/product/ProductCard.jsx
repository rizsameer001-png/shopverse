import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';
import { toggleWishlist, selectIsWishlisted } from '../../store/slices/wishlistSlice';
import { toggleCart } from '../../store/slices/uiSlice';
import { useSettings } from '../../context/SettingsContext';
import toast from 'react-hot-toast';

function getProductImage(product, idx = 0) {
  if (!product?.images?.length) return 'https://placehold.co/400x400?text=No+Image';
  const def = product.images.find(i => i.isDefault);
  return (def || product.images[idx] || product.images[0])?.url || 'https://placehold.co/400x400?text=No+Image';
}

export default function ProductCard({ product }) {
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const isWishlisted = useSelector(selectIsWishlisted(product._id));
  const { user }    = useSelector(s => s.auth);
  const { formatPrice } = useSettings();

  const mainImage  = getProductImage(product, 0);
  const hoverImage = product.images?.length > 1 ? product.images[1]?.url : null;
  const rawPrice   = product.price || 0;
  const discount   = product.discount || 0;
  const displayPrice = discount > 0 ? +(rawPrice * (1 - discount / 100)).toFixed(2) : rawPrice;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return;
    dispatch(addToCart({ product }));
    dispatch(toggleCart());
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Please sign in to save items'); navigate('/login'); return; }
    dispatch(toggleWishlist(product._id));
  };

  return (
    <div className="product-card group cursor-pointer select-none">

      {/* ── Image area keep aspect ratio 4/5─────────────────────────────────────── */}
      {/*<div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: '1/1' }}>*/}
      <div className="relative overflow-hidden bg-gray-50" style={{ aspectRatio: '1/1' }}>

        {/* ── Main image ─────────────────────────────────────
            Key fix: use transform-gpu + will-change: transform to prevent
            rasterization blur during scale transitions. The image itself
            must NOT be scaled — only the container perspective changes.      */}
        <Link to={`/product/${product.slug}`} className="block w-full h-full">
          <div
            className="w-full h-full"
            style={{
              /* GPU compositing layer — prevents subpixel blur on hover */
              willChange: 'transform',
              transform:  'translateZ(0)',
            }}
          >
            <img
              src={mainImage}
              alt={product.name}
              loading="lazy"
              /* No scale on the image itself — scale the WRAPPER instead */
              className={`w-full h-full object-cover transition-all duration-500
                ${hoverImage ? 'group-hover:opacity-0' : 'group-hover:scale-105'}
              `}
              style={{
                imageRendering: 'crisp-edges',
                /* Force high-quality downscaling */
                WebkitBackfaceVisibility: 'hidden',
                backfaceVisibility: 'hidden',
              }}
              onError={e => { e.target.src = 'https://placehold.co/400x400?text=No+Image'; }}
            />
          </div>
          {/* Hover image (second product photo) */}
          {hoverImage && (
            <img
              src={hoverImage}
              alt={`${product.name} alt`}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{ WebkitBackfaceVisibility: 'hidden', backfaceVisibility: 'hidden' }}
              onError={e => { e.target.style.display = 'none'; }}
            />
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none z-10">
          {discount > 0    && <span className="badge bg-red-500     text-white text-[10px] font-bold px-1.5 py-0.5">-{discount}%</span>}
          {product.isNewArrival  && <span className="badge bg-emerald-500 text-white text-[10px] px-1.5 py-0.5">NEW</span>}
          {product.isBestSeller  && <span className="badge bg-amber-500   text-white text-[10px] px-1.5 py-0.5">🔥 HOT</span>}
          {product.stock === 0   && <span className="badge bg-gray-700    text-white text-[10px] px-1.5 py-0.5">SOLD OUT</span>}
        </div>

        {/* Wishlist button — always visible */}
        <button
          onClick={handleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center
            shadow-md transition-all duration-200 active:scale-90
            ${isWishlisted
              ? 'bg-rose-500 text-white scale-110'
              : 'bg-white/90 backdrop-blur-sm text-gray-500 hover:bg-rose-50 hover:text-rose-500 hover:scale-110'
            }`}
        >
          <Heart size={14} fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Add to cart — slides up on desktop hover, always visible on mobile */}
        <div className="absolute bottom-0 left-0 right-0 p-2 z-10
          sm:translate-y-full sm:opacity-0
          sm:group-hover:translate-y-0 sm:group-hover:opacity-100
          sm:transition-all sm:duration-300">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold
              shadow-lg transition-all duration-200 active:scale-95
              ${product.stock === 0
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
          >
            <ShoppingCart size={13} />
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>

      {/* ── Product Info ────────────────────────────────────── */}
      <Link to={`/product/${product.slug}`} className="block p-3.5">
        {product.brand?.name && (
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-0.5 truncate">
            {product.brand.name}
          </p>
        )}
        <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-primary-600 transition-colors min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Rating */}
        {product.numReviews > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={11} className={s <= Math.round(product.ratings || 0)
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-gray-200 fill-gray-200'} />
              ))}
            </div>
            <span className="text-[10px] text-gray-400">({product.numReviews})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2 mt-1.5">
          <span className="font-bold text-gray-900">{formatPrice(displayPrice)}</span>
          {product.comparePrice > rawPrice && (
            <span className="text-xs text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
          )}
        </div>

        {/* Mobile add-to-cart */}
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={`sm:hidden mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold
            transition-all active:scale-95
            ${product.stock === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-primary-50 text-primary-700 hover:bg-primary-600 hover:text-white'
            }`}
        >
          <ShoppingCart size={13} />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </Link>
    </div>
  );
}
