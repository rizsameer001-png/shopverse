import React, { useEffect, useState, useRef } from 'react';
import { api } from '../store';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, X, Upload, Image } from 'lucide-react';

const EMPTY = { name: '', description: '', website: '', isFeatured: false, isActive: true };

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [logoFile, setLogoFile] = useState(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const fetchAll = async () => {
    const r = await api.get('/brands');
    setBrands(r.data.data);
  };
  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => { setForm(EMPTY); setEditing(null); setLogoFile(null); setLogoUrl(''); setLogoPreview(''); setModal(true); };
  const openEdit = (b) => {
    setForm({ name: b.name, description: b.description || '', website: b.website || '', isFeatured: b.isFeatured, isActive: b.isActive !== false });
    setEditing(b._id); setLogoPreview(b.logo?.url || ''); setLogoFile(null); setLogoUrl(''); setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (logoFile) data.append('logo', logoFile);
      else if (logoUrl) data.append('logoUrl', logoUrl);
      if (editing) await api.put(`/brands/${editing}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      else await api.post('/brands', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(editing ? 'Updated!' : 'Created!');
      setModal(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try { await api.delete(`/brands/${id}`); toast.success('Deleted'); fetchAll(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
        <button onClick={openAdd} className="btn-admin flex items-center gap-2"><Plus size={16} /> Add Brand</button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {brands.map(brand => (
          <div key={brand._id} className="admin-card p-4 text-center group">
            <div className="w-20 h-16 mx-auto mb-3 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
              {brand.logo?.url
                ? <img src={brand.logo.url} alt={brand.name} className="max-w-full max-h-full object-contain" />
                : <Image size={24} className="text-gray-300" />}
            </div>
            <p className="font-semibold text-gray-800 text-sm truncate">{brand.name}</p>
            {brand.productsCount !== undefined && <p className="text-xs text-gray-400 mt-0.5">{brand.productsCount} products</p>}
            <div className="flex items-center justify-center gap-1 mt-2">
              <span className={`badge-status px-2 py-0.5 rounded-full text-xs ${brand.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {brand.isActive ? 'Active' : 'Off'}
              </span>
              {brand.isFeatured && <span className="badge-status px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-700">Featured</span>}
            </div>
            <div className="flex justify-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEdit(brand)} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg"><Edit size={14} /></button>
              <button onClick={() => handleDelete(brand._id, brand.name)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-lg">{editing ? 'Edit' : 'Add'} Brand</h3>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Brand Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-admin" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                <div className="flex gap-3 items-start">
                  <div className="w-20 h-16 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {logoPreview ? <img src={logoPreview} alt="" className="max-w-full max-h-full object-contain" /> : <Image size={20} className="text-gray-300" />}
                  </div>
                  <div className="flex-1 space-y-2">
                    <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary w-full py-2 text-xs flex items-center justify-center gap-1.5">
                      <Upload size={12} /> Upload Logo
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files[0]; if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); setLogoUrl(''); } }} />
                    <input type="url" value={logoUrl} placeholder="Or paste logo URL" className="input-admin text-xs py-2"
                      onChange={e => { setLogoUrl(e.target.value); setLogoPreview(e.target.value); setLogoFile(null); }} />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
                <input type="url" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} className="input-admin" placeholder="https://" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} className="input-admin resize-none" />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(p => ({ ...p, isFeatured: e.target.checked }))} />
                  <span className="text-sm text-gray-700">Featured</span>
                </label>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-admin flex-1">{saving ? 'Saving...' : 'Save Brand'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
