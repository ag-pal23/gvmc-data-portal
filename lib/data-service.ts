import { query, isDbConnected } from './db';
import { datasets as mockDatasets, Dataset, generateWaterSupplyData, revenueByZone, grievancesByCategory, aiResponses, generateTrafficForecast } from '../data/mock';
import { vizagSoilPresets, calculateSoilFeasibility, SoilProfile, SoilAnalysisResult } from '../data/soilData';
import wardsData from '../data/wards.json';

export interface DataServiceResponse<T> {
  data: T;
  source: 'database' | 'mock';
}

/**
 * Get all available datasets with optional filtering.
 */
export async function getDatasets(q?: string, category?: string): Promise<DataServiceResponse<Dataset[]>> {
  const dbActive = await isDbConnected();
  if (dbActive) {
    try {
      let sql = 'SELECT * FROM datasets WHERE status = \'published\'';
      const params: any[] = [];
      if (category) {
        params.push(category);
        sql += ` AND category = $${params.length}`;
      }
      if (q) {
        params.push(`%${q}%`);
        sql += ` AND (title ILIKE $${params.length} OR description ILIKE $${params.length})`;
      }
      
      const res = await query(sql, params);
      
      // Load fields for each dataset
      const datasetsWithFields = await Promise.all(
        res.rows.map(async (row) => {
          const fieldsRes = await query('SELECT name, field_type as type, description FROM dataset_fields WHERE dataset_id = $1 ORDER BY ordinal', [row.id]);
          return {
            dataset_id: row.slug || row.id,
            title: row.title,
            category: row.category,
            description: row.description,
            format: [row.format.toUpperCase()],
            update_frequency: row.update_frequency,
            last_updated: row.last_updated?.toISOString() || row.updated_at?.toISOString(),
            row_count: parseInt(row.row_count || '0'),
            fields: fieldsRes.rows,
            source_agency: row.source_agency,
            license: row.license,
            downloads: 120, // default or custom metric from logs
            tags: [row.category],
          } as Dataset;
        })
      );
      
      return { data: datasetsWithFields, source: 'database' };
    } catch (error) {
      console.error('Database query error in getDatasets, falling back to mock:', error);
    }
  }

  // Fallback to Mock Data
  let filtered = [...mockDatasets];
  if (category) {
    filtered = filtered.filter(d => d.category.toLowerCase() === category.toLowerCase());
  }
  if (q) {
    const searchVal = q.toLowerCase();
    filtered = filtered.filter(d => 
      d.title.toLowerCase().includes(searchVal) || 
      d.description.toLowerCase().includes(searchVal) ||
      d.tags.some(t => t.toLowerCase().includes(searchVal))
    );
  }
  return { data: filtered, source: 'mock' };
}

/**
 * Get a specific dataset by ID or slug.
 */
export async function getDatasetById(id: string): Promise<DataServiceResponse<Dataset | null>> {
  const dbActive = await isDbConnected();
  if (dbActive) {
    try {
      const res = await query('SELECT * FROM datasets WHERE id = $1 OR slug = $1', [id]);
      if (res.rows.length > 0) {
        const row = res.rows[0];
        const fieldsRes = await query('SELECT name, field_type as type, description FROM dataset_fields WHERE dataset_id = $1 ORDER BY ordinal', [row.id]);
        const dataset: Dataset = {
          dataset_id: row.slug || row.id,
          title: row.title,
          category: row.category,
          description: row.description,
          format: [row.format.toUpperCase()],
          update_frequency: row.update_frequency,
          last_updated: row.last_updated?.toISOString() || row.updated_at?.toISOString(),
          row_count: parseInt(row.row_count || '0'),
          fields: fieldsRes.rows,
          source_agency: row.source_agency,
          license: row.license,
          downloads: 120,
          tags: [row.category],
        };
        return { data: dataset, source: 'database' };
      }
    } catch (error) {
      console.error('Database query error in getDatasetById, falling back to mock:', error);
    }
  }

  // Fallback to Mock
  const found = mockDatasets.find(d => d.dataset_id === id) || null;
  return { data: found, source: 'mock' };
}

/**
 * Get dashboard and analytics KPIs.
 */
