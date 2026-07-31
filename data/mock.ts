export interface Dataset {
  dataset_id: string;
  title: string;
  category: string;
  description: string;
  format: string[];
  update_frequency: string;
  last_updated: string;
  row_count: number;
  fields: { name: string; type: string; description: string }[];
  source_agency: string;
  license: string;
  downloads: number;
  tags: string[];
}

export const datasets: Dataset[] = [
  {
    dataset_id: "ds-water-001",
    title: "Water Supply Daily",
    category: "Utilities",
    description: "Daily water supply volume (MLD) by ward. Includes source reservoir, target allocation, and actual supply percentage.",
    format: ["CSV", "JSON", "API"],
    update_frequency: "daily",
    last_updated: "2026-07-30T06:00:00Z",
    row_count: 58400,
    fields: [
      { name: "date", type: "date", description: "Record date" },
      { name: "ward_id", type: "integer", description: "Ward number (1–72)" },
      { name: "zone", type: "string", description: "Zone name" },
      { name: "supply_mld", type: "number", description: "Water supplied in MLD" },
      { name: "target_mld", type: "number", description: "Target allocation in MLD" },
      { name: "supply_pct", type: "number", description: "Percentage of target met" },
      { name: "source", type: "string", description: "Water source reservoir name" }
    ],
    source_agency: "GVMC Water Works",
    license: "CC-BY-4.0",
    downloads: 1247,
    tags: ["water", "utilities", "ward-level", "daily"]
  },
  {
    dataset_id: "ds-traffic-001",
    title: "Traffic Volume Hourly",
    category: "Transport",
    description: "Hourly traffic sensor readings across 45 junctions in Visakhapatnam. Includes vehicle count, avg speed, and congestion index.",
    format: ["CSV", "JSON"],
    update_frequency: "hourly",
    last_updated: "2026-07-30T14:00:00Z",
    row_count: 324000,
    fields: [
      { name: "timestamp", type: "datetime", description: "Reading timestamp" },
      { name: "junction_id", type: "string", description: "Sensor junction ID" },
      { name: "vehicle_count", type: "integer", description: "Vehicles per hour" },
      { name: "avg_speed_kmh", type: "number", description: "Average speed (km/h)" },
      { name: "congestion_index", type: "number", description: "0–100, higher = more congested" }
    ],
    source_agency: "GVMC Traffic Cell",
    license: "ODbL-1.0",
    downloads: 3412,
    tags: ["traffic", "transport", "hourly", "sensors"]
  },
  {
    dataset_id: "ds-aqi-001",
    title: "Air Quality Index Readings",
    category: "Environment",
    description: "AQI readings from 15 monitoring stations across Visakhapatnam. Includes PM2.5, PM10, NO2, SO2, O3 levels.",
    format: ["CSV", "JSON", "GeoJSON"],
    update_frequency: "hourly",
    last_updated: "2026-07-30T13:00:00Z",
    row_count: 131400,
    fields: [
      { name: "timestamp", type: "datetime", description: "Reading timestamp" },
      { name: "station_id", type: "string", description: "Monitoring station ID" },
      { name: "lat", type: "number", description: "Latitude" },
      { name: "lng", type: "number", description: "Longitude" },
      { name: "aqi", type: "integer", description: "Air Quality Index (0–500)" },
      { name: "pm25", type: "number", description: "PM2.5 (µg/m³)" },
      { name: "pm10", type: "number", description: "PM10 (µg/m³)" },
      { name: "dominant_pollutant", type: "string", description: "Primary pollutant" }
    ],
    source_agency: "AP Pollution Control Board",
    license: "CC-BY-4.0",
    downloads: 892,
    tags: ["air-quality", "environment", "pollution", "AQI"]
  },
  {
    dataset_id: "ds-grievance-001",
    title: "Citizen Grievances",
    category: "Civic Services",
    description: "Grievance reports filed by citizens categorized by type, ward, and resolution status.",
    format: ["CSV", "JSON"],
    update_frequency: "daily",
    last_updated: "2026-07-30T08:00:00Z",
    row_count: 45200,
    fields: [
      { name: "grievance_id", type: "string", description: "Unique grievance ID" },
      { name: "date_filed", type: "date", description: "Filing date" },
      { name: "ward_id", type: "integer", description: "Ward number" },
      { name: "category", type: "string", description: "Type: Roads, Water, Sanitation, etc." },
      { name: "status", type: "string", description: "Open / In Progress / Resolved" },
      { name: "resolution_days", type: "integer", description: "Days to resolve (null if open)" }
    ],
    source_agency: "GVMC Grievance Cell",
    license: "CC-BY-4.0",
    downloads: 2103,
    tags: ["grievances", "civic", "complaints", "resolution"]
  },
  {
    dataset_id: "ds-revenue-001",
    title: "Property Tax Revenue",
    category: "Finance",
    description: "Monthly property tax collection by ward and zone. Includes target vs actual collection and arrears.",
    format: ["CSV", "JSON"],
    update_frequency: "monthly",
    last_updated: "2026-07-01T00:00:00Z",
    row_count: 8640,
    fields: [
      { name: "month", type: "date", description: "Collection month" },
      { name: "ward_id", type: "integer", description: "Ward number" },
      { name: "zone", type: "string", description: "Zone name" },
      { name: "target_lakhs", type: "number", description: "Target (₹ Lakhs)" },
      { name: "collected_lakhs", type: "number", description: "Collected (₹ Lakhs)" },
      { name: "arrears_lakhs", type: "number", description: "Pending arrears" }
    ],
    source_agency: "GVMC Revenue Department",
    license: "CC-BY-4.0",
    downloads: 567,
    tags: ["revenue", "finance", "property-tax", "monthly"]
  },
  {
    dataset_id: "ds-census-001",
    title: "Ward-wise Population Census",
    category: "Demographics",
    description: "Ward-level population, household count, literacy rate, and demographic distribution from 2021 Census.",
    format: ["CSV", "JSON"],
    update_frequency: "static",
    last_updated: "2024-01-15T00:00:00Z",
    row_count: 72,
    fields: [
      { name: "ward_id", type: "integer", description: "Ward number (1–72)" },
      { name: "ward_name", type: "string", description: "Ward name" },
      { name: "population", type: "integer", description: "Total population" },
      { name: "households", type: "integer", description: "Number of households" },
      { name: "literacy_pct", type: "number", description: "Literacy rate %" },
      { name: "male_pct", type: "number", description: "Male population %" },
      { name: "female_pct", type: "number", description: "Female population %" }
    ],
    source_agency: "Census of India",
    license: "Government Open Data License",
    downloads: 4521,
    tags: ["census", "population", "demographics", "ward-level"]
  },
  {
    dataset_id: "ds-sanitation-001",
    title: "Sanitation Infrastructure Points",
    category: "Infrastructure",
    description: "Locations and status of public toilets, waste bins, and sanitation facilities across the city.",
    format: ["CSV", "GeoJSON"],
    update_frequency: "weekly",
    last_updated: "2026-07-28T00:00:00Z",
    row_count: 2840,
    fields: [
      { name: "facility_id", type: "string", description: "Facility ID" },
      { name: "type", type: "string", description: "Toilet / Waste Bin / Collection Point" },
      { name: "lat", type: "number", description: "Latitude" },
      { name: "lng", type: "number", description: "Longitude" },
      { name: "ward_id", type: "integer", description: "Ward number" },
      { name: "status", type: "string", description: "Operational / Under Repair / Closed" }
    ],
    source_agency: "GVMC Sanitation Wing",
    license: "CC-BY-4.0",
    downloads: 312,
    tags: ["sanitation", "infrastructure", "toilets", "waste"]
  },
  {
    dataset_id: "ds-road-001",
    title: "Road Condition Survey 2026",
    category: "Infrastructure",
    description: "Road surface condition assessment across major and minor roads. Includes pothole density and repair status.",
    format: ["CSV", "JSON", "GeoJSON"],
    update_frequency: "quarterly",
    last_updated: "2026-04-15T00:00:00Z",
    row_count: 4200,
    fields: [
      { name: "road_id", type: "string", description: "Road segment ID" },
      { name: "road_name", type: "string", description: "Road name" },
      { name: "ward_id", type: "integer", description: "Ward number" },
      { name: "length_km", type: "number", description: "Segment length (km)" },
      { name: "condition", type: "string", description: "Good / Fair / Poor / Critical" },
      { name: "potholes_per_km", type: "number", description: "Pothole density" },
      { name: "last_repaired", type: "date", description: "Last repair date" }
    ],
    source_agency: "GVMC Roads Division",
    license: "CC-BY-4.0",
    downloads: 1890,
    tags: ["roads", "infrastructure", "potholes", "maintenance"]
  }
];

