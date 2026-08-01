'use client';

import React, { useState } from 'react';
import {
  Rocket, Star, Zap, TrendingUp, X, ArrowRight, Sparkles,
  ChevronRight, Globe, Cpu, Leaf, Building2, Users, HeartPulse,
  ShieldCheck, Lightbulb, BadgeDollarSign
} from 'lucide-react';
import styles from './page.module.css';

// ─────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────

interface StartupIdea {
  id: string;
  tier: 1 | 2 | 3 | 4;
  icon: string;
  iconBg: string;
  title: string;
  tagline: string;
  description: string;
  fullDescription: string;
  tags: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  market: string;
  impact: number; // 0–100
  roi: { investment: string; revenue: string; timeline: string };
  steps: string[];
  category: string;
}

const startupIdeas: StartupIdea[] = [
  // ─── TIER 1: Entry Level ───────────────────────────────────────────────────
  {
    id: 't1-1', tier: 1,
    icon: '🌱', iconBg: 'rgba(34,197,94,0.12)',
    title: 'HyperLocal Civic Alert App',
    tagline: 'Real-time ward-level civic alerts for Vizag residents',
    description: 'A mobile-first PWA that pushes hyper-local alerts (water cuts, road digs, garbage pickup) to residents ward-by-ward using GVMC open datasets.',
    fullDescription: 'Built on GVMC Open Data APIs, this PWA sends push notifications for scheduled water supply cuts, garbage collection times, road closure warnings, and civic maintenance alerts. Citizens subscribe to their ward and receive pin-point notifications — reducing missed services and complaints.',
    tags: ['PWA', 'GVMC API', 'Civic Tech', 'Push Notifications'],
    difficulty: 'Easy', market: '₹12 Cr TAM',
    impact: 72, category: 'Civic Services',
    roi: { investment: '₹2L', revenue: '₹18L/yr', timeline: '3 Months' },
    steps: [
      'Integrate with GVMC Open Data API for water & road datasets',
      'Build React Native / PWA frontend with ward selector',
      'Implement Firebase push notifications per ward subscription',
      'Add feedback loop (did garbage arrive?) to improve data quality',
      'Monetize via GVMC white-label contract or B2G SaaS subscription',
    ],
  },
  {
    id: 't1-2', tier: 1,
    icon: '📊', iconBg: 'rgba(59,130,246,0.12)',
    title: 'Civic Report Card Dashboard',
    tagline: 'Ward-level performance scorecards for citizens & councillors',
    description: 'Visual dashboards showing water supply, AQI, grievance resolution, and sanitation scores per ward — updated weekly from GVMC datasets.',
    fullDescription: 'A public dashboard generating weekly and monthly scorecards per ward council member — KPIs include water availability %, AQI index, grievance SLA adherence, and sanitation scores. Citizens can share & post on social media, creating public accountability pressure.',
    tags: ['Dashboard', 'Open Data', 'GovTech', 'Accountability'],
    difficulty: 'Easy', market: '₹8 Cr TAM',
    impact: 68, category: 'GovTech',
    roi: { investment: '₹1.5L', revenue: '₹10L/yr', timeline: '2 Months' },
    steps: [
      'Pull datasets from GVMC Open Data Portal APIs',
      'Build Next.js scorecard dashboard with chart visualizations',
      'Add councillor public profiles with performance history',
      'Enable sharable PNG cards for WhatsApp & social media',
      'Pitch to GVMC as official transparency module',
    ],
  },
  {
    id: 't1-3', tier: 1,
    icon: '🗺️', iconBg: 'rgba(234,179,8,0.12)',
    title: 'Pothole & Infra Damage Crowdmap',
    tagline: 'Community-powered city defect detection and tracking',
    description: 'Citizens photo-report potholes, broken lights, damaged footpaths — auto-geotagged on a live ward map. Works as a civic audit layer on top of GVMC ward data.',
    fullDescription: 'A crowd-sourced defect reporting map where citizens photograph and pin infrastructure damage. Reports are auto-classified by AI (pothole/broken-light/flooding) and escalated to the right GVMC department. Resolution status is tracked and made public.',
    tags: ['Crowdsourcing', 'Computer Vision', 'Mapping', 'GIS'],
    difficulty: 'Easy', market: '₹15 Cr TAM',
    impact: 75, category: 'Smart City',
    roi: { investment: '₹3L', revenue: '₹22L/yr', timeline: '4 Months' },
    steps: [
      'Build photo-upload app with GPS auto-tagging',
      'Integrate MapLibre for ward-level pin map display',
      'Add YOLOv8 model for pothole/damage auto-classification',
      'Create GVMC department notification & escalation workflow',
      'Publish open API for third-party civic monitors to consume',
    ],
  },

  // ─── TIER 2: Growth Stage ────────────────────────────────────────────────
  {
    id: 't2-1', tier: 2,
    icon: '💧', iconBg: 'rgba(14,159,110,0.12)',
    title: 'WaterSense Smart Billing SaaS',
    tagline: 'ML-predicted water usage and dynamic tariff optimization',
    description: 'SaaS platform for municipal water utilities combining IoT sensor data, predictive ML models, and citizen self-service billing — reducing non-revenue water by 35%.',
    fullDescription: 'By combining smart meter IoT telemetry with machine learning forecasting, WaterSense predicts household consumption, detects leakage anomalies, and dynamically adjusts tariff slabs. A citizen self-service portal with WhatsApp bill delivery dramatically cuts billing complaints.',
    tags: ['IoT', 'ML', 'SaaS', 'Water', 'Smart Meters'],
    difficulty: 'Medium', market: '₹85 Cr TAM',
    impact: 88, category: 'Smart Infrastructure',
    roi: { investment: '₹25L', revenue: '₹1.2 Cr/yr', timeline: '8 Months' },
    steps: [
      'Build IoT data ingestion pipeline (MQTT/REST) for smart meters',
      'Train LSTM model for household consumption prediction',
      'Build utility billing dashboard + citizen portal',
      'Implement anomaly detection for leakage events',
      'Pilot with one GVMC water zone (50,000 connections)',
    ],
  },
  {
    id: 't2-2', tier: 2,
    icon: '🏙️', iconBg: 'rgba(11,95,255,0.12)',
    title: 'AI Urban Planning Co-Pilot',
    tagline: 'Geospatial AI assistant for ward-level urban master planning',
    description: 'An AI co-pilot that ingests satellite imagery, land use datasets, and demographic data to generate automated urban planning recommendations and zoning impact reports.',
    fullDescription: 'Urban planners and architects interact with an LLM-powered co-pilot that overlays GIS datasets (land use, population density, GVMC ward data, pollution maps) to generate recommended zoning changes, transit expansion plans, and infra project impact assessments.',
    tags: ['GIS', 'LLM', 'Urban Planning', 'Satellite Imagery'],
    difficulty: 'Hard', market: '₹120 Cr TAM',
    impact: 91, category: 'GovTech',
    roi: { investment: '₹45L', revenue: '₹2.5 Cr/yr', timeline: '12 Months' },
    steps: [
      'Ingest GVMC GIS datasets + satellite image layers (Sentinel-2)',
      'Build RAG pipeline for urban policy documents + IS codes',
      'Create interactive map-based query interface',
      'Train custom zoning recommendation classifier',
      'Pilot with GVMC Town Planning department',
    ],
  },
  {
    id: 't2-3', tier: 2,
    icon: '🌬️', iconBg: 'rgba(249,115,22,0.12)',
    title: 'AQI Prediction & Pollution SOS',
    tagline: 'Hyper-local air quality forecasting for at-risk Vizag communities',
    description: 'An ML-powered AQI forecasting system trained on Visakhapatnam\'s VSEZ industrial data, port emissions, and weather patterns — providing 48-hour community health alerts.',
    fullDescription: 'Combines sensor IoT data, meteorological APIs, and industrial emissions schedules to predict hourly AQI at the ward level. Sends automated health advisories to registered citizens, schools, and hospitals with recommended PPE and outdoor activity guidance. Integrated with GVMC AQI dataset.',
    tags: ['Air Quality', 'ML Forecasting', 'IoT', 'Health Alerts'],
    difficulty: 'Medium', market: '₹60 Cr TAM',
    impact: 84, category: 'Environment',
    roi: { investment: '₹20L', revenue: '₹85L/yr', timeline: '7 Months' },
    steps: [
      'Scrape and model GVMC + CPCB pollution sensor data',
      'Train LSTM/XGBoost for 48-hour ward-level AQI prediction',
      'Build public-facing alert system (SMS + WhatsApp + app)',
      'Publish free API for schools & hospitals to consume',
      'Monetize via enterprise health & safety compliance subscriptions',
    ],
  },
  {
    id: 't2-4', tier: 2,
    icon: '🏗️', iconBg: 'rgba(124,58,237,0.12)',
    title: 'ConstructIQ — Building Permission AI',
    tagline: 'End-to-end AI-powered building permit processing for municipalities',
    description: 'Digitizes GVMC building permission workflow using AI document parsing, soil feasibility checks, and automated IS code compliance verification — reducing permit time from 45 days to 4 days.',
    fullDescription: 'Integrates with the AI Soil & Foundation Advisor to auto-validate soil reports, uses AI OCR to parse architectural drawings, and runs automated IS 875/IS 1893 structural compliance checks. Officers get a ranked approval queue with risk scores.',
    tags: ['AI OCR', 'Soil Analysis', 'GovTech', 'Compliance', 'LLM'],
    difficulty: 'Hard', market: '₹200 Cr TAM',
    impact: 93, category: 'GovTech',
    roi: { investment: '₹60L', revenue: '₹3 Cr/yr', timeline: '14 Months' },
    steps: [
      'Build AI OCR pipeline for building plan document parsing',
      'Integrate Soil Advisor API for auto soil feasibility checks',
      'Create IS code compliance rule engine (IS 875, IS 1893)',
      'Build officer dashboard with risk-ranked approval queue',
      'Pilot with GVMC Town Planning for real permit batches',
    ],
  },

  // ─── TIER 3: High Impact / Next-Gen ─────────────────────────────────────
  {
    id: 't3-1', tier: 3,
    icon: '🤖', iconBg: 'rgba(124,58,237,0.12)',
    title: 'CivicMind — Multimodal City OS',
    tagline: 'LLM-powered city brain that autonomously manages civic workflows',
    description: 'A next-gen city management OS powered by a fine-tuned multimodal LLM that autonomously processes citizen grievances, routes department tasks, and predicts city-wide service failures 72 hours in advance.',
    fullDescription: 'CivicMind is an agentic AI platform — a multi-agent orchestration layer over GVMC\'s departments. It autonomously classifies, routes, and tracks grievances. It monitors water/power/sanitation sensor streams for anomaly prediction and dispatches maintenance crews with optimal routing. A natural language interface allows both officers and citizens to interact via text, voice, or image.',
    tags: ['Agentic AI', 'Multi-Agent', 'LLM Fine-Tuning', 'Smart City OS'],
    difficulty: 'Expert', market: '₹800 Cr TAM',
    impact: 97, category: 'AI Platform',
    roi: { investment: '₹2 Cr', revenue: '₹18 Cr/yr', timeline: '24 Months' },
    steps: [
      'Fine-tune Gemini/GPT on GVMC civic records & grievance data',
      'Build multi-agent orchestration (grievance, scheduling, prediction agents)',
      'Integrate with all GVMC department data APIs and IoT sensor feeds',
      'Build natural language city command center dashboard',
      'Pilot with Commissioner office for one full quarter',
    ],
  },
  {
    id: 't3-2', tier: 3,
    icon: '🌊', iconBg: 'rgba(14,159,110,0.12)',
    title: 'BlueCycle — Circular Waste Ocean Economy',
    tagline: 'AI-powered coastal waste-to-resource circular economy platform',
    description: 'An AI marketplace connecting Vizag\'s coastal waste generators (fishing industries, ports, beach hotels) with certified recyclers and upcyclers — tracking CO₂ savings in real-time on a blockchain ledger.',
    fullDescription: 'Visakhapatnam generates massive coastal industrial waste. BlueCycle uses computer vision to classify waste streams from harbors and fishing docks, matches waste producers with certified recyclers on an AI marketplace, and issues verifiable carbon credits on a blockchain. Fishermen earn micro-payments for plastic waste returns.',
    tags: ['CircularEconomy', 'Blockchain', 'CV', 'GreenTech', 'Carbon Credits'],
    difficulty: 'Expert', market: '₹450 Cr TAM',
    impact: 95, category: 'GreenTech',
    roi: { investment: '₹1.5 Cr', revenue: '₹12 Cr/yr', timeline: '18 Months' },
    steps: [
      'Deploy CV waste classification cameras at fishing harbors & ports',
      'Build waste producer–recycler AI matching marketplace',
      'Implement blockchain carbon credit issuance (Polygon/Hyperledger)',
      'Launch fisherman micro-payment for plastic collection rewards',
      'Partner with AP Pollution Control Board for regulatory data',
    ],
  },
  {
    id: 't3-3', tier: 3,
    icon: '🏥', iconBg: 'rgba(239,68,68,0.12)',
    title: 'HealthGrid — Predictive Civic Epidemiology',
    tagline: 'AI-driven disease outbreak prediction for Vizag\'s 2M residents',
    description: 'A predictive public health surveillance platform combining water quality data, hospital visit records, weather, and AQI datasets to forecast disease outbreaks 3 weeks ahead with ward-level precision.',
    fullDescription: 'HealthGrid integrates GVMC\'s water quality datasets, AP\'s hospital visit anonymized records, satellite-derived stagnant water maps, and AQI data into a unified epidemiology prediction engine. It forecasts dengue, cholera, and respiratory disease clusters 21 days ahead, enabling preemptive public health interventions at the ward level.',
    tags: ['Epidemiology', 'ML', 'Public Health', 'GIS', 'Open Data'],
    difficulty: 'Expert', market: '₹600 Cr TAM',
    impact: 96, category: 'HealthTech',
    roi: { investment: '₹1.8 Cr', revenue: '₹15 Cr/yr', timeline: '20 Months' },
    steps: [
      'Aggregate GVMC water quality, weather, and AQI datasets',
      'Train ensemble models for dengue, cholera, respiratory outbreak prediction',
      'Build satellite stagnant water detection pipeline (Sentinel-2)',
      'Build health officer command dashboard with ward-level heat maps',
      'Partner with Greater Vizag Municipal Health Department for pilot',
    ],
  },

  // ─── TIER 4: Moonshots / Frontier ────────────────────────────────────────
  {
    id: 't4-1', tier: 4,
    icon: '🛸', iconBg: 'rgba(236,72,153,0.12)',
    title: 'AeroGrid — Drone Delivery Public Infrastructure',
    tagline: 'Municipal drone corridor network for last-mile civic deliveries in Vizag',
    description: 'Build India\'s first municipal drone delivery infrastructure layer — government-licensed corridors for medicine, document, and food deliveries across Visakhapatnam\'s 98 wards.',
    fullDescription: 'AeroGrid establishes a city-licensed drone corridor network mapped to GVMC ward boundaries. Drone traffic management integrates with DGCA NPNT, weather APIs, and no-fly zone overlays. Initial use cases: medicine delivery to coastal fishing villages, document attestation courier, blood sample logistics between hospitals.',
    tags: ['Drones', 'DGCA NPNT', 'Last-Mile', 'Smart City', 'DeepTech'],
    difficulty: 'Expert', market: '₹2,200 Cr TAM',
    impact: 99, category: 'DeepTech',
    roi: { investment: '₹5 Cr', revenue: '₹40 Cr/yr', timeline: '36 Months' },
    steps: [
      'Obtain DGCA drone corridor licensing for Visakhapatnam urban airspace',
      'Build UTM (Unmanned Traffic Management) system on GVMC GIS map layer',
      'Pilot blood sample logistics between government hospitals',
      'Launch medicine-to-fishing-village delivery in coastal wards',
      'Open corridor to third-party delivery operators via licensing API',
    ],
  },
  {
    id: 't4-2', tier: 4,
    icon: '🧠', iconBg: 'rgba(124,58,237,0.12)',
    title: 'NeuroCity — Digital Twin of Visakhapatnam',
    tagline: 'Real-time 3D digital twin of GVMC infrastructure for simulation & planning',
    description: 'A photorealistic real-time 3D digital twin of Visakhapatnam — updated from drone surveys, IoT sensors, and satellite imagery — enabling city-scale simulation of flood risk, traffic, and disaster response.',
    fullDescription: 'Built on Unreal Engine 5 + NVIDIA Omniverse, NeuroCity is a living digital twin of Visakhapatnam updated daily from Sentinel-2 satellite imagery, drone photogrammetry surveys, IoT sensor streams, and GVMC datasets. Planners simulate cyclone evacuation routes, flood inundation, infra load capacity, and large-event crowd scenarios before real decisions are made.',
    tags: ['Digital Twin', 'Unreal Engine 5', 'NVIDIA Omniverse', 'GIS', 'Simulation'],
    difficulty: 'Expert', market: '₹3,500 Cr TAM',
    impact: 99, category: 'DeepTech',
    roi: { investment: '₹8 Cr', revenue: '₹65 Cr/yr', timeline: '48 Months' },
    steps: [
      'Commission LiDAR drone survey of GVMC\'s 680 km² urban area',
      'Build Unreal Engine 5 city mesh from photogrammetry + GIS layers',
      'Integrate live IoT sensor streams and GVMC Open Data API feeds',
      'Build simulation engine for flood, traffic, crowd, and disaster scenarios',
      'License to GVMC, NDRF, urban planners, and real estate developers',
    ],
  },
];

