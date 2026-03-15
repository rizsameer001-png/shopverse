import React, { useEffect, useState } from 'react';
import { api } from '../store';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, X } from 'lucide-react';

export default function SubCategoriesPage() {
  const [subs, setSubs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', category: '', description: '', isActive: true });
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState('');

  const fetchAll = async () => {
    const [subRes, catRes] = await Promise.all([
      api.get('/subcategories' + (filterCat ? `?category=${filterCat}` : '')),
      api.get('/categories')
    ]);
    setSubs(subRes.data.data);
    setCategories(catRes.data.data);
  };

  useEffect(() => { fetchAll(); }, [filterCat]);

  const openAdd = () => { setForm({ name: '', category: '', description: '', isActive: true }); setEditing(null); setModal(true); };
  const openEdit = (s) => { setForm({ name: s.name, category: s.category?._id || '', description: s.description || '', isActive: s.isActive !== false }); setEditing(s._id); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await api.put(`/subcategories/${editing}`, form);
      else await api.post('/subcategories', form);
      toast.success(editing ? 'Updated!' : 'Created!');
      setModal(false);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try { await api.delete(`/subcategories/${id}`); toast.success('Deleted'); fetchAll(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Sub-Categories</h1>
        <div className="flex gap-3">
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="input-admin w-44 py-2">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <button onClick={openAdd} className="btn-admin flex items-center gap-2"><Plus size={16} /> Add SubCategory</button>
        </div>
      </div>
      <div className="admin-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['Name', 'Category', 'Status', 'Actions'].map(h => <th key={h} className="table-th">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {subs.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-gray-400">No subcategories found</td></tr>
            ) : subs.map(s => (
              <tr key={s._id} className="hover:bg-gray-50">
                <td className="table-td font-medium text-gray-800">{s.name}</td>
                <td className="table-td text-gray-500">{s.category?.name || '—'}</td>
                <td className="table-td">
                  <span className={`badge-status px-2.5 py-1 rounded-full text-xs font-medium ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {s.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="table-td">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(s)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><Edit size={15} /></button>
                    <button onClick={() => handleDelete(s._id, s.name)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-lg">{editing ? 'Edit' : 'Add'} SubCategory</h3>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-admin" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="input-admin" required>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} className="input-admin resize-none" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
              <div className="flex gap-3">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-admin flex-1">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