/* ---------- Water Supply Time Series ---------- */
export function generateWaterSupplyData() {
  const data = [];
  const baseDate = new Date('2026-05-01');
  for (let d = 0; d < 90; d++) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() + d);
    const dateStr = date.toISOString().split('T')[0];
    const base = 94 + Math.sin(d / 7) * 3;
    data.push({
      date: dateStr,
      supply_pct: Math.round((base + (Math.random() - 0.5) * 4) * 10) / 10,
      supply_mld: Math.round((4.0 + Math.sin(d / 7) * 0.3 + (Math.random() - 0.5) * 0.2) * 100) / 100,
      target_mld: 4.3,
    });
  }
  return data;
}

/* ---------- Revenue by Zone ---------- */
export const revenueByZone = [
  { zone: "Zone 1 - North", target: 180, collected: 156 },
  { zone: "Zone 2 - Central", target: 320, collected: 298 },
  { zone: "Zone 3 - South", target: 240, collected: 210 },
  { zone: "Zone 4 - West", target: 150, collected: 132 },
  { zone: "Zone 5 - Beach", target: 200, collected: 188 },
  { zone: "Zone 6 - Industrial", target: 280, collected: 265 },
];

/* ---------- Grievances by Category ---------- */
export const grievancesByCategory = [
  { category: "Roads & Potholes", count: 342, color: "#0B5FFF" },
  { category: "Water Supply", count: 278, color: "#0E9F6E" },
  { category: "Sanitation", count: 215, color: "#F59E0B" },
  { category: "Street Lights", count: 168, color: "#7C3AED" },
  { category: "Drainage", count: 124, color: "#DC2626" },
  { category: "Others", count: 77, color: "#8B95A5" },
];

