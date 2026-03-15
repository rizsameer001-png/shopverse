// OrderSuccessPage.jsx
import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchOrder } from '../store/slices/orderSlice';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const dispatch = useDispatch();

  useEffect(() => { dispatch(fetchOrder(id)); }, [id, dispatch]);

  return (
    <div className="page-container py-20 text-center animate-fade-in">
      <div className="max-w-md mx-auto">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={48} className="text-green-500" />
        </div>
        <h1 className="font-heading text-3xl font-bold text-gray-900">Order Placed!</h1>
        <p className="text-gray-500 mt-3">Thank you for your purchase. Your order has been confirmed and is being processed.</p>
        <div className="bg-gray-50 rounded-2xl p-5 mt-6 text-left space-y-2">
          <p className="text-sm text-gray-600">Order ID: <span className="font-semibold text-gray-800">#{id.slice(-8).toUpperCase()}</span></p>
          <p className="text-sm text-gray-500">You'll receive an email confirmation shortly.</p>
        </div>
        <div className="flex gap-3 mt-8">
          <Link to="/profile/orders" className="btn-primary flex-1 flex items-center justify-center gap-2">
            <Package size={16} /> Track Order
          </Link>
          <Link to="/shop" className="btn-outline flex-1 flex items-center justify-center gap-2">
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
