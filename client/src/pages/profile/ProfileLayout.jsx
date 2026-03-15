import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { User, Package, MapPin, Shield, Heart } from 'lucide-react';

const NAV = [
  { to: '/profile', icon: User, label: 'My Profile', end: true },
  { to: '/profile/orders', icon: Package, label: 'My Orders' },
  { to: '/profile/addresses', icon: MapPin, label: 'Addresses' },
  { to: '/profile/security', icon: Shield, label: 'Security' },
];

export default function ProfileLayout() {
  const { user } = useSelector(s => s.auth);
  return (
    <div className="page-container py-10">
      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="card p-6 mb-4 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-primary-100 flex items-center justify-center mb-3">
              {user?.avatar?.url
                ? <img src={user.avatar.url} alt={user.name} className="w-20 h-20 rounded-full object-cover" />
                : <span className="text-3xl font-bold text-primary-600">{user?.name?.[0]?.toUpperCase()}</span>}
            </div>
            <p className="font-semibold text-gray-800">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
          <nav className="card overflow-hidden">
            {NAV.map(({ to, icon: Icon, label, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-colors border-l-4 ${isActive ? 'bg-primary-50 text-primary-600 border-primary-600' : 'text-gray-600 hover:bg-gray-50 border-transparent'}`
                }>
                <Icon size={16} />{label}
              </NavLink>
            ))}
          </nav>
        </aside>
        {/* Content */}
        <div className="lg:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