/* ---------- Traffic Congestion Forecast ---------- */
export function generateTrafficForecast() {
  const data = [];
  const now = new Date('2026-07-30T08:00:00Z');
  // Historical (last 12 hours)
  for (let h = -12; h < 0; h++) {
    const ts = new Date(now);
    ts.setHours(ts.getHours() + h);
    const hour = ts.getHours();
    const base = hour >= 8 && hour <= 10 ? 75 : hour >= 17 && hour <= 19 ? 80 : hour >= 12 && hour <= 14 ? 55 : 30;
    data.push({
      timestamp: ts.toISOString(),
      value: base + (Math.random() - 0.5) * 10,
      type: 'actual',
    });
  }
  // Forecast (next 24 hours)
  for (let h = 0; h < 24; h++) {
    const ts = new Date(now);
    ts.setHours(ts.getHours() + h);
    const hour = ts.getHours();
    const base = hour >= 8 && hour <= 10 ? 78 : hour >= 17 && hour <= 19 ? 85 : hour >= 12 && hour <= 14 ? 58 : 28;
    const uncertainty = 5 + h * 0.5;
    data.push({
      timestamp: ts.toISOString(),
      value: Math.round((base + (Math.random() - 0.5) * 6) * 10) / 10,
      lower: Math.round((base - uncertainty) * 10) / 10,
      upper: Math.round((base + uncertainty) * 10) / 10,
      confidence: Math.round((95 - h * 0.8) * 10) / 10,
      type: 'forecast',
    });
  }
  return data;
}

/* ---------- AI Assistant Responses ---------- */
export interface AIResponse {
  question: string;
  answer: string;
  confidence: 'high' | 'medium' | 'low';
  sources: { dataset_id: string; title: string; updated: string }[];
  chartData?: { labels: string[]; values: number[] };
}

