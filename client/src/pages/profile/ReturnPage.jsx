// ReturnPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { requestReturn } from '../../store/slices/orderSlice';
import { ArrowLeft } from 'lucide-react';

const REASONS = ['Item damaged', 'Wrong item received', 'Item not as described', 'Changed my mind', 'Better price found', 'Other'];

export default function ReturnPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalReason = reason === 'Other' ? custom : reason;
    if (!finalReason.trim()) return;
    setLoading(true);
    const result = await dispatch(requestReturn({ id, reason: finalReason }));
    if (result.type === 'orders/return/fulfilled') navigate(`/profile/orders/${id}`);
    setLoading(false);
  };

  return (
    <div className="card p-6 max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/profile/orders/${id}`} className="btn-ghost p-2"><ArrowLeft size={18} /></Link>
        <h2 className="font-heading text-xl font-bold text-gray-900">Request Return</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Return</label>
          <div className="space-y-2">
            {REASONS.map(r => (
              <label key={r} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${reason === r ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
                <input type="radio" name="reason" value={r} checked={reason === r} onChange={() => setReason(r)} className="text-primary-600" />
                <span className="text-sm text-gray-700">{r}</span>
              </label>
            ))}
          </div>
        </div>
        {reason === 'Other' && (
          <textarea value={custom} onChange={e => setCustom(e.target.value)} placeholder="Please describe your reason..." rows={4} className="input-field resize-none" required />
        )}
        <div className="flex gap-3">
          <Link to={`/profile/orders/${id}`} className="btn-ghost flex-1 border border-gray-200 text-center">Cancel</Link>
          <button type="submit" disabled={!reason || loading} className="btn-primary flex-1">
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}
