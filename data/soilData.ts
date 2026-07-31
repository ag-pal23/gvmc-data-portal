export interface SoilProfile {
  id: string;
  locationName: string;
  wardNumber: number;
  soilType: 'Cohesive Clay' | 'Red Weathered Rock' | 'Coastal Sand' | 'Hard Granite' | 'Black Cotton' | 'Silty Loam';
  sbc: number; // Safe Bearing Capacity in kN/m²
  soilOxygenLevel: number; // Dissolved Oxygen in mg/L (1.0 to 10.0 mg/L)
  waterTableDepth: number; // meters below surface
  moistureContent: number; // percentage %
  sptNValue: number; // Standard Penetration Test blow count
  ph: number; // pH value (0 - 14)
  description: string;
}

export interface SoilAnalysisResult {
  maxFloors: number; // e.g., 4 for G+4
  maxHeightMeters: number;
  foundationType: string;
  foundationDescription: string;
  safetyScore: number; // 0 - 100
  riskCategory: 'Low Risk' | 'Moderate Risk' | 'High Risk / Heavy Engineering' | 'Extreme Risk / Unstable Ground';
  oxygenImpact: {
    level: string;
    corrosionRisk: 'Low' | 'Moderate' | 'High' | 'Severe';
    recommendation: string;
  };
  structuralWarnings: string[];
  recommendations: string[];
  isLiquefactionRisk: boolean;
}

export const vizagSoilPresets: SoilProfile[] = [
  {
    id: 'beach-road',
    locationName: 'Beach Road (RK Beach Zone)',
    wardNumber: 24,
    soilType: 'Coastal Sand',
    sbc: 120,
    soilOxygenLevel: 7.2,
    waterTableDepth: 1.8,
    moistureContent: 28,
    sptNValue: 14,
    ph: 8.2,
    description: 'High salinity coastal sand with shallow water table. Susceptible to rebar oxidation and moisture seepage.',
  },
  {
    id: 'madhurawada-hills',
    locationName: 'Madhurawada Hill Top (IT SEZ)',
    wardNumber: 6,
    soilType: 'Hard Granite',
    sbc: 420,
    soilOxygenLevel: 3.5,
    waterTableDepth: 14.5,
    moistureContent: 8,
    sptNValue: 48,
    ph: 7.1,
    description: 'Dense crystalline hard rock strata. Outstanding load-bearing capacity suitable for ultra high-rise structures.',
  },
  {
    id: 'gajuwaka-ind',
    locationName: 'Gajuwaka Industrial Zone',
    wardNumber: 65,
    soilType: 'Black Cotton',
    sbc: 110,
    soilOxygenLevel: 2.1,
    waterTableDepth: 3.2,
    moistureContent: 35,
    sptNValue: 10,
    ph: 6.2,
    description: 'High swelling and shrinkage clay. Anaerobic acidic sub-soil with high sulphate corrosion risk.',
  },
  {
    id: 'mvp-colony',
    locationName: 'MVP Colony Urban Sector',
    wardNumber: 18,
    soilType: 'Red Weathered Rock',
    sbc: 240,
    soilOxygenLevel: 4.8,
    waterTableDepth: 6.5,
    moistureContent: 16,
    sptNValue: 28,
    ph: 7.4,
    description: 'Stable gravelly red clay loam with moderate bearing strength. Ideal for mid-rise G+6 to G+10 residential blocks.',
  },
  {
    id: 'siripuram-center',
    locationName: 'Siripuram Financial Center',
    wardNumber: 15,
    soilType: 'Cohesive Clay',
    sbc: 280,
    soilOxygenLevel: 4.2,
    waterTableDepth: 8.0,
    moistureContent: 18,
    sptNValue: 32,
    ph: 7.3,
    description: 'Stiff gravelly clay with good shear strength. Suitable for commercial complexes with basement parking.',
  },
];

