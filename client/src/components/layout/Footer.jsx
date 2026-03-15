import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import api from '../../utils/api';

export default function Footer() {
  const [navPages, setNavPages] = useState([]);

  useEffect(() => {
    api.get('/pages', { params: { showInNav: true } })
      .then(r => setNavPages(r.data.data || []))
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="page-container py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="font-heading text-2xl font-bold text-white">
              Shop<span className="text-primary-400">Verse</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              Your ultimate shopping destination. Quality products, unbeatable prices, fast delivery.
            </p>
            <div className="mt-5 flex gap-3">
              {[
                { Icon: Facebook, href: '#' },
                { Icon: Twitter, href: '#' },
                { Icon: Instagram, href: '#' },
                { Icon: Youtube, href: '#' },
              ].map(({ Icon, href }, i) => (
                <a key={i} href={href}
                  className="w-9 h-9 bg-gray-800 rounded-xl flex items-center justify-center hover:bg-primary-600 transition-colors">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { to: '/', label: 'Home' },
                { to: '/shop', label: 'Shop' },
                { to: '/shop?isFeatured=true', label: 'Featured Products' },
                { to: '/shop?isNewArrival=true', label: 'New Arrivals' },
                { to: '/blog', label: 'Blog' },
                { to: '/wishlist', label: 'Wishlist' },
              ].map(({ to, label }) => (
                <li key={label}>
                  <Link to={to} className="hover:text-primary-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info / CMS Pages */}
          <div>
            <h4 className="text-white font-semibold mb-4">Information</h4>
            <ul className="space-y-2 text-sm">
              {[
                { to: '/profile/orders', label: 'Order History' },
                { to: '/profile', label: 'My Account' },
                { to: '/profile/orders', label: 'Returns & Refunds' },
              ].map(({ to, label }) => (
                <li key={label}>
                  <Link to={to} className="hover:text-primary-400 transition-colors">{label}</Link>
                </li>
              ))}
              {navPages.map(page => (
                <li key={page._id}>
                  <Link to={`/pages/${page.slug}`} className="hover:text-primary-400 transition-colors">{page.title}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={15} className="text-primary-400 mt-0.5 flex-shrink-0" />
                <span>123 Commerce St, New York, NY 10001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={15} className="text-primary-400 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={15} className="text-primary-400 flex-shrink-0" />
                <span>support@shopverse.com</span>
              </li>
            </ul>

            <div className="mt-5">
              <p className="text-xs text-gray-500 mb-2">We accept</p>
              <div className="flex gap-2 flex-wrap">
                {['Visa', 'Mastercard', 'PayPal', 'Stripe'].map(p => (
                  <span key={p} className="px-2 py-1 bg-gray-800 border border-gray-700 rounded-lg text-xs text-gray-400">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="page-container py-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} ShopVerse. All rights reserved.</p>
          <div className="flex gap-4 flex-wrap justify-center">
            <Link to="/pages/privacy-policy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link to="/pages/terms-of-service" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
            <Link to="/pages/cookie-policy" className="hover:text-gray-300 transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
