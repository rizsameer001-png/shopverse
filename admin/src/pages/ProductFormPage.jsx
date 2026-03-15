import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../store';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, Link as LinkIcon, Trash2, Star, ZoomIn, X, Plus, GripVertical } from 'lucide-react';

const EMPTY_FORM = {
  name: '', description: '', shortDescription: '', price: '', comparePrice: '',
  costPrice: '', sku: '', barcode: '', stock: '', lowStockThreshold: '5',
  category: '', subcategory: '', brand: '', discount: '0', weight: '',
  shippingClass: 'standard', isFeatured: false, isNewArrival: false,
  isBestSeller: false, isActive: true, metaTitle: '', metaDescription: '',
  tags: '', variants: [], specifications: [],
};

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const fileInputRef = useRef();

  const [form, setForm] = useState(EMPTY_FORM);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [urlInput, setUrlInput] = useState('');
  const [urlImages, setUrlImages] = useState([]);
  const [removeImages, setRemoveImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [zoomImg, setZoomImg] = useState(null);
  const [variantName, setVariantName] = useState('');
  const [variantOptions, setVariantOptions] = useState('');
  const [specKey, setSpecKey] = useState('');
  const [specVal, setSpecVal] = useState('');

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.data));
    api.get('/brands').then(r => setBrands(r.data.data));
    if (isEdit) {
      api.get(`/products/${id}`).then(r => {
        const p = r.data.data;
        setForm({
          name: p.name || '', description: p.description || '',
          shortDescription: p.shortDescription || '', price: p.price || '',
          comparePrice: p.comparePrice || '', costPrice: p.costPrice || '',
          sku: p.sku || '', barcode: p.barcode || '', stock: p.stock || '',
          lowStockThreshold: p.lowStockThreshold || '5', category: p.category?._id || '',
          subcategory: p.subcategory?._id || '', brand: p.brand?._id || '',
          discount: p.discount || '0', weight: p.weight || '',
          shippingClass: p.shippingClass || 'standard', isFeatured: p.isFeatured || false,
          isNewArrival: p.isNewArrival || false, isBestSeller: p.isBestSeller || false,
          isActive: p.isActive !== false, metaTitle: p.metaTitle || '',
          metaDescription: p.metaDescription || '',
          tags: p.tags?.join(', ') || '',
          variants: p.variants || [], specifications: p.specifications || [],
        });
        setExistingImages(p.images || []);
        if (p.category?._id) {
          api.get(`/subcategories?category=${p.category._id}`).then(r => setSubcategories(r.data.data));
        }
      });
    }
  }, [id]);

  const handleCategoryChange = async (catId) => {
    setForm(p => ({ ...p, category: catId, subcategory: '' }));
    if (catId) {
      const res = await api.get(`/subcategories?category=${catId}`);
      setSubcategories(res.data.data);
    } else setSubcategories([]);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setNewFiles(p => [...p, ...previews]);
  };

  const handleAddUrlImage = () => {
    const url = urlInput.trim();
    if (!url.startsWith('http')) { toast.error('Enter a valid URL'); return; }
    setUrlImages(p => [...p, url]);
    setUrlInput('');
  };

  const handleRemoveExisting = (publicId) => {
    setRemoveImages(p => [...p, publicId]);
    setExistingImages(p => p.filter(i => i.public_id !== publicId));
  };

  const handleAddVariant = () => {
    if (!variantName.trim() || !variantOptions.trim()) return;
    const options = variantOptions.split(',').map(o => o.trim()).filter(Boolean);
    setForm(p => ({ ...p, variants: [...p.variants, { name: variantName, options }] }));
    setVariantName(''); setVariantOptions('');
  };

  const handleAddSpec = () => {
    if (!specKey.trim() || !specVal.trim()) return;
    setForm(p => ({ ...p, specifications: [...p.specifications, { key: specKey, value: specVal }] }));
    setSpecKey(''); setSpecVal('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      const fields = ['name','description','shortDescription','price','comparePrice','costPrice',
        'sku','barcode','stock','lowStockThreshold','category','subcategory','brand','discount',
        'weight','shippingClass','metaTitle','metaDescription'];
      fields.forEach(f => { if (form[f] !== '') data.append(f, form[f]); });
      data.append('isFeatured', form.isFeatured);
      data.append('isNewArrival', form.isNewArrival);
      data.append('isBestSeller', form.isBestSeller);
      data.append('isActive', form.isActive);
      if (form.tags) data.append('tags', JSON.stringify(form.tags.split(',').map(t => t.trim()).filter(Boolean)));
      data.append('variants', JSON.stringify(form.variants));
      data.append('specifications', JSON.stringify(form.specifications));
      newFiles.forEach(f => data.append('images', f.file));
      if (urlImages.length) data.append('imageUrls', JSON.stringify(urlImages));
      if (isEdit && removeImages.length) data.append('removeImages', JSON.stringify(removeImages));

      if (isEdit) await api.put(`/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      else await api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } });

      toast.success(isEdit ? 'Product updated!' : 'Product created!');
      navigate('/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally { setLoading(false); }
  };

  const inputClass = "input-admin";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/products" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft size={18} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="text-gray-500 text-sm">{isEdit ? 'Update product details' : 'Fill in the details to create a new product'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Main Info */}
          <div className="lg:col-span-2 space-y-5">

            {/* Basic Info */}
            <div className="admin-card p-5 space-y-4">
              <h2 className="font-semibold text-gray-800 text-base border-b border-gray-100 pb-3">Basic Information</h2>
              <div>
                <label className={labelClass}>Product Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputClass} required placeholder="Enter product name" />
              </div>
              <div>
                <label className={labelClass}>Short Description</label>
                <textarea value={form.shortDescription} onChange={e => setForm(p => ({ ...p, shortDescription: e.target.value }))}
                  rows={2} className={inputClass + " resize-none"} placeholder="Brief product summary (max 500 chars)" maxLength={500} />
              </div>
              <div>
                <label className={labelClass}>Full Description *</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={6} className={inputClass + " resize-none"} required placeholder="Detailed product description..." />
              </div>
              <div>
                <label className={labelClass}>Tags (comma separated)</label>
                <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} className={inputClass} placeholder="electronics, phone, android" />
              </div>
            </div>

            {/* ═══ IMAGE SECTION ═══ */}
            <div className="admin-card p-5 space-y-4">
              <h2 className="font-semibold text-gray-800 text-base border-b border-gray-100 pb-3">Product Images</h2>

              {/* Existing images */}
              {existingImages.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2 font-medium">Current Images</p>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {existingImages.map((img, i) => (
                      <div key={img.public_id || i} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-transparent hover:border-primary-400 transition-all">
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                        {img.isDefault && (
                          <span className="absolute top-1 left-1 bg-primary-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                            DEFAULT
                          </span>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button type="button" onClick={() => setZoomImg(img.url)} className="p-1.5 bg-white/90 rounded-lg hover:bg-white">
                            <ZoomIn size={14} className="text-gray-700" />
                          </button>
                          <button type="button" onClick={() => handleRemoveExisting(img.public_id)} className="p-1.5 bg-white/90 rounded-lg hover:bg-red-100">
                            <Trash2 size={14} className="text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New file uploads */}
              {newFiles.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2 font-medium">New Uploads (pending)</p>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {newFiles.map((f, i) => (
                      <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-primary-300">
                        <img src={f.preview} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button type="button" onClick={() => setNewFiles(p => p.filter((_, j) => j !== i))} className="p-1.5 bg-white/90 rounded-lg">
                            <Trash2 size={14} className="text-red-600" />
                          </button>
                        </div>
                        <span className="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-[9px] rounded px-1 truncate">{f.file.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* URL images */}
              {urlImages.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2 font-medium">Images from URLs (pending)</p>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {urlImages.map((url, i) => (
                      <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 border-amber-300">
                        <img src={url} alt="" className="w-full h-full object-cover" onError={e => e.target.src = '/placeholder.png'} />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button type="button" onClick={() => setUrlImages(p => p.filter((_, j) => j !== i))} className="p-1.5 bg-white/90 rounded-lg">
                            <Trash2 size={14} className="text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload controls */}
              <div className="space-y-3">
                {/* File upload drop zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')); setNewFiles(p => [...p, ...files.map(f => ({ file: f, preview: URL.createObjectURL(f) }))]); }}
                  className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all group"
                >
                  <Upload size={28} className="mx-auto text-gray-400 group-hover:text-primary-500 mb-2" />
                  <p className="text-sm font-medium text-gray-600">Drag & drop or <span className="text-primary-600">click to upload</span></p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP • Max 5MB each • Up to 10 images</p>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple accept="image/*" className="hidden" />
                </div>

                {/* URL input */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="url"
                      value={urlInput}
                      onChange={e => setUrlInput(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddUrlImage())}
                      className={inputClass + " pl-8"}
                      placeholder="Or paste an image URL (https://...)"
                    />
                  </div>
                  <button type="button" onClick={handleAddUrlImage} className="btn-secondary whitespace-nowrap flex items-center gap-1.5">
                    <Plus size={14} /> Add URL
                  </button>
                </div>
              </div>
            </div>

            {/* Variants */}
            <div className="admin-card p-5 space-y-4">
              <h2 className="font-semibold text-gray-800 text-base border-b border-gray-100 pb-3">Variants</h2>
              {form.variants.length > 0 && (
                <div className="space-y-2">
                  {form.variants.map((v, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                      <div>
                        <span className="font-medium text-sm text-gray-800">{v.name}:</span>
                        <span className="text-sm text-gray-500 ml-2">{v.options.join(', ')}</span>
                      </div>
                      <button type="button" onClick={() => setForm(p => ({ ...p, variants: p.variants.filter((_, j) => j !== i) }))}
                        className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-3 gap-2">
                <input value={variantName} onChange={e => setVariantName(e.target.value)} className={inputClass} placeholder="Name (e.g. Color)" />
                <input value={variantOptions} onChange={e => setVariantOptions(e.target.value)} className={inputClass} placeholder="Options (Red,Blue,Green)" />
                <button type="button" onClick={handleAddVariant} className="btn-secondary flex items-center justify-center gap-1.5">
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>

            {/* Specifications */}
            <div className="admin-card p-5 space-y-4">
              <h2 className="font-semibold text-gray-800 text-base border-b border-gray-100 pb-3">Specifications</h2>
              {form.specifications.length > 0 && (
                <div className="rounded-xl overflow-hidden border border-gray-200">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-gray-100">
                      {form.specifications.map((s, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="px-4 py-2.5 font-medium text-gray-700 w-1/3">{s.key}</td>
                          <td className="px-4 py-2.5 text-gray-600">{s.value}</td>
                          <td className="px-4 py-2.5 w-10">
                            <button type="button" onClick={() => setForm(p => ({ ...p, specifications: p.specifications.filter((_, j) => j !== i) }))}
                              className="text-red-400 hover:text-red-600">
                              <X size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2">
                <input value={specKey} onChange={e => setSpecKey(e.target.value)} className={inputClass} placeholder="Key (e.g. Material)" />
                <input value={specVal} onChange={e => setSpecVal(e.target.value)} className={inputClass} placeholder="Value (e.g. Cotton)" />
                <button type="button" onClick={handleAddSpec} className="btn-secondary flex items-center justify-center gap-1.5">
                  <Plus size={14} /> Add
                </button>
              </div>
            </div>

            {/* SEO */}
            <div className="admin-card p-5 space-y-4">
              <h2 className="font-semibold text-gray-800 text-base border-b border-gray-100 pb-3">SEO</h2>
              <div>
                <label className={labelClass}>Meta Title</label>
                <input value={form.metaTitle} onChange={e => setForm(p => ({ ...p, metaTitle: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Meta Description</label>
                <textarea value={form.metaDescription} onChange={e => setForm(p => ({ ...p, metaDescription: e.target.value }))}
                  rows={2} className={inputClass + " resize-none"} />
              </div>
            </div>
          </div>

          {/* Right: Settings */}
          <div className="space-y-5">
            {/* Pricing */}
            <div className="admin-card p-5 space-y-4">
              <h2 className="font-semibold text-gray-800 text-base border-b border-gray-100 pb-3">Pricing</h2>
              <div>
                <label className={labelClass}>Selling Price ($) *</label>
                <input type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Compare Price ($)</label>
                <input type="number" min="0" step="0.01" value={form.comparePrice} onChange={e => setForm(p => ({ ...p, comparePrice: e.target.value }))} className={inputClass} placeholder="Original/crossed price" />
              </div>
              <div>
                <label className={labelClass}>Cost Price ($)</label>
                <input type="number" min="0" step="0.01" value={form.costPrice} onChange={e => setForm(p => ({ ...p, costPrice: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Discount (%)</label>
                <input type="number" min="0" max="100" value={form.discount} onChange={e => setForm(p => ({ ...p, discount: e.target.value }))} className={inputClass} />
              </div>
            </div>

            {/* Inventory */}
            <div className="admin-card p-5 space-y-4">
              <h2 className="font-semibold text-gray-800 text-base border-b border-gray-100 pb-3">Inventory</h2>
              <div>
                <label className={labelClass}>Stock Quantity *</label>
                <input type="number" min="0" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Low Stock Alert</label>
                <input type="number" min="0" value={form.lowStockThreshold} onChange={e => setForm(p => ({ ...p, lowStockThreshold: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>SKU</label>
                <input value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))} className={inputClass} placeholder="e.g. SKU-001" />
              </div>
              <div>
                <label className={labelClass}>Barcode</label>
                <input value={form.barcode} onChange={e => setForm(p => ({ ...p, barcode: e.target.value }))} className={inputClass} />
              </div>
            </div>

            {/* Classification */}
            <div className="admin-card p-5 space-y-4">
              <h2 className="font-semibold text-gray-800 text-base border-b border-gray-100 pb-3">Classification</h2>
              <div>
                <label className={labelClass}>Category *</label>
                <select value={form.category} onChange={e => handleCategoryChange(e.target.value)} className={inputClass} required>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              {subcategories.length > 0 && (
                <div>
                  <label className={labelClass}>SubCategory</label>
                  <select value={form.subcategory} onChange={e => setForm(p => ({ ...p, subcategory: e.target.value }))} className={inputClass}>
                    <option value="">None</option>
                    {subcategories.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className={labelClass}>Brand</label>
                <select value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} className={inputClass}>
                  <option value="">No brand</option>
                  {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Shipping Class</label>
                <select value={form.shippingClass} onChange={e => setForm(p => ({ ...p, shippingClass: e.target.value }))} className={inputClass}>
                  <option value="standard">Standard</option>
                  <option value="express">Express</option>
                  <option value="free">Free</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Weight (kg)</label>
                <input type="number" min="0" step="0.01" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} className={inputClass} />
              </div>
            </div>

            {/* Flags */}
            <div className="admin-card p-5 space-y-3">
              <h2 className="font-semibold text-gray-800 text-base border-b border-gray-100 pb-3">Product Flags</h2>
              {[
                { key: 'isActive', label: 'Active (visible to customers)', color: 'text-green-600' },
                { key: 'isFeatured', label: '⭐ Featured Product', color: 'text-yellow-600' },
                { key: 'isNewArrival', label: '🆕 New Arrival', color: 'text-blue-600' },
                { key: 'isBestSeller', label: '🔥 Best Seller', color: 'text-orange-600' },
              ].map(({ key, label, color }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" checked={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.checked }))} className="sr-only" />
                    <div className={`w-10 h-5 rounded-full transition-colors ${form[key] ? 'bg-primary-600' : 'bg-gray-200'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form[key] ? 'left-5' : 'left-0.5'}`} />
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${form[key] ? color : 'text-gray-500'}`}>{label}</span>
                </label>
              ))}
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <Link to="/products" className="btn-secondary flex-1 text-center">Cancel</Link>
              <button type="submit" disabled={loading} className="btn-admin flex-1">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </span>
                ) : (isEdit ? 'Update Product' : 'Create Product')}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Zoom Modal */}
      {zoomImg && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setZoomImg(null)}>
          <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setZoomImg(null)} className="absolute -top-10 right-0 text-white hover:text-gray-300 p-2">
              <X size={24} />
            </button>
            <img src={zoomImg} alt="Zoom preview" className="w-full rounded-2xl max-h-[80vh] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
