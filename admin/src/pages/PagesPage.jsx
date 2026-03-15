import React, { useEffect, useState } from 'react';
import { api } from '../store';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, X, Globe, Lock, Eye, Upload, Image as ImageIcon } from 'lucide-react';

const EMPTY = { title: '', content: '', excerpt: '', template: 'default', status: 'draft', showInNav: false, sortOrder: 0, metaTitle: '', metaDescription: '' };
const TEMPLATES = ['default', 'full-width', 'sidebar', 'landing'];

export default function PagesPage() {
  const [pagesData, setPagesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [isSystem, setIsSystem] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [coverFile, setCoverFile] = useState(null);
  const [coverUrl, setCoverUrl] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const fileRef = React.useRef();

  const fetchAll = async () => {
    setLoading(true);
    try { const r = await api.get('/pages', { params: { status: 'all' } }); setPagesData(r.data.data); }
    catch { toast.error('Failed to load pages'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => { setForm(EMPTY); setEditing(null); setIsSystem(false); setCoverFile(null); setCoverUrl(''); setCoverPreview(''); setModal(true); };

  const openEdit = async (p) => {
    try {
      const r = await api.get(`/pages/${p._id}`);
      const pg = r.data.data;
      setForm({ title: pg.title, content: pg.content, excerpt: pg.excerpt || '', template: pg.template, status: pg.status, showInNav: pg.showInNav, sortOrder: pg.sortOrder || 0, metaTitle: pg.metaTitle || '', metaDescription: pg.metaDescription || '' });
      setIsSystem(pg.isSystem);
      setCoverPreview(pg.coverImage?.url || ''); setCoverFile(null); setCoverUrl(''); setEditing(pg._id); setModal(true);
    } catch { toast.error('Failed to load page'); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) { toast.error('Title and content required'); return; }
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (coverFile) data.append('image', coverFile);
      else if (coverUrl) data.append('imageUrl', coverUrl);

      if (editing) await api.put(`/pages/${editing}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      else await api.post('/pages', data, { headers: { 'Content-Type': 'multipart/form-data' } });

      toast.success(editing ? 'Page updated!' : 'Page created!');
      setModal(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete page "${title}"?`)) return;
    try { await api.delete(`/pages/${id}`); toast.success('Deleted'); fetchAll(); }
    catch (err) { toast.error(err.response?.data?.message || 'Cannot delete system page'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CMS Pages</h1>
          <p className="text-sm text-gray-500">{pagesData.length} pages</p>
        </div>
        <button onClick={openAdd} className="btn-admin flex items-center gap-2"><Plus size={16} /> New Page</button>
      </div>

      <div className="admin-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['Title', 'Slug', 'Template', 'Nav', 'Status', 'Last Updated', 'Actions'].map(h => <th key={h} className="table-th">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              Array(5).fill(0).map((_, i) => <tr key={i}><td colSpan={7} className="table-td"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>)
            ) : pagesData.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-400">
                <Globe size={40} className="mx-auto mb-2 text-gray-200" />
                No pages yet. Create your first page.
              </td></tr>
            ) : (
              pagesData.map(pg => (
                <tr key={pg._id} className="hover:bg-gray-50 transition-colors">
                  <td className="table-td">
                    <div className="flex items-center gap-2">
                      {pg.isSystem && <Lock size={12} className="text-gray-400 flex-shrink-0" title="System page" />}
                      <span className="font-medium text-gray-800">{pg.title}</span>
                    </div>
                  </td>
                  <td className="table-td text-gray-400 font-mono text-xs">/{pg.slug}</td>
                  <td className="table-td capitalize text-gray-500 text-xs">{pg.template}</td>
                  <td className="table-td">
                    <span className={`badge-status px-2 py-0.5 rounded-full text-xs ${pg.showInNav ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                      {pg.showInNav ? '✓ In Nav' : 'Hidden'}
                    </span>
                  </td>
                  <td className="table-td">
                    <span className={`badge-status px-2.5 py-1 rounded-full text-xs font-medium ${pg.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {pg.status}
                    </span>
                  </td>
                  <td className="table-td text-gray-400 text-xs">{new Date(pg.updatedAt).toLocaleDateString()}</td>
                  <td className="table-td">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(pg)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><Edit size={15} /></button>
                      {!pg.isSystem && (
                        <button onClick={() => handleDelete(pg._id, pg.title)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={15} /></button>
                      )}
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl my-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
              <h3 className="font-semibold text-lg">{editing ? 'Edit Page' : 'Create New Page'}</h3>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              {isSystem && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700 flex items-center gap-2">
                  <Lock size={14} /> This is a system page. Be careful with edits.
                </div>
              )}

              {/* Cover */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                <div className="flex gap-3">
                  <div className="w-28 h-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                    {coverPreview ? <img src={coverPreview} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={20} className="m-auto mt-3 text-gray-300" />}
                  </div>
                  <div className="flex-1 space-y-2">
                    <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary w-full py-2 text-xs flex items-center justify-center gap-1.5">
                      <Upload size={12} /> Upload
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden"
                      onChange={e => { const f = e.target.files[0]; if (f) { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); setCoverUrl(''); } }} />
                    <input type="url" value={coverUrl} onChange={e => { setCoverUrl(e.target.value); setCoverPreview(e.target.value); setCoverFile(null); }} className="input-admin text-xs py-2" placeholder="Or paste image URL" />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Page Title *</label>
                  <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="input-admin" required placeholder="About Us" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Template</label>
                  <select value={form.template} onChange={e => setForm(p => ({ ...p, template: e.target.value }))} className="input-admin">
                    {TEMPLATES.map(t => <option key={t} value={t} className="capitalize">{t.replace('-', ' ')}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Excerpt</label>
                <textarea value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} rows={2} className="input-admin resize-none" placeholder="Short page description..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Page Content * <span className="text-gray-400 font-normal">(HTML supported)</span></label>
                <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={12} className="input-admin resize-y font-mono text-sm" required placeholder="<h2>About Us</h2><p>Your page content here...</p>" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="input-admin">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Sort Order</label>
                  <input type="number" value={form.sortOrder} onChange={e => setForm(p => ({ ...p, sortOrder: e.target.value }))} className="input-admin" />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Title</label>
                  <input value={form.metaTitle} onChange={e => setForm(p => ({ ...p, metaTitle: e.target.value }))} className="input-admin" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Meta Description</label>
                  <input value={form.metaDescription} onChange={e => setForm(p => ({ ...p, metaDescription: e.target.value }))} className="input-admin" />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.showInNav} onChange={e => setForm(p => ({ ...p, showInNav: e.target.checked }))} />
                <span className="text-sm font-medium text-gray-700">Show in Navigation Menu</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-admin flex-1">{saving ? 'Saving...' : editing ? 'Update Page' : 'Create Page'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
