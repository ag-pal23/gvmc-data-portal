'use client';

import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import styles from './page.module.css';

const docSections = [
  { id: 'getting-started', label: 'Getting Started' },
  { id: 'datasets', label: 'Working with Datasets' },
  { id: 'api', label: 'API Integration' },
  { id: 'ai-assistant', label: 'Using the AI Assistant' },
  { id: 'predictions', label: 'Understanding Predictions' },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('getting-started');

  return (
    <div className={styles.page}>
      <div className={styles.grid}>
        <aside className={styles.toc} aria-label="Table of contents">
          <div className={styles.tocTitle}>Documentation</div>
          {docSections.map(sec => (
            <button
              key={sec.id}
              className={`${styles.tocItem} ${activeSection === sec.id ? styles.tocItemActive : ''}`}
              onClick={() => setActiveSection(sec.id)}
              style={{ background: 'none', border: 'none', textAlign: 'left', padding: '4px 0' }}
            >
              {sec.label}
            </button>
          ))}
        </aside>

        <main className={styles.content}>
          {activeSection === 'getting-started' && (
            <>
              <h1>Getting Started</h1>
              <p>Welcome to the GVMC Open Data Intelligence Platform. This portal is designed to provide seamless access to Visakhapatnam&apos;s open civic datasets, map layers, analytics, and AI assistance.</p>
              
              <h2>Key Features</h2>
              <ul>
                <li><strong>AI Assistant</strong>: Ask questions in plain language and get citation-backed answers directly from city data.</li>
                <li><strong>Interactive Map</strong>: View geospatial distributions of ward parameters, traffic, and air quality.</li>
                <li><strong>Analytics</strong>: Drill down into trends, ward metrics, and compare parameters across the city.</li>
                <li><strong>API Hub</strong>: Integrate data into external apps using documented REST/JSON endpoints.</li>
              </ul>

              <h2>How to Use This Portal</h2>
              <p>Depending on your needs, you can explore the portal using the navigation at the top:</p>
              <ul>
                <li>To see visual city-wide metrics, go to the <strong>Dashboard</strong> or <strong>Map</strong>.</li>
                <li>To search for files or datasets to analyze, go to <strong>Datasets</strong>.</li>
                <li>For quick custom queries, go to the <strong>AI Assistant</strong>.</li>
              </ul>
            </>
          )}

          {activeSection === 'datasets' && (
            <>
              <h1>Working with Datasets</h1>
              <p>All open datasets on the GVMC platform are published by GVMC departments under public licenses.</p>
              
              <h2>Formats Available</h2>
              <ul>
                <li><strong>CSV</strong>: Standard tabular data, ideal for spreadsheets, Excel, R, or Python pandas.</li>
                <li><strong>JSON</strong>: Structured records, ideal for web integrations.</li>
                <li><strong>GeoJSON</strong>: Geospatial features, ideal for GIS tools like QGIS or Leaflet.</li>
              </ul>

              <h2>Freshness & Metadata</h2>
              <p>Each dataset details its source agency, license, record count, and field schema description. Always check the &quot;Last updated&quot; field to verify the freshness of the dataset before conducting research or analytics.</p>
            </>
          )}

          {activeSection === 'api' && (
            <>
              <h1>API Integration</h1>
              <p>Developers can integrate city data directly. All endpoints require a valid API key passed via the authorization header.</p>
              
              <h2>Authentication</h2>
              <pre>{`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://api.gvmc.gov.in/v1/datasets`}</pre>
              
              <h2>Rate Limits</h2>
              <p>Standard developers are limited to 1,000 requests per day. For higher volumes, apply via the <strong>Startup Hub</strong> portal for custom quotas.</p>
            </>
          )}

          {activeSection === 'ai-assistant' && (
            <>
              <h1>Using the AI Assistant</h1>
              <p>The Ask GVMC Assistant uses advanced natural language models to process your queries, convert them into queries, and retrieve factual details from our database.</p>
              
              <h2>Tips for Better Queries</h2>
              <ul>
                <li>Be specific: instead of &quot;water supply&quot;, ask &quot;water supply in Ward 12 this month&quot;.</li>
                <li>Reference dates: specify &quot;last 7 days&quot;, &quot;July 2026&quot;, or &quot;hourly&quot; to get the best charts.</li>
                <li>Compare: ask &quot;Compare AQI across all zones&quot; to get bar/pie breakdowns.</li>
              </ul>
            </>
          )}

          {activeSection === 'predictions' && (
            <>
              <h1>Understanding Predictions</h1>
              <p>Predictions are generated using machine learning models trained on historical civic datasets. Traffic models use LSTM networks, while water demand models use Prophet forecasting.</p>
              
              <h2>Confidence Intervals</h2>
              <p>All forecasts display a 90% confidence interval (shaded band on charts). This indicates that there is a 90% probability that the actual metric will fall within the upper and lower bounds. As you forecast further into the future, the band naturally widens representing higher uncertainty.</p>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
