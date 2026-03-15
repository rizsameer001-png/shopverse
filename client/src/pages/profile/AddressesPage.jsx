// AddressesPage.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getMe } from '../../store/slices/authSlice';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit, MapPin } from 'lucide-react';

const EMPTY_ADDR = { label: 'Home', street: '', city: '', state: '', country: '', zipCode: '', isDefault: false };

export function AddressesPage() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_ADDR);
  const [loading, setLoading] = useState(false);

  const openAdd = () => { setForm(EMPTY_ADDR); setEditing(null); setShowForm(true); };
  const openEdit = (addr) => { setForm({ ...addr }); setEditing(addr._id); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editing) await api.put(`/users/addresses/${editing}`, form);
      else await api.post('/users/addresses', form);
      toast.success(editing ? 'Address updated!' : 'Address added!');
      dispatch(getMe());
      setShowForm(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this address?')) return;
    try {
      await api.delete(`/users/addresses/${id}`);
      toast.success('Address deleted');
      dispatch(getMe());
    } catch (err) { toast.error('Failed'); }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-gray-900">My Addresses</h2>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2 py-2 text-sm"><Plus size={15} /> Add Address</button>
      </div>
      {user?.addresses?.length === 0 && (
        <div className="card p-10 text-center">
          <MapPin size={48} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">No addresses saved yet.</p>
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        {user?.addresses?.map(addr => (
          <div key={addr._id} className={`card p-5 relative ${addr.isDefault ? 'border-2 border-primary-400' : ''}`}>
            {addr.isDefault && <span className="absolute top-3 right-3 badge bg-primary-100 text-primary-700 text-xs">Default</span>}
            <p className="font-medium text-gray-800 mb-2">{addr.label}</p>
            <div className="text-sm text-gray-600 space-y-0.5">
              <p>{addr.street}</p>
              <p>{addr.city}, {addr.state} {addr.zipCode}</p>
              <p>{addr.country}</p>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => openEdit(addr)} className="btn-ghost text-sm py-1.5 px-3 flex items-center gap-1.5"><Edit size={13} /> Edit</button>
              <button onClick={() => handleDelete(addr._id)} className="text-sm py-1.5 px-3 text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-1.5"><Trash2 size={13} /> Delete</button>
            </div>
          </div>
        ))}
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
            <h3 className="font-semibold text-lg mb-5">{editing ? 'Edit Address' : 'Add New Address'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Label</label>
                  <input type="text" value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} className="input-field" placeholder="Home / Work" />
                </div>
              </div>
              {['street','city','state','country','zipCode'].map(field => (
                <div key={field}>
                  <label className="block text-sm text-gray-600 mb-1 capitalize">{field === 'zipCode' ? 'ZIP Code' : field}</label>
                  <input type="text" required value={form[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} className="input-field" />
                </div>
              ))}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isDefault} onChange={e => setForm(p => ({ ...p, isDefault: e.target.checked }))} />
                <span className="text-sm text-gray-600">Set as default address</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-ghost flex-1 border border-gray-200">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Saving...' : 'Save Address'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default AddressesPage;
