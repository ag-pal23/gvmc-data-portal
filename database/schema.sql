-- =============================================================================
-- GVMC Open Data Intelligence Platform — Database Schema
-- Engine:  PostgreSQL 14+
-- Features: pgcrypto (UUIDs), PostGIS (spatial), JSONB, native ENUMs
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Extensions & Enums
-- ─────────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "citext";     -- case-insensitive text for emails
CREATE EXTENSION IF NOT EXISTS "postgis";    -- spatial types for the map

-- Domain enums
CREATE TYPE user_role        AS ENUM ('citizen','researcher','startup','developer','admin');
CREATE TYPE dataset_format   AS ENUM ('csv','json','geojson','xlsx','parquet');
CREATE TYPE update_frequency AS ENUM ('daily','weekly','monthly','static');
CREATE TYPE dataset_status   AS ENUM ('draft','published','archived');
CREATE TYPE project_role     AS ENUM ('owner','editor','viewer');
CREATE TYPE project_status   AS ENUM ('active','completed','archived');
CREATE TYPE message_role     AS ENUM ('user','assistant');
CREATE TYPE feedback_rating  AS ENUM ('up','down');
CREATE TYPE notebook_lang    AS ENUM ('python','sql');
CREATE TYPE run_status       AS ENUM ('queued','running','success','error');
CREATE TYPE alert_severity   AS ENUM ('info','warning','critical');
CREATE TYPE visibility_level AS ENUM ('private','shared','public');


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Users, Auth & API Access
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           CITEXT UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    full_name       TEXT NOT NULL,
    organization    TEXT,
    primary_role    user_role NOT NULL DEFAULT 'citizen',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Supports users holding more than one role (e.g., researcher + startup founder)
CREATE TABLE user_roles (
    user_id   UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role      user_role NOT NULL,
    PRIMARY KEY (user_id, role)
);

