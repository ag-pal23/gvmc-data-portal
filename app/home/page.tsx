'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Users, IndianRupee, Droplets, MessageSquareWarning, Wind, Activity,
  AlertTriangle, Info, Sparkles, Database, Map, ArrowRight, Clock
} from 'lucide-react';
import { dashboardKPIs, cityAlerts, datasets } from '@/data/mock';
import styles from './page.module.css';

const iconMap: Record<string, React.ReactNode> = {
  Users: <Users size={20} />,
  IndianRupee: <IndianRupee size={20} />,
  Droplets: <Droplets size={20} />,
  MessageSquareWarning: <MessageSquareWarning size={20} />,
  Wind: <Wind size={20} />,
  Activity: <Activity size={20} />,
};

const colorMap: Record<string, string> = {
  Users: '#0B5FFF',
  IndianRupee: '#0B5FFF',
  Droplets: '#0E9F6E',
  MessageSquareWarning: '#DC2626',
  Wind: '#F59E0B',
  Activity: '#7C3AED',
};

export default function HomeDashboard() {
  const router = useRouter();
  const [askInput, setAskInput] = useState('');

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!askInput.trim()) return;
    router.push(`/assistant?q=${encodeURIComponent(askInput)}`);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Welcome back, Anand</h1>
          <p className={styles.subtitle}>Here is what is happening across Visakhapatnam today.</p>
        </div>
        <div className={styles.actions}>
          <Link href="/map" className={styles.actionBtn}>
            <Map size={16} /> View Live Map
          </Link>
          <Link href="/datasets" className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}>
            <Database size={16} /> Browse Datasets
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className={styles.kpiGrid}>
        {dashboardKPIs.map((kpi) => (
          <div key={kpi.title} className={styles.kpiCard}>
            <div 
              className={styles.kpiIcon} 
              style={{ 
                background: `${colorMap[kpi.icon] || '#0B5FFF'}18`, 
                color: colorMap[kpi.icon] || '#0B5FFF' 
              }}
            >
              {iconMap[kpi.icon]}
            </div>
            <div className={styles.kpiContent}>
              <span className={styles.kpiValue}>{kpi.value}</span>
              <span className={styles.kpiLabel}>{kpi.title}</span>
            </div>
            <span 
              className={styles.kpiTrend}
              style={{ color: kpi.trendDirection === 'up' && kpi.title.includes('Grievance') ? '#DC2626' : '#0E9F6E' }}
            >
              {kpi.trend}
            </span>
          </div>
        ))}
      </div>

      {/* Main Layout Grid */}
      <div className={styles.layoutGrid}>
        <div className={styles.mainSection}>
          {/* Active Alerts */}
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>
              <AlertTriangle size={20} style={{ color: 'var(--color-danger)' }} />
              Active City Alerts
            </h2>
            <div className={styles.alertList}>
              {cityAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`${styles.alertItem} ${
                    alert.severity === 'warning' ? styles.alertWarning : styles.alertInfo
                  }`}
                >
                  <div className={styles.alertIcon}>
                    {alert.severity === 'warning' ? <AlertTriangle size={18} /> : <Info size={18} />}
                  </div>
                  <div>{alert.message}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recently Updated Datasets */}
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>
              <Clock size={20} style={{ color: 'var(--color-primary)' }} />
              Recently Updated Datasets
            </h2>
            <div className={styles.recentGrid}>
              {datasets.slice(0, 4).map((ds) => (
                <div key={ds.dataset_id} className={styles.recentItem}>
                  <div className={styles.recentInfo}>
                    <Link href={`/datasets/${ds.dataset_id}`} className={styles.recentTitle}>
                      {ds.title}
                    </Link>
                    <span className={styles.recentMeta}>
                      Updated {ds.last_updated.split('T')[0]} · {ds.source_agency}
                    </span>
                  </div>
                  <Link href={`/datasets/${ds.dataset_id}`} className={styles.recentAction}>
                    Explore
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.sideSection}>
          {/* Ask AI Widget */}
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>
              <Sparkles size={20} style={{ color: '#7C3AED' }} />
              Ask GVMC AI
            </h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)', lineHeight: 1.5 }}>
              Ask any question about city water, traffic, air quality, or demographics in plain natural language.
            </p>
            <form onSubmit={handleAsk} className={styles.quickAsk}>
              <input 
                type="text" 
                placeholder="e.g. water trend in ward 12..." 
                className={styles.askInput}
                value={askInput}
                onChange={e => setAskInput(e.target.value)}
                aria-label="Ask AI"
              />
              <button type="submit" className={styles.askBtn}>Ask</button>
            </form>
          </div>

          {/* Mini Map Widget */}
          <div className={styles.sectionCard}>
            <h2 className={styles.sectionTitle}>
              <Map size={20} style={{ color: 'var(--color-secondary)' }} />
              Ward Map
            </h2>
            <div className={styles.miniMap}>
              {/* Draw a static shape representing Visakhapatnam bay outline using CSS/HTML shapes */}
              <div style={{
                position: 'absolute', right: 0, top: 0, width: '40%', height: '100%',
                background: '#B3D9F2', borderRadius: '50% 0 0 50% / 10% 0 0 100%'
              }} />
              {/* Draw three simple ward outline boxes for mock visual */}
              <div style={{ position: 'absolute', left: '10%', top: '20%', width: '30%', height: '25%', border: '2px solid #0D9F6E', background: 'rgba(14,159,110,0.15)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 600 }}>Ward 12</div>
              <div style={{ position: 'absolute', left: '30%', top: '50%', width: '25%', height: '25%', border: '2px solid #0B5FFF', background: 'rgba(11,95,255,0.15)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 600 }}>Ward 5</div>
              <div style={{ position: 'absolute', left: '15%', top: '52%', width: '12%', height: '15%', border: '2px solid #DC2626', background: 'rgba(220,38,38,0.15)', borderRadius: '4px' }} />
              
              <div className={styles.miniMapOverlay}>
                <Link href="/map" style={{
                  background: 'var(--color-bg)', color: 'var(--color-text)',
                  border: '1px solid var(--color-border)', padding: '6px 12px',
                  borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)',
                  fontWeight: 'var(--weight-semibold)', boxShadow: 'var(--shadow-sm)',
                  display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none'
                }}>
                  Explore Interactive Map <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