export function calculateSoilFeasibility(profile: {
  sbc: number;
  soilOxygenLevel: number;
  waterTableDepth: number;
  moistureContent: number;
  sptNValue: number;
  ph: number;
  soilType: string;
}): SoilAnalysisResult {
  const { sbc, soilOxygenLevel, waterTableDepth, moistureContent, sptNValue, ph, soilType } = profile;

  // 1. Calculate floor limit based on Safe Bearing Capacity (SBC in kN/m²)
  let baseFloors = Math.floor(sbc / 35);
  
  if (soilType === 'Hard Granite' || sbc > 380) {
    baseFloors = Math.min(baseFloors, 35); // Up to G+35 high-rise
  }

  if (waterTableDepth < 2.5) {
    baseFloors = Math.max(1, baseFloors - 2);
  }

  if (soilType === 'Black Cotton' && moistureContent > 30) {
    baseFloors = Math.min(baseFloors, 3); // Cap G+3 without deep piling
  }

  const maxFloors = Math.max(1, baseFloors);
  const maxHeightMeters = (maxFloors + 1) * 3.3; // 3.3m per floor + ground level

  // 2. Determine Foundation Recommendation
  let foundationType = 'Shallow Isolated Footing';
  let foundationDescription = 'Standard individual column footings with tie beams.';

  if (sbc >= 350) {
    foundationType = 'Hard Rock Raft / Direct Pillar Anchors';
    foundationDescription = 'Direct anchoring into crystalline bedrock with minimum excavation depth.';
  } else if (sbc >= 220 && waterTableDepth >= 4) {
    foundationType = 'Combined Raft / Mat Foundation';
    foundationDescription = 'Reinforced concrete slab distributing load uniformly over the entire building footprint.';
  } else if (sbc < 140 || waterTableDepth < 3.0 || soilType === 'Black Cotton') {
    foundationType = 'Deep RCC Friction / End-Bearing Piles';
    foundationDescription = 'Bored cast-in-situ concrete piles driven 12m–20m into firm underlying strata to bypass weak upper soil.';
  }

  // 3. Soil Oxygen & Corrosiveness Impact
  let corrosionRisk: 'Low' | 'Moderate' | 'High' | 'Severe' = 'Low';
  let oxygenLevelText = 'Optimal Aeration';
  let oxygenRec = 'Standard FE-550 TMT steel rebar and M25 grade concrete recommended.';

  if (soilOxygenLevel > 6.0 && waterTableDepth < 4.0) {
    corrosionRisk = 'High';
    oxygenLevelText = 'High Dissolved Oxygen + Shallow Moisture';
    oxygenRec = 'Use Epoxy-Coated TMT Steel or Anti-Corrosive Polymer Slurry with minimum M35 dense concrete cover (50mm+).';
  } else if (soilOxygenLevel < 2.5 && (ph < 6.5 || ph > 8.5)) {
    corrosionRisk = 'Severe';
    oxygenLevelText = 'Anaerobic Corrosive Environment';
    oxygenRec = 'High risk of sulfate attack. Mandatory Sulphate Resisting Portland Cement (SRPC) with waterproofing membrane.';
  } else if (soilOxygenLevel > 5.0) {
    corrosionRisk = 'Moderate';
    oxygenLevelText = 'Moderate Oxidation Risk';
    oxygenRec = 'Ensure proper damp-proof course (DPC) and corrosion-inhibiting concrete admixtures.';
  }

  // 4. Liquefaction Risk Assessment
  const isLiquefactionRisk = (soilType === 'Coastal Sand' || soilType === 'Silty Loam') && waterTableDepth < 3.0 && sptNValue < 15;

  // 5. Safety Score (0 to 100)
  let score = 50 + (sbc / 10) + (sptNValue * 0.8) - (moistureContent * 0.4);
  if (waterTableDepth < 2.5) score -= 15;
  if (isLiquefactionRisk) score -= 25;
  if (ph < 6.0 || ph > 8.5) score -= 10;
  const safetyScore = Math.min(98, Math.max(15, Math.round(score)));

  // Risk Category
  let riskCategory: SoilAnalysisResult['riskCategory'] = 'Low Risk';
  if (safetyScore < 40) riskCategory = 'Extreme Risk / Unstable Ground';
  else if (safetyScore < 65) riskCategory = 'High Risk / Heavy Engineering';
  else if (safetyScore < 82) riskCategory = 'Moderate Risk';

  // Warnings & Recommendations
  const warnings: string[] = [];
  const recs: string[] = [];

  if (waterTableDepth < 3) {
    warnings.push(`Shallow groundwater table (${waterTableDepth}m) requires continuous dewatering during excavation.`);
  }
  if (isLiquefactionRisk) {
    warnings.push('High soil liquefaction risk under seismic tremors due to loose saturated sand (N-Value < 15).');
    recs.push('Ground improvement required: Stone columns or soil compaction grouting prior to foundation work.');
  }
  if (soilType === 'Black Cotton') {
    warnings.push('Expansive Black Cotton soil subject to high volumetric swelling/shrinkage cycles.');
    recs.push('Replace top 1.5m soil with non-swallowing moorum backfill or construct under-reamed pile foundation.');
  }
  if (ph < 6.5) {
    warnings.push(`Acidic soil pH (${ph}) will accelerate concrete degradation over time.`);
  }

  recs.push(`Maximum permissible building height: G+${maxFloors} (${maxHeightMeters}m) under standard SBC limits.`);
  recs.push(`Recommended foundation depth: ${waterTableDepth < 3 ? 'Deep Piling (15m+)' : '2.5m to 4.0m below natural ground level'}.`);
  recs.push(oxygenRec);

  return {
    maxFloors,
    maxHeightMeters,
    foundationType,
    foundationDescription,
    safetyScore,
    riskCategory,
    oxygenImpact: {
      level: oxygenLevelText,
      corrosionRisk,
      recommendation: oxygenRec,
    },
    structuralWarnings: warnings,
    recommendations: recs,
    isLiquefactionRisk,
  };
}
