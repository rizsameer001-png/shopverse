import React, { useEffect, useState } from 'react';
import { api } from '../store';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Eye, X, Upload, Image as ImageIcon, Tag } from 'lucide-react';

const EMPTY = { title: '', excerpt: '', content: '', category: 'General', tags: '', status: 'draft', isFeatured: false, metaTitle: '', metaDescription: '' };
const CATEGORIES = ['General', 'Fashion', 'Technology', 'Lifestyle', 'News', 'Tips & Tricks', 'Behind the Scenes'];

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [coverFile, setCoverFile] = useState(null);
  const [coverUrl, setCoverUrl] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const fileRef = React.useRef();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const r = await api.get('/blogs', { params: { page, limit: 12, status: 'all' } });
      setBlogs(r.data.data); setTotal(r.data.total); setPages(r.data.pages);
    } catch { toast.error('Failed to load blogs'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [page]);

  const openAdd = () => { setForm(EMPTY); setEditing(null); setCoverFile(null); setCoverUrl(''); setCoverPreview(''); setModal(true); };
  const openEdit = async (b) => {
    try {
      const r = await api.get(`/blogs/${b._id}`);
      const blog = r.data.data;
      setForm({ title: blog.title, excerpt: blog.excerpt || '', content: blog.content, category: blog.category || 'General', tags: blog.tags?.join(', ') || '', status: blog.status, isFeatured: blog.isFeatured, metaTitle: blog.metaTitle || '', metaDescription: blog.metaDescription || '' });
      setCoverPreview(blog.coverImage?.url || ''); setCoverFile(null); setCoverUrl(''); setEditing(blog._id); setModal(true);
    } catch { toast.error('Failed to load blog'); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) { toast.error('Title and content are required'); return; }
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'tags') data.append('tags', JSON.stringify(v.split(',').map(t => t.trim()).filter(Boolean)));
        else data.append(k, v);
      });
      if (coverFile) data.append('image', coverFile);
      else if (coverUrl) data.append('imageUrl', coverUrl);

      if (editing) await api.put(`/blogs/${editing}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      else await api.post('/blogs', data, { headers: { 'Content-Type': 'multipart/form-data' } });

      toast.success(editing ? 'Blog updated!' : 'Blog published!');
      setModal(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete blog "${title}"?`)) return;
    try { await api.delete(`/blogs/${id}`); toast.success('Deleted'); fetchAll(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const handleToggleStatus = async (blog) => {
    try {
      const newStatus = blog.status === 'published' ? 'draft' : 'published';
      await api.put(`/blogs/${blog._id}`, { status: newStatus });
      toast.success(`Blog ${newStatus === 'published' ? 'published' : 'unpublished'}`);
      fetchAll();
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-sm text-gray-500">{total} total posts</p>
        </div>
        <button onClick={openAdd} className="btn-admin flex items-center gap-2"><Plus size={16} /> New Post</button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <div key={i} className="admin-card h-64 animate-pulse bg-gray-100 rounded-2xl" />)}
        </div>
      ) : blogs.length === 0 ? (
        <div className="admin-card p-16 text-center">
          <div className="text-5xl mb-4">✍️</div>
          <p className="text-gray-500 font-medium">No blog posts yet</p>
          <button onClick={openAdd} className="btn-admin mt-4">Write First Post</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {blogs.map(blog => (
            <div key={blog._id} className="admin-card overflow-hidden group">
              <div className="relative h-44 bg-gray-100 overflow-hidden">
                {blog.coverImage?.url ? (
                  <img src={blog.coverImage.url} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <ImageIcon size={40} />
                  </div>
                )}
                <div className="absolute top-2 left-2 flex gap-1.5">
                  <span className={`badge-status px-2 py-0.5 rounded-full text-xs font-semibold ${blog.status === 'published' ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}`}>
                    {blog.status}
                  </span>
                  {blog.isFeatured && <span className="badge-status px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-500 text-white">Featured</span>}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs text-primary-600 font-medium bg-primary-50 px-2 py-0.5 rounded-full">{blog.category}</span>
                  <span className="text-xs text-gray-400">{new Date(blog.createdAt).toLocaleDateString()}</span>
                  <span className="text-xs text-gray-400 ml-auto">👁 {blog.views}</span>
                </div>
                <h3 className="font-semibold text-gray-800 line-clamp-2 text-sm leading-snug">{blog.title}</h3>
                {blog.excerpt && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{blog.excerpt}</p>}
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-gray-100">
                  <button onClick={() => openEdit(blog)} className="btn-secondary py-1 px-3 text-xs flex items-center gap-1"><Edit size={12} /> Edit</button>
                  <button onClick={() => handleToggleStatus(blog)} className={`py-1 px-3 text-xs rounded-lg font-medium transition-colors ${blog.status === 'published' ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
                    {blog.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button onClick={() => handleDelete(blog._id, blog.title)} className="ml-auto p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-1.5 px-4 disabled:opacity-40">← Prev</button>
          <span className="py-1.5 px-4 text-sm text-gray-600">Page {page} of {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="btn-secondary py-1.5 px-4 disabled:opacity-40">Next →</button>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl my-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="font-semibold text-lg text-gray-900">{editing ? 'Edit Blog Post' : 'New Blog Post'}</h3>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              {/* Cover image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                <div className="flex gap-3">
                  <div className="w-32 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                    {coverPreview ? <img src={coverPreview} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={24} className="m-auto mt-4 text-gray-300" />}
                  </div>
                  <div className="flex-1 space-y-2">
                    <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary w-full py-2 text-xs flex items-center justify-center gap-1.5">
                      <Upload size={12} /> Upload Image
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden"
                      onChange={e => { const f = e.target.files[0]; if (f) { setCoverFile(f); setCoverPreview(URL.createObjectURL(f)); setCoverUrl(''); } }} />
                    <input type="url" placeholder="Or paste image URL" className="input-admin text-xs py-2" value={coverUrl}
                      onChange={e => { setCoverUrl(e.target.value); setCoverPreview(e.target.value); setCoverFile(null); }} />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Title *</label>
                  <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="input-admin" required placeholder="Blog post title" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="input-admin">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Excerpt</label>
                <textarea value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} rows={2} className="input-admin resize-none" placeholder="Short summary shown in listings..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Content *</label>
                <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={10} className="input-admin resize-y font-mono text-sm" required placeholder="Write your blog post content here... (Supports HTML)" />
                <p className="text-xs text-gray-400 mt-1">Supports plain text and HTML markup</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tags (comma separated)</label>
                  <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} className="input-admin" placeholder="fashion, tips, sale" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                  <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="input-admin">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
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
                <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(p => ({ ...p, isFeatured: e.target.checked }))} />
                <span className="text-sm font-medium text-gray-700">⭐ Featured Post</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-admin flex-1">
                  {saving ? 'Saving...' : editing ? 'Update Post' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
