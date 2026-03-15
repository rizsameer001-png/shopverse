import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { fetchWishlist, toggleWishlist } from '../store/slices/wishlistSlice';
import { addToCart } from '../store/slices/cartSlice';
import { toggleCart } from '../store/slices/uiSlice';
import { formatPrice, getProductImage } from '../utils/helpers';
import { Spinner } from '../components/common';
import api from '../utils/api';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(s => s.wishlist);
  const { user } = useSelector(s => s.auth);
  const [products, setProducts] = useState([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (user) {
      setFetching(true);
      api.get('/wishlist').then(res => {
        setProducts(res.data.data?.products?.map(p => p.product).filter(Boolean) || []);
      }).finally(() => setFetching(false));
    }
  }, [user, items.length]);

  if (!user) {
    return (
      <div className="page-container py-20 text-center">
        <Heart size={64} className="text-gray-200 mx-auto mb-4" />
        <h2 className="font-heading text-2xl font-bold text-gray-700">Please login to view your wishlist</h2>
        <Link to="/login" className="btn-primary mt-6 inline-flex">Sign In</Link>
      </div>
    );
  }

  if (fetching) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="page-container py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-heading text-3xl font-bold text-gray-900">My Wishlist</h1>
        <span className="badge bg-primary-100 text-primary-700">{products.length} items</span>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <Heart size={72} className="text-gray-200 mx-auto mb-4" />
          <h3 className="font-heading text-xl font-bold text-gray-600">Your wishlist is empty</h3>
          <p className="text-gray-400 mt-2">Save items you love to buy later</p>
          <Link to="/shop" className="btn-primary mt-6 inline-flex">Explore Products</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {products.map(product => {
            if (!product) return null;
            const price = product.discountedPrice || product.price;
            return (
              <div key={product._id} className="product-card">
                <div className="relative aspect-square overflow-hidden bg-gray-50">
                  <Link to={`/product/${product.slug}`}>
                    <img src={getProductImage(product)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </Link>
                  <button
                    onClick={() => dispatch(toggleWishlist(product._id))}
                    className="absolute top-2 right-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <span className="badge bg-gray-900 text-white">Out of Stock</span>
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-2">
                  <Link to={`/product/${product.slug}`}>
                    <h3 className="text-sm font-medium text-gray-800 line-clamp-2 hover:text-primary-600">{product.name}</h3>
                  </Link>
                  <p className="font-bold text-gray-900 text-sm">{formatPrice(price)}</p>
                  <button
                    onClick={() => { dispatch(addToCart({ product })); dispatch(toggleCart()); }}
                    disabled={product.stock === 0}
                    className="w-full btn-primary text-xs py-2 flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <ShoppingCart size={13} /> Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