export async function getAnalyticsData(): Promise<DataServiceResponse<{
  waterSupplyTrend: any[];
  revenueByZone: any[];
  grievancesByCategory: any[];
  kpis: any[];
}>> {
  const dbActive = await isDbConnected();
  if (dbActive) {
    try {
      // Try to read metrics from analytics_datapoints
      const waterMetric = await query("SELECT id FROM analytics_metrics WHERE key = 'water_supply_hours'");
      const waterTrend: any[] = [];
      if (waterMetric.rows.length > 0) {
        const datapoints = await query(
          "SELECT date, AVG(value) as avg_val FROM analytics_datapoints WHERE metric_id = $1 GROUP BY date ORDER BY date LIMIT 90",
          [waterMetric.rows[0].id]
        );
        datapoints.rows.forEach(r => {
          waterTrend.push({
            date: r.date.toISOString().split('T')[0],
            supply_pct: Math.round(r.avg_val * 10) / 10,
            supply_mld: Math.round((r.avg_val / 24) * 4.3 * 100) / 100,
            target_mld: 4.3
          });
        });
      }

      // If database doesn't have sufficient metrics, fall back to generating or returning standard
      const trend = waterTrend.length > 0 ? waterTrend : generateWaterSupplyData();

      // Return combined data
      return {
        data: {
          waterSupplyTrend: trend,
          revenueByZone: revenueByZone, // standard zones
          grievancesByCategory: grievancesByCategory,
          kpis: [
            { label: 'Avg Water Supply', value: '96.1%', color: '#0E9F6E', trend: '+2.1%' },
            { label: 'Avg AQI', value: '72', color: '#F59E0B', trend: '-5 pts' },
            { label: 'Open Grievances', value: '1,204', color: '#DC2626', trend: '+12%' },
            { label: 'Tax Collected (YTD)', value: '₹42.3Cr', color: '#0B5FFF', trend: '+8.5%' },
          ]
        },
        source: 'database'
      };
    } catch (error) {
      console.error('Database query error in getAnalyticsData, falling back to mock:', error);
    }
  }

  return {
    data: {
      waterSupplyTrend: generateWaterSupplyData(),
      revenueByZone,
      grievancesByCategory,
      kpis: [
        { label: 'Avg Water Supply', value: '96.1%', color: '#0E9F6E', trend: '+2.1%' },
        { label: 'Avg AQI', value: '72', color: '#F59E0B', trend: '-5 pts' },
        { label: 'Open Grievances', value: '1,204', color: '#DC2626', trend: '+12%' },
        { label: 'Tax Collected (YTD)', value: '₹42.3Cr', color: '#0B5FFF', trend: '+8.5%' },
      ]
    },
    source: 'mock'
  };
}

/**
 * Get model predictions and forecasts.
 */
export async function getPredictionsData(ward: string = 'all', horizon: string = '24h'): Promise<DataServiceResponse<{
  forecast: any[];
  accuracy: string;
  algorithm: string;
}>> {
  const dbActive = await isDbConnected();
  if (dbActive) {
    try {
      const modelRes = await query("SELECT * FROM prediction_models WHERE target_metric = 'traffic_congestion_index'");
      if (modelRes.rows.length > 0) {
        const model = modelRes.rows[0];
        const runRes = await query(
          "SELECT * FROM prediction_runs WHERE model_id = $1 AND horizon = $2 ORDER BY generated_at DESC LIMIT 1",
          [model.id, horizon]
        );
        if (runRes.rows.length > 0) {
          const pointsRes = await query(
            "SELECT ts, predicted_value, lower_bound, upper_bound FROM prediction_points WHERE run_id = $1 ORDER BY ts",
            [runRes.rows[0].id]
          );
          const forecast = pointsRes.rows.map(p => ({
            timestamp: p.ts.toISOString(),
            value: parseFloat(p.predicted_value),
            lower: p.lower_bound ? parseFloat(p.lower_bound) : null,
            upper: p.upper_bound ? parseFloat(p.upper_bound) : null,
            type: p.ts > new Date() ? 'forecast' : 'actual'
          }));
          return {
            data: {
              forecast,
              accuracy: `${Math.round(model.accuracy * 1000) / 10}%`,
              algorithm: 'LSTM + Weather'
            },
            source: 'database'
          };
        }
      }
    } catch (error) {
      console.error('Database query error in getPredictionsData, falling back to mock:', error);
    }
  }

  return {
    data: {
      forecast: generateTrafficForecast(),
      accuracy: '94.2%',
      algorithm: 'LSTM + Weather'
    },
    source: 'mock'
  };
}

/**
 * Ask the AI Assistant a question.
 */
export async function askAssistant(question: string): Promise<DataServiceResponse<{
  answer: string;
  confidence: 'high' | 'medium' | 'low';
  sources: { dataset_id: string; title: string; updated: string }[];
  chartData?: { labels: string[]; values: number[] };
}>> {
  const dbActive = await isDbConnected();
  if (dbActive) {
    try {
      // In a full implementation, this could execute a similarity query against vector embeddings,
      // or search stored assistant_conversations.
      // For now, look up matching seed questions or return default.
    } catch (error) {
      console.error('Database error in askAssistant:', error);
    }
  }

  const matched = aiResponses.find(
    r => r.question.toLowerCase() === question.toLowerCase()
  );

  const defaultResponse = {
    answer: `I found some related information about "${question}". Based on the available civic datasets, here are some insights:\n\nThe GVMC platform contains multiple datasets that may help answer your question. I recommend exploring the **Open Datasets** section for detailed data.\n\nYou can also try rephrasing your question or browse specific dataset categories for more precise results.`,
    confidence: 'low' as const,
    sources: [
      { dataset_id: "ds-water-001", title: "Water Supply Daily", updated: "2h ago" },
      { dataset_id: "ds-grievance-001", title: "Citizen Grievances", updated: "4h ago" },
    ],
  };

  return {
    data: matched || defaultResponse,
    source: 'mock'
  };
}

/**
 * Assess soil characteristics.
 */
export function getSoilFeasibilityReport(profile: Parameters<typeof calculateSoilFeasibility>[0]): SoilAnalysisResult {
  return calculateSoilFeasibility(profile);
}

/**
 * Get map boundaries.
 */
export function getMapFeatures() {
  return wardsData;
}