export const aiResponses: AIResponse[] = [
  {
    question: "What is the water supply trend in Ward 12 this month?",
    answer: "Ward 12 (Maharanipeta) has maintained an average water supply of **96.3%** of its daily target (4.3 MLD) throughout July 2026. Supply has been stable with minor fluctuations between 93% and 98%. The primary source is Yeleru Reservoir, which is currently at 82% capacity.\n\nCompared to June 2026, there has been a **+2.1%** improvement in supply consistency.",
    confidence: "high",
    sources: [
      { dataset_id: "ds-water-001", title: "Water Supply Daily", updated: "2h ago" },
      { dataset_id: "ds-census-001", title: "Ward Master Data", updated: "7d ago" }
    ],
    chartData: {
      labels: ["Jul 1", "Jul 5", "Jul 10", "Jul 15", "Jul 20", "Jul 25", "Jul 30"],
      values: [94.2, 95.8, 97.1, 93.5, 96.8, 97.2, 96.3]
    }
  },
  {
    question: "How many grievances were filed this week?",
    answer: "A total of **1,204 grievances** were filed in the current week (July 24–30, 2026). This represents a **12% increase** compared to last week (1,075).\n\n**Top categories:**\n1. Roads & Potholes — 342 (28.4%)\n2. Water Supply — 278 (23.1%)\n3. Sanitation — 215 (17.9%)\n\nWard 5 (Gajuwaka) has the highest volume with 89 grievances, followed by Ward 18 (Seethammadhara) with 72.",
    confidence: "high",
    sources: [
      { dataset_id: "ds-grievance-001", title: "Citizen Grievances", updated: "4h ago" }
    ],
    chartData: {
      labels: ["Roads", "Water", "Sanitation", "Lights", "Drainage", "Others"],
      values: [342, 278, 215, 168, 124, 77]
    }
  },
  {
    question: "Compare AQI across all zones for July 2026",
    answer: "The Air Quality Index across Visakhapatnam zones for July 2026 shows **moderate** conditions overall (average AQI: 72).\n\n**Zone breakdown:**\n- Industrial Zone: AQI **112** (Unhealthy for Sensitive Groups) ⚠️\n- Central Zone: AQI **68** (Moderate)\n- Beach Zone: AQI **45** (Good) ✅\n- North Zone: AQI **58** (Moderate)\n- South Zone: AQI **76** (Moderate)\n- West Zone: AQI **65** (Moderate)\n\nThe Industrial Zone consistently exceeds safe levels, primarily due to PM2.5 from manufacturing units.",
    confidence: "high",
    sources: [
      { dataset_id: "ds-aqi-001", title: "Air Quality Index Readings", updated: "1h ago" }
    ],
    chartData: {
      labels: ["Industrial", "South", "Central", "West", "North", "Beach"],
      values: [112, 76, 68, 65, 58, 45]
    }
  },
  {
    question: "Show me datasets related to water",
    answer: "Here are the datasets related to **water** available on the platform:\n\n1. **Water Supply Daily** — Daily water supply volume by ward (updated 2h ago)\n2. **Citizen Grievances** — Includes water-related complaints (updated 4h ago)\n3. **Sanitation Infrastructure Points** — Includes water facilities (updated 2d ago)\n\nYou can explore these datasets for detailed analysis or use the API to integrate them into your application.",
    confidence: "high",
    sources: [
      { dataset_id: "ds-water-001", title: "Water Supply Daily", updated: "2h ago" },
      { dataset_id: "ds-grievance-001", title: "Citizen Grievances", updated: "4h ago" },
      { dataset_id: "ds-sanitation-001", title: "Sanitation Infrastructure", updated: "2d ago" }
    ]
  },
  {
    question: "Predict traffic congestion for tomorrow",
    answer: "Based on historical traffic sensor data and weather forecasts, **traffic congestion is expected to peak during evening rush hours tomorrow** (July 31, 2026).\n\n**Key predictions:**\n- Morning peak (8–10 AM): Congestion Index **78/100** (Heavy)\n- Midday (12–2 PM): Congestion Index **55/100** (Moderate)\n- Evening peak (5–7 PM): Congestion Index **85/100** (Very Heavy) ⚠️\n- Late night (10 PM+): Congestion Index **22/100** (Light)\n\nConfidence: **82%** (based on LSTM model trained on 90 days of data).\n\n> ⚠️ Note: A cultural event near RK Beach may cause higher-than-predicted congestion in Zone 5.",
    confidence: "medium",
    sources: [
      { dataset_id: "ds-traffic-001", title: "Traffic Volume Hourly", updated: "30min ago" }
    ],
    chartData: {
      labels: ["6AM", "8AM", "10AM", "12PM", "2PM", "4PM", "6PM", "8PM", "10PM"],
      values: [25, 78, 62, 55, 48, 65, 85, 52, 22]
    }
  }
];

/* ---------- Dashboard KPIs ---------- */
export const dashboardKPIs = [
  { title: "Population", value: "21L", icon: "Users", trend: "+1.2%", trendDirection: "up" as const },
  { title: "Revenue (YTD)", value: "₹42.3Cr", icon: "IndianRupee", trend: "+8.5%", trendDirection: "up" as const },
  { title: "Water Supply", value: "96%", icon: "Droplets", trend: "+2.1%", trendDirection: "up" as const },
  { title: "Open Grievances", value: "1,204", icon: "MessageSquareWarning", trend: "+12%", trendDirection: "down" as const },
  { title: "Air Quality (AQI)", value: "72", icon: "Wind", trend: "-5", trendDirection: "up" as const },
  { title: "API Calls Today", value: "14.2K", icon: "Activity", trend: "+23%", trendDirection: "up" as const },
];

