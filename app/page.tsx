'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Database, Map, Sparkles, BarChart3, TrendingUp, Code2,
  ArrowRight
} from 'lucide-react';
import styles from './page.module.css';
import GlobeIntro from '@/components/organisms/GlobeIntro/GlobeIntro';
import Typewriter from '@/components/atoms/Typewriter/Typewriter';
import LoginPortal from '@/components/organisms/LoginPortal/LoginPortal';


const features = [
  {
    icon: <Database size={24} />,
    color: '#0B5FFF',
    bg: '#E8F0FF',
    title: 'Open Datasets',
    desc: 'Browse 1,200+ civic datasets across water, transport, health, finance, and more. Download or connect via API.',
    href: '/datasets',
  },
  {
    icon: <Map size={24} />,
    color: '#0E9F6E',
    bg: '#E6F9F2',
    title: 'Interactive City Map',
    desc: 'Visualize city data on a live map with toggleable layers for water supply, traffic, AQI, and infrastructure.',
    href: '/map',
  },
  {
    icon: <Sparkles size={24} />,
    color: '#7C3AED',
    bg: '#F3E8FF',
    title: 'AI Assistant',
    desc: 'Ask questions in plain language and get data-backed answers with source citations. No SQL needed.',
    href: '/assistant',
  },
  {
    icon: <BarChart3 size={24} />,
    color: '#F59E0B',
    bg: '#FFF7E6',
    title: 'Analytics Dashboard',
    desc: 'Explore trends, compare metrics across wards and zones, and build custom charts from live data.',
    href: '/analytics',
  },
  {
    icon: <TrendingUp size={24} />,
    color: '#DC2626',
    bg: '#FEE2E2',
    title: 'Predictions',
    desc: 'View AI-powered forecasts for traffic congestion, water demand, and more with confidence intervals.',
    href: '/predictions',
  },
  {
    icon: <Code2 size={24} />,
    color: '#0B5FFF',
    bg: '#E8F0FF',
    title: 'API Hub',
    desc: 'Explore REST APIs, test endpoints live, generate code snippets, and manage API keys for integration.',
    href: '/api-hub',
  },
];

const personas = [
  { emoji: '🏛️', title: 'City Officials', desc: 'Monitor KPIs, review predictions, and make data-driven policy decisions.' },
  { emoji: '🔬', title: 'Researchers', desc: 'Access raw data, run analyses in notebooks, and share findings.' },
  { emoji: '🚀', title: 'Startups', desc: 'Discover problem statements, prototype solutions, and access APIs.' },
  { emoji: '👨‍💻', title: 'Developers', desc: 'Integrate city data via documented APIs with code examples and SDKs.' },
];

export default function LandingPage() {
  const [entered, setEntered] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const appUiStyle: React.CSSProperties = {
    opacity: entered ? 1 : 0,
    transform: entered ? 'scale(1)' : 'scale(1.04)',
    pointerEvents: entered ? 'auto' : 'none',
    transition: 'opacity 900ms cubic-bezier(0.22,1,0.36,1), transform 900ms cubic-bezier(0.22,1,0.36,1)',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <>
      {/* 3D Interactive Globe Intro Walkthrough */}
      {!entered && !showLogin && (
        <GlobeIntro onEnter={() => setShowLogin(true)} />
      )}

      {/* Frosted Glass Login Portal Overlay */}
      {showLogin && (
        <LoginPortal onLoginSuccess={() => {
          setShowLogin(false);
          setEntered(true);
        }} />
      )}

      {/* Main UI layout container */}
      <div style={appUiStyle} aria-hidden={!entered}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroBg}>
            <div className={`${styles.heroGlow} ${styles.heroGlow1}`} />
            <div className={`${styles.heroGlow} ${styles.heroGlow2}`} />
            <div className={`${styles.heroGlow} ${styles.heroGlow3}`} />
          </div>
          <div className={styles.heroContent}>
            <div className={styles.badge}>
              <Sparkles size={16} />
              Powered by AI · Open Data · Real-time Analytics
            </div>
            <h1 className={styles.title}>
              <Typewriter text="Unlock Vizag's Data. " speed={30} showCursor={false} />
              <span className={styles.titleGradient}>
                <Typewriter text="Empower Your City." speed={30} delay={600} showCursor={true} />
              </span>
            </h1>
            <p className={styles.subtitle}>
              <Typewriter 
                text="Explore Visakhapatnam's open civic data through interactive maps, AI-powered insights, and predictive analytics — built for citizens, researchers, startups, and city officials." 
                speed={10} 
                delay={1600} 
                showCursor={false} 
              />
            </p>
            <div className={styles.ctas}>
              <Link
                href="/datasets"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '12px 28px', background: 'var(--color-primary)',
                  color: 'white', borderRadius: 'var(--radius-md)',
                  fontWeight: 600, fontSize: 'var(--text-body)',
                  textDecoration: 'none', transition: 'all 0.15s ease',
                  border: 'none', cursor: 'pointer'
                }}
              >
                Explore Data <ArrowRight size={18} />
              </Link>
              <Link
                href="/assistant"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '12px 28px',
                  background: 'linear-gradient(135deg, #7C3AED, #0B5FFF)',
                  color: 'white', borderRadius: 'var(--radius-md)',
                  fontWeight: 600, fontSize: 'var(--text-body)',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(123, 58, 237, 0.35)',
                  border: 'none', cursor: 'pointer'
                }}
              >
                <Sparkles size={18} /> Ask GVMC
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className={styles.statsBar} aria-label="Platform statistics">
          <div className={styles.statsInner}>
            <div className={styles.statItem}>
              <div className={styles.statValue}>1,200+</div>
              <div className={styles.statLabel}>Datasets Available</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>72</div>
              <div className={styles.statLabel}>Wards Covered</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>10K+</div>
              <div className={styles.statLabel}>AI Queries Answered</div>
            </div>
            <div className={styles.statItem}>
              <div className={styles.statValue}>500+</div>
              <div className={styles.statLabel}>API Integrations</div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className={styles.features} aria-label="Platform features">
          <div className={styles.featuresInner}>
            <h2 className={styles.sectionTitle}>Everything You Need to Explore City Data</h2>
            <p className={styles.sectionSubtitle}>
              From raw datasets to AI-powered predictions — tools for every level of expertise.
            </p>
            <div className={styles.featuresGrid}>
              {features.map((f) => (
                <Link key={f.href} href={f.href} className={styles.featureCard}>
                  <div
                    className={styles.featureIcon}
                    style={{ background: f.bg, color: f.color }}
                  >
                    {f.icon}
                  </div>
                  <h3 className={styles.featureTitle}>{f.title}</h3>
                  <p className={styles.featureDesc}>{f.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Personas */}
        <section className={styles.personas} aria-label="Who is this for">
          <div className={styles.personasInner}>
            <h2 className={styles.sectionTitle}>Built For Everyone</h2>
            <p className={styles.sectionSubtitle}>
              Whether you govern the city, study it, build on it, or live in it.
            </p>
            <div className={styles.personasGrid}>
              {personas.map((p) => (
                <div key={p.title} className={styles.personaCard}>
                  <div className={styles.personaEmoji} aria-hidden="true">{p.emoji}</div>
                  <h3 className={styles.personaTitle}>{p.title}</h3>
                  <p className={styles.personaDesc}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <p className={styles.footerCopy}>
              © 2026 GVMC Open Data Intelligence Platform. All rights reserved.
            </p>
            <div className={styles.footerLinks}>
              <Link href="/docs">Documentation</Link>
              <Link href="/api-hub">API Hub</Link>
              <Link href="/datasets">Datasets</Link>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Use</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
