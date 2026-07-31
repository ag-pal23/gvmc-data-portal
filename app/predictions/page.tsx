'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, Info } from 'lucide-react';
import { generateTrafficForecast } from '@/data/mock';
import styles from './page.module.css';
import Typewriter from '@/components/atoms/Typewriter/Typewriter';

export default function PredictionsPage() {
  const [ward, setWard] = useState('all');
  const [horizon, setHorizon] = useState('24h');
  const [showTable, setShowTable] = useState(false);
  const [forecastData, setForecastData] = useState<any[]>(generateTrafficForecast());
  const [modelInfo, setModelInfo] = useState({ accuracy: '94.2%', algorithm: 'LSTM + Weather' });

  useEffect(() => {
    async function loadPredictions() {
      try {
        const res = await fetch(`/api/predictions?ward=${ward}&horizon=${horizon}`);
        if (res.ok) {
          const body = await res.json();
          setForecastData(body.data.forecast);
          setModelInfo({ accuracy: body.data.accuracy, algorithm: body.data.algorithm });
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadPredictions();
  }, [ward, horizon]);

  const forecastOnly = useMemo(() => forecastData.filter(d => d.type === 'forecast'), [forecastData]);
  const allValues = useMemo(() => forecastData.map(d => d.upper || d.value), [forecastData]);
  const allLower = useMemo(() => forecastData.map(d => d.lower || d.value), [forecastData]);
  
  const maxVal = useMemo(() => Math.max(...allValues) + 5, [allValues]);
  const minVal = useMemo(() => Math.min(...allLower) - 5, [allLower]);
  const range = useMemo(() => maxVal - minVal, [maxVal, minVal]);

  const toY = (v: number) => 280 - ((v - minVal) / range) * 260 - 10;
  const toX = (i: number) => (i / (forecastData.length - 1)) * 880 + 10;

  const todayIdx = useMemo(() => forecastData.findIndex(d => d.type === 'forecast'), [forecastData]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <TrendingUp size={28} style={{ flexShrink: 0 }} /> 
          <Typewriter text="Predictions" speed={40} />
        </h1>
        <p className={styles.subtitle}>
          <Typewriter text="AI-powered forecasts with confidence intervals for smarter planning." speed={15} delay={400} showCursor={false} />
        </p>
      </div>

      <div className={styles.grid}>
        <div className={styles.main}>
          <div className={styles.chartCard}>
            <h2 className={styles.chartTitle}>Traffic Congestion Forecast — Next 24 Hours</h2>
            <p className={styles.chartSubtitle}>Congestion index (0–100) based on LSTM model trained on 90 days of sensor data.</p>
            <div className={styles.chartLegend}>
              <span className={styles.legendLine}><span style={{ width: 20, height: 2, background: '#DC2626', display: 'inline-block' }} /> Actual</span>
              <span className={styles.legendLine}><span style={{ width: 20, background: '#0B5FFF', display: 'inline-block', borderTop: '2px dashed #0B5FFF', height: 0 }} /> Predicted</span>
              <span className={styles.legendLine}><span style={{ width: 20, height: 10, background: 'rgba(11,95,255,0.15)', display: 'inline-block', borderRadius: 2 }} /> 90% CI</span>
            </div>

            <div className={styles.forecastChart}>
              <svg viewBox="0 0 900 300" className={styles.forecastSvg} role="img" aria-label="Traffic congestion forecast chart showing actual data and 24-hour prediction with confidence band">
                {/* Y-axis grid lines */}
                {[0, 25, 50, 75, 100].map(v => (
                  <React.Fragment key={v}>
                    <line x1="10" y1={toY(v)} x2="890" y2={toY(v)} stroke="var(--color-border-light)" strokeWidth="0.5" />
                    <text x="4" y={toY(v) + 4} fontSize="9" fill="var(--color-text-light)">{v}</text>
                  </React.Fragment>
                ))}

                {/* Today line */}
                <line x1={toX(todayIdx)} y1="10" x2={toX(todayIdx)} y2="290" className={styles.todayLine} />
                <text x={toX(todayIdx) + 4} y="20" className={styles.todayLabel}>NOW</text>

                {/* Confidence band */}
                <path
                  d={
                    forecastData.filter(d => d.type === 'forecast').map((d, i) => {
                      const idx = todayIdx + i;
                      return `${i === 0 ? 'M' : 'L'}${toX(idx)},${toY(d.upper!)}`;
                    }).join(' ') +
                    ' ' +
                    forecastData.filter(d => d.type === 'forecast').reverse().map((d, i) => {
                      const idx = todayIdx + forecastOnly.length - 1 - i;
                      return `L${toX(idx)},${toY(d.lower!)}`;
                    }).join(' ') +
                    ' Z'
                  }
                  fill="rgba(11, 95, 255, 0.12)"
                />

                {/* Actual line */}
                <polyline
                  points={forecastData.filter(d => d.type === 'actual').map((d, i) => `${toX(i)},${toY(d.value)}`).join(' ')}
                  fill="none"
                  stroke="#DC2626"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />

                {/* Forecast line */}
                <polyline
                  points={forecastData.filter(d => d.type === 'forecast').map((d, i) => `${toX(todayIdx + i)},${toY(d.value)}`).join(' ')}
                  fill="none"
                  stroke="#0B5FFF"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeDasharray="8 4"
                />

                {/* Dots on forecast */}
                {forecastData.filter(d => d.type === 'forecast').filter((_, i) => i % 3 === 0).map((d, i) => (
                  <circle key={i} cx={toX(todayIdx + i * 3)} cy={toY(d.value)} r="4" fill="#0B5FFF" stroke="white" strokeWidth="2" />
                ))}
              </svg>
            </div>

            <div className={styles.chartXLabels}>
              {forecastData.filter((_, i) => i % 4 === 0).map(d => (
                <span key={d.timestamp}>
                  {new Date(d.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </span>
              ))}
            </div>

            <button className={styles.tableToggle} onClick={() => setShowTable(!showTable)}>
              {showTable ? 'Hide Table' : 'View as Table (Accessible)'}
            </button>

            {showTable && (
              <table className={styles.forecastTable}>
                <thead>
                  <tr>
                    <th scope="col">Time</th>
                    <th scope="col">Type</th>
                    <th scope="col">Value</th>
                    <th scope="col">Lower</th>
                    <th scope="col">Upper</th>
                    <th scope="col">Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {forecastData.map((d, i) => (
                    <tr key={i}>
                      <td>{new Date(d.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>{d.type}</td>
                      <td>{Math.round(d.value)}</td>
                      <td>{d.lower ? Math.round(d.lower) : '—'}</td>
                      <td>{d.upper ? Math.round(d.upper) : '—'}</td>
                      <td>{d.confidence ? `${d.confidence}%` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <div className={styles.confidenceNote}>
              <Info size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
              The shaded band represents the 10th–90th percentile confidence interval. Wider bands indicate higher uncertainty, which naturally increases for predictions further into the future.
            </div>
          </div>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.sideCard}>
            <h3 className={styles.sideCardTitle}>Parameters</h3>
            <div className={styles.paramRow}>
              <label className={styles.paramLabel} htmlFor="ward-select">Ward</label>
              <select id="ward-select" className={styles.paramSelect} value={ward} onChange={e => setWard(e.target.value)}>
                <option value="all">All Wards</option>
                <option value="12">Ward 12 - Maharanipeta</option>
                <option value="5">Ward 5 - Gajuwaka South</option>
                <option value="18">Ward 18 - Seethammadhara</option>
                <option value="30">Ward 30 - RK Beach</option>
              </select>
            </div>
            <div className={styles.paramRow}>
              <label className={styles.paramLabel} htmlFor="horizon-select">Forecast Horizon</label>
              <select id="horizon-select" className={styles.paramSelect} value={horizon} onChange={e => setHorizon(e.target.value)}>
                <option value="24h">24 Hours</option>
                <option value="48h">48 Hours</option>
                <option value="7d">7 Days</option>
              </select>
            </div>
          </div>

          <div className={styles.sideCard}>
            <h3 className={styles.sideCardTitle}>Model Information</h3>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Algorithm</span><span className={styles.infoValue}>{modelInfo.algorithm}</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Accuracy</span><span className={styles.accuracyBadge}>{modelInfo.accuracy}</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>MAE</span><span className={styles.infoValue}>3.8 pts</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>RMSE</span><span className={styles.infoValue}>5.2 pts</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Training Data</span><span className={styles.infoValue}>90 days</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Last Trained</span><span className={styles.infoValue}>Jul 29, 2026</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Data Sources</span><span className={styles.infoValue}>Traffic Sensors, Weather API</span></div>
          </div>

          <div className={styles.sideCard}>
            <h3 className={styles.sideCardTitle}>Key Insights</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 'var(--line-height-relaxed)' }}>
              ⚠️ <strong>Evening peak (5–7 PM)</strong> predicted to reach congestion index 85/100 — very heavy traffic expected.
              <br /><br />
              Morning rush (8–10 AM) moderate at 78/100. Late night drops to 22/100.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
