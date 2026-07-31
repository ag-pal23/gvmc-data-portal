/**
 * GVMC Schema Deployer — runs schema.sql against a Supabase PostgreSQL database.
 *
 * Usage:
 *   set DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres
 *   node deploy_schema.js
 */

const { Client } = require("pg");
const fs = require("fs");
const path = require("path");

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌  Set DATABASE_URL environment variable first.");
  console.error(
    '   Example: set DATABASE_URL=postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres'
  );
  process.exit(1);
}

async function deploy() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf-8");

  // Split into individual statements so we can report progress
  // We split on semicolons that are NOT inside dollar-quoted blocks or string literals
  // For simplicity, we'll execute as a single transaction
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Supabase requires SSL
  });

  try {
    console.log("🔌  Connecting to Supabase PostgreSQL...");
    await client.connect();
    console.log("✅  Connected!\n");

    // Get server version
    const versionRes = await client.query("SELECT version()");
    console.log("📦  Server:", versionRes.rows[0].version.split(",")[0]);
    console.log("");

    console.log("🚀  Deploying schema...\n");

    // Execute the entire schema as one batch
    await client.query(sql);

    console.log("✅  Schema deployed successfully!\n");

    // Verify by listing created tables
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);

    console.log(`📊  ${tablesRes.rows.length} tables created:`);
    console.log("─".repeat(40));
    tablesRes.rows.forEach((row, i) => {
      console.log(`   ${String(i + 1).padStart(2)}.  ${row.table_name}`);
    });

    // Verify enums
    const enumsRes = await client.query(`
      SELECT t.typname AS enum_name, 
             string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) AS values
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      GROUP BY t.typname
      ORDER BY t.typname
    `);

    console.log(`\n🏷️   ${enumsRes.rows.length} enum types created:`);
    console.log("─".repeat(40));
    enumsRes.rows.forEach((row) => {
      console.log(`   ${row.enum_name}: ${row.values}`);
    });

    // Verify seed data
    const seedChecks = [
      { table: "users", label: "Users" },
      { table: "datasets", label: "Datasets" },
      { table: "analytics_metrics", label: "Analytics Metrics" },
      { table: "prediction_models", label: "Prediction Models" },
      { table: "problem_statements", label: "Problem Statements" },
      { table: "doc_pages", label: "Doc Pages" },
      { table: "api_endpoints", label: "API Endpoints" },
      { table: "map_layers", label: "Map Layers" },
      { table: "alerts", label: "Alerts" },
    ];

    console.log(`\n🌱  Seed data verification:`);
    console.log("─".repeat(40));
    for (const check of seedChecks) {
      const countRes = await client.query(
        `SELECT COUNT(*) as count FROM ${check.table}`
      );
      console.log(
        `   ${check.label.padEnd(22)} ${countRes.rows[0].count} rows`
      );
    }

    console.log("\n🎉  GVMC Open Data Platform database is ready!");
    console.log(
      `   Connection: ${DATABASE_URL.replace(/:[^:@]+@/, ":****@")}\n`
    );
  } catch (err) {
    console.error("\n❌  Deployment failed:");
    console.error(`   ${err.message}`);
    if (err.detail) console.error(`   Detail: ${err.detail}`);
    if (err.hint) console.error(`   Hint: ${err.hint}`);
    if (err.position) {
      // Show context around the error position
      const pos = parseInt(err.position);
      const context = sql.substring(
        Math.max(0, pos - 100),
        Math.min(sql.length, pos + 100)
      );
      console.error(`\n   Near position ${pos}:`);
      console.error(`   ...${context}...`);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

deploy();
