'use client';

import React from 'react';
import Link from 'next/link';
import { Rocket, Target, Users, BookOpen } from 'lucide-react';
import styles from './page.module.css';

const problems = [
  { id: 1, title: "Optimize Ward 5 Water Distribution", dept: "Water Works", submissions: 12 },
  { id: 2, title: "Predict Monsoon Traffic Congestion", dept: "Traffic Cell", submissions: 8 },
  { id: 3, title: "Analyse Industrial Zone PM2.5 Sources", dept: "AP Pollution Board", submissions: 15 },
];

export default function StartupHubPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}><Rocket size={28} /> Startup Hub</h1>
        <p className={styles.subtitle}>Build data-driven solutions for Visakhapatnam&apos;s civic challenges.</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}><Target size={20} style={{ color: 'var(--color-primary)' }} /> Civic Problem Statements</h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            Submit proposals and prototype apps against real-world problem statements issued by city departments.
          </p>
          <div className={styles.list}>
            {problems.map(prob => (
              <div key={prob.id} className={styles.item}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{prob.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-light)' }}>{prob.dept}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{prob.submissions} proposals</span>
                  <button style={{ padding: '4px 8px', background: 'var(--color-primary-light)', border: 'none', borderRadius: '4px', color: 'var(--color-primary)', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Apply</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}><Users size={20} style={{ color: 'var(--color-secondary)' }} /> Workspace Collaboration</h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            Invite team members, share saved queries, bookmark datasets together, and manage team API keys in a single sandbox dashboard.
          </p>
          <button style={{ padding: '10px 20px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, width: '100%', cursor: 'pointer' }}>Create Project Workspace</button>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}><BookOpen size={20} style={{ color: 'var(--color-accent)' }} /> Startup Grant Resources</h2>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
            Access sandbox credits for compute pipelines, developer guides, and GVMC seed funding opportunities for civic solutions.
          </p>
          <button style={{ padding: '10px 20px', background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontWeight: 600, width: '100%', cursor: 'pointer' }}>View Resource Library</button>
        </div>
      </div>
    </div>
  );
}
