import Link from 'next/link';
import { ArrowLeft, Download, Code2, Bookmark, Clock, FileText, Building2, Scale } from 'lucide-react';
import { getDatasetById, getDatasets } from '@/backend/services/dataService';
import styles from './page.module.css';

export async function generateStaticParams() {
  const res = await getDatasets();
  return res.data.map((ds) => ({ id: ds.dataset_id }));
}

export default async function DatasetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: ds } = await getDatasetById(id);

  if (!ds) {
    return (
      <div className={styles.page}>
        <h1>Dataset not found</h1>
        <Link href="/datasets">← Back to datasets</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/datasets">Datasets</Link>
        <span>/</span>
        <span>{ds.title}</span>
      </nav>

      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{ds.title}</h1>
          <div className={styles.actions}>
            <button className={styles.actionBtn}><Bookmark size={16} /> Bookmark</button>
            <button className={`${styles.actionBtn} ${styles.actionBtnPrimary}`}><Download size={16} /> Download CSV</button>
          </div>
        </div>
        <p className={styles.desc}>{ds.description}</p>
        <div className={styles.metaRow}>
          <span className={styles.metaItem}><Clock size={14} /> Updated {ds.last_updated.split('T')[0]}</span>
          <span className={styles.metaItem}><FileText size={14} /> {ds.row_count.toLocaleString()} rows</span>
          <span className={styles.metaItem}><Download size={14} /> {ds.downloads.toLocaleString()} downloads</span>
          <span className={styles.metaItem}><Building2 size={14} /> {ds.source_agency}</span>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.main}>
          {/* Schema */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Schema ({ds.fields.length} fields)</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Field</th>
                  <th scope="col">Type</th>
                  <th scope="col">Description</th>
                </tr>
              </thead>
              <tbody>
                {ds.fields.map(f => (
                  <tr key={f.name}>
                    <td><code style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>{f.name}</code></td>
                    <td><span className={styles.typeBadge}>{f.type}</span></td>
                    <td>{f.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sample Data */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Sample Data (first 5 rows)</h2>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    {ds.fields.map(f => <th key={f.name} scope="col">{f.name}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {ds.fields.map(f => (
                        <td key={f.name}>
                          {f.type === 'date' ? `2026-07-${String(25 + i).padStart(2, '0')}` :
                           f.type === 'integer' ? Math.floor(Math.random() * 100) :
                           f.type === 'number' ? (Math.random() * 100).toFixed(1) :
                           f.type === 'datetime' ? `2026-07-30T${String(8 + i).padStart(2, '0')}:00:00Z` :
                           `Sample ${i + 1}`}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* API Access */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>API Access</h2>
            <pre className={styles.apiSnippet}>{`GET /api/v1/datasets/${ds.dataset_id}/data
Authorization: Bearer <your-api-key>
Content-Type: application/json

# Query parameters:
#   page (int)    - Page number (default: 1)
#   limit (int)   - Results per page (default: 100)
#   ward (int)    - Filter by ward number
#   from (date)   - Start date (ISO 8601)
#   to (date)     - End date (ISO 8601)

# Example Response:
{
  "dataset_id": "${ds.dataset_id}",
  "total": ${ds.row_count},
  "page": 1,
  "data": [
    { ${ds.fields.map(f => `"${f.name}": ...`).join(', ')} }
  ]
}`}</pre>
          </div>
        </div>

        <aside className={styles.sidebar}>
          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>Dataset Information</h3>
            <div className={styles.infoItem}><span className={styles.infoLabel}>Category</span><span>{ds.category}</span></div>
            <div className={styles.infoItem}><span className={styles.infoLabel}>Formats</span><span>{ds.format.join(', ')}</span></div>
            <div className={styles.infoItem}><span className={styles.infoLabel}>Update Freq.</span><span>{ds.update_frequency}</span></div>
            <div className={styles.infoItem}><span className={styles.infoLabel}>Source</span><span>{ds.source_agency}</span></div>
            <div className={styles.infoItem}><span className={styles.infoLabel}>License</span><span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Scale size={12} />{ds.license}</span></div>
            <div className={styles.infoItem}><span className={styles.infoLabel}>Dataset ID</span><code style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>{ds.dataset_id}</code></div>
          </div>

          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <Link href="/assistant" className={styles.actionBtn} style={{ justifyContent: 'center', width: '100%' }}>Ask AI about this dataset</Link>
              <Link href="/analytics" className={styles.actionBtn} style={{ justifyContent: 'center', width: '100%' }}>View in Analytics</Link>
              <Link href="/map" className={styles.actionBtn} style={{ justifyContent: 'center', width: '100%' }}>View on Map</Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
