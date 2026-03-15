import React, { useEffect, useState } from 'react';
import { api } from '../store';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, X, Tag, Copy, Check, AlertCircle } from 'lucide-react';

const EMPTY = {
  code: '', type: 'percentage', value: '', minOrderAmount: '0',
  maxDiscount: '', usageLimit: '', userLimit: '1',
  validFrom: new Date().toISOString().split('T')[0],
  validUntil: '', description: '', isActive: true,
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');
  const [errors, setErrors] = useState({});

  const fetchAll = async () => {
    setLoading(true);
    try { const r = await api.get('/coupons'); setCoupons(r.data.data); }
    catch { toast.error('Failed to load coupons'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const openAdd = () => { setForm(EMPTY); setEditing(null); setErrors({}); setModal(true); };

  const openEdit = (c) => {
    setForm({
      code: c.code,
      type: c.type,
      value: c.value?.toString() || '',
      minOrderAmount: (c.minOrderAmount || 0).toString(),
      maxDiscount: c.maxDiscount?.toString() || '',
      usageLimit: c.usageLimit?.toString() || '',
      userLimit: (c.userLimit || 1).toString(),
      validFrom: c.validFrom ? c.validFrom.split('T')[0] : new Date().toISOString().split('T')[0],
      validUntil: c.validUntil ? c.validUntil.split('T')[0] : '',
      description: c.description || '',
      isActive: c.isActive !== false,
    });
    setEditing(c._id);
    setErrors({});
    setModal(true);
  };

  const validate = () => {
    const errs = {};
    if (!form.code.trim()) errs.code = 'Code is required';
    if (!form.value || Number(form.value) <= 0) errs.value = 'Value must be greater than 0';
    if (form.type === 'percentage' && Number(form.value) > 100) errs.value = 'Percentage cannot exceed 100%';
    if (!form.validUntil) errs.validUntil = 'Expiry date is required';
    if (form.validFrom && form.validUntil && form.validFrom >= form.validUntil) errs.validUntil = 'Expiry must be after start date';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        code: form.code.toUpperCase().trim(),
        type: form.type,
        value: Number(form.value),
        minOrderAmount: Number(form.minOrderAmount) || 0,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        userLimit: Number(form.userLimit) || 1,
        validFrom: form.validFrom,
        validUntil: form.validUntil,
        description: form.description,
        isActive: form.isActive,
      };
      if (editing) await api.put(`/coupons/${editing}`, payload);
      else await api.post('/coupons', payload);
      toast.success(editing ? '✅ Coupon updated!' : '✅ Coupon created!');
      setModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save coupon');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, code) => {
    if (!confirm(`Delete coupon "${code}"? This cannot be undone.`)) return;
    try { await api.delete(`/coupons/${id}`); toast.success('Coupon deleted'); fetchAll(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const handleToggleActive = async (coupon) => {
    try {
      await api.put(`/coupons/${coupon._id}`, { isActive: !coupon.isActive });
      toast.success(coupon.isActive ? 'Coupon disabled' : 'Coupon enabled');
      fetchAll();
    } catch { toast.error('Failed to update'); }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Code copied!');
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const isExpired = (validUntil) => new Date(validUntil) < new Date();
  const isActive = (c) => c.isActive && !isExpired(c.validUntil) && (!c.usageLimit || c.usedCount < c.usageLimit);

  const STATUS_CONFIG = {
    active: { label: 'Active', class: 'bg-green-100 text-green-700 border border-green-200' },
    expired: { label: 'Expired', class: 'bg-red-100 text-red-700 border border-red-200' },
    disabled: { label: 'Disabled', class: 'bg-gray-100 text-gray-600 border border-gray-200' },
    exhausted: { label: 'Exhausted', class: 'bg-orange-100 text-orange-700 border border-orange-200' },
  };

  const getCouponStatus = (c) => {
    if (!c.isActive) return 'disabled';
    if (isExpired(c.validUntil)) return 'expired';
    if (c.usageLimit && c.usedCount >= c.usageLimit) return 'exhausted';
    return 'active';
  };

  const inputClass = (field) => `input-admin ${errors[field] ? 'border-red-400 focus:ring-red-400' : ''}`;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-500">{coupons.length} total coupons</p>
        </div>
        <button onClick={openAdd} className="btn-admin flex items-center gap-2"><Plus size={16} /> Add Coupon</button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: coupons.length, color: 'text-gray-900' },
          { label: 'Active', value: coupons.filter(c => getCouponStatus(c) === 'active').length, color: 'text-green-600' },
          { label: 'Expired', value: coupons.filter(c => getCouponStatus(c) === 'expired').length, color: 'text-red-600' },
          { label: 'Disabled', value: coupons.filter(c => getCouponStatus(c) === 'disabled').length, color: 'text-gray-500' },
        ].map(s => (
          <div key={s.label} className="admin-card p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Coupon Cards */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <div key={i} className="h-52 admin-card animate-pulse bg-gray-50" />)}
        </div>
      ) : coupons.length === 0 ? (
        <div className="admin-card p-16 text-center">
          <Tag size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500">No coupons yet. Create your first coupon!</p>
          <button onClick={openAdd} className="btn-admin mt-4">Create Coupon</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map(c => {
            const status = getCouponStatus(c);
            const statusCfg = STATUS_CONFIG[status];
            const usedPct = c.usageLimit ? Math.min(100, Math.round((c.usedCount / c.usageLimit) * 100)) : 0;

            return (
              <div key={c._id} className={`admin-card p-5 relative overflow-hidden transition-opacity ${status !== 'active' ? 'opacity-75' : ''}`}>
                {/* Background deco */}
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary-50 rounded-full opacity-50" />
                <div className="absolute -right-2 -bottom-4 w-16 h-16 bg-primary-50 rounded-full opacity-30" />

                <div className="relative">
                  {/* Header row */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Tag size={14} className="text-primary-600" />
                        <button onClick={() => copyCode(c.code)} className="group flex items-center gap-1.5">
                          <span className="font-mono font-bold text-gray-900 tracking-wider">{c.code}</span>
                          {copiedCode === c.code
                            ? <Check size={12} className="text-green-500" />
                            : <Copy size={11} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />}
                        </button>
                      </div>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusCfg.class}`}>
                        {statusCfg.label}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <Edit size={13} />
                      </button>
                      <button onClick={() => handleDelete(c._id, c.code)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Discount value */}
                  <div className="bg-gray-50 rounded-xl py-3 px-4 text-center mb-3">
                    <span className="text-3xl font-black text-gray-900">
                      {c.type === 'percentage' ? `${c.value}%` : `$${c.value}`}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">OFF</span>
                  </div>

                  {/* Details */}
                  <div className="space-y-1.5 text-xs text-gray-500">
                    {c.minOrderAmount > 0 && (
                      <div className="flex justify-between">
                        <span>Min. order:</span>
                        <span className="font-medium text-gray-700">${c.minOrderAmount}</span>
                      </div>
                    )}
                    {c.maxDiscount && c.type === 'percentage' && (
                      <div className="flex justify-between">
                        <span>Max discount:</span>
                        <span className="font-medium text-gray-700">${c.maxDiscount}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Expires:</span>
                      <span className={`font-medium ${isExpired(c.validUntil) ? 'text-red-600' : 'text-gray-700'}`}>
                        {new Date(c.validUntil).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Used:</span>
                      <span className="font-medium text-gray-700">
                        {c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ' times'}
                      </span>
                    </div>
                  </div>

                  {/* Usage bar */}
                  {c.usageLimit > 0 && (
                    <div className="mt-2.5">
                      <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                        <span>Usage</span><span>{usedPct}%</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full transition-all ${usedPct >= 100 ? 'bg-red-500' : usedPct >= 75 ? 'bg-orange-500' : 'bg-green-500'}`}
                          style={{ width: `${usedPct}%` }} />
                      </div>
                    </div>
                  )}

                  {/* Enable/Disable toggle */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    {c.description && <p className="text-xs text-gray-400 truncate max-w-[140px]">{c.description}</p>}
                    <button onClick={() => handleToggleActive(c)}
                      className={`ml-auto text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${c.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                      {c.isActive ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-4">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{editing ? 'Edit Coupon' : 'Create Coupon'}</h3>
                <p className="text-xs text-gray-400 mt-0.5">Fill in the details below</p>
              </div>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              {/* Code + Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Coupon Code *</label>
                  <input
                    value={form.code}
                    onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase().replace(/\s/g, '') }))}
                    className={inputClass('code') + ' uppercase font-mono font-bold tracking-widest'}
                    placeholder="SAVE20"
                    maxLength={20}
                    required
                  />
                  {errors.code && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.code}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount Type *</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value, maxDiscount: '' }))} className="input-admin">
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
              </div>

              {/* Value + Max discount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {form.type === 'percentage' ? 'Discount %' : 'Discount Amount ($)'} *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">
                      {form.type === 'percentage' ? '%' : '$'}
                    </span>
                    <input type="number" min="0.01" max={form.type === 'percentage' ? 100 : undefined} step="0.01"
                      value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))}
                      className={inputClass('value') + ' pl-8'} placeholder={form.type === 'percentage' ? '20' : '10.00'} required />
                  </div>
                  {errors.value && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.value}</p>}
                </div>
                {form.type === 'percentage' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Discount Cap ($)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                      <input type="number" min="0" step="0.01" value={form.maxDiscount}
                        onChange={e => setForm(p => ({ ...p, maxDiscount: e.target.value }))}
                        className="input-admin pl-8" placeholder="e.g. 50 (optional)" />
                    </div>
                  </div>
                )}
              </div>

              {/* Min order + usage limit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Minimum Order ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input type="number" min="0" step="0.01" value={form.minOrderAmount}
                      onChange={e => setForm(p => ({ ...p, minOrderAmount: e.target.value }))}
                      className="input-admin pl-8" placeholder="0" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Usage Limit</label>
                  <input type="number" min="1" value={form.usageLimit}
                    onChange={e => setForm(p => ({ ...p, usageLimit: e.target.value }))}
                    className="input-admin" placeholder="∞ unlimited" />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Start Date</label>
                  <input type="date" value={form.validFrom} onChange={e => setForm(p => ({ ...p, validFrom: e.target.value }))} className="input-admin" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiry Date *</label>
                  <input type="date" value={form.validUntil} onChange={e => setForm(p => ({ ...p, validUntil: e.target.value }))}
                    className={inputClass('validUntil')} min={form.validFrom || new Date().toISOString().split('T')[0]} required />
                  {errors.validUntil && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={10} />{errors.validUntil}</p>}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Internal Description</label>
                <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className="input-admin" placeholder="e.g. Summer sale coupon for new customers" />
              </div>

              {/* Active toggle */}
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded-xl">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={form.isActive} onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />
                  <div className={`w-10 h-5 rounded-full transition-colors ${form.isActive ? 'bg-primary-600' : 'bg-gray-300'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form.isActive ? 'left-5' : 'left-0.5'}`} />
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Coupon Active</span>
                  <p className="text-xs text-gray-400">{form.isActive ? 'Customers can use this coupon' : 'Coupon is disabled'}</p>
                </div>
              </label>

              {/* Preview */}
              {form.code && form.value && (
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-primary-600 font-medium mb-1">Preview</p>
                  <p className="font-mono font-black text-xl text-primary-800 tracking-widest">{form.code}</p>
                  <p className="text-sm text-primary-700 mt-0.5">
                    {form.type === 'percentage' ? `${form.value}% off` : `$${form.value} off`}
                    {form.minOrderAmount > 0 ? ` on orders over $${form.minOrderAmount}` : ''}
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={saving} className="btn-admin flex-1">
                  {saving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (editing ? 'Update Coupon' : 'Create Coupon')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
