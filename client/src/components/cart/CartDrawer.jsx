import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { closeCart } from '../../store/slices/uiSlice';
import { removeFromCart, updateCartQty, selectCartItems, selectCartSubtotal } from '../../store/slices/cartSlice';
import { formatPrice, getProductImage } from '../../utils/helpers';

export default function CartDrawer() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartOpen = useSelector(s => s.ui.cartOpen);
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const shipping = subtotal > 50 ? 0 : 5.99;

  const handleCheckout = () => {
    dispatch(closeCart());
    navigate('/checkout');
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${cartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => dispatch(closeCart())}
      />

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-primary-600" />
            <h2 className="font-heading font-semibold text-lg text-gray-900">Shopping Cart</h2>
            <span className="badge bg-primary-100 text-primary-700">{items.length}</span>
          </div>
          <button onClick={() => dispatch(closeCart())} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={64} className="text-gray-200 mb-4" />
              <p className="text-gray-500 font-medium">Your cart is empty</p>
              <p className="text-gray-400 text-sm mt-1">Add items to get started</p>
              <Link to="/shop" onClick={() => dispatch(closeCart())} className="btn-primary mt-6">Browse Products</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map(item => {
                const key = `${item._id}-${item.variant || ''}`;
                const itemPrice = item.discountedPrice || item.price;
                return (
                  <div key={key} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                    <Link to={`/product/${item.slug}`} onClick={() => dispatch(closeCart())}>
                      <img src={getProductImage(item)} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.slug}`} onClick={() => dispatch(closeCart())}>
                        <h4 className="text-sm font-medium text-gray-800 line-clamp-2 hover:text-primary-600">{item.name}</h4>
                      </Link>
                      {item.variant && <p className="text-xs text-gray-500 mt-0.5">{item.variant}</p>}
                      <p className="text-primary-600 font-semibold mt-1">{formatPrice(itemPrice)}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200">
                          <button
                            onClick={() => dispatch(updateCartQty({ key, quantity: item.cartQty - 1 }))}
                            className="p-1.5 hover:bg-gray-100 rounded-l-lg transition-colors"
                          ><Minus size={12} /></button>
                          <span className="text-sm font-medium w-6 text-center">{item.cartQty}</span>
                          <button
                            onClick={() => dispatch(updateCartQty({ key, quantity: item.cartQty + 1 }))}
                            className="p-1.5 hover:bg-gray-100 rounded-r-lg transition-colors"
                          ><Plus size={12} /></button>
                        </div>
                        <button
                          onClick={() => dispatch(removeFromCart(key))}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        ><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-4 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping</span>
              <span>{shipping === 0 ? <span className="text-green-600 font-medium">FREE</span> : formatPrice(shipping)}</span>
            </div>
            {subtotal < 50 && (
              <p className="text-xs text-gray-400">Add {formatPrice(50 - subtotal)} more for free shipping</p>
            )}
            <div className="flex justify-between font-semibold text-gray-900 text-base pt-2 border-t border-gray-100">
              <span>Total</span><span>{formatPrice(subtotal + shipping)}</span>
            </div>
            <button onClick={handleCheckout} className="btn-primary w-full text-center">Proceed to Checkout</button>
            <Link to="/cart" onClick={() => dispatch(closeCart())} className="block text-center text-sm text-gray-500 hover:text-primary-600 transition-colors">
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
