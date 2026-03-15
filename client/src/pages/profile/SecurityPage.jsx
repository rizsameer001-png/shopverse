import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePassword } from '../../store/slices/authSlice';
import { Eye, EyeOff, Shield } from 'lucide-react';

export default function SecurityPage() {
  const dispatch = useDispatch();
  const { loading } = useSelector(s => s.auth);
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ cur: false, new: false, conf: false });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.newPassword !== form.confirmPassword) { setError('New passwords do not match'); return; }
    if (form.newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    const result = await dispatch(updatePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword }));
    if (result.type === 'auth/updatePassword/fulfilled') {
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };

  return (
    <div className="card p-6 max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
          <Shield size={18} className="text-primary-600" />
        </div>
        <div>
          <h2 className="font-heading text-xl font-bold text-gray-900">Security</h2>
          <p className="text-sm text-gray-500">Update your password</p>
        </div>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        {[
          { field: 'currentPassword', label: 'Current Password', showKey: 'cur' },
          { field: 'newPassword', label: 'New Password', showKey: 'new' },
          { field: 'confirmPassword', label: 'Confirm New Password', showKey: 'conf' },
        ].map(({ field, label, showKey }) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
            <div className="relative">
              <input
                type={show[showKey] ? 'text' : 'password'}
                required
                value={form[field]}
                onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                className="input-field pr-10"
                placeholder="••••••••"
              />
              <button type="button" onClick={() => setShow(p => ({ ...p, [showKey]: !p[showKey] }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {show[showKey] ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
        ))}
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
}