/* ---------- City Alerts ---------- */
export const cityAlerts = [
  { id: "alert-1", severity: "warning" as const, message: "Heat advisory: 42°C expected tomorrow in most wards", expires: "2026-07-31T18:00:00Z" },
  { id: "alert-2", severity: "info" as const, message: "Water supply maintenance scheduled in Zone 3 on Aug 2", expires: "2026-08-02T23:59:00Z" },
];

/* ---------- API Endpoints for API Hub ---------- */
export const apiEndpoints = [
  {
    method: "GET",
    path: "/api/v1/datasets",
    description: "List all available datasets with optional filtering",
    parameters: [
      { name: "q", type: "string", required: false, description: "Search query" },
      { name: "category", type: "string", required: false, description: "Filter by category" },
      { name: "format", type: "string", required: false, description: "Filter by format (csv, json, geojson)" },
      { name: "page", type: "integer", required: false, description: "Page number (default: 1)" },
      { name: "limit", type: "integer", required: false, description: "Results per page (default: 20)" },
    ],
    sampleResponse: `{
  "total": 128,
  "page": 1,
  "results": [
    {
      "dataset_id": "ds-water-001",
      "title": "Water Supply Daily",
      "category": "Utilities",
      "format": ["CSV", "JSON"],
      "last_updated": "2026-07-30T06:00:00Z"
    }
  ]
}`
  },
  {
    method: "GET",
    path: "/api/v1/datasets/:id",
    description: "Get detailed information about a specific dataset",
    parameters: [
      { name: "id", type: "string", required: true, description: "Dataset ID" },
    ],
    sampleResponse: `{
  "dataset_id": "ds-water-001",
  "title": "Water Supply Daily",
  "description": "Daily water supply volume by ward...",
  "fields": [...],
  "row_count": 58400,
  "last_updated": "2026-07-30T06:00:00Z"
}`
  },
  {
    method: "GET",
    path: "/api/v1/analytics/:metric",
    description: "Get time series analytics for a specific metric",
    parameters: [
      { name: "metric", type: "string", required: true, description: "Metric name (water_supply, aqi, grievances...)" },
      { name: "range", type: "string", required: false, description: "Time range (7d, 30d, 90d, 1y)" },
      { name: "groupBy", type: "string", required: false, description: "Group by field (ward, zone, category)" },
    ],
    sampleResponse: `{
  "metric": "water_supply_pct",
  "range": "30d",
  "series": [
    { "date": "2026-07-01", "value": 95.2, "ward": 12 },
    { "date": "2026-07-02", "value": 96.1, "ward": 12 }
  ]
}`
  },
  {
    method: "POST",
    path: "/api/v1/assistant/query",
    description: "Submit a natural-language question to the AI Assistant",
    parameters: [
      { name: "question", type: "string", required: true, description: "Natural language question" },
      { name: "context", type: "object", required: false, description: "Optional context (ward, date range)" },
    ],
    sampleResponse: `{
  "answer": "Ward 12 currently receives 96% of its daily allocation...",
  "confidence": "high",
  "sources": [
    { "dataset_id": "ds-water-001", "title": "Water Supply Daily" }
  ]
}`
  },
  {
    method: "GET",
    path: "/api/v1/predictions/:model",
    description: "Get predictions from a trained model",
    parameters: [
      { name: "model", type: "string", required: true, description: "Model ID (traffic, water-demand)" },
      { name: "horizon", type: "string", required: false, description: "Forecast horizon (24h, 7d)" },
      { name: "ward", type: "integer", required: false, description: "Filter by ward" },
    ],
    sampleResponse: `{
  "model": "traffic-congestion-lstm",
  "forecast": [
    { "timestamp": "...", "value": 78, "lower": 70, "upper": 86, "confidence": 0.82 }
  ]
}`
  },
  {
    method: "GET",
    path: "/api/v1/map/layers/:layerId",
    description: "Get GeoJSON or vector tile data for a map layer",
    parameters: [
      { name: "layerId", type: "string", required: true, description: "Layer ID (wards, water, traffic, aqi)" },
      { name: "bbox", type: "string", required: false, description: "Bounding box (minLng,minLat,maxLng,maxLat)" },
    ],
    sampleResponse: `{
  "type": "FeatureCollection",
  "features": [
    { "type": "Feature", "properties": { "ward_id": 12, "name": "Maharanipeta" }, "geometry": {...} }
  ]
}`
  },
];
