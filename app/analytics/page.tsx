'use client';

import React, { useState } from 'react';
import { BarChart3, TrendingUp, Download, Droplets, Wind, MessageSquareWarning, IndianRupee } from 'lucide-react';
import { generateWaterSupplyData, revenueByZone, grievancesByCategory } from '@/data/mock';
import styles from './page.module.css';
import Typewriter from '@/components/atoms/Typewriter/Typewriter';

const waterData = generateWaterSupplyData();
const kpis = [
  { label: 'Avg Water Supply', value: '96.1%', icon: <Droplets size={20} />, color: '#0E9F6E', trend: '+2.1%' },
  { label: 'Avg AQI', value: '72', icon: <Wind size={20} />, color: '#F59E0B', trend: '-5 pts' },
  { label: 'Open Grievances', value: '1,204', icon: <MessageSquareWarning size={20} />, color: '#DC2626', trend: '+12%' },
  { label: 'Tax Collected (YTD)', value: '₹42.3Cr', icon: <IndianRupee size={20} />, color: '#0B5FFF', trend: '+8.5%' },
];

export default function AnalyticsPage() {
  const [showTable, setShowTable] = useState<string | null>(null);
  const maxSupply = Math.max(...waterData.map(d => d.supply_pct));
  const minSupply = Math.min(...waterData.map(d => d.supply_pct));
  const maxRevenue = Math.max(...revenueByZone.map(d => Math.max(d.target, d.collected)));
  const totalGrievances = grievancesByCategory.reduce((s, g) => s + g.count, 0);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BarChart3 size={28} style={{ flexShrink: 0 }} /> 
          <Typewriter text="Analytics Dashboard" speed={40} />
        </h1>
        <p className={styles.subtitle}>
          <Typewriter text="Explore trends and KPIs across Visakhapatnam's civic data." speed={15} delay={400} showCursor={false} />
        </p>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiRow}>
        {kpis.map(kpi => (
          <div key={kpi.label} className={styles.kpiCard}>
            <div className={styles.kpiIcon} style={{ background: kpi.color + '18', color: kpi.color }}>
              {kpi.icon}
            </div>
            <div>
              <div className={styles.kpiValue}>{kpi.value}</div>
              <div className={styles.kpiLabel}>{kpi.label}</div>
            </div>
            <span className={styles.kpiTrend} style={{ color: kpi.trend.startsWith('+') && kpi.label.includes('Grievance') ? '#DC2626' : '#0E9F6E' }}>{kpi.trend}</span>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className={styles.chartsGrid}>
        {/* Water Supply Trend */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>Water Supply Trend (90 days)</h2>
            <div className={styles.chartActions}>
              <button className={styles.chartBtn} onClick={() => setShowTable(showTable === 'water' ? null : 'water')}>
                {showTable === 'water' ? 'Chart' : 'Table'}
              </button>
              <button className={styles.chartBtn}><Download size={14} /></button>
            </div>
          </div>
          {showTable === 'water' ? (
            <div className={styles.tableWrap}>
              <table className={styles.dataTable}>
                <thead><tr><th>Date</th><th>Supply %</th><th>Supply MLD</th><th>Target MLD</th></tr></thead>
                <tbody>
                  {waterData.slice(-14).map(d => (
                    <tr key={d.date}><td>{d.date}</td><td>{d.supply_pct}%</td><td>{d.supply_mld}</td><td>{d.target_mld}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.chart}>
              <svg viewBox={`0 0 ${waterData.length * 10} 200`} className={styles.lineSvg} aria-label="Water supply trend line chart">
                {/* Grid lines */}
                {[0, 50, 100, 150, 200].map(y => (
                  <line key={y} x1="0" y1={y} x2={waterData.length * 10} y2={y} stroke="var(--color-border-light)" strokeWidth="0.5" />
                ))}
                {/* Area */}
                <path
                  d={`M0,${200 - ((waterData[0].supply_pct - minSupply) / (maxSupply - minSupply)) * 180 - 10} ` +
                    waterData.map((d, i) => `L${i * 10},${200 - ((d.supply_pct - minSupply) / (maxSupply - minSupply)) * 180 - 10}`).join(' ') +
                    ` L${(waterData.length - 1) * 10},200 L0,200 Z`}
                  fill="url(#waterGrad)"
                  opacity="0.3"
                />
                {/* Line */}
                <polyline
                  points={waterData.map((d, i) => `${i * 10},${200 - ((d.supply_pct - minSupply) / (maxSupply - minSupply)) * 180 - 10}`).join(' ')}
                  fill="none"
                  stroke="#0E9F6E"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0E9F6E" />
                    <stop offset="100%" stopColor="#0E9F6E" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              <div className={styles.chartXLabels}>
                {waterData.filter((_, i) => i % 15 === 0).map(d => (
                  <span key={d.date}>{d.date.slice(5)}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Revenue by Zone */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>Revenue by Zone (₹ Lakhs)</h2>
            <div className={styles.chartActions}>
              <button className={styles.chartBtn} onClick={() => setShowTable(showTable === 'revenue' ? null : 'revenue')}>
                {showTable === 'revenue' ? 'Chart' : 'Table'}
              </button>
              <button className={styles.chartBtn}><Download size={14} /></button>
            </div>
          </div>
          {showTable === 'revenue' ? (
            <div className={styles.tableWrap}>
              <table className={styles.dataTable}>
                <thead><tr><th>Zone</th><th>Target (₹L)</th><th>Collected (₹L)</th><th>%</th></tr></thead>
                <tbody>
                  {revenueByZone.map(d => (
                    <tr key={d.zone}><td>{d.zone}</td><td>{d.target}</td><td>{d.collected}</td><td>{Math.round(d.collected / d.target * 100)}%</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.barChart}>
              {revenueByZone.map(d => (
                <div key={d.zone} className={styles.barGroup}>
                  <div className={styles.barLabel}>{d.zone.replace('Zone ', 'Z').split(' - ')[0]}</div>
                  <div className={styles.barTrack}>
                    <div className={styles.barTarget} style={{ width: `${(d.target / maxRevenue) * 100}%` }} />
                    <div className={styles.barFill} style={{ width: `${(d.collected / maxRevenue) * 100}%` }} />
                  </div>
                  <div className={styles.barValue}>₹{d.collected}L</div>
                </div>
              ))}
              <div className={styles.barLegend}>
                <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#0B5FFF', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} /> Collected</span>
                <span><span style={{ display: 'inline-block', width: 12, height: 12, background: '#D9DEE3', borderRadius: 2, marginRight: 4, verticalAlign: 'middle' }} /> Target</span>
              </div>
            </div>
          )}
        </div>

        {/* Grievances by Category */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>Grievances by Category</h2>
            <div className={styles.chartActions}>
              <button className={styles.chartBtn} onClick={() => setShowTable(showTable === 'grievance' ? null : 'grievance')}>
                {showTable === 'grievance' ? 'Chart' : 'Table'}
              </button>
            </div>
          </div>
          {showTable === 'grievance' ? (
            <div className={styles.tableWrap}>
              <table className={styles.dataTable}>
                <thead><tr><th>Category</th><th>Count</th><th>% of Total</th></tr></thead>
                <tbody>
                  {grievancesByCategory.map(d => (
                    <tr key={d.category}><td>{d.category}</td><td>{d.count}</td><td>{Math.round(d.count / totalGrievances * 100)}%</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.donutChart}>
              <svg viewBox="0 0 200 200" className={styles.donutSvg}>
                {grievancesByCategory.reduce((acc, g, i) => {
                  const pct = g.count / totalGrievances;
                  const startAngle = acc.offset;
                  const endAngle = startAngle + pct * 360;
                  const midAngle = ((startAngle + endAngle) / 2) * (Math.PI / 180);
                  const r = 70;
                  const x1 = 100 + r * Math.cos((startAngle - 90) * Math.PI / 180);
                  const y1 = 100 + r * Math.sin((startAngle - 90) * Math.PI / 180);
                  const x2 = 100 + r * Math.cos((endAngle - 90) * Math.PI / 180);
                  const y2 = 100 + r * Math.sin((endAngle - 90) * Math.PI / 180);
                  const largeArc = pct > 0.5 ? 1 : 0;
                  acc.elements.push(
                    <path
                      key={i}
                      d={`M100,100 L${x1},${y1} A${r},${r} 0 ${largeArc},1 ${x2},${y2} Z`}
                      fill={g.color}
                      stroke="var(--color-bg)"
                      strokeWidth="2"
                    />
                  );
                  acc.offset = endAngle;
                  return acc;
                }, { elements: [] as React.ReactNode[], offset: 0 }).elements}
                <circle cx="100" cy="100" r="40" fill="var(--color-bg)" />
                <text x="100" y="96" textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--color-text)">{totalGrievances}</text>
                <text x="100" y="112" textAnchor="middle" fontSize="10" fill="var(--color-text-muted)">Total</text>
              </svg>
              <div className={styles.donutLegend}>
                {grievancesByCategory.map(g => (
                  <div key={g.category} className={styles.donutLegendItem}>
                    <span className={styles.donutDot} style={{ background: g.color }} />
                    <span>{g.category}</span>
                    <span className={styles.donutCount}>{g.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
