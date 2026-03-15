import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { removeFromCart, updateCartQty, selectCartItems, selectCartSubtotal } from '../store/slices/cartSlice';
import { formatPrice, getProductImage } from '../utils/helpers';
import api from '../utils/api';
import { applyCoupon, removeCoupon } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function CartPageFull() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const { coupon, discount } = useSelector(s => s.cart);
  const shipping = subtotal > 50 ? 0 : subtotal > 0 ? 5.99 : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax - (discount || 0);

  const [couponCode, setCouponCode] = useState('');
  const [applying, setApplying] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      setApplying(true);
      const res = await api.post('/coupons/validate', { code: couponCode, orderAmount: subtotal });
      dispatch(applyCoupon({ coupon: res.data.data.coupon, discount: res.data.data.discount }));
      setCouponCode('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
    } finally {
      setApplying(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="page-container py-20 text-center">
        <ShoppingBag size={80} className="text-gray-200 mx-auto mb-4" />
        <h2 className="font-heading text-2xl font-bold text-gray-700">Your cart is empty</h2>
        <p className="text-gray-400 mt-2">Looks like you haven't added anything yet</p>
        <Link to="/shop" className="btn-primary mt-6 inline-flex">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="page-container py-10">
      <h1 className="font-heading text-3xl font-bold text-gray-900 mb-8">Shopping Cart ({items.length})</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => {
            const key = `${item._id}-${item.variant || ''}`;
            const price = item.discountedPrice || item.price;
            return (
              <div key={key} className="card p-5 flex gap-5">
                <Link to={`/product/${item.slug}`}>
                  <img src={getProductImage(item)} alt={item.name} className="w-28 h-28 object-cover rounded-xl" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <div>
                      <Link to={`/product/${item.slug}`}><h3 className="font-medium text-gray-800 hover:text-primary-600 line-clamp-2">{item.name}</h3></Link>
                      {item.variant && <p className="text-sm text-gray-400 mt-0.5">{item.variant}</p>}
                    </div>
                    <button onClick={() => dispatch(removeFromCart(key))} className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg flex-shrink-0">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-gray-200 rounded-xl">
                      <button onClick={() => dispatch(updateCartQty({ key, quantity: item.cartQty - 1 }))} className="p-2.5 hover:bg-gray-100 rounded-l-xl"><Minus size={13} /></button>
                      <span className="px-4 text-sm font-medium">{item.cartQty}</span>
                      <button onClick={() => dispatch(updateCartQty({ key, quantity: item.cartQty + 1 }))} disabled={item.cartQty >= item.stock} className="p-2.5 hover:bg-gray-100 rounded-r-xl disabled:opacity-40"><Plus size={13} /></button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatPrice(price * item.cartQty)}</p>
                      {item.cartQty > 1 && <p className="text-xs text-gray-400">{formatPrice(price)} each</p>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          {/* Coupon */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><Tag size={16} /> Coupon Code</h3>
            {coupon ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3">
                <div>
                  <p className="text-green-700 font-semibold text-sm">{coupon.code}</p>
                  <p className="text-green-600 text-xs">-{formatPrice(discount)} off</p>
                </div>
                <button onClick={() => dispatch(removeCoupon())} className="text-red-400 hover:text-red-600 text-xs font-medium">Remove</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input type="text" placeholder="Enter coupon code" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 input-field py-2.5 text-sm uppercase" onKeyPress={e => e.key === 'Enter' && handleApplyCoupon()} />
                <button onClick={handleApplyCoupon} disabled={applying} className="btn-primary px-4 py-2.5 text-sm">
                  {applying ? '...' : 'Apply'}
                </button>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="card p-5 space-y-3">
            <h3 className="font-semibold text-gray-800">Order Summary</h3>
            <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping</span>
              <span>{shipping === 0 ? <span className="text-green-600 font-medium">FREE</span> : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600"><span>Tax (10%)</span><span>{formatPrice(tax)}</span></div>
            {discount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
            <div className="flex justify-between font-bold text-gray-900 text-lg pt-2 border-t border-gray-100">
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>
            <button onClick={() => navigate('/checkout')} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              Checkout <ArrowRight size={16} />
            </button>
            <Link to="/shop" className="block text-center text-sm text-gray-500 hover:text-primary-600">← Continue Shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
