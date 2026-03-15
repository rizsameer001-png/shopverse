import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../store';
import toast from 'react-hot-toast';
import { Search, ChevronRight, Eye } from 'lucide-react';

const STATUS_COLORS = { pending:'bg-yellow-100 text-yellow-700', confirmed:'bg-blue-100 text-blue-700', processing:'bg-indigo-100 text-indigo-700', shipped:'bg-purple-100 text-purple-700', delivered:'bg-green-100 text-green-700', cancelled:'bg-red-100 text-red-700', refunded:'bg-gray-100 text-gray-600' };
const ALL_STATUSES = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded'];

export default function OrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const status = searchParams.get('status') || '';

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20, ...(status && { status }), ...(search && { search }) };
      const r = await api.get('/orders', { params });
      setOrders(r.data.data); setTotal(r.data.total); setPages(r.data.pages);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [page, status, search]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{total} total orders</p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search order #..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="input-admin pl-8 w-48" />
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => { setSearchParams({}); setPage(1); }}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${!status ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          All ({total})
        </button>
        {ALL_STATUSES.map(s => (
          <button key={s} onClick={() => { setSearchParams({ status: s }); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors ${status === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="admin-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', 'Action'].map(h => <th key={h} className="table-th">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array(8).fill(0).map((_, i) => <tr key={i}>{Array(8).fill(0).map((_, j) => <td key={j} className="table-td"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>)}</tr>)
            ) : orders.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-gray-400">No orders found</td></tr>
            ) : orders.map(order => (
              <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                <td className="table-td"><Link to={`/orders/${order._id}`} className="text-primary-600 font-medium hover:underline">{order.orderNumber}</Link></td>
                <td className="table-td">
                  <p className="font-medium text-sm">{order.user?.name || '—'}</p>
                  <p className="text-xs text-gray-400">{order.user?.email}</p>
                </td>
                <td className="table-td text-center">{order.orderItems?.length}</td>
                <td className="table-td font-semibold">${order.totalPrice?.toFixed(2)}</td>
                <td className="table-td">
                  <span className={`badge-status px-2.5 py-0.5 rounded-full text-xs font-medium ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {order.isPaid ? 'Paid' : 'Unpaid'}
                  </span>
                </td>
                <td className="table-td">
                  <span className={`badge-status px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.orderStatus] || ''}`}>
                    {order.orderStatus}
                  </span>
                </td>
                <td className="table-td text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="table-td">
                  <Link to={`/orders/${order._id}`} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg inline-flex">
                    <Eye size={15} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {pages > 1 && (
          <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Page {page} of {pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-1.5 px-3 disabled:opacity-40">← Prev</button>
              <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary py-1.5 px-3 disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
