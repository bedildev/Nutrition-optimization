import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import logo from '../assets/nutriai-logo.jpg';

const guestLinks = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/login', label: 'Login' },
  { to: '/register', label: 'Register' },
];

const memberLinks = [
  { to: '/homepage', label: 'Homepage' },
  { to: '/menu', label: 'Menu' },
  { to: '/ai-optimizer', label: 'AI Optimizer' },
  { to: '/profile', label: 'Profile' },
];

function Layout({ children, authUser, onLogout }) {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const links = authUser ? memberLinks : guestLinks;

  return (
    <div className="app-shell">
      <header className={`topbar ${isAuthPage ? 'topbar--auth' : ''}`}>
        <NavLink className="brand" to={authUser ? '/homepage' : '/'} aria-label="NutriAI">
          <img className="brand__logo" src={logo} alt="NutriAI logo" />
          <span className="brand__text">
            <strong>NutriAI</strong>
            <small>Smart meal optimizer for a healthier routine</small>
          </span>
        </NavLink>

        <button
          className="topbar__toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`topbar__menu ${menuOpen ? 'topbar__menu--open' : ''}`}>
          <nav className="topbar__nav" aria-label="Primary navigation">
            {links.map((link) => (
              <NavLink
                key={link.to}
                className={({ isActive }) => `topbar__link ${isActive ? 'topbar__link--active' : ''}`}
                to={link.to}
                end={link.end}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {authUser ? (
            <button className="topbar__action topbar__action--ghost" type="button" onClick={onLogout}>
              Keluar
            </button>
          ) : (
            <NavLink className="topbar__action" to={isAuthPage ? '/' : '/login'}>
              {isAuthPage ? 'Kembali ke Beranda' : 'Mulai'}
            </NavLink>
          )}
        </div>
      </header>

      <main className={`app-main ${isAuthPage ? 'app-main--auth' : ''}`}>{children}</main>
    </div>
  );
}

export default Layout;
