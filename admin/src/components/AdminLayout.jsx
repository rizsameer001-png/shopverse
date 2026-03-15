import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { adminLogout } from '../store';
import {
  LayoutDashboard, Package, Tag, Layers, Award,
  ShoppingCart, Users, Heart, Ticket, LogOut,
  Menu, X, Bell, BookOpen, FileText,
  Image as ImageIcon, Settings, ChevronRight,
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { to: '/products',     icon: Package,  label: 'Products'      },
      { to: '/categories',   icon: Tag,      label: 'Categories'    },
      { to: '/subcategories',icon: Layers,   label: 'Sub-Categories'},
      { to: '/brands',       icon: Award,    label: 'Brands'        },
    ],
  },
  {
    label: 'Sales',
    items: [
      { to: '/orders',         icon: ShoppingCart, label: 'Orders'       },
      { to: '/coupons',        icon: Ticket,       label: 'Coupons'      },
      { to: '/wishlist-stats', icon: Heart,        label: 'Wishlist Stats'},
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/blogs',   icon: BookOpen,  label: 'Blog Posts' },
      { to: '/pages',   icon: FileText,  label: 'CMS Pages'  },
      { to: '/banners', icon: ImageIcon, label: 'Banners'    },
    ],
  },
  {
    label: 'Users',
    items: [
      { to: '/users', icon: Users, label: 'Customers' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

function SidebarNav({ collapsed }) {
  return (
    // <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-4">
    <nav class="flex-1 px-2 py-3 overflow-y-auto space-y-4 sidebar-scroll">
      {NAV_GROUPS.map(group => (
        <div key={group.label}>
          {!collapsed && (
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold px-3 mb-1">
              {group.label}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to} to={to} end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm group relative
                  ${isActive
                    ? 'bg-primary-600 text-white shadow-sm shadow-primary-900/20'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={17} className="flex-shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="font-medium flex-1 text-sm">{label}</span>
                        {!isActive && (
                          <ChevronRight size={12} className="opacity-0 group-hover:opacity-50 transition-opacity" />
                        )}
                      </>
                    )}
                    {/* Tooltip when collapsed */}
                    {collapsed && (
                      <div className="absolute left-full ml-2.5 px-2.5 py-1.5 bg-slate-800 text-white text-xs
                        rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap
                        pointer-events-none z-50 shadow-lg">
                        {label}
                        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-slate-800 rotate-45" />
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

export default function AdminLayout() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector(s => s.auth);
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  const handleLogout = () => { dispatch(adminLogout()); navigate('/login'); };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── Desktop Sidebar ───────────────────────────────── */}
      <aside className={`hidden lg:flex flex-col bg-sidebar transition-all duration-300 flex-shrink-0 ${collapsed ? 'w-[60px]' : 'w-64'}`}>
        {/* Logo */}
        <div className={`flex items-center gap-2.5 px-4 py-4 border-b border-slate-700/50 min-h-[64px] ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-white font-black text-sm">S</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="font-bold text-white text-base block leading-tight">ShopVerse</span>
              <p className="text-[10px] text-slate-400 leading-tight">Admin Panel</p>
            </div>
          )}
        </div>

        <SidebarNav collapsed={collapsed} />

        {/* User footer */}
        <div className="border-t border-slate-700/50 p-2">
          <div className={`flex items-center gap-2 p-2 rounded-xl hover:bg-slate-700/30 transition-colors ${collapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white text-xs font-bold">{user?.name?.[0]?.toUpperCase()}</span>
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold truncate leading-tight">{user?.name}</p>
                  <p className="text-slate-400 text-[10px] capitalize leading-tight">{user?.role}</p>
                </div>
                <button onClick={handleLogout} title="Logout"
                  className="text-slate-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-slate-700/50">
                  <LogOut size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* ── Mobile Sidebar Overlay ────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-sidebar flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-black text-sm">S</span>
                </div>
                <span className="font-bold text-white">ShopVerse</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-700/50 rounded-lg">
                <X size={18} />
              </button>
            </div>
            <SidebarNav collapsed={false} />
            <div className="border-t border-slate-700/50 p-3">
              <button onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-red-400 hover:bg-red-900/20 rounded-xl text-sm font-medium transition-colors">
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setCollapsed(!collapsed); setMobileOpen(!mobileOpen); }}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Menu size={18} className="text-gray-600" />
            </button>
            <span className="font-semibold text-gray-700 text-sm hidden sm:block">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Bell size={17} className="text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200 ml-1">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{user?.name?.[0]?.toUpperCase()}</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.name}</p>
                <p className="text-[10px] text-gray-400 capitalize leading-tight">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
