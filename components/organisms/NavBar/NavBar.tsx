'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Database, Map, BarChart3, TrendingUp,
  Sparkles, Code2, BookOpen, Shield, User, Search,
  Menu, X, Home, MoreHorizontal, Sun, Moon, Rocket, FlaskConical
} from 'lucide-react';
import styles from './NavBar.module.css';

const mainNavItems = [
  { path: '/home', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/datasets', label: 'Datasets', icon: Database },
  { path: '/map', label: 'Map', icon: Map },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/predictions', label: 'Predictions', icon: TrendingUp },
];

const moreNavItems = [
  { path: '/startup-hub', label: 'Startup Hub', icon: Rocket },
  { path: '/research', label: 'Research', icon: FlaskConical },
  { path: '/api-hub', label: 'API Hub', icon: Code2 },
  { path: '/docs', label: 'Docs', icon: BookOpen },
  { path: '/admin', label: 'Admin', icon: Shield },
  { path: '/settings', label: 'Settings', icon: User },
];

const mobileTabItems = [
  { path: '/home', label: 'Home', icon: Home },
  { path: '/datasets', label: 'Datasets', icon: Database },
  { path: '/map', label: 'Map', icon: Map },
  { path: '/assistant', label: 'Ask AI', icon: Sparkles },
];

export default function NavBar() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <>
      {/* Skip Link */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Desktop Top Nav */}
      <header className={styles.header}>
        <div className={styles.inner}>
          <button
            className={styles.hamburger}
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={24} />
          </button>

          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>G</div>
            <span>GVMC</span>
          </Link>

          <nav className={styles.nav} aria-label="Main navigation">
            {mainNavItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`${styles.navLink} ${isActive(item.path) ? styles.navLinkActive : ''}`}
                aria-current={isActive(item.path) ? 'page' : undefined}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
            <Link
              href="/assistant"
              className={`${styles.navLink} ${styles.askButton} ${isActive('/assistant') ? styles.navLinkActive : ''}`}
            >
              <Sparkles size={18} />
              Ask GVMC
            </Link>
          </nav>

          <div className={styles.actions}>
            <button className={styles.searchBtn} aria-label="Search">
              <Search size={20} />
            </button>
            <button className={styles.themeBtn} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} onClick={toggleDark}>
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <Link href="/settings" className={styles.profileBtn} aria-label="Profile">
              A
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav className={styles.bottomTab} aria-label="Mobile navigation">
        <div className={styles.bottomTabInner}>
          {mobileTabItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`${styles.tabItem} ${isActive(item.path) ? styles.tabItemActive : ''}`}
              aria-current={isActive(item.path) ? 'page' : undefined}
            >
              <item.icon size={22} />
              <span>{item.label}</span>
            </Link>
          ))}
          <button
            className={styles.tabItem}
            onClick={() => setDrawerOpen(true)}
            aria-label="More options"
          >
            <MoreHorizontal size={22} />
            <span>More</span>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ''}`} role="dialog" aria-modal="true" aria-label="Navigation menu">
        <div className={styles.drawerBackdrop} onClick={() => setDrawerOpen(false)} />
        <div className={styles.drawerContent}>
          <div className={styles.drawerHeader}>
            <Link href="/" className={styles.logo} onClick={() => setDrawerOpen(false)}>
              <div className={styles.logoIcon}>G</div>
              <span>GVMC</span>
            </Link>
            <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)' }}>
              <X size={24} />
            </button>
          </div>
          <nav className={styles.drawerNav} aria-label="Full navigation">
            {[...mainNavItems, { path: '/assistant', label: 'Ask GVMC ✨', icon: Sparkles }, ...moreNavItems].map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`${styles.drawerLink} ${isActive(item.path) ? styles.drawerLinkActive : ''}`}
                onClick={() => setDrawerOpen(false)}
                aria-current={isActive(item.path) ? 'page' : undefined}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
