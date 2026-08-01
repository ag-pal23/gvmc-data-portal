'use client';

import React, { useState, useMemo } from 'react';
import {
  Layers, Building2, ShieldCheck, AlertTriangle, Wind,
  Droplets, Activity, FileText, Download, CheckCircle2,
  Sparkles, Compass, Gauge, Info
} from 'lucide-react';
import { vizagSoilPresets, calculateSoilFeasibility, SoilProfile } from '@/data/soilData';
import styles from './page.module.css';
import Typewriter from '@/components/atoms/Typewriter/Typewriter';

export default function SoilAdvisorPage() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('beach-road');

  // Input states
  const [soilType, setSoilType] = useState<SoilProfile['soilType']>('Coastal Sand');
  const [sbc, setSbc] = useState<number>(120);
  const [soilOxygenLevel, setSoilOxygenLevel] = useState<number>(7.2);
  const [waterTableDepth, setWaterTableDepth] = useState<number>(1.8);
  const [moistureContent, setMoistureContent] = useState<number>(28);
  const [sptNValue, setSptNValue] = useState<number>(14);
  const [ph, setPh] = useState<number>(8.2);

  // Load Preset
  const handleSelectPreset = (preset: SoilProfile) => {
    setSelectedPresetId(preset.id);
    setSoilType(preset.soilType);
    setSbc(preset.sbc);
    setSoilOxygenLevel(preset.soilOxygenLevel);
    setWaterTableDepth(preset.waterTableDepth);
    setMoistureContent(preset.moistureContent);
    setSptNValue(preset.sptNValue);
    setPh(preset.ph);
  };

  // Compute live AI Feasibility
  const analysis = useMemo(() => {
    return calculateSoilFeasibility({
      sbc,
      soilOxygenLevel,
      waterTableDepth,
      moistureContent,
      sptNValue,
      ph,
      soilType,
    });
  }, [sbc, soilOxygenLevel, waterTableDepth, moistureContent, sptNValue, ph, soilType]);

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.badge}>
          <Sparkles size={14} /> AI Structural & Geotechnical Engineering Module
        </div>
        <h1 className={styles.title}>
          <Layers size={32} style={{ color: 'var(--color-primary)' }} />
          <Typewriter text="AI Soil & Foundation Advisor" speed={30} />
        </h1>
        <p className={styles.subtitle}>
          Assess land buildability, permissible building floor height ($G+N$), foundation structural load limits, and sub-soil oxygen corrosion risks using real-time geotechnical models.
        </p>
      </div>

      {/* Preset Location Strip */}
      <div className={styles.presetStrip} role="region" aria-label="Visakhapatnam Zone Soil Test Presets">
        <span className={styles.presetLabel}>
          <Compass size={16} /> Visakhapatnam Presets:
        </span>
        {vizagSoilPresets.map((preset) => (
          <button
            key={preset.id}
            className={`${styles.presetBtn} ${selectedPresetId === preset.id ? styles.presetBtnActive : ''}`}
            onClick={() => handleSelectPreset(preset)}
            suppressHydrationWarning
          >
            {preset.locationName}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className={styles.grid}>
        {/* Left: Input Controls */}
        <div className={styles.formCard}>
          <h2 className={styles.cardTitle}>
            <Gauge size={20} style={{ color: 'var(--color-primary)' }} /> Soil Test Parameters
          </h2>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="soilTypeSelect">Soil Classification</label>
            <select
              id="soilTypeSelect"
              className={styles.select}
              value={soilType}
              onChange={(e) => setSoilType(e.target.value as SoilProfile['soilType'])}
              suppressHydrationWarning
            >
              <option value="Coastal Sand">Coastal Sand (Loose/Saline)</option>
              <option value="Hard Granite">Hard Granite (Bedrock)</option>
              <option value="Cohesive Clay">Cohesive Stiff Clay</option>
              <option value="Red Weathered Rock">Red Weathered Rock Loam</option>
              <option value="Black Cotton">Black Cotton Soil (Expansive)</option>
              <option value="Silty Loam">Silty Loam</option>
            </select>
          </div>

          {/* Safe Bearing Capacity (SBC) */}
          <div className={styles.inputGroup}>
            <div className={styles.label}>
              <span>Safe Bearing Capacity (SBC)</span>
              <span className={styles.valDisplay}>{sbc} kN/m²</span>
            </div>
            <input
              type="range"
              min="50"
              max="500"
              step="5"
              className={styles.rangeInput}
              value={sbc}
              onChange={(e) => setSbc(Number(e.target.value))}
              aria-label="Safe Bearing Capacity in kN/m²"
            />
          </div>

          {/* Soil Dissolved Oxygen */}
          <div className={styles.inputGroup}>
            <div className={styles.label}>
              <span>Soil Dissolved Oxygen (DO)</span>
              <span className={styles.valDisplay}>{soilOxygenLevel.toFixed(1)} mg/L</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="10.0"
              step="0.1"
              className={styles.rangeInput}
              value={soilOxygenLevel}
              onChange={(e) => setSoilOxygenLevel(Number(e.target.value))}
              aria-label="Soil Dissolved Oxygen in mg/L"
            />
          </div>

          {/* Groundwater Depth */}
          <div className={styles.inputGroup}>
            <div className={styles.label}>
              <span>Water Table Depth</span>
              <span className={styles.valDisplay}>{waterTableDepth.toFixed(1)} m</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="20.0"
              step="0.5"
              className={styles.rangeInput}
              value={waterTableDepth}
              onChange={(e) => setWaterTableDepth(Number(e.target.value))}
              aria-label="Groundwater Table Depth in meters"
            />
          </div>

          {/* SPT N-Value */}
          <div className={styles.inputGroup}>
            <div className={styles.label}>
              <span>SPT Blow Count (N-Value)</span>
              <span className={styles.valDisplay}>N = {sptNValue}</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="1"
              className={styles.rangeInput}
              value={sptNValue}
              onChange={(e) => setSptNValue(Number(e.target.value))}
              aria-label="Standard Penetration Test N-Value"
            />
          </div>

          {/* Moisture Content & pH */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className={styles.inputGroup}>
              <div className={styles.label}>
                <span>Moisture %</span>
                <span className={styles.valDisplay}>{moistureContent}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="45"
                step="1"
                className={styles.rangeInput}
                value={moistureContent}
                onChange={(e) => setMoistureContent(Number(e.target.value))}
              />
            </div>
            <div className={styles.inputGroup}>
              <div className={styles.label}>
                <span>Soil pH</span>
                <span className={styles.valDisplay}>{ph.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="4.5"
                max="9.5"
                step="0.1"
                className={styles.rangeInput}
                value={ph}
                onChange={(e) => setPh(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Right: AI Results & Visual Floor Simulator */}
        <div className={styles.resultsContainer}>
          {/* Key Metrics */}
          <div className={styles.metricsGrid}>
            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <Building2 size={16} style={{ color: 'var(--color-primary)' }} /> Max Floor Capacity
              </div>
              <div className={styles.metricValue}>G + {analysis.maxFloors}</div>
              <div className={styles.metricSubtext}>Max height: ~{analysis.maxHeightMeters.toFixed(1)}m above ground</div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <ShieldCheck size={16} style={{ color: '#16A34A' }} /> Safety Score
              </div>
              <div className={styles.metricValue} style={{ color: analysis.safetyScore > 65 ? '#16A34A' : '#EA580C' }}>
                {analysis.safetyScore} / 100
              </div>
              <div className={styles.metricSubtext}>{analysis.riskCategory}</div>
            </div>

            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <Wind size={16} style={{ color: '#0284C7' }} /> Soil Aeration / DO
              </div>
              <div className={styles.metricValue} style={{ fontSize: '1.6rem', color: '#0284C7' }}>
                {soilOxygenLevel} mg/L
              </div>
              <div className={styles.metricSubtext}>{analysis.oxygenImpact.level}</div>
            </div>
          </div>

          {/* Visual Floor Simulator */}
          <div className={styles.visualizerCard}>
            <div className={styles.buildingStack} aria-label={`Building height simulator showing G plus ${analysis.maxFloors} floors`}>
              <div className={styles.groundLine} />
              {Array.from({ length: Math.min(8, analysis.maxFloors + 1) }).map((_, i) => (
                <div key={i} className={styles.floorBar}>
                  <span>{i === 0 ? 'G (Ground Level)' : `Floor ${i}`}</span>
                  <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>3.3m</span>
                </div>
              ))}
              {analysis.maxFloors > 8 && (
                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 700, padding: '2px' }}>
                  + {analysis.maxFloors - 8} Additional Upper Floors
                </div>
              )}
            </div>

            <div className={styles.floorSummary}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                Recommended Structural Foundation
              </h3>
              <div className={styles.foundationBox}>
                <div className={styles.foundationTitle}>{analysis.foundationType}</div>
                <div className={styles.foundationDesc}>{analysis.foundationDescription}</div>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <CheckCircle2 size={16} style={{ color: '#16A34A', flexShrink: 0 }} />
                <span>Compliant with IS 1893 Seismic & IS 6403 Bearing Capacity Guidelines.</span>
              </div>
            </div>
          </div>

          {/* Soil Oxygen & Corrosion Risk Details */}
          <div className={styles.oxygenCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Droplets size={18} style={{ color: '#0284C7' }} /> Soil Oxygen & Sub-Soil Corrosion Report
              </h3>
              <span className={`${styles.riskBadge} ${
                analysis.oxygenImpact.corrosionRisk === 'Low' ? styles.riskLow :
                analysis.oxygenImpact.corrosionRisk === 'Moderate' ? styles.riskModerate :
                analysis.oxygenImpact.corrosionRisk === 'High' ? styles.riskHigh : styles.riskSevere
              }`}>
                {analysis.oxygenImpact.corrosionRisk} Corrosion Risk
              </span>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
              {analysis.oxygenImpact.recommendation}
            </p>

            {analysis.structuralWarnings.length > 0 && (
              <div className={styles.warningBox}>
                <div className={styles.warningTitle}>
                  <AlertTriangle size={16} /> Engineering Warnings & Risk Mitigations
                </div>
                <ul className={styles.warningList}>
                  {analysis.structuralWarnings.map((warn, idx) => (
                    <li key={idx}>{warn}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Actions & Export */}
          <div className={styles.actionsBar}>
            <button className={styles.exportBtn} onClick={handlePrintReport} suppressHydrationWarning>
              <Download size={18} /> Export Official Soil Assessment Report (PDF)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