const TIERS = [
  { id: 1, label: 'Tier 1 — Entry Level', badge: 'BEGINNER FRIENDLY', desc: 'Low capital · 2–4 month MVP · ₹1–5L investment', badgeClass: styles.tier1Badge },
  { id: 2, label: 'Tier 2 — Growth Stage', badge: 'SCALE-READY', desc: 'Medium complexity · 6–14 month MVP · ₹10–75L investment', badgeClass: styles.tier2Badge },
  { id: 3, label: 'Tier 3 — High Impact', badge: 'NEXT-GEN', desc: 'Deep tech · 18–24 months · ₹1–2 Cr investment', badgeClass: styles.tier3Badge },
  { id: 4, label: 'Tier 4 — Moonshots 🚀', badge: 'FRONTIER', desc: 'City-scale transformation · 3–5 years · ₹5 Cr+ investment', badgeClass: styles.tier4Badge },
];

const CATEGORIES = ['All', 'Civic Services', 'GovTech', 'Smart City', 'Smart Infrastructure', 'Environment', 'AI Platform', 'GreenTech', 'HealthTech', 'DeepTech'];

const diffClass: Record<string, string> = {
  Easy: styles.diffEasy, Medium: styles.diffMed, Hard: styles.diffHard, Expert: styles.diffExpert,
};
const tierCardClass: Record<number, string> = {
  1: styles.tier1Card, 2: styles.tier2Card, 3: styles.tier3Card, 4: styles.tier4Card,
};

