// ForgotPasswordPage.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { setLoading(true); await api.post('/auth/forgot-password', { email }); setSent(true); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to send email'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="font-heading text-3xl font-bold text-gray-900">Shop<span className="text-primary-600">Verse</span></Link>
          <h2 className="font-heading text-2xl font-bold text-gray-800 mt-4">Forgot Password</h2>
        </div>
        <div className="card p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-5xl mb-4">📧</div>
              <h3 className="font-semibold text-gray-800">Check Your Email</h3>
              <p className="text-gray-500 text-sm mt-2">We've sent a password reset link to {email}</p>
              <Link to="/login" className="btn-primary mt-6 inline-flex">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-gray-500 text-sm">Enter your email and we'll send you a reset link.</p>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="input-field" placeholder="you@example.com" />
              <button type="submit" disabled={loading} className="btn-primary w-full py-3">{loading ? 'Sending...' : 'Send Reset Link'}</button>
              <p className="text-center text-sm"><Link to="/login" className="text-primary-600 hover:underline">← Back to Login</Link></p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
export default ForgotPasswordPage;
