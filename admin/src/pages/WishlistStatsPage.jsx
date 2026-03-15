import React, { useEffect, useState } from 'react';
import { api } from '../store';
import { Heart, TrendingUp, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WishlistStatsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('products');

  useEffect(() => {
    api.get('/wishlist/admin/stats')
      .then(r => setData(r.data.data))
      .catch(() => toast.error('Failed to load wishlist stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;

  const { topWishlistedProducts = [], userWishlists = [], totalUsers = 0 } = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Wishlist Statistics</h1>
        <p className="text-gray-500 text-sm mt-0.5">Track what customers want most</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="admin-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center"><Heart size={22} className="text-rose-600" /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
            <p className="text-sm text-gray-500">Users with Wishlists</p>
          </div>
        </div>
        <div className="admin-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center"><TrendingUp size={22} className="text-primary-600" /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{topWishlistedProducts.length}</p>
            <p className="text-sm text-gray-500">Wishlisted Products</p>
          </div>
        </div>
        <div className="admin-card p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center"><Users size={22} className="text-violet-600" /></div>
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {userWishlists.reduce((acc, w) => acc + (w.products?.length || 0), 0)}
            </p>
            <p className="text-sm text-gray-500">Total Wishlist Items</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b border-gray-200 pb-0">
        {['products', 'customers'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`pb-3 px-1 text-sm font-medium capitalize border-b-2 transition-all ${tab === t ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            {t === 'products' ? 'Top Wishlisted Products' : 'Customer Wishlists'}
          </button>
        ))}
      </div>

      {/* Top Products */}
      {tab === 'products' && (
        <div className="admin-card overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <Heart size={16} className="text-rose-500" />
            <h3 className="font-semibold text-gray-800">Most Wishlisted Products</h3>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-th">Rank</th>
                <th className="table-th">Product</th>
                <th className="table-th">Price</th>
                <th className="table-th text-center">Total Wishlists ❤️</th>
                <th className="table-th">Demand Bar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topWishlistedProducts.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-400">No wishlist data yet</td></tr>
              ) : topWishlistedProducts.map((item, i) => {
                const maxCount = topWishlistedProducts[0]?.totalWishlists || 1;
                const pct = Math.round((item.totalWishlists / maxCount) * 100);
                return (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-td">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-500'}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        {item.image?.url ? (
                          <img src={item.image.url} alt={item.name} className="w-10 h-10 rounded-xl object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">🛍️</div>
                        )}
                        <p className="font-medium text-gray-800 truncate max-w-[180px]">{item.name}</p>
                      </div>
                    </td>
                    <td className="table-td font-semibold">${item.price?.toFixed(2)}</td>
                    <td className="table-td text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Heart size={13} className="text-rose-500 fill-rose-500" />
                        <span className="font-bold text-gray-900">{item.totalWishlists}</span>
                      </div>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="bg-rose-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Customer Wishlists */}
      {tab === 'customers' && (
        <div className="admin-card overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Customer Wishlist Details</h3>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="table-th">Customer</th>
                <th className="table-th text-center">Items in Wishlist</th>
                <th className="table-th">Wishlisted Products</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {userWishlists.length === 0 ? (
                <tr><td colSpan={3} className="text-center py-10 text-gray-400">No wishlist data</td></tr>
              ) : userWishlists.filter(w => w.products?.length > 0).sort((a, b) => b.products.length - a.products.length).map(wishlist => (
                <tr key={wishlist._id} className="hover:bg-gray-50">
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-sm font-bold text-primary-600">
                        {wishlist.user?.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{wishlist.user?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-400">{wishlist.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-td text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Heart size={13} className="text-rose-500 fill-rose-500" />
                      <span className="font-bold text-gray-900">{wishlist.products?.length}</span>
                    </div>
                  </td>
                  <td className="table-td">
                    <div className="flex gap-2 flex-wrap">
                      {wishlist.products?.slice(0, 4).map((p, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-gray-100 rounded-lg px-2 py-1">
                          {p.product?.images?.[0]?.url && (
                            <img src={p.product.images[0].url} alt="" className="w-5 h-5 rounded object-cover" />
                          )}
                          <span className="text-xs text-gray-700 truncate max-w-[100px]">{p.product?.name || 'Unknown'}</span>
                        </div>
                      ))}
                      {wishlist.products?.length > 4 && (
                        <span className="text-xs text-gray-400 self-center">+{wishlist.products.length - 4} more</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
