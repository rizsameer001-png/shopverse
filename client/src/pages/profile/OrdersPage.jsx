import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../../store/slices/orderSlice';
import { formatPrice, formatDate, ORDER_STATUS_COLORS } from '../../utils/helpers';
import { Package, ChevronRight } from 'lucide-react';
import { Spinner } from '../../components/common';

export default function OrdersPage() {
  const dispatch = useDispatch();
  const { items: orders, loading } = useSelector(s => s.orders);

  useEffect(() => { dispatch(fetchMyOrders()); }, [dispatch]);

  if (loading) return <div className="flex justify-center py-12"><Spinner /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-heading text-xl font-bold text-gray-900">My Orders</h2>
        <span className="text-sm text-gray-500">{orders.length} orders</span>
      </div>
      {orders.length === 0 ? (
        <div className="card p-12 text-center">
          <Package size={56} className="text-gray-200 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-600">No orders yet</h3>
          <p className="text-gray-400 text-sm mt-1">Your orders will appear here once you start shopping.</p>
          <Link to="/shop" className="btn-primary mt-5 inline-flex">Start Shopping</Link>
        </div>
      ) : (
        orders.map(order => (
          <Link key={order._id} to={`/profile/orders/${order._id}`} className="card p-5 flex items-center justify-between hover:shadow-product-hover transition-shadow group">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
                {order.orderItems?.[0]?.image
                  ? <img src={order.orderItems[0].image} alt="" className="w-full h-full object-cover" />
                  : <Package className="m-auto mt-3 text-gray-300" />}
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{order.orderNumber}</p>
                <p className="text-gray-500 text-xs mt-0.5">{formatDate(order.createdAt)} • {order.orderItems?.length} item(s)</p>
                <span className={`badge mt-1.5 text-xs ${ORDER_STATUS_COLORS[order.orderStatus] || 'bg-gray-100 text-gray-600'}`}>
                  {order.orderStatus?.charAt(0).toUpperCase() + order.orderStatus?.slice(1)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="font-bold text-gray-900">{formatPrice(order.totalPrice)}</p>
                <p className={`text-xs mt-0.5 ${order.isPaid ? 'text-green-600' : 'text-orange-500'}`}>
                  {order.isPaid ? '✓ Paid' : 'Pending Payment'}
                </p>
              </div>
              <ChevronRight size={18} className="text-gray-400 group-hover:text-primary-600 transition-colors" />
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
