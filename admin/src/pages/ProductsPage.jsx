import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../store';
import { Plus, Search, Edit, Trash2, Eye, Star, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [deleting, setDeleting] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15, ...(search && { keyword: search }) };
      const res = await api.get('/products', { params });
      setProducts(res.data.data);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
    finally { setDeleting(null); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm mt-0.5">{total} total products</p>
        </div>
        <Link to="/products/new" className="btn-admin flex items-center gap-2"><Plus size={16} /> Add Product</Link>
      </div>

      <div className="admin-card">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search products..." value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="input-admin pl-9" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="table-th">Product</th>
                <th className="table-th">Category</th>
                <th className="table-th">Price</th>
                <th className="table-th">Stock</th>
                <th className="table-th">Rating</th>
                <th className="table-th">Status</th>
                <th className="table-th">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(7).fill(0).map((_, j) => (
                      <td key={j} className="table-td"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">
                  <Package size={32} className="mx-auto mb-2 text-gray-300" />
                  No products found
                </td></tr>
              ) : (
                products.map(product => (
                  <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-td">
                      <div className="flex items-center gap-3">
                        <img src={product.images?.[0]?.url || '/placeholder.png'} alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover bg-gray-100 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate max-w-[180px]">{product.name}</p>
                          {product.sku && <p className="text-xs text-gray-400">SKU: {product.sku}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="table-td text-gray-500">{product.category?.name || '—'}</td>
                    <td className="table-td">
                      <span className="font-semibold text-gray-900">${(product.discountedPrice || product.price)?.toFixed(2)}</span>
                      {product.discount > 0 && <span className="ml-1 text-xs text-green-600">-{product.discount}%</span>}
                    </td>
                    <td className="table-td">
                      <span className={`font-medium ${product.stock === 0 ? 'text-red-600' : product.stock <= 5 ? 'text-orange-500' : 'text-gray-700'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1">
                        <Star size={13} className="text-amber-400 fill-amber-400" />
                        <span>{product.ratings || 0}</span>
                        <span className="text-gray-400 text-xs">({product.numReviews})</span>
                      </div>
                    </td>
                    <td className="table-td">
                      <span className={`badge-status px-2.5 py-1 rounded-full text-xs font-medium ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-1">
                        <a href={`${import.meta.env.VITE_CLIENT_URL || 'http://localhost:5173'}/product/${product.slug}`} target="_blank" rel="noreferrer"
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                          <Eye size={15} />
                        </a>
                        <Link to={`/products/edit/${product._id}`}
                          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                          <Edit size={15} />
                        </Link>
                        <button onClick={() => handleDelete(product._id, product.name)} disabled={deleting === product._id}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
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