CREATE TABLE api_keys (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name         TEXT NOT NULL,
    key_hash     TEXT NOT NULL UNIQUE,      -- store hashed, never plaintext
    key_prefix   VARCHAR(12) NOT NULL,      -- shown in UI e.g. "gvmc_live_ab12"
    scopes       TEXT[] NOT NULL DEFAULT '{}',
    last_used_at TIMESTAMPTZ,
    revoked_at   TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_api_keys_user ON api_keys(user_id);

CREATE TABLE user_preferences (
    user_id       UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme         TEXT NOT NULL DEFAULT 'system',
    language      TEXT NOT NULL DEFAULT 'en',
    notifications JSONB NOT NULL DEFAULT '{}'::jsonb
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Open Datasets
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE datasets (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug             TEXT UNIQUE NOT NULL,
    title            TEXT NOT NULL,
    description      TEXT,
    category         TEXT NOT NULL,
    format           dataset_format NOT NULL,
    update_frequency update_frequency NOT NULL DEFAULT 'static',
    source_agency    TEXT,
    license          TEXT,
    row_count        BIGINT DEFAULT 0,
    geo_enabled      BOOLEAN NOT NULL DEFAULT FALSE,
    status           dataset_status NOT NULL DEFAULT 'draft',
    created_by       UUID REFERENCES users(id),
    last_updated     TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_datasets_category ON datasets(category);
CREATE INDEX idx_datasets_status   ON datasets(status);

CREATE TABLE dataset_fields (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_id  UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    field_type  TEXT NOT NULL,              -- string | number | date | geo | boolean
    description TEXT,
    ordinal     INT NOT NULL DEFAULT 0
);
CREATE INDEX idx_dataset_fields_dataset ON dataset_fields(dataset_id);

CREATE TABLE dataset_files (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_id   UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    version      INT NOT NULL DEFAULT 1,
    file_url     TEXT NOT NULL,
    file_format  dataset_format NOT NULL,
    size_bytes   BIGINT,
    checksum     TEXT,
    uploaded_by  UUID REFERENCES users(id),
    uploaded_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (dataset_id, version)
);

CREATE TABLE dataset_bookmarks (
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, dataset_id)
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Interactive City Map (PostGIS)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE map_layers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dataset_id      UUID REFERENCES datasets(id) ON DELETE SET NULL,
    name            TEXT NOT NULL,
    category        TEXT NOT NULL,          -- Infrastructure | Environment | Transport | Civic Services
    description     TEXT,
    source_type     TEXT NOT NULL,          -- geojson | vector_tile
    source_url      TEXT,                   -- tile server URL or static GeoJSON endpoint
    default_visible BOOLEAN NOT NULL DEFAULT FALSE,
    style           JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Only needed if features are served from Postgres rather than external vector tiles
CREATE TABLE map_features (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    layer_id    UUID NOT NULL REFERENCES map_layers(id) ON DELETE CASCADE,
    geom        GEOMETRY(Geometry, 4326) NOT NULL,
    properties  JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX idx_map_features_geom  ON map_features USING GIST (geom);
CREATE INDEX idx_map_features_layer ON map_features(layer_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Analytics
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE analytics_metrics (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key         TEXT UNIQUE NOT NULL,       -- e.g. "water_supply_hours"
    label       TEXT NOT NULL,
    unit        TEXT,
    description TEXT
);

CREATE TABLE analytics_datapoints (
    id         BIGSERIAL PRIMARY KEY,
    metric_id  UUID NOT NULL REFERENCES analytics_metrics(id) ON DELETE CASCADE,
    ward       TEXT,
    date       DATE NOT NULL,
    value      NUMERIC NOT NULL
);
CREATE INDEX idx_analytics_datapoints_metric_date ON analytics_datapoints(metric_id, date);
CREATE INDEX idx_analytics_datapoints_ward        ON analytics_datapoints(ward);

CREATE TABLE saved_charts (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title      TEXT NOT NULL,
    config     JSONB NOT NULL,             -- { datasetId, metricKey, chartType, groupBy, range }
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Predictions
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE prediction_models (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL,
    description     TEXT,
    target_metric   TEXT NOT NULL,          -- e.g. "traffic_congestion_index"
    version         TEXT NOT NULL,
    accuracy        NUMERIC,               -- e.g. 0.82
    last_trained_at TIMESTAMPTZ,
    status          TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE prediction_runs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id     UUID NOT NULL REFERENCES prediction_models(id) ON DELETE CASCADE,
    horizon      TEXT NOT NULL,             -- e.g. "24h"
    input_params JSONB NOT NULL DEFAULT '{}'::jsonb,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_prediction_runs_model ON prediction_runs(model_id);

CREATE TABLE prediction_points (
    id              BIGSERIAL PRIMARY KEY,
    run_id          UUID NOT NULL REFERENCES prediction_runs(id) ON DELETE CASCADE,
    ts              TIMESTAMPTZ NOT NULL,
    predicted_value NUMERIC NOT NULL,
    lower_bound     NUMERIC,
    upper_bound     NUMERIC
);
CREATE INDEX idx_prediction_points_run_ts ON prediction_points(run_id, ts);


-- ─────────────────────────────────────────────────────────────────────────────
-- 7. AI Assistant (Ask GVMC)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE assistant_conversations (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID REFERENCES users(id) ON DELETE SET NULL,  -- nullable: anonymous citizen use
    started_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE assistant_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES assistant_conversations(id) ON DELETE CASCADE,
    role            message_role NOT NULL,
    content         TEXT NOT NULL,
    sources         JSONB NOT NULL DEFAULT '[]'::jsonb,   -- [{datasetId, title, url}]
    confidence      NUMERIC,                              -- 0-1, assistant messages only
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_assistant_messages_conversation ON assistant_messages(conversation_id);

CREATE TABLE assistant_feedback (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES assistant_messages(id) ON DELETE CASCADE,
    user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
    rating     feedback_rating NOT NULL,
    comment    TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Startup Hub
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE startups (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name             TEXT NOT NULL,
    description      TEXT,
    interest_domains TEXT[] NOT NULL DEFAULT '{}',
    website          TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE problem_statements (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       TEXT NOT NULL,
    description TEXT NOT NULL,
    category    TEXT,
    posted_by   UUID REFERENCES users(id),
    status      TEXT NOT NULL DEFAULT 'open',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE startup_projects (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    startup_id            UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
    problem_statement_id  UUID REFERENCES problem_statements(id) ON DELETE SET NULL,
    title                 TEXT NOT NULL,
    description           TEXT,
    status                project_status NOT NULL DEFAULT 'active',
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE project_members (
    project_id UUID NOT NULL REFERENCES startup_projects(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role       project_role NOT NULL DEFAULT 'viewer',
    invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (project_id, user_id)
);

CREATE TABLE project_notes (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES startup_projects(id) ON DELETE CASCADE,
    author_id  UUID NOT NULL REFERENCES users(id),
    content    TEXT NOT NULL,               -- markdown
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE project_datasets (
    project_id UUID NOT NULL REFERENCES startup_projects(id) ON DELETE CASCADE,
    dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, dataset_id)
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 9. Research Workspace
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE research_projects (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title          TEXT NOT NULL,
    description    TEXT,
    visibility     visibility_level NOT NULL DEFAULT 'private',
    forked_from_id UUID REFERENCES research_projects(id) ON DELETE SET NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE research_project_members (
    project_id UUID NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role       project_role NOT NULL DEFAULT 'viewer',
    PRIMARY KEY (project_id, user_id)
);

CREATE TABLE research_project_datasets (
    project_id    UUID NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
    dataset_id    UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
    bookmarked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (project_id, dataset_id)
);

CREATE TABLE notebooks (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES research_projects(id) ON DELETE CASCADE,
    title      TEXT NOT NULL DEFAULT 'Untitled',
    language   notebook_lang NOT NULL DEFAULT 'python',
    content    TEXT NOT NULL DEFAULT '',    -- source (or JSON cell array for true notebooks)
    version    INT NOT NULL DEFAULT 1,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE notebook_runs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notebook_id  UUID NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
    executed_by  UUID REFERENCES users(id),
    status       run_status NOT NULL DEFAULT 'queued',
    output       TEXT,
    duration_ms  INT,
    executed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notebook_runs_notebook ON notebook_runs(notebook_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- 10. API Hub
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE api_endpoints (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    path           TEXT NOT NULL,
    method         TEXT NOT NULL,           -- GET | POST | PUT | DELETE
    summary        TEXT,
    description    TEXT,
    requires_auth  BOOLEAN NOT NULL DEFAULT TRUE,
    roles_allowed  TEXT[] NOT NULL DEFAULT '{}',
    UNIQUE (path, method)
);

CREATE TABLE api_usage_logs (
    id           BIGSERIAL PRIMARY KEY,
    api_key_id   UUID REFERENCES api_keys(id) ON DELETE SET NULL,
    endpoint_id  UUID REFERENCES api_endpoints(id) ON DELETE SET NULL,
    status_code  INT NOT NULL,
    latency_ms   INT,
    called_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_api_usage_key_time ON api_usage_logs(api_key_id, called_at);


-- ─────────────────────────────────────────────────────────────────────────────
-- 11. Admin, Audit & Alerts
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE audit_logs (
    id          BIGSERIAL PRIMARY KEY,
    actor_id    UUID REFERENCES users(id) ON DELETE SET NULL,
    action      TEXT NOT NULL,              -- e.g. "dataset.publish", "user.role_change"
    entity_type TEXT NOT NULL,
    entity_id   UUID,
    metadata    JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_actor  ON audit_logs(actor_id);

CREATE TABLE system_health_snapshots (
    id           BIGSERIAL PRIMARY KEY,
    service_name TEXT NOT NULL,
    status       TEXT NOT NULL,             -- ok | degraded | down
    latency_ms   INT,
    checked_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE alerts (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title      TEXT NOT NULL,
    body       TEXT,
    severity   alert_severity NOT NULL DEFAULT 'info',
    ward       TEXT,
    category   TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ
);

CREATE TABLE user_alert_reads (
    user_id  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alert_id UUID NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
    read_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, alert_id)
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 12. Documentation
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE doc_pages (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug       TEXT UNIQUE NOT NULL,
    title      TEXT NOT NULL,
    content    TEXT NOT NULL,               -- markdown
    category   TEXT,                        -- getting-started | guides | changelog
    version    TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ─────────────────────────────────────────────────────────────────────────────
-- 13. Helper: updated_at trigger
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with an updated_at column
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_datasets_updated_at
    BEFORE UPDATE ON datasets
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_startup_projects_updated_at
    BEFORE UPDATE ON startup_projects
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_research_projects_updated_at
    BEFORE UPDATE ON research_projects
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ─────────────────────────────────────────────────────────────────────────────
-- 14. Minimal Seed Data
-- ─────────────────────────────────────────────────────────────────────────────

INSERT INTO users (email, password_hash, full_name, primary_role)
VALUES ('admin@gvmc.gov.in', '$2a$12$placeholder_hash_replace_me', 'GVMC Admin', 'admin');

INSERT INTO user_roles (user_id, role)
SELECT id, 'admin' FROM users WHERE email = 'admin@gvmc.gov.in';

INSERT INTO user_preferences (user_id)
SELECT id FROM users WHERE email = 'admin@gvmc.gov.in';

INSERT INTO datasets (slug, title, category, format, update_frequency, source_agency, license, status, geo_enabled)
VALUES
    ('ward-water-supply',       'Ward-wise Water Supply Hours',       'water',     'csv',     'daily',   'GVMC Water Works',       'CC-BY 4.0', 'published', TRUE),
    ('road-conditions',         'Road Conditions Survey',             'transport', 'geojson', 'monthly', 'GVMC Roads & Buildings', 'CC-BY 4.0', 'published', TRUE),
    ('air-quality-index',       'Air Quality Index - Ward Level',     'environment','csv',    'daily',   'AP Pollution Control',   'OGL',       'published', FALSE),
    ('property-tax-collection', 'Property Tax Collection Data',       'revenue',   'csv',     'monthly', 'GVMC Revenue Dept',      'CC-BY 4.0', 'published', FALSE),
    ('garbage-collection',      'Garbage Collection Routes & Status', 'sanitation','geojson', 'daily',   'GVMC Sanitation Wing',   'CC-BY 4.0', 'published', TRUE);

INSERT INTO analytics_metrics (key, label, unit) VALUES
    ('water_supply_hours',   'Water Supply Hours',        'hrs/day'),
    ('air_quality_index',    'Air Quality Index',         'AQI'),
    ('road_condition_score', 'Road Condition Score',      'score 1-10'),
    ('tax_collection_rate',  'Property Tax Collection %', '%'),
    ('garbage_coverage',     'Garbage Collection Coverage','%');

INSERT INTO prediction_models (name, description, target_metric, version, accuracy, status) VALUES
    ('Water Supply Forecaster', 'LSTM model predicting ward-level water supply hours', 'water_supply_hours',        'v1.0', 0.82, 'active'),
    ('AQI Predictor',          'Gradient-boosted tree for air quality forecasting',    'air_quality_index',         'v1.0', 0.78, 'active'),
    ('Traffic Congestion',     'Temporal convolutional network for congestion index',  'traffic_congestion_index',  'v0.9', 0.75, 'active');

INSERT INTO problem_statements (title, description, category, status) VALUES
    ('Optimize Water Distribution',        'Build a solution to predict and optimize ward-level water supply schedules to reduce downtime.',                'water',       'open'),
    ('Smart Garbage Route Planning',       'Use collection data to suggest optimal garbage truck routes that minimize fuel consumption and maximize coverage.','sanitation',  'open'),
    ('Real-time Air Quality Alerts',       'Create a citizen-facing alert system that warns residents when AQI exceeds safe thresholds in their ward.',      'environment', 'open'),
    ('Property Tax Compliance Dashboard',  'Design an analytics dashboard to identify low-compliance wards and suggest targeted outreach strategies.',       'revenue',     'open');

INSERT INTO doc_pages (slug, title, content, category) VALUES
    ('getting-started',   'Getting Started',        E'# Getting Started\n\nWelcome to the GVMC Open Data Intelligence Platform.\n\n## Quick Start\n\n1. Browse the **Data Catalog** to discover available datasets.\n2. Use the **Analytics Dashboard** to visualize key city metrics.\n3. Try the **AI Assistant** to ask questions about Visakhapatnam data.\n4. Generate an **API Key** in your profile settings to access data programmatically.', 'getting-started'),
    ('api-authentication', 'API Authentication Guide', E'# API Authentication\n\n## API Keys\n\nAll API requests require a valid API key passed in the `Authorization` header:\n\n```\nAuthorization: Bearer gvmc_live_xxxxxxxxxxxx\n```\n\n## Scopes\n\nAPI keys can be scoped to limit access:\n- `datasets:read` — Read dataset metadata and download files\n- `analytics:read` — Query analytics datapoints\n- `predictions:read` — Fetch prediction results\n- `map:read` — Access map layers and features', 'guides');

INSERT INTO api_endpoints (path, method, summary, requires_auth, roles_allowed) VALUES
    ('/api/v1/datasets',            'GET',  'List all published datasets',            FALSE, '{}'),
    ('/api/v1/datasets/:id',        'GET',  'Get dataset details by ID',              FALSE, '{}'),
    ('/api/v1/datasets/:id/data',   'GET',  'Query dataset rows (paginated)',          TRUE,  '{developer,researcher,admin}'),
    ('/api/v1/analytics/metrics',   'GET',  'List available analytics metrics',        FALSE, '{}'),
    ('/api/v1/analytics/datapoints','GET',  'Query datapoints for a metric',           TRUE,  '{developer,researcher,admin}'),
    ('/api/v1/predictions/models',  'GET',  'List prediction models',                  TRUE,  '{developer,researcher,admin}'),
    ('/api/v1/predictions/latest',  'GET',  'Get latest prediction run for a model',   TRUE,  '{developer,researcher,admin}'),
    ('/api/v1/map/layers',          'GET',  'List map layers',                         FALSE, '{}'),
    ('/api/v1/assistant/ask',       'POST', 'Send a question to the AI assistant',     FALSE, '{}');

INSERT INTO map_layers (name, category, description, source_type, default_visible) VALUES
    ('Ward Boundaries',     'Civic Services',   'Administrative ward boundary polygons',             'geojson', TRUE),
    ('Water Pipelines',     'Infrastructure',    'Major and minor water distribution pipelines',      'geojson', FALSE),
    ('Road Network',        'Transport',         'Road network with condition overlay',               'vector_tile', TRUE),
    ('Air Quality Stations','Environment',       'Locations of air quality monitoring stations',      'geojson', FALSE),
    ('Garbage Routes',      'Civic Services',    'Daily garbage collection truck routes',             'geojson', FALSE);

INSERT INTO alerts (title, body, severity, category) VALUES
    ('Platform Launch',            'Welcome to the GVMC Open Data Intelligence Platform! Explore datasets, analytics, and more.', 'info',    'platform'),
    ('New Datasets Available',     '5 new datasets have been published covering water, transport, environment, revenue, and sanitation.', 'info', 'data');


-- ─────────────────────────────────────────────────────────────────────────────
-- Done.
-- ─────────────────────────────────────────────────────────────────────────────
