import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../store/slices/orderSlice';
import { clearCart, selectCartItems, selectCartSubtotal } from '../store/slices/cartSlice';
import { formatPrice, getProductImage } from '../utils/helpers';
import { MapPin, CreditCard, Truck, CheckCircle } from 'lucide-react';

const STEPS = ['Shipping', 'Payment', 'Review'];

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const { coupon, discount } = useSelector(s => s.cart);
  const { user } = useSelector(s => s.auth);
  const { loading } = useSelector(s => s.orders);

  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax - (discount || 0);

  const [step, setStep] = useState(0);
  const [shippingAddr, setShippingAddr] = useState({
    fullName: user?.name || '', phone: '', street: '', city: '', state: '', country: '', zipCode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const handlePlaceOrder = async () => {
    const orderData = {
      orderItems: items.map(i => ({ product: i._id, quantity: i.cartQty, variant: i.variant || '' })),
      shippingAddress: shippingAddr,
      paymentMethod,
      itemsPrice: subtotal,
      shippingPrice: shipping,
      taxPrice: tax,
      totalPrice: total,
      couponCode: coupon?.code,
    };
    const result = await dispatch(createOrder(orderData));
    if (result.type === 'orders/create/fulfilled') {
      dispatch(clearCart());
      navigate(`/order-success/${result.payload.data._id}`);
    }
  };

  return (
    <div className="page-container py-10">
      <h1 className="font-heading text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Stepper */}
      <div className="flex items-center gap-4 mb-10">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${i <= step ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`text-sm font-medium ${i === step ? 'text-primary-600' : 'text-gray-500'}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-primary-600' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 0: Shipping */}
          {step === 0 && (
            <div className="card p-6 space-y-4">
              <h2 className="font-semibold text-lg flex items-center gap-2"><MapPin size={18} className="text-primary-600" /> Shipping Address</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[['fullName','Full Name'], ['phone','Phone Number'], ['street','Street Address'], ['city','City'], ['state','State'], ['country','Country'], ['zipCode','ZIP Code']].map(([field, label]) => (
                  <div key={field} className={field === 'street' ? 'sm:col-span-2' : ''}>
                    <label className="block text-sm text-gray-600 mb-1">{label}</label>
                    <input type="text" value={shippingAddr[field]} onChange={e => setShippingAddr(p => ({ ...p, [field]: e.target.value }))}
                      className="input-field" required />
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(1)} disabled={!Object.values(shippingAddr).every(v => v.trim())} className="btn-primary w-full py-3 mt-2 disabled:opacity-50">
                Continue to Payment
              </button>
            </div>
          )}

          {/* Step 1: Payment */}
          {step === 1 && (
            <div className="card p-6 space-y-4">
              <h2 className="font-semibold text-lg flex items-center gap-2"><CreditCard size={18} className="text-primary-600" /> Payment Method</h2>
              <div className="space-y-3">
                {[['cod', '💵', 'Cash on Delivery', 'Pay when you receive your order'],
                  ['stripe', '💳', 'Credit/Debit Card', 'Secure payment via Stripe'],
                ].map(([val, emoji, label, desc]) => (
                  <label key={val} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === val ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
                    <input type="radio" name="payment" value={val} checked={paymentMethod === val} onChange={() => setPaymentMethod(val)} className="text-primary-600" />
                    <span className="text-2xl">{emoji}</span>
                    <div>
                      <p className="font-medium text-gray-800">{label}</p>
                      <p className="text-sm text-gray-500">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(0)} className="btn-ghost flex-1 border border-gray-200">← Back</button>
                <button onClick={() => setStep(2)} className="btn-primary flex-1 py-3">Review Order</button>
              </div>
            </div>
          )}

          {/* Step 2: Review */}
          {step === 2 && (
            <div className="card p-6 space-y-5">
              <h2 className="font-semibold text-lg flex items-center gap-2"><CheckCircle size={18} className="text-primary-600" /> Review Order</h2>
              <div className="bg-gray-50 rounded-xl p-4 space-y-1 text-sm">
                <p className="font-medium text-gray-700">Shipping to:</p>
                <p className="text-gray-600">{shippingAddr.fullName} • {shippingAddr.phone}</p>
                <p className="text-gray-600">{shippingAddr.street}, {shippingAddr.city}, {shippingAddr.state} {shippingAddr.zipCode}, {shippingAddr.country}</p>
                <p className="font-medium text-gray-700 mt-2">Payment: <span className="font-normal text-gray-600 capitalize">{paymentMethod === 'cod' ? 'Cash on Delivery' : 'Credit/Debit Card'}</span></p>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map(item => (
                  <div key={item._id} className="flex gap-3 items-center">
                    <img src={getProductImage(item)} alt={item.name} className="w-14 h-14 rounded-xl object-cover" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.cartQty}</p>
                    </div>
                    <p className="font-semibold text-sm">{formatPrice((item.discountedPrice || item.price) * item.cartQty)}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="btn-ghost flex-1 border border-gray-200">← Back</button>
                <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary flex-1 py-3">
                  {loading ? 'Placing Order...' : `Place Order • ${formatPrice(total)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="card p-5 space-y-3 h-fit sticky top-24">
          <h3 className="font-semibold text-gray-800">Order Summary</h3>
          <div className="max-h-48 overflow-y-auto space-y-2">
            {items.map(item => (
              <div key={item._id} className="flex justify-between text-sm text-gray-600">
                <span className="truncate max-w-[200px]">{item.name} × {item.cartQty}</span>
                <span className="ml-2 font-medium">{formatPrice((item.discountedPrice || item.price) * item.cartQty)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 pt-2 border-t border-gray-100 text-sm">
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{shipping === 0 ? <span className="text-green-600">FREE</span> : formatPrice(shipping)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Tax</span><span>{formatPrice(tax)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
            <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
