import React, { useEffect, useState, useRef } from 'react';
import { api } from '../store';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Upload, Link as LinkIcon, X, Image } from 'lucide-react';

const EMPTY = { name: '', description: '', sortOrder: 0, isActive: true };

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const fetch = async () => {
    setLoading(true);
    try { const r = await api.get('/categories'); setCategories(r.data.data); }
    catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setForm(EMPTY); setEditing(null); setImageFile(null); setImageUrl(''); setImagePreview(''); setModal(true); };
  const openEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description || '', sortOrder: cat.sortOrder || 0, isActive: cat.isActive !== false });
    setEditing(cat._id);
    setImagePreview(cat.image?.url || '');
    setImageFile(null); setImageUrl('');
    setModal(true);
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); setImageUrl(''); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      data.append('name', form.name);
      data.append('description', form.description);
      data.append('sortOrder', form.sortOrder);
      data.append('isActive', form.isActive);
      if (imageFile) data.append('image', imageFile);
      else if (imageUrl) data.append('imageUrl', imageUrl);

      if (editing) await api.put(`/categories/${editing}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      else await api.post('/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } });

      toast.success(editing ? 'Category updated!' : 'Category created!');
      setModal(false);
      fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try { await api.delete(`/categories/${id}`); toast.success('Deleted'); fetch(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button onClick={openAdd} className="btn-admin flex items-center gap-2"><Plus size={16} /> Add Category</button>
      </div>

      <div className="admin-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Category', 'Description', 'Products', 'Sub-cats', 'Order', 'Status', 'Actions'].map(h => <th key={h} className="table-th">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={7} className="table-td"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>)
            ) : categories.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">No categories found</td></tr>
            ) : (
              categories.map(cat => (
                <tr key={cat._id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      {cat.image?.url ? (
                        <img src={cat.image.url} alt={cat.name} className="w-10 h-10 rounded-xl object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center"><Image size={16} className="text-gray-400" /></div>
                      )}
                      <div>
                        <p className="font-medium text-gray-800">{cat.name}</p>
                        <p className="text-xs text-gray-400">{cat.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-td text-gray-500 max-w-[200px] truncate">{cat.description || '—'}</td>
                  <td className="table-td text-center font-medium">{cat.productsCount ?? '—'}</td>
                  <td className="table-td text-center">{cat.subcategoriesCount ?? '—'}</td>
                  <td className="table-td text-center">{cat.sortOrder}</td>
                  <td className="table-td">
                    <span className={`badge-status px-2.5 py-1 rounded-full text-xs font-medium ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {cat.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="table-td">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(cat)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><Edit size={15} /></button>
                      <button onClick={() => handleDelete(cat._id, cat.name)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-lg text-gray-900">{editing ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-admin" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} className="input-admin resize-none" />
              </div>
              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Image</label>
                <div className="flex gap-3">
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                    {imagePreview ? <img src={imagePreview} alt="" className="w-full h-full object-cover" /> : <Image size={24} className="m-auto mt-4 text-gray-300" />}
                  </div>
                  <div className="flex-1 space-y-2">
                    <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary w-full flex items-center justify-center gap-2 py-2">
                      <Upload size={14} /> Upload File
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    <div className="flex gap-2">
                      <input type="url" value={imageUrl} onChange={e => { setImageUrl(e.target.value); setImagePreview(e.target.value); setImageFile(null); }}
                        className="input-admin flex-1 text-xs py-2" placeholder="Or paste image URL" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Sort Order</label>
                  <input type="number" value={form.sortOrder} onChange={e => setForm(p => ({ ...p, sortOrder: e.target.value }))} className="input-admin" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer mb-1">
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} className="w-4 h-4" />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-admin flex-1">{saving ? 'Saving...' : 'Save Category'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