// ─────────────────────────────────────────────
//  COMPONENT
// ─────────────────────────────────────────────
export default function StartupHubPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeIdea, setActiveIdea] = useState<StartupIdea | null>(null);

  const filtered = startupIdeas.filter(
    (idea) => selectedCategory === 'All' || idea.category === selectedCategory
  );

  return (
    <div className={styles.page}>
      {/* ── Hero ───────────────────────────────────── */}
      <div className={styles.hero}>
        <div className={styles.heroBadge}>
          <Sparkles size={14} /> GVMC Startup Ideas Engine — Visakhapatnam 2026
        </div>
        <h1 className={styles.heroTitle}>
          Build the Next-Gen<br />Smart City Startups
        </h1>
        <p className={styles.heroSub}>
          Curated, tier-ranked startup ideas powered by GVMC Open Data. From beginner-friendly civic apps to frontier AI platforms — find your perfect opportunity and launch faster.
        </p>

        {/* Stats */}
        <div className={styles.statsStrip}>
          <div className={styles.statItem}>
            <div className={styles.statValue}>{startupIdeas.length}</div>
            <div className={styles.statLabel}>Curated Ideas</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>4</div>
            <div className={styles.statLabel}>Difficulty Tiers</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>₹7,200 Cr+</div>
            <div className={styles.statLabel}>Combined Market TAM</div>
          </div>
          <div className={styles.statItem}>
            <div className={styles.statValue}>98</div>
            <div className={styles.statLabel}>Wards to Impact</div>
          </div>
        </div>
      </div>

      {/* ── Filter Bar ─────────────────────────────── */}
      <div className={styles.filterBar}>
        <span className={styles.filterLabel}>Category:</span>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`${styles.filterBtn} ${selectedCategory === cat ? styles.filterBtnActive : ''}`}
            onClick={() => setSelectedCategory(cat)}
            suppressHydrationWarning
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Tier Sections ──────────────────────────── */}
      {TIERS.map((tier) => {
        const ideas = filtered.filter((i) => i.tier === tier.id);
        if (ideas.length === 0) return null;
        return (
          <section key={tier.id} className={styles.tierSection}>
            <div className={styles.tierHeader}>
              <span className={`${styles.tierBadge} ${tier.badgeClass}`}>
                {tier.badge}
              </span>
              <h2 className={styles.tierTitle}>{tier.label}</h2>
              <span className={styles.tierDesc}>{tier.desc}</span>
            </div>

            <div className={styles.cardsGrid}>
              {ideas.map((idea) => (
                <div
                  key={idea.id}
                  className={`${styles.ideaCard} ${tierCardClass[idea.tier]}`}
                  onClick={() => setActiveIdea(idea)}
                  role="button"
                  aria-label={`View startup idea: ${idea.title}`}
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setActiveIdea(idea)}
                >
                  <div className={styles.cardTop}>
                    <div className={styles.cardIcon} style={{ background: idea.iconBg }}>
                      {idea.icon}
                    </div>
                    <div className={styles.cardMeta}>
                      <span className={`${styles.difficultyBadge} ${diffClass[idea.difficulty]}`}>
                        {idea.difficulty}
                      </span>
                      <span className={styles.marketBadge}>{idea.market}</span>
                    </div>
                  </div>

                  <div className={styles.cardTitle}>{idea.title}</div>
                  <div className={styles.cardDesc}>{idea.description}</div>

                  <div className={styles.cardTags}>
                    {idea.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                  </div>

                  <div className={styles.cardFooter}>
                    <div className={styles.impactScore}>
                      <span>Impact</span>
                      <div className={styles.impactBar}>
                        <div className={styles.impactFill} style={{ width: `${idea.impact}%` }} />
                      </div>
                      <span>{idea.impact}%</span>
                    </div>
                    <button className={styles.exploreBtn} suppressHydrationWarning>
                      Explore <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* ── Idea Detail Modal ──────────────────────── */}
      {activeIdea && (
        <div
          className={styles.modalOverlay}
          onClick={(e) => e.target === e.currentTarget && setActiveIdea(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Startup idea details: ${activeIdea.title}`}
        >
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div style={{ fontSize: '2.5rem' }}>{activeIdea.icon}</div>
              <div className={styles.modalTitle}>{activeIdea.title}</div>
              <button className={styles.closeBtn} onClick={() => setActiveIdea(null)} aria-label="Close modal" suppressHydrationWarning>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              <span className={`${styles.difficultyBadge} ${diffClass[activeIdea.difficulty]}`}>{activeIdea.difficulty}</span>
              <span className={styles.tag}>{activeIdea.category}</span>
              <span className={styles.tag}>{activeIdea.market}</span>
              {activeIdea.tags.map((t) => <span key={t} className={styles.tag}>{t}</span>)}
            </div>

            <div className={styles.modalSection}>
              <div className={styles.modalSectionTitle}>Overview</div>
              <p className={styles.modalBody}>{activeIdea.fullDescription}</p>
            </div>

            <div className={styles.modalSection}>
              <div className={styles.modalSectionTitle}>Financial Projection</div>
              <div className={styles.roiGrid}>
                <div className={styles.roiCard}>
                  <div className={styles.roiValue}>{activeIdea.roi.investment}</div>
                  <div className={styles.roiKey}>Min Investment</div>
                </div>
                <div className={styles.roiCard}>
                  <div className={styles.roiValue}>{activeIdea.roi.revenue}</div>
                  <div className={styles.roiKey}>Revenue Potential</div>
                </div>
                <div className={styles.roiCard}>
                  <div className={styles.roiValue}>{activeIdea.roi.timeline}</div>
                  <div className={styles.roiKey}>MVP Timeline</div>
                </div>
              </div>
            </div>

            <div className={styles.modalSection}>
              <div className={styles.modalSectionTitle}>Launch Roadmap</div>
              <ol className={styles.stepsList}>
                {activeIdea.steps.map((step, i) => (
                  <li key={i}>
                    <span className={styles.stepNum}>{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <button className={styles.applyBtn} suppressHydrationWarning>
              <Rocket size={18} /> Launch This Idea with GVMC Support
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
