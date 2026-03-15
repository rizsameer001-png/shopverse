import React, { useEffect, useState, useRef } from 'react';
import { api } from '../store';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, X, Upload, Image as ImageIcon, ExternalLink } from 'lucide-react';

const POSITIONS = ['hero', 'promo', 'sidebar', 'popup'];
const EMPTY = { title: '', subtitle: '', buttonText: 'Shop Now', buttonLink: '/shop', position: 'hero', bgColor: '#fff7ed', textColor: '#1f2937', isActive: true, sortOrder: 0 };

export default function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl]   = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving]   = useState(false);
  const [filterPos, setFilterPos] = useState('');
  const fileRef = useRef();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const r = await api.get('/banners', { params: filterPos ? { position: filterPos } : {} });
      setBanners(r.data.data);
    } catch { toast.error('Failed to load banners'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [filterPos]);

  const openAdd = () => { setForm(EMPTY); setEditing(null); setImageFile(null); setImageUrl(''); setImagePreview(''); setModal(true); };
  const openEdit = (b) => {
    setForm({ title: b.title, subtitle: b.subtitle || '', buttonText: b.buttonText || 'Shop Now', buttonLink: b.buttonLink || '/shop', position: b.position, bgColor: b.bgColor || '#fff7ed', textColor: b.textColor || '#1f2937', isActive: b.isActive !== false, sortOrder: b.sortOrder || 0 });
    setImagePreview(b.image?.url || ''); setImageFile(null); setImageUrl(''); setEditing(b._id); setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (imageFile) data.append('image', imageFile);
      else if (imageUrl) data.append('imageUrl', imageUrl);

      if (editing) await api.put(`/banners/${editing}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      else await api.post('/banners', data, { headers: { 'Content-Type': 'multipart/form-data' } });

      toast.success(editing ? 'Banner updated!' : 'Banner created!');
      setModal(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this banner?')) return;
    try { await api.delete(`/banners/${id}`); toast.success('Deleted'); fetchAll(); }
    catch { toast.error('Delete failed'); }
  };

  const handleToggle = async (b) => {
    try { await api.put(`/banners/${b._id}`, { isActive: !b.isActive }); fetchAll(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
          <p className="text-sm text-gray-500">{banners.length} banners</p>
        </div>
        <div className="flex gap-3">
          <select value={filterPos} onChange={e => setFilterPos(e.target.value)} className="input-admin py-2 w-36">
            <option value="">All Positions</option>
            {POSITIONS.map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
          </select>
          <button onClick={openAdd} className="btn-admin flex items-center gap-2"><Plus size={16} /> Add Banner</button>
        </div>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">{Array(4).fill(0).map((_, i) => <div key={i} className="h-48 admin-card animate-pulse bg-gray-50" />)}</div>
      ) : banners.length === 0 ? (
        <div className="admin-card p-16 text-center">
          <ImageIcon size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500">No banners yet. Add your first banner!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {banners.map(b => (
            <div key={b._id} className={`admin-card overflow-hidden group ${!b.isActive ? 'opacity-60' : ''}`}>
              <div className="relative h-40 overflow-hidden" style={{ backgroundColor: b.bgColor || '#fff7ed' }}>
                {b.image?.url ? (
                  <img src={b.image.url} alt={b.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4">
                    <p className="font-heading font-bold text-lg text-center" style={{ color: b.textColor }}>{b.title}</p>
                    {b.subtitle && <p className="text-sm opacity-70 text-center" style={{ color: b.textColor }}>{b.subtitle}</p>}
                    {b.buttonText && <span className="mt-2 px-4 py-1.5 bg-white/20 backdrop-blur rounded-lg text-sm font-semibold" style={{ color: b.textColor }}>{b.buttonText}</span>}
                  </div>
                )}
                <div className="absolute top-2 left-2 flex gap-1.5">
                  <span className={`badge-status px-2 py-0.5 rounded-full text-[10px] font-bold ${b.isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}`}>{b.isActive ? 'Live' : 'Off'}</span>
                  <span className="badge-status px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/40 text-white capitalize">{b.position}</span>
                </div>
              </div>
              <div className="p-4">
                <p className="font-semibold text-gray-800 text-sm truncate">{b.title}</p>
                {b.subtitle && <p className="text-xs text-gray-400 truncate mt-0.5">{b.subtitle}</p>}
                <div className="flex items-center gap-2 mt-3">
                  <a href={b.buttonLink} target="_blank" rel="noreferrer" className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg">
                    <ExternalLink size={13} />
                  </a>
                  <button onClick={() => openEdit(b)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><Edit size={13} /></button>
                  <button onClick={() => handleToggle(b)} className={`text-xs px-2.5 py-1 rounded-lg font-medium ${b.isActive ? 'bg-yellow-50 text-yellow-700' : 'bg-green-50 text-green-700'}`}>
                    {b.isActive ? 'Hide' : 'Show'}
                  </button>
                  <button onClick={() => handleDelete(b._id)} className="ml-auto p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-semibold text-lg">{editing ? 'Edit Banner' : 'Add Banner'}</h3>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Banner Image</label>
                <div className="flex gap-3">
                  <div className="w-32 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                    {imagePreview ? <img src={imagePreview} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={22} className="m-auto mt-4 text-gray-300" />}
                  </div>
                  <div className="flex-1 space-y-2">
                    <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary w-full py-2 text-xs flex items-center justify-center gap-1.5">
                      <Upload size={12} /> Upload Image
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden"
                      onChange={e => { const f = e.target.files[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); setImageUrl(''); } }} />
                    <input type="url" value={imageUrl} onChange={e => { setImageUrl(e.target.value); setImagePreview(e.target.value); setImageFile(null); }}
                      className="input-admin text-xs py-2" placeholder="Or paste image URL" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
                  <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="input-admin" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Position</label>
                  <select value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))} className="input-admin">
                    {POSITIONS.map(pos => <option key={pos} value={pos} className="capitalize">{pos}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Subtitle</label>
                <input value={form.subtitle} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))} className="input-admin" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Button Text</label>
                  <input value={form.buttonText} onChange={e => setForm(p => ({ ...p, buttonText: e.target.value }))} className="input-admin" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Button Link</label>
                  <input value={form.buttonLink} onChange={e => setForm(p => ({ ...p, buttonLink: e.target.value }))} className="input-admin" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Background Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={form.bgColor} onChange={e => setForm(p => ({ ...p, bgColor: e.target.value }))} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                    <input type="text" value={form.bgColor} onChange={e => setForm(p => ({ ...p, bgColor: e.target.value }))} className="input-admin flex-1" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Text Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={form.textColor} onChange={e => setForm(p => ({ ...p, textColor: e.target.value }))} className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
                    <input type="text" value={form.textColor} onChange={e => setForm(p => ({ ...p, textColor: e.target.value }))} className="input-admin flex-1" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Sort Order</label>
                  <input type="number" value={form.sortOrder} onChange={e => setForm(p => ({ ...p, sortOrder: e.target.value }))} className="input-admin" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer mb-2">
                    <input type="checkbox" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-admin flex-1">{saving ? 'Saving...' : 'Save Banner'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
