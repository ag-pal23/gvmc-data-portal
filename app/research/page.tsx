'use client';

import React, { useState } from 'react';
import { FlaskConical, Play, Save, Share2, Database, Code, BookOpen } from 'lucide-react';
import styles from './page.module.css';

const notebooks = [
  { id: 'water-analysis', label: 'Water Analysis v3', type: 'sql' },
  { id: 'aqi-modelling', label: 'Industrial Zone AQI model', type: 'python' },
  { id: 'grievance-correl', label: 'Demographics vs Complaints', type: 'sql' },
];

export default function ResearchWorkspacePage() {
  const [activeId, setActiveId] = useState('water-analysis');
  const [query, setQuery] = useState(`SELECT ward_id, zone, AVG(supply_pct) AS avg_supply
FROM ds_water_daily
WHERE date >= '2026-07-01'
GROUP BY ward_id, zone
ORDER BY avg_supply ASC
LIMIT 5;`);
  const [results, setResults] = useState<any[] | null>(null);
  const [execTime, setExecTime] = useState<number | null>(null);

  const handleRun = () => {
    setResults(null);
    setExecTime(null);
    setTimeout(() => {
      setResults([
        { ward_id: 55, zone: 'Industrial', avg_supply: '83.1%' },
        { ward_id: 50, zone: 'Industrial', avg_supply: '85.4%' },
        { ward_id: 45, zone: 'West', avg_supply: '87.2%' },
        { ward_id: 5, zone: 'North', avg_supply: '88.1%' },
        { ward_id: 60, zone: 'North', avg_supply: '89.2%' },
      ]);
      setExecTime(124);
    }, 600);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}><FlaskConical size={28} /> Research Workspace</h1>
        <p className={styles.subtitle}>Analyze city datasets using SQL, Python, or embedded notebooks.</p>
      </div>

      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="Saved notebooks list">
          <div className={styles.sidebarTitle}>Notebooks</div>
          {notebooks.map(nb => (
            <button
              key={nb.id}
              className={`${styles.notebookBtn} ${activeId === nb.id ? styles.notebookBtnActive : ''}`}
              onClick={() => setActiveId(nb.id)}
            >
              <Code size={14} style={{ color: nb.type === 'sql' ? 'var(--color-primary)' : 'var(--color-secondary)' }} />
              {nb.label}
            </button>
          ))}
        </aside>

        <main className={styles.editorPane}>
          <div className={styles.editorHeader}>
            <div className={styles.editorTitle}>Water Analysis v3 (SQL Sandbox)</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className={styles.notebookBtn} style={{ border: '1px solid var(--color-border)', borderRadius: '4px' }}><Save size={14} /> Save</button>
              <button className={styles.notebookBtn} style={{ border: '1px solid var(--color-border)', borderRadius: '4px' }}><Share2 size={14} /> Share</button>
            </div>
          </div>

          <textarea
            className={styles.sqlEditor}
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="SQL Editor Code Field"
          />

          <button onClick={handleRun} className={styles.runBtn}>
            <Play size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            Run Query
          </button>

          {results && (
            <div style={{ marginTop: '24px' }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginBottom: '8px' }}>
                Query executed successfully in {execTime}ms. Showing top 5 results.
              </div>
              <table className={styles.outputTable}>
                <thead>
                  <tr>
                    <th scope="col">Ward ID</th>
                    <th scope="col">Zone</th>
                    <th scope="col">Avg Supply %</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.ward_id}</td>
                      <td>{row.zone}</td>
                      <td>{row.avg_supply}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
