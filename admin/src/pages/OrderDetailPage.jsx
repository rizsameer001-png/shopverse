// OrderDetailPage.jsx (admin)
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../store';
import toast from 'react-hot-toast';
import { ArrowLeft, Package } from 'lucide-react';

const STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded'];
const STATUS_COLORS = { pending:'bg-yellow-100 text-yellow-700', confirmed:'bg-blue-100 text-blue-700', processing:'bg-indigo-100 text-indigo-700', shipped:'bg-purple-100 text-purple-700', delivered:'bg-green-100 text-green-700', cancelled:'bg-red-100 text-red-700', refunded:'bg-gray-100 text-gray-600' };

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [tracking, setTracking] = useState('');
  const [carrier, setCarrier] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    try { const r = await api.get(`/orders/${id}`); setOrder(r.data.data); setNewStatus(r.data.data.orderStatus); }
    catch { toast.error('Failed to load order'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    setUpdating(true);
    try {
      await api.put(`/orders/${id}/status`, { status: newStatus, note, trackingNumber: tracking, carrier });
      toast.success('Status updated!');
      fetchOrder();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setUpdating(false); }
  };

  if (loading || !order) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link to="/orders" className="p-2 hover:bg-gray-100 rounded-xl"><ArrowLeft size={18} /></Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{order.orderNumber}</h1>
          <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <span className={`ml-auto badge-status px-3 py-1.5 rounded-full text-sm font-medium ${STATUS_COLORS[order.orderStatus]}`}>{order.orderStatus}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Items */}
          <div className="admin-card p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.orderItems?.map((item, i) => (
                <div key={i} className="flex gap-3 items-center bg-gray-50 rounded-xl p-3">
                  <img src={item.image} alt={item.name} className="w-14 h-14 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className="font-medium text-sm text-gray-800">{item.name}</p>
                    {item.variant && <p className="text-xs text-gray-400">{item.variant}</p>}
                    <p className="text-xs text-gray-500">Qty: {item.quantity} × ${item.price?.toFixed(2)}</p>
                  </div>
                  <p className="font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Update Status */}
          <div className="admin-card p-5">
            <h3 className="font-semibold text-gray-800 mb-4">Update Order Status</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">New Status</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="input-admin">
                  {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </div>
              {(newStatus === 'shipped' || newStatus === 'processing') && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tracking Number</label>
                    <input value={tracking} onChange={e => setTracking(e.target.value)} className="input-admin" placeholder="TRK123456" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Carrier</label>
                    <input value={carrier} onChange={e => setCarrier(e.target.value)} className="input-admin" placeholder="FedEx, UPS..." />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Note (optional)</label>
                <input value={note} onChange={e => setNote(e.target.value)} className="input-admin" placeholder="Internal note..." />
              </div>
              <button onClick={handleUpdateStatus} disabled={updating} className="btn-admin">
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>

          {/* Status History */}
          {order.statusHistory?.length > 0 && (
            <div className="admin-card p-5">
              <h3 className="font-semibold text-gray-800 mb-4">Status History</h3>
              <div className="space-y-3">
                {order.statusHistory.slice().reverse().map((h, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${STATUS_COLORS[h.status]?.includes('green') ? 'bg-green-500' : 'bg-primary-500'}`} />
                    <div>
                      <span className="capitalize font-medium text-gray-800">{h.status}</span>
                      {h.note && <span className="text-gray-400 ml-2">— {h.note}</span>}
                      <p className="text-xs text-gray-400">{new Date(h.changedAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="space-y-4">
          {/* Customer */}
          <div className="admin-card p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Customer</h3>
            <p className="font-medium text-gray-800">{order.user?.name}</p>
            <p className="text-sm text-gray-500">{order.user?.email}</p>
            {order.user?.phone && <p className="text-sm text-gray-500">{order.user.phone}</p>}
          </div>
          {/* Shipping */}
          <div className="admin-card p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Shipping</h3>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p className="font-medium">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.phone}</p>
              <p>{order.shippingAddress?.street}</p>
              <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</p>
              <p>{order.shippingAddress?.country}</p>
            </div>
            {order.trackingNumber && (
              <div className="mt-3 pt-3 border-t border-gray-100 text-sm">
                <p><span className="font-medium">Tracking:</span> {order.trackingNumber}</p>
                {order.carrier && <p><span className="font-medium">Carrier:</span> {order.carrier}</p>}
              </div>
            )}
          </div>
          {/* Payment */}
          <div className="admin-card p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Payment Summary</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${order.itemsPrice?.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Shipping</span><span>${order.shippingPrice?.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Tax</span><span>${order.taxPrice?.toFixed(2)}</span></div>
              {order.discountAmount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-${order.discountAmount?.toFixed(2)}</span></div>}
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100"><span>Total</span><span>${order.totalPrice?.toFixed(2)}</span></div>
            </div>
            <div className="mt-3">
              <span className={`badge-status px-3 py-1 rounded-full text-xs font-medium ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {order.isPaid ? `✓ Paid (${order.paymentMethod})` : 'Awaiting Payment'}
              </span>
            </div>
          </div>
          {/* Return Request */}
          {order.returnRequest?.isRequested && (
            <div className="admin-card p-5 border-2 border-orange-200 bg-orange-50">
              <h3 className="font-semibold text-orange-800 mb-2">⚠️ Return Request</h3>
              <p className="text-sm text-orange-700">Reason: {order.returnRequest.reason}</p>
              <p className="text-xs text-orange-500 mt-1">Status: {order.returnRequest.status}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
