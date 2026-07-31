'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Database, Clock, Download, FileText } from 'lucide-react';
import { datasets } from '@/data/mock';
import styles from './page.module.css';

const categories = [...new Set(datasets.map(d => d.category))];
const formats = ['CSV', 'JSON', 'GeoJSON', 'API'];
const frequencies = ['hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'static'];

function formatBadgeClass(format: string) {
  const map: Record<string, string> = {
    CSV: styles.formatCSV,
    JSON: styles.formatJSON,
    GeoJSON: styles.formatGeoJSON,
    API: styles.formatAPI,
  };
  return `${styles.formatBadge} ${map[format] || styles.formatCSV}`;
}

function timeAgo(dateStr: string) {
  const now = new Date('2026-07-30T14:30:00Z');
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function DatasetsPage() {
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return datasets.filter(d => {
      const matchesSearch = !search ||
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.description.toLowerCase().includes(search.toLowerCase()) ||
        d.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchesCat = selectedCategories.length === 0 || selectedCategories.includes(d.category);
      const matchesFmt = selectedFormats.length === 0 || d.format.some(f => selectedFormats.includes(f));
      return matchesSearch && matchesCat && matchesFmt;
    });
  }, [search, selectedCategories, selectedFormats]);

  const toggleFilter = (value: string, list: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Open Datasets</h1>
        <p className={styles.subtitle}>Browse, search, and download {datasets.length} civic datasets from Visakhapatnam.</p>
      </div>

      <div className={styles.searchRow}>
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Search datasets by name, topic, or keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search datasets"
          role="searchbox"
        />
      </div>

      <div className={styles.layout}>
        <aside className={styles.filters} aria-label="Dataset filters">
          <fieldset className={styles.filterGroup}>
            <legend>Category</legend>
            {categories.map(cat => (
              <label key={cat} className={styles.filterOption}>
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleFilter(cat, selectedCategories, setSelectedCategories)}
                />
                {cat}
              </label>
            ))}
          </fieldset>
          <fieldset className={styles.filterGroup}>
            <legend>Format</legend>
            {formats.map(fmt => (
              <label key={fmt} className={styles.filterOption}>
                <input
                  type="checkbox"
                  checked={selectedFormats.includes(fmt)}
                  onChange={() => toggleFilter(fmt, selectedFormats, setSelectedFormats)}
                />
                {fmt}
              </label>
            ))}
          </fieldset>
        </aside>

        <div className={styles.results}>
          <p className={styles.resultCount}>Showing {filtered.length} of {datasets.length} datasets</p>
          {filtered.map(ds => (
            <Link key={ds.dataset_id} href={`/datasets/${ds.dataset_id}`} className={styles.card}>
              <div className={styles.cardTitle}>
                <Database size={18} style={{ color: 'var(--color-primary)' }} />
                {ds.title}
              </div>
              <p className={styles.cardDesc}>{ds.description}</p>
              <div className={styles.cardMeta}>
                <span className={styles.metaItem}><Clock size={12} /> {timeAgo(ds.last_updated)}</span>
                <span className={styles.metaItem}><FileText size={12} /> {ds.row_count.toLocaleString()} rows</span>
                <span className={styles.metaItem}><Download size={12} /> {ds.downloads.toLocaleString()}</span>
                {ds.format.map(f => (
                  <span key={f} className={formatBadgeClass(f)}>{f}</span>
                ))}
              </div>
              <div className={styles.tags}>
                {ds.tags.map(t => (
                  <span key={t} className={styles.tag}>#{t}</span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
