import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { api } from '../store';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import {
  ShoppingCart, Users, DollarSign, Package,
  TrendingUp, TrendingDown, AlertTriangle, Clock, RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const STATUS_COLORS = {
  pending:    '#f59e0b',
  confirmed:  '#3b82f6',
  processing: '#8b5cf6',
  shipped:    '#06b6d4',
  delivered:  '#22c55e',
  cancelled:  '#ef4444',
  refunded:   '#6b7280',
};

function StatCard({ label, value, sub, icon: Icon, color, trend, trendVal }) {
  return (
    <div className="admin-card p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
        {trendVal !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${
            trend === 'up'   ? 'bg-emerald-50 text-emerald-600' :
            trend === 'down' ? 'bg-red-50 text-red-500' :
            'bg-gray-100 text-gray-500'
          }`}>
            {trend === 'up'   ? <TrendingUp   size={11} /> :
             trend === 'down' ? <TrendingDown  size={11} /> : null}
            {trendVal}
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5 font-medium">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />;
}

export default function DashboardPage() {
  const { token } = useSelector(s => s.auth);   // ← wait for token
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  const loadStats = () => {
    if (!token) return;            // ← guard: don't call without token
    setLoading(true);
    setError(false);
    api.get('/dashboard/stats')
      .then(r => setStats(r.data.data))
      .catch(err => {
        console.error('Dashboard error:', err.response?.data || err.message);
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  // Only run when token is available
  useEffect(() => {
    if (token) loadStats();
  }, [token]);   // ← depends on token

  /* ── Loading skeleton ─────────────────────────────────────── */
  if (loading) return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><Skeleton className="h-7 w-32 mb-1" /><Skeleton className="h-4 w-48" /></div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-32" />)}
      </div>
      <div className="grid lg:grid-cols-3 gap-5">
        <Skeleton className="lg:col-span-2 h-72" />
        <Skeleton className="h-72" />
      </div>
    </div>
  );

  /* ── Error state ──────────────────────────────────────────── */
  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertTriangle size={48} className="text-amber-400 mb-4" />
      <h2 className="text-xl font-bold text-gray-800 mb-2">Failed to load dashboard</h2>
      <p className="text-gray-500 text-sm mb-5">Check the server is running and your session is valid.</p>
      <button onClick={loadStats} className="btn-admin flex items-center gap-2">
        <RefreshCw size={15} /> Retry
      </button>
    </div>
  );

  const { overview, recentOrders = [], topProducts = [], ordersByStatus = [], revenueByMonth = [] } = stats || {};

  /* ── Chart data ───────────────────────────────────────────── */
  const revenueChartData = {
    labels: MONTHS,
    datasets: [{
      label: 'Revenue ($)',
      data: MONTHS.map((_, i) => {
        const found = revenueByMonth.find(r => r._id?.month === i + 1);
        return found ? +found.revenue.toFixed(2) : 0;
      }),
      borderColor: '#0284c7',
      backgroundColor: 'rgba(2,132,199,0.08)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#0284c7',
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };

  const ordersChartData = {
    labels: MONTHS,
    datasets: [{
      label: 'Orders',
      data: MONTHS.map((_, i) => {
        const found = revenueByMonth.find(r => r._id?.month === i + 1);
        return found?.orders || 0;
      }),
      backgroundColor: 'rgba(14,165,233,0.8)',
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const statusChartData = {
    labels: ordersByStatus.map(s => s._id),
    datasets: [{
      data: ordersByStatus.map(s => s.count),
      backgroundColor: ordersByStatus.map(s => STATUS_COLORS[s._id] || '#94a3b8'),
      borderWidth: 0,
      hoverOffset: 6,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } },
    },
  };

  const growthTrend = overview?.orderGrowth > 0 ? 'up' : overview?.orderGrowth < 0 ? 'down' : 'neutral';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button onClick={loadStats} className="btn-secondary flex items-center gap-2 text-sm py-2">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={`$${(overview?.totalRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          sub={`$${(overview?.monthRevenue || 0).toFixed(0)} this month`}
          icon={DollarSign}
          color="bg-emerald-50 text-emerald-600"
          trend="up"
          trendVal="+month"
        />
        <StatCard
          label="Total Orders"
          value={(overview?.totalOrders || 0).toLocaleString()}
          sub={`+${overview?.monthOrders || 0} this month`}
          icon={ShoppingCart}
          color="bg-blue-50 text-blue-600"
          trend={growthTrend}
          trendVal={overview?.orderGrowth ? `${overview.orderGrowth > 0 ? '+' : ''}${overview.orderGrowth}%` : undefined}
        />
        <StatCard
          label="Customers"
          value={(overview?.totalUsers || 0).toLocaleString()}
          sub={`+${overview?.newUsers || 0} new this month`}
          icon={Users}
          color="bg-violet-50 text-violet-600"
        />
        <StatCard
          label="Active Products"
          value={(overview?.totalProducts || 0).toLocaleString()}
          sub={overview?.lowStockProducts > 0 ? `⚠️ ${overview.lowStockProducts} low stock` : 'All stocked'}
          icon={Package}
          color="bg-amber-50 text-amber-600"
        />
      </div>

      {/* Alert badges */}
      {(overview?.pendingOrders > 0 || overview?.lowStockProducts > 0) && (
        <div className="flex gap-3 flex-wrap">
          {overview.pendingOrders > 0 && (
            <Link to="/orders?status=pending"
              className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-amber-100 transition-colors">
              <Clock size={14} /> {overview.pendingOrders} pending orders need attention
            </Link>
          )}
          {overview.lowStockProducts > 0 && (
            <Link to="/products"
              className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors">
              <AlertTriangle size={14} /> {overview.lowStockProducts} products running low on stock
            </Link>
          )}
        </div>
      )}

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Revenue line chart */}
        <div className="admin-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Revenue ({new Date().getFullYear()})</h3>
            <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg">Monthly</span>
          </div>
          <Line data={revenueChartData} options={chartOptions} height={90} />
        </div>

        {/* Status donut */}
        <div className="admin-card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Orders by Status</h3>
          {statusChartData.labels?.length > 0 ? (
            <Doughnut
              data={statusChartData}
              options={{
                responsive: true,
                cutout: '65%',
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: { boxWidth: 10, font: { size: 11 }, padding: 12 },
                  },
                },
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-300 text-sm">No orders yet</div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Monthly orders bar chart */}
        <div className="admin-card p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Monthly Orders</h3>
          <Bar data={ordersChartData} options={chartOptions} height={110} />
        </div>

        {/* Top products */}
        <div className="admin-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Top Selling Products</h3>
            <Link to="/products" className="text-xs text-primary-600 hover:underline font-medium">View all</Link>
          </div>
          <div className="space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">No sales data yet</p>
            ) : topProducts.map((p, i) => (
              <div key={p._id} className="flex items-center gap-3">
                <span className={`text-xs font-bold w-5 text-center ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-400' : 'text-gray-300'}`}>
                  {i + 1}
                </span>
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {p.images?.[0]?.url
                    ? <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                    : <Package size={16} className="m-auto mt-2.5 text-gray-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">${p.price?.toFixed(2)} · ⭐ {p.ratings?.toFixed(1) || 0}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{p.soldCount}</p>
                  <p className="text-xs text-gray-400">sold</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders table */}
      <div className="admin-card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Recent Orders</h3>
          <Link to="/orders" className="text-xs text-primary-600 hover:underline font-medium">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Order #', 'Customer', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400 text-sm">No orders yet</td></tr>
              ) : recentOrders.map(order => (
                <tr key={order._id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="table-td">
                    <Link to={`/orders/${order._id}`} className="text-primary-600 hover:underline font-medium text-sm">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="table-td">
                    <p className="text-sm font-medium text-gray-800">{order.user?.name || '—'}</p>
                    <p className="text-xs text-gray-400">{order.user?.email}</p>
                  </td>
                  <td className="table-td font-semibold text-gray-900">${order.totalPrice?.toFixed(2)}</td>
                  <td className="table-td">
                    <span
                      className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold"
                      style={{
                        backgroundColor: (STATUS_COLORS[order.orderStatus] || '#94a3b8') + '20',
                        color: STATUS_COLORS[order.orderStatus] || '#94a3b8',
                      }}
                    >
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="table-td text-gray-400 text-xs">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
