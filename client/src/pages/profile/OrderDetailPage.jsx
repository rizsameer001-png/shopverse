import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrder } from '../../store/slices/orderSlice';
import { formatPrice, formatDate, ORDER_STATUS_COLORS } from '../../utils/helpers';
import { ArrowLeft, Package, Truck, MapPin, CreditCard } from 'lucide-react';
import { Spinner } from '../../components/common';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { current: order, loading } = useSelector(s => s.orders);

  useEffect(() => { dispatch(fetchOrder(id)); }, [id, dispatch]);

  if (loading || !order) return <div className="flex justify-center py-12"><Spinner /></div>;

  const currentStep = STATUS_STEPS.indexOf(order.orderStatus);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/profile/orders" className="btn-ghost p-2"><ArrowLeft size={18} /></Link>
        <div>
          <h2 className="font-heading text-xl font-bold text-gray-900">Order Details</h2>
          <p className="text-sm text-gray-500">{order.orderNumber}</p>
        </div>
        <span className={`badge ml-auto ${ORDER_STATUS_COLORS[order.orderStatus]}`}>
          {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1)}
        </span>
      </div>

      {/* Progress Tracker */}
      {!['cancelled', 'refunded'].includes(order.orderStatus) && (
        <div className="card p-6">
          <h3 className="font-semibold text-gray-800 mb-5">Order Progress</h3>
          <div className="flex items-center">
            {STATUS_STEPS.map((step, i) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center text-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${i <= currentStep ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {i < currentStep ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs mt-1.5 capitalize font-medium ${i <= currentStep ? 'text-primary-600' : 'text-gray-400'}`}>{step}</span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-1 mx-1 rounded-full transition-colors ${i < currentStep ? 'bg-primary-500' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Items */}
      <div className="card p-5">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2"><Package size={16} /> Order Items</h3>
        <div className="divide-y divide-gray-100">
          {order.orderItems?.map((item, i) => (
            <div key={i} className="flex gap-4 py-4 first:pt-0 last:pb-0">
              <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-gray-50" />
              <div className="flex-1">
                <Link to={`/product/${item.product?.slug || item.product}`}>
                  <p className="font-medium text-gray-800 hover:text-primary-600">{item.name}</p>
                </Link>
                {item.variant && <p className="text-sm text-gray-400">{item.variant}</p>}
                <p className="text-sm text-gray-500 mt-0.5">Qty: {item.quantity}</p>
              </div>
              <p className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {/* Shipping */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><MapPin size={16} /> Shipping Address</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p className="font-medium text-gray-800">{order.shippingAddress?.fullName}</p>
            <p>{order.shippingAddress?.phone}</p>
            <p>{order.shippingAddress?.street}</p>
            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
            <p>{order.shippingAddress?.country}</p>
          </div>
          {order.trackingNumber && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">Tracking: <span className="font-semibold text-gray-800">{order.trackingNumber}</span></p>
              {order.carrier && <p className="text-xs text-gray-500">Carrier: <span className="font-medium">{order.carrier}</span></p>}
            </div>
          )}
        </div>

        {/* Payment Summary */}
        <div className="card p-5">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2"><CreditCard size={16} /> Payment</h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600"><span>Payment Method</span><span className="capitalize">{order.paymentMethod}</span></div>
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>{formatPrice(order.itemsPrice)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'FREE' : formatPrice(order.shippingPrice)}</span></div>
            <div className="flex justify-between text-gray-600"><span>Tax</span><span>{formatPrice(order.taxPrice)}</span></div>
            {order.discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(order.discountAmount)}</span></div>}
            <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100"><span>Total</span><span>{formatPrice(order.totalPrice)}</span></div>
          </div>
          <div className={`mt-3 inline-flex px-3 py-1 rounded-full text-xs font-medium ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {order.isPaid ? `✓ Paid on ${formatDate(order.paidAt)}` : 'Payment Pending'}
          </div>
        </div>
      </div>

      {/* Actions */}
      {order.orderStatus === 'delivered' && !order.returnRequest?.isRequested && (
        <div className="card p-5 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800">Not satisfied with your order?</p>
            <p className="text-sm text-gray-500">You can request a return within 30 days</p>
          </div>
          <Link to={`/profile/orders/${order._id}/return`} className="btn-outline text-sm">Request Return</Link>
        </div>
      )}
      {order.returnRequest?.isRequested && (
        <div className="card p-5 bg-orange-50 border border-orange-200">
          <p className="font-medium text-orange-800">Return Request Submitted</p>
          <p className="text-sm text-orange-600 mt-1">Status: {order.returnRequest.status} • Reason: {order.returnRequest.reason}</p>
        </div>
      )}
    </div>
  );
}
