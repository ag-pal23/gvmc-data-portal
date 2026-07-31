'use client';

import React, { useState } from 'react';
import { Code2, Play, Copy, Check } from 'lucide-react';
import { apiEndpoints } from '@/data/mock';
import styles from './page.module.css';
import Typewriter from '@/components/atoms/Typewriter/Typewriter';

export default function APIHubPage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [params, setParams] = useState<Record<string, string>>({});
  const [responseOutput, setResponseOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const endpoint = apiEndpoints[activeIdx];

  const handleCopy = () => {
    const code = `curl -X ${endpoint.method} "https://api.gvmc.gov.in/v1${endpoint.path}" \\
  -H "Authorization: Bearer YOUR_API_KEY"`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTryIt = () => {
    setIsRunning(true);
    setResponseOutput(null);
    setTimeout(() => {
      setResponseOutput(endpoint.sampleResponse);
      setIsRunning(false);
    }, 800);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Code2 size={28} style={{ flexShrink: 0 }} /> 
          <Typewriter text="API Hub" speed={40} />
        </h1>
        <p className={styles.subtitle}>
          <Typewriter text="Integrate GVMC civic data directly into your applications." speed={15} delay={400} showCursor={false} />
        </p>
      </div>

      <div className={styles.grid}>
        <aside className={styles.sidebar} aria-label="Endpoints list">
          <div className={styles.sidebarTitle}>Endpoints</div>
          {apiEndpoints.map((ep, idx) => (
            <button
              key={ep.path}
              className={`${styles.endpointBtn} ${activeIdx === idx ? styles.endpointBtnActive : ''}`}
              onClick={() => {
                setActiveIdx(idx);
                setResponseOutput(null);
                setParams({});
              }}
            >
              <span className={`${styles.methodBadge} ${
                ep.method === 'GET' ? styles.methodGET : styles.methodPOST
              }`}>
                {ep.method}
              </span>
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>{ep.path}</span>
            </button>
          ))}
        </aside>

        <div className={styles.main}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>{endpoint.description}</h2>
            <div className={styles.pathRow}>
              <span className={`${styles.methodBadge} ${
                endpoint.method === 'GET' ? styles.methodGET : styles.methodPOST
              }`}>
                {endpoint.method}
              </span>
              <span>https://api.gvmc.gov.in/v1{endpoint.path}</span>
            </div>

            {endpoint.parameters && endpoint.parameters.length > 0 && (
              <>
                <h3 className={styles.sectionTitle}>Parameters</h3>
                <table className={styles.paramTable}>
                  <thead>
                    <tr>
                      <th scope="col">Parameter</th>
                      <th scope="col">Type</th>
                      <th scope="col">Required</th>
                      <th scope="col">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpoint.parameters.map(p => (
                      <tr key={p.name}>
                        <td><code style={{ fontFamily: 'var(--font-mono)', fontWeight: 'bold' }}>{p.name}</code></td>
                        <td><span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{p.type}</span></td>
                        <td>{p.required ? <span style={{ color: 'var(--color-danger)', fontWeight: 'bold' }}>Yes</span> : 'No'}</td>
                        <td>
                          <input
                            type="text"
                            placeholder={p.description}
                            className={styles.explorerInput}
                            value={params[p.name] || ''}
                            onChange={e => setParams({...params, [p.name]: e.target.value})}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}

            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <button
                onClick={handleTryIt}
                className={styles.actionBtn}
                style={{ background: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)' }}
                disabled={isRunning}
              >
                <Play size={14} /> {isRunning ? 'Running...' : 'Try it out'}
              </button>
              <button onClick={handleCopy} className={styles.actionBtn}>
                {copied ? <Check size={14} style={{ color: 'var(--color-success)' }} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy cURL'}
              </button>
            </div>

            {responseOutput && (
              <>
                <h3 className={styles.sectionTitle}>Response</h3>
                <pre className={styles.pre}>
                  <code>{responseOutput}</code>
                </pre>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
