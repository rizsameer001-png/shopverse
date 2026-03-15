import React, { useEffect, useState, useRef } from 'react';
import { api } from '../store';
import toast from 'react-hot-toast';
import { Save, Upload, Plus, Trash2, Globe, DollarSign, Image as ImageIcon, Settings as SettingsIcon } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [logoFile,    setLogoFile]    = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [logoPreview,    setLogoPreview]    = useState('');
  const [faviconPreview, setFaviconPreview] = useState('');
  const [currencies, setCurrencies] = useState([]);
  const [languages,  setLanguages]  = useState([]);
  const [social, setSocial] = useState({});
  const [form, setForm] = useState({});
  const logoRef    = useRef();
  const faviconRef = useRef();

  useEffect(() => {
    api.get('/settings').then(r => {
      const d = r.data.data;
      setSettings(d);
      setForm({ siteName: d.siteName, siteTagline: d.siteTagline, email: d.email || '', phone: d.phone || '', address: d.address || '', defaultCurrency: d.defaultCurrency, defaultLanguage: d.defaultLanguage, freeShippingThreshold: d.freeShippingThreshold, taxRate: d.taxRate, googleAnalyticsId: d.googleAnalyticsId || '' });
      setCurrencies(d.currencies || []);
      setLanguages(d.languages   || []);
      setSocial(d.socialLinks    || {});
      setLogoPreview(d.logo?.url    || '');
      setFaviconPreview(d.favicon?.url || '');
    }).catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => v !== undefined && data.append(k, v));
      data.append('currencies',  JSON.stringify(currencies));
      data.append('languages',   JSON.stringify(languages));
      data.append('socialLinks', JSON.stringify(social));
      if (logoFile)    data.append('logo',    logoFile);
      if (faviconFile) data.append('favicon', faviconFile);
      await api.put('/settings', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Settings saved successfully!');
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const addCurrency = () => setCurrencies(p => [...p, { code: '', symbol: '', name: '', rate: 1, isDefault: false }]);
  const removeCurrency = (i) => setCurrencies(p => p.filter((_, j) => j !== i));
  const updateCurrency = (i, field, val) => setCurrencies(p => p.map((c, j) => j === i ? { ...c, [field]: val } : c));
  const setDefaultCurrency = (i) => setCurrencies(p => p.map((c, j) => ({ ...c, isDefault: j === i })));

  const addLanguage = () => setLanguages(p => [...p, { code: '', name: '', dir: 'ltr', isDefault: false }]);
  const removeLanguage = (i) => setLanguages(p => p.filter((_, j) => j !== i));
  const updateLanguage = (i, field, val) => setLanguages(p => p.map((l, j) => j === i ? { ...l, [field]: val } : l));
  const setDefaultLanguage = (i) => setLanguages(p => p.map((l, j) => ({ ...l, isDefault: j === i })));

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;

  const TABS = [
    { key: 'general',  icon: SettingsIcon, label: 'General'   },
    { key: 'logo',     icon: ImageIcon,    label: 'Logo & Brand'},
    { key: 'currency', icon: DollarSign,   label: 'Currencies' },
    { key: 'language', icon: Globe,        label: 'Languages'  },
    { key: 'social',   icon: Globe,        label: 'Social'     },
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
        <button onClick={handleSave} disabled={saving} className="btn-admin flex items-center gap-2">
          <Save size={15} />{saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Tab nav */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl">
        {TABS.map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all flex-1 justify-center ${activeTab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <Icon size={14} /><span className="hidden sm:block">{label}</span>
          </button>
        ))}
      </div>

      {/* General */}
      {activeTab === 'general' && (
        <div className="admin-card p-6 space-y-4">
          <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-3">General Settings</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[['siteName','Site Name'], ['siteTagline','Tagline'], ['email','Contact Email'], ['phone','Phone'], ['googleAnalyticsId','Google Analytics ID']].map(([k, l]) => (
              <div key={k} className={k === 'address' ? 'sm:col-span-2' : ''}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{l}</label>
                <input value={form[k] || ''} onChange={e => setForm(p => ({ ...p, [k]: e.target.value }))} className="input-admin" />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
            <textarea value={form.address || ''} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} rows={2} className="input-admin resize-none" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Free Shipping Threshold ($)</label>
              <input type="number" min="0" value={form.freeShippingThreshold || 50} onChange={e => setForm(p => ({ ...p, freeShippingThreshold: e.target.value }))} className="input-admin" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tax Rate (%)</label>
              <input type="number" min="0" max="100" value={form.taxRate || 10} onChange={e => setForm(p => ({ ...p, taxRate: e.target.value }))} className="input-admin" />
            </div>
          </div>
        </div>
      )}

      {/* Logo & Brand */}
      {activeTab === 'logo' && (
        <div className="admin-card p-6 space-y-6">
          <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-3">Logo & Branding</h3>
          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Site Logo</label>
            <div className="flex gap-4">
              <div className="w-40 h-16 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50">
                {logoPreview ? <img src={logoPreview} alt="Logo" className="max-w-full max-h-full object-contain p-2" /> : <span className="text-gray-400 text-xs">No logo</span>}
              </div>
              <div className="flex-1 space-y-2">
                <button type="button" onClick={() => logoRef.current?.click()} className="btn-secondary w-full py-2.5 flex items-center justify-center gap-2">
                  <Upload size={14} /> Upload Logo
                </button>
                <input ref={logoRef} type="file" accept="image/*,.svg" className="hidden"
                  onChange={e => { const f = e.target.files[0]; if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)); } }} />
                <p className="text-xs text-gray-400">Recommended: PNG/SVG, transparent background, 300×80px</p>
              </div>
            </div>
          </div>
          {/* Favicon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Favicon</label>
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden bg-gray-50">
                {faviconPreview ? <img src={faviconPreview} alt="Favicon" className="max-w-full max-h-full object-contain" /> : <span className="text-gray-400 text-xs text-center">No icon</span>}
              </div>
              <div className="flex-1 space-y-2">
                <button type="button" onClick={() => faviconRef.current?.click()} className="btn-secondary w-full py-2.5 flex items-center justify-center gap-2">
                  <Upload size={14} /> Upload Favicon
                </button>
                <input ref={faviconRef} type="file" accept="image/*,.ico,.svg" className="hidden"
                  onChange={e => { const f = e.target.files[0]; if (f) { setFaviconFile(f); setFaviconPreview(URL.createObjectURL(f)); } }} />
                <p className="text-xs text-gray-400">Recommended: 32×32 or 64×64 px ICO/PNG</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Currencies */}
      {activeTab === 'currency' && (
        <div className="admin-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-semibold text-gray-800">Currencies</h3>
            <button onClick={addCurrency} className="btn-secondary text-xs flex items-center gap-1.5 py-1.5"><Plus size={13} /> Add Currency</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50"><th className="table-th">Code</th><th className="table-th">Symbol</th><th className="table-th">Name</th><th className="table-th">Rate (vs USD)</th><th className="table-th">Default</th><th className="table-th">Remove</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {currencies.map((c, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2"><input value={c.code} onChange={e => updateCurrency(i, 'code', e.target.value.toUpperCase())} className="input-admin w-20 py-1.5 text-xs font-mono uppercase" maxLength={3} placeholder="USD" /></td>
                    <td className="px-3 py-2"><input value={c.symbol} onChange={e => updateCurrency(i, 'symbol', e.target.value)} className="input-admin w-16 py-1.5 text-xs" placeholder="$" /></td>
                    <td className="px-3 py-2"><input value={c.name} onChange={e => updateCurrency(i, 'name', e.target.value)} className="input-admin w-36 py-1.5 text-xs" placeholder="US Dollar" /></td>
                    <td className="px-3 py-2"><input type="number" step="0.0001" value={c.rate} onChange={e => updateCurrency(i, 'rate', e.target.value)} className="input-admin w-24 py-1.5 text-xs" /></td>
                    <td className="px-3 py-2 text-center"><input type="radio" name="defCurr" checked={!!c.isDefault} onChange={() => setDefaultCurrency(i)} className="text-primary-600" /></td>
                    <td className="px-3 py-2 text-center"><button onClick={() => removeCurrency(i)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={13} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Languages */}
      {activeTab === 'language' && (
        <div className="admin-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-semibold text-gray-800">Languages</h3>
            <button onClick={addLanguage} className="btn-secondary text-xs flex items-center gap-1.5 py-1.5"><Plus size={13} /> Add Language</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50"><th className="table-th">Code</th><th className="table-th">Name</th><th className="table-th">Flag Emoji</th><th className="table-th">Direction</th><th className="table-th">Default</th><th className="table-th">Remove</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {languages.map((l, i) => (
                  <tr key={i}>
                    <td className="px-3 py-2"><input value={l.code} onChange={e => updateLanguage(i, 'code', e.target.value.toLowerCase())} className="input-admin w-16 py-1.5 text-xs font-mono" maxLength={5} placeholder="en" /></td>
                    <td className="px-3 py-2"><input value={l.name} onChange={e => updateLanguage(i, 'name', e.target.value)} className="input-admin w-28 py-1.5 text-xs" placeholder="English" /></td>
                    <td className="px-3 py-2"><input value={l.flag || ''} onChange={e => updateLanguage(i, 'flag', e.target.value)} className="input-admin w-16 py-1.5 text-center text-lg" placeholder="🇺🇸" /></td>
                    <td className="px-3 py-2">
                      <select value={l.dir} onChange={e => updateLanguage(i, 'dir', e.target.value)} className="input-admin w-20 py-1.5 text-xs">
                        <option value="ltr">LTR</option>
                        <option value="rtl">RTL</option>
                      </select>
                    </td>
                    <td className="px-3 py-2 text-center"><input type="radio" name="defLang" checked={!!l.isDefault} onChange={() => setDefaultLanguage(i)} className="text-primary-600" /></td>
                    <td className="px-3 py-2 text-center"><button onClick={() => removeLanguage(i)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={13} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Social */}
      {activeTab === 'social' && (
        <div className="admin-card p-6 space-y-4">
          <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-3">Social Media Links</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[['facebook','Facebook'],['twitter','Twitter / X'],['instagram','Instagram'],['youtube','YouTube'],['tiktok','TikTok'],['linkedin','LinkedIn']].map(([k, l]) => (
              <div key={k}>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{l}</label>
                <input type="url" value={social[k] || ''} onChange={e => setSocial(p => ({ ...p, [k]: e.target.value }))}
                  className="input-admin" placeholder={`https://${k}.com/yourpage`} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
