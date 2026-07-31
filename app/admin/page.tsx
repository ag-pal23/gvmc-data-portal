'use client';

import React, { useState } from 'react';
import { Shield, Users, Database, Activity, ToggleLeft } from 'lucide-react';
import styles from './page.module.css';

const adminTabs = [
  { id: 'users', label: 'User Management', icon: <Users size={16} /> },
  { id: 'datasets', label: 'Dataset Ingestion', icon: <Database size={16} /> },
  { id: 'health', label: 'System Health', icon: <Activity size={16} /> },
];

const mockUsers = [
  { name: "Ravi Kumar", email: "ravi@example.com", role: "admin", status: "active" },
  { name: "Priya Sharma", email: "priya@univ.edu", role: "researcher", status: "active" },
  { name: "Arjun Varma", email: "arjun@startup.com", role: "startup", status: "active" },
  { name: "Sneha Reddy", email: "sneha@dev.io", role: "developer", status: "active" },
];

export default function AdminPortalPage() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}><Shield size={28} /> Admin Portal</h1>
        <p className={styles.subtitle}>Manage users, roles, dataset pipelines, and audit system metrics.</p>
      </div>

      <div className={styles.layout}>
        <aside className={styles.sidebar} aria-label="Admin tools">
          {adminTabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles.sidebarBtn} ${activeTab === tab.id ? styles.sidebarBtnActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </aside>

        <main className={styles.main}>
          {activeTab === 'users' && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>User Management</h2>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Role</th>
                    <th scope="col">Status</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mockUsers.map(user => (
                    <tr key={user.email}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`${styles.roleBadge} ${
                          user.role === 'admin' ? styles.roleAdmin :
                          user.role === 'researcher' ? styles.roleResearcher :
                          styles.roleStartup
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--color-secondary)' }}>
                          ● {user.status}
                        </span>
                      </td>
                      <td>
                        <button style={{ padding: '4px 8px', border: '1px solid var(--color-border)', borderRadius: '4px', background: 'var(--color-bg)', fontSize: '12px', cursor: 'pointer' }}>
                          Edit Role
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'datasets' && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Dataset Ingestion Form</h2>
              <form onSubmit={e => { e.preventDefault(); alert('Dataset registered for ingestion queue.'); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '480px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }} htmlFor="ds-title">Dataset Title</label>
                  <input id="ds-title" type="text" placeholder="e.g. Ward Waste Tonnage" style={{ padding: '8px', border: '1px solid var(--color-border)', borderRadius: '4px' }} required />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold' }} htmlFor="ds-upload">Upload File (CSV or GeoJSON)</label>
                  <input id="ds-upload" type="file" style={{ fontSize: '12px' }} required />
                </div>
                <button type="submit" style={{ padding: '10px 20px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>Register Dataset</button>
              </form>
            </div>
          )}

          {activeTab === 'health' && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>System Health Metrics</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '16px', border: '1px solid var(--color-border-light)', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-secondary)' }}>99.98%</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>API Uptime (30d)</div>
                </div>
                <div style={{ padding: '16px', border: '1px solid var(--color-border-light)', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-primary)' }}>12 ms</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Avg API Latency</div>
                </div>
                <div style={{ padding: '16px', border: '1px solid var(--color-border-light)', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--color-danger)' }}>0.02%</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Ingestion Error Rate</div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
