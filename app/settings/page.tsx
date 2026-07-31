'use client';

import React, { useState } from 'react';
import { User, Bell, Shield, Key, Eye } from 'lucide-react';
import styles from './page.module.css';

const sidebarItems = [
  { id: 'profile', label: 'Profile Settings', icon: <User size={16} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
  { id: 'api-keys', label: 'API Keys & Access', icon: <Key size={16} /> },
  { id: 'security', label: 'Security & 2FA', icon: <Shield size={16} /> },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Anand Kumar',
    email: 'anand@example.com',
    org: 'GVMC Innovation Lab',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Settings saved successfully!');
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText('gvmc_live_8f3c829e1a2b3c4d5e6f7g8h9i0j');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Manage your profile, preferences, notifications, and API credentials.</p>
      </div>

      <div className={styles.grid}>
        <aside className={styles.sidebar} aria-label="Settings categories">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              className={`${styles.sidebarBtn} ${activeTab === item.id ? styles.sidebarBtnActive : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </aside>

        <main className={styles.main}>
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className={styles.formCard}>
              <h2 className={styles.formTitle}>Profile Information</h2>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="profile-name">Full Name</label>
                <input
                  id="profile-name"
                  type="text"
                  className={styles.input}
                  value={profile.name}
                  onChange={e => setProfile({...profile, name: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="profile-email">Email Address</label>
                <input
                  id="profile-email"
                  type="email"
                  className={styles.input}
                  value={profile.email}
                  onChange={e => setProfile({...profile, email: e.target.value})}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="profile-org">Organization / Institution</label>
                <input
                  id="profile-org"
                  type="text"
                  className={styles.input}
                  value={profile.org}
                  onChange={e => setProfile({...profile, org: e.target.value})}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: '10px 20px', background: 'var(--color-primary)',
                  color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
                  fontWeight: 600, cursor: 'pointer'
                }}
              >
                Save Profile
              </button>
            </form>
          )}

          {activeTab === 'notifications' && (
            <div className={styles.formCard}>
              <h2 className={styles.formTitle}>Notification Preferences</h2>
              <div className={styles.toggleRow}>
                <div className={styles.toggleInfo}>
                  <span className={styles.toggleTitle}>Dataset Updates</span>
                  <span className={styles.toggleDesc}>Receive emails when datasets you bookmark are updated.</span>
                </div>
                <input type="checkbox" className={styles.toggleInput} defaultChecked />
              </div>
              <div className={styles.toggleRow}>
                <div className={styles.toggleInfo}>
                  <span className={styles.toggleTitle}>City Alerts</span>
                  <span className={styles.toggleDesc}>Critical notifications about water supply or AQI anomalies in Vizag.</span>
                </div>
                <input type="checkbox" className={styles.toggleInput} defaultChecked />
              </div>
              <div className={styles.toggleRow}>
                <div className={styles.toggleInfo}>
                  <span className={styles.toggleTitle}>Platform Newsletter</span>
                  <span className={styles.toggleDesc}>Monthly digest of new open datasets and developer case studies.</span>
                </div>
                <input type="checkbox" className={styles.toggleInput} />
              </div>
            </div>
          )}

          {activeTab === 'api-keys' && (
            <div className={styles.formCard}>
              <h2 className={styles.formTitle}>Developer API Keys</h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: '24px' }}>
                Use these credentials to authenticate API calls from your application.
              </p>
              
              <div className={styles.formGroup}>
                <label className={styles.label}>Live API Key</label>
                <div style={{ display: 'flex', gap: '8px', maxWidth: '480px' }}>
                  <input
                    type="password"
                    className={styles.input}
                    value="gvmc_live_8f3c829e1a2b3c4d5e6f7g8h9i0j"
                    readOnly
                    style={{ background: 'var(--color-bg-alt)', cursor: 'not-allowed' }}
                  />
                  <button
                    onClick={handleCopyKey}
                    style={{
                      padding: '0 16px', background: 'var(--color-bg)',
                      border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                      cursor: 'pointer', fontSize: 'var(--text-xs)', fontWeight: 'bold'
                    }}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <span className={styles.helpText}>Do not share this key in public repositories.</span>
              </div>
              
              <div style={{ marginTop: '24px', borderTop: '1px solid var(--color-border-light)', paddingTop: '24px' }}>
                <h3 className={styles.formTitle} style={{ fontSize: '16px' }}>Generate New Key</h3>
                <button
                  style={{
                    padding: '8px 16px', background: 'var(--color-primary-light)',
                    color: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-md)',
                    fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Create API Key
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleSave} className={styles.formCard}>
              <h2 className={styles.formTitle}>Security Settings</h2>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="current-pw">Current Password</label>
                <input id="current-pw" type="password" className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="new-pw">New Password</label>
                <input id="new-pw" type="password" className={styles.input} />
              </div>
              <button
                type="submit"
                style={{
                  padding: '10px 20px', background: 'var(--color-primary)',
                  color: 'white', border: 'none', borderRadius: 'var(--radius-md)',
                  fontWeight: 600, cursor: 'pointer'
                }}
              >
                Change Password
              </button>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
