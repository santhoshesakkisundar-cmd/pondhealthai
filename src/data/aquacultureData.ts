import {
  PondProfile,
  SpeciesThresholdProfile,
  SensorProbe,
  PondAlert,
  MaintenanceRecord,
  AIInsight,
  WaterParameters,
  HealthStatus,
} from '../types/aquaculture';

export const SPECIES_PROFILES: Record<string, SpeciesThresholdProfile> = {
  vannamei_intensive: {
    speciesId: 'vannamei_intensive',
    commonName: 'Pacific Whiteleg Shrimp',
    scientificName: 'Litopenaeus vannamei',
    pondType: 'HDPE Lined Intensive',
    lifeStage: 'Juvenile Grow-Out',
    notes:
      'Brackish-water intensive shrimp require high dissolved oxygen (>5.0 mg/L) and tight ammonia control. Unionized NH3 toxicity spikes rapidly when both water temperature (>30°C) and pH (>8.3) rise.',
    ranges: {
      temperature: { minOptimal: 27.0, maxOptimal: 30.5, minWarning: 25.0, maxWarning: 32.0, unit: '°C', label: 'Water Temp' },
      ph: { minOptimal: 7.6, maxOptimal: 8.3, minWarning: 7.2, maxWarning: 8.6, unit: 'pH', label: 'pH Level' },
      dissolvedOxygen: { minOptimal: 5.2, maxOptimal: 8.5, minWarning: 4.0, maxWarning: 10.0, unit: 'mg/L', label: 'Dissolved O₂' },
      turbidity: { minOptimal: 25, maxOptimal: 45, minWarning: 15, maxWarning: 65, unit: 'NTU', label: 'Turbidity' },
      conductivity: { minOptimal: 18500, maxOptimal: 26000, minWarning: 14000, maxWarning: 31000, unit: 'µS/cm', label: 'Conductivity' },
      ammonia: { minOptimal: 0.0, maxOptimal: 0.15, minWarning: 0.0, maxWarning: 0.35, unit: 'mg/L', label: 'Total Ammonia (TAN)' },
    },
  },
  nile_tilapia: {
    speciesId: 'nile_tilapia',
    commonName: 'Nile Tilapia',
    scientificName: 'Oreochromis niloticus',
    pondType: 'Earthen Semi-Intensive',
    lifeStage: 'Market Sub-Adult',
    notes:
      'Freshwater eurythermal species tolerant of moderate turbidity, though afternoon algal photosynthesis can drive diurnal pH swings and pre-dawn dissolved oxygen sags.',
    ranges: {
      temperature: { minOptimal: 26.0, maxOptimal: 30.0, minWarning: 23.0, maxWarning: 32.5, unit: '°C', label: 'Water Temp' },
      ph: { minOptimal: 6.8, maxOptimal: 8.2, minWarning: 6.4, maxWarning: 8.7, unit: 'pH', label: 'pH Level' },
      dissolvedOxygen: { minOptimal: 4.5, maxOptimal: 8.5, minWarning: 3.2, maxWarning: 10.5, unit: 'mg/L', label: 'Dissolved O₂' },
      turbidity: { minOptimal: 20, maxOptimal: 55, minWarning: 10, maxWarning: 80, unit: 'NTU', label: 'Turbidity' },
      conductivity: { minOptimal: 350, maxOptimal: 1200, minWarning: 200, maxWarning: 1800, unit: 'µS/cm', label: 'Conductivity' },
      ammonia: { minOptimal: 0.0, maxOptimal: 0.25, minWarning: 0.0, maxWarning: 0.55, unit: 'mg/L', label: 'Total Ammonia (TAN)' },
    },
  },
  asian_seabass: {
    speciesId: 'asian_seabass',
    commonName: 'Asian Seabass (Barramundi)',
    scientificName: 'Lates calcarifer',
    pondType: 'HDPE Lined Intensive',
    lifeStage: 'Market Sub-Adult',
    notes:
      'Carnivorous high-metabolism finfish with elevated protein feed input. Sensitive to sudden dissolved oxygen drops below 4.5 mg/L and suspended gill-irritating solids.',
    ranges: {
      temperature: { minOptimal: 26.5, maxOptimal: 30.0, minWarning: 24.5, maxWarning: 31.5, unit: '°C', label: 'Water Temp' },
      ph: { minOptimal: 7.4, maxOptimal: 8.3, minWarning: 7.0, maxWarning: 8.6, unit: 'pH', label: 'pH Level' },
      dissolvedOxygen: { minOptimal: 5.0, maxOptimal: 8.5, minWarning: 4.2, maxWarning: 9.8, unit: 'mg/L', label: 'Dissolved O₂' },
      turbidity: { minOptimal: 12, maxOptimal: 35, minWarning: 5, maxWarning: 55, unit: 'NTU', label: 'Turbidity' },
      conductivity: { minOptimal: 14000, maxOptimal: 24000, minWarning: 9000, maxWarning: 28000, unit: 'µS/cm', label: 'Conductivity' },
      ammonia: { minOptimal: 0.0, maxOptimal: 0.18, minWarning: 0.0, maxWarning: 0.40, unit: 'mg/L', label: 'Total Ammonia (TAN)' },
    },
  },
  rohu_carp: {
    speciesId: 'rohu_carp',
    commonName: 'Indian Major Carp (Rohu)',
    scientificName: 'Labeo rohita',
    pondType: 'Earthen Semi-Intensive',
    lifeStage: 'Juvenile Grow-Out',
    notes:
      'Freshwater polyculture column feeder. Optimal growth depends on balanced plankton bloom (25–50 NTU) and neutral-to-slightly-alkaline carbonate buffering.',
    ranges: {
      temperature: { minOptimal: 25.0, maxOptimal: 30.5, minWarning: 22.0, maxWarning: 33.0, unit: '°C', label: 'Water Temp' },
      ph: { minOptimal: 7.0, maxOptimal: 8.2, minWarning: 6.5, maxWarning: 8.6, unit: 'pH', label: 'pH Level' },
      dissolvedOxygen: { minOptimal: 4.8, maxOptimal: 8.5, minWarning: 3.5, maxWarning: 10.0, unit: 'mg/L', label: 'Dissolved O₂' },
      turbidity: { minOptimal: 25, maxOptimal: 50, minWarning: 15, maxWarning: 75, unit: 'NTU', label: 'Turbidity' },
      conductivity: { minOptimal: 300, maxOptimal: 950, minWarning: 180, maxWarning: 1400, unit: 'µS/cm', label: 'Conductivity' },
      ammonia: { minOptimal: 0.0, maxOptimal: 0.20, minWarning: 0.0, maxWarning: 0.45, unit: 'mg/L', label: 'Total Ammonia (TAN)' },
    },
  },
  ras_nursery: {
    speciesId: 'ras_nursery',
    commonName: 'Recirculating Nursery Post-Larvae',
    scientificName: 'Litopenaeus vannamei (PL-15)',
    pondType: 'RAS Nursery',
    lifeStage: 'Fingerling / Post-Larvae',
    notes:
      'Early life stages have minimal gill surface reserve and zero tolerance for unionized ammonia spikes or rapid thermal fluctuations (>0.8°C/hr).',
    ranges: {
      temperature: { minOptimal: 28.0, maxOptimal: 30.0, minWarning: 27.0, maxWarning: 31.0, unit: '°C', label: 'Water Temp' },
      ph: { minOptimal: 7.7, maxOptimal: 8.1, minWarning: 7.4, maxWarning: 8.3, unit: 'pH', label: 'pH Level' },
      dissolvedOxygen: { minOptimal: 6.0, maxOptimal: 8.2, minWarning: 5.2, maxWarning: 9.0, unit: 'mg/L', label: 'Dissolved O₂' },
      turbidity: { minOptimal: 5, maxOptimal: 18, minWarning: 2, maxWarning: 28, unit: 'NTU', label: 'Turbidity' },
      conductivity: { minOptimal: 21000, maxOptimal: 25000, minWarning: 19000, maxWarning: 27000, unit: 'µS/cm', label: 'Conductivity' },
      ammonia: { minOptimal: 0.0, maxOptimal: 0.08, minWarning: 0.0, maxWarning: 0.18, unit: 'mg/L', label: 'Total Ammonia (TAN)' },
    },
  },
};

// Calculate Unionized Ammonia (NH3 mg/L) from TAN, Temperature (°C), and pH
export function calculateUnionizedAmmonia(tan: number, tempC: number, ph: number): number {
  const pKa = 0.09018 + 2729.92 / (273.15 + tempC);
  const fractionNH3 = 1 / (Math.pow(10, pKa - ph) + 1);
  return Number((tan * fractionNH3).toFixed(4));
}

function build24hHistory(base: WaterParameters, status: HealthStatus) {
  const hours = [
    '00:00', '02:00', '04:00', '06:00', '08:00', '10:00',
    '12:00', '14:00', '16:00', '18:00', '20:00', '22:00', 'Now',
  ];
  return hours.map((label, idx) => {
    // Realistic diurnal aquaculture cycle: DO & pH lowest at 04:00-06:00, highest at 14:00-16:00
    const phase = ((idx - 3) / 12) * Math.PI * 2;
    const diurnalWave = Math.sin(phase);
    const temp = Number((base.temperature + diurnalWave * 1.1).toFixed(1));
    const ph = Number((base.ph + diurnalWave * 0.22).toFixed(2));
    const doVal = Number(Math.max(2.1, base.dissolvedOxygen + diurnalWave * 0.95).toFixed(2));
    const turb = Number(Math.max(5, base.turbidity + (idx % 3 - 1) * 2.5).toFixed(1));
    const cond = Math.round(base.conductivity + diurnalWave * (base.conductivity * 0.015));
    const amm = Number(Math.max(0.02, base.ammonia - diurnalWave * 0.04).toFixed(2));
    const scoreBase = status === 'Critical' ? 54 : status === 'Warning' ? 74 : 93;
    return {
      timestamp: `2026-10-26 ${label}`,
      dateLabel: label,
      temperature: temp,
      ph,
      dissolvedOxygen: doVal,
      turbidity: turb,
      conductivity: cond,
      ammonia: amm,
      unionizedAmmonia: calculateUnionizedAmmonia(amm, temp, ph),
      healthScore: Math.min(99, Math.max(38, Math.round(scoreBase + diurnalWave * 4))),
    };
  });
}

function build30dHistory(base: WaterParameters, status: HealthStatus) {
  const days = 14;
  return Array.from({ length: days }, (_, idx) => {
    const dayNum = idx + 13;
    const drift = status === 'Critical' ? (idx / days) * 1.2 : status === 'Warning' ? (idx / days) * 0.6 : Math.sin(idx) * 0.25;
    const temp = Number((base.temperature - 0.8 + drift * 0.9).toFixed(1));
    const ph = Number((base.ph - 0.15 + drift * 0.18).toFixed(2));
    const doVal = Number((base.dissolvedOxygen + 0.9 - drift * 0.85).toFixed(2));
    const turb = Number((base.turbidity - 8 + drift * 9).toFixed(1));
    const cond = Math.round(base.conductivity + Math.sin(idx) * (base.conductivity * 0.02));
    const amm = Number(Math.max(0.03, base.ammonia - 0.12 + drift * 0.14).toFixed(2));
    const scoreBase = status === 'Critical' ? 78 - idx * 1.8 : status === 'Warning' ? 86 - idx * 0.9 : 92 + Math.sin(idx) * 2;
    return {
      timestamp: `2026-10-${dayNum}`,
      dateLabel: `Oct ${dayNum}`,
      temperature: temp,
      ph,
      dissolvedOxygen: doVal,
      turbidity: turb,
      conductivity: cond,
      ammonia: amm,
      unionizedAmmonia: calculateUnionizedAmmonia(amm, temp, ph),
      healthScore: Math.round(Math.max(42, Math.min(98, scoreBase))),
    };
  });
}

export const INITIAL_PONDS: PondProfile[] = [
  {
    id: 'pond-01',
    code: 'AQ-POND-01',
    name: 'Kaveri Delta Bio-Basin A1',
    sector: 'North Estuarine Sector · Block A',
    coordinates: { lat: 10.7905, lng: 79.8428, gridX: 22, gridY: 36 },
    species: 'Nile Tilapia',
    scientificName: 'Oreochromis niloticus',
    speciesProfileId: 'nile_tilapia',
    pondType: 'Earthen Semi-Intensive',
    lifeStage: 'Market Sub-Adult',
    surfaceAreaHectares: 1.4,
    meanDepthMeters: 1.6,
    stockingDensityPerM2: 6,
    estimatedBiomassKg: 14200,
    status: 'Healthy',
    healthScore: 94,
    primaryDiagnostic:
      'Optimal carbonate buffering and stable phytoplankton equilibrium. Dissolved oxygen remains +2.3 mg/L above pre-dawn safety floor.',
    aeratorActiveCount: 4,
    aeratorTotalCount: 4,
    currentReadings: {
      temperature: 28.2,
      ph: 7.75,
      dissolvedOxygen: 6.8,
      turbidity: 34.0,
      conductivity: 680,
      ammonia: 0.09,
      unionizedAmmonia: calculateUnionizedAmmonia(0.09, 28.2, 7.75),
    },
    deltas24h: {
      temperature: +0.3,
      ph: +0.05,
      dissolvedOxygen: +0.4,
      turbidity: -1.8,
      conductivity: +12,
      ammonia: -0.02,
    },
    history24h: [],
    history30d: [],
  },
  {
    id: 'pond-02',
    code: 'AQ-POND-02',
    name: 'Pulicat Intensive Shrimp Basin B4',
    sector: 'East Brackish Grid · Block B',
    coordinates: { lat: 13.4167, lng: 80.3167, gridX: 52, gridY: 28 },
    species: 'Pacific Whiteleg Shrimp',
    scientificName: 'Litopenaeus vannamei',
    speciesProfileId: 'vannamei_intensive',
    pondType: 'HDPE Lined Intensive',
    lifeStage: 'Juvenile Grow-Out',
    surfaceAreaHectares: 0.85,
    meanDepthMeters: 1.8,
    stockingDensityPerM2: 65,
    estimatedBiomassKg: 9850,
    status: 'Critical',
    healthScore: 52,
    primaryDiagnostic:
      'Hypoxic dissolved oxygen sag (3.3 mg/L) compounded by elevated Total Ammonia (0.48 mg/L) and thermal stratification at 32.4°C.',
    aeratorActiveCount: 6,
    aeratorTotalCount: 6,
    currentReadings: {
      temperature: 32.4,
      ph: 8.58,
      dissolvedOxygen: 3.3,
      turbidity: 68.5,
      conductivity: 24800,
      ammonia: 0.48,
      unionizedAmmonia: calculateUnionizedAmmonia(0.48, 32.4, 8.58),
    },
    deltas24h: {
      temperature: +1.9,
      ph: +0.38,
      dissolvedOxygen: -2.1,
      turbidity: +19.4,
      conductivity: +950,
      ammonia: +0.26,
    },
    history24h: [],
    history30d: [],
  },
  {
    id: 'pond-03',
    code: 'AQ-POND-03',
    name: 'Godavari Seabass Grow-Out C2',
    sector: 'South Coastal Channel · Block C',
    coordinates: { lat: 16.7107, lng: 82.2163, gridX: 78, gridY: 42 },
    species: 'Asian Seabass (Barramundi)',
    scientificName: 'Lates calcarifer',
    speciesProfileId: 'asian_seabass',
    pondType: 'HDPE Lined Intensive',
    lifeStage: 'Market Sub-Adult',
    surfaceAreaHectares: 1.1,
    meanDepthMeters: 2.1,
    stockingDensityPerM2: 18,
    estimatedBiomassKg: 16400,
    status: 'Warning',
    healthScore: 73,
    primaryDiagnostic:
      'Afternoon cyanobacteria bloom surge driving pH to 8.46 and turbidity to 51.2 NTU. Pre-dawn respiratory oxygen demand projected to increase.',
    aeratorActiveCount: 4,
    aeratorTotalCount: 6,
    currentReadings: {
      temperature: 30.8,
      ph: 8.46,
      dissolvedOxygen: 4.4,
      turbidity: 51.2,
      conductivity: 19400,
      ammonia: 0.29,
      unionizedAmmonia: calculateUnionizedAmmonia(0.29, 30.8, 8.46),
    },
    deltas24h: {
      temperature: +1.1,
      ph: +0.24,
      dissolvedOxygen: -0.9,
      turbidity: +12.5,
      conductivity: +410,
      ammonia: +0.11,
    },
    history24h: [],
    history30d: [],
  },
  {
    id: 'pond-04',
    code: 'AQ-POND-04',
    name: 'Thanjavur Polyculture Reservoir D1',
    sector: 'West Freshwater Terrace · Block D',
    coordinates: { lat: 10.787, lng: 79.1378, gridX: 34, gridY: 68 },
    species: 'Indian Major Carp (Rohu)',
    scientificName: 'Labeo rohita',
    speciesProfileId: 'rohu_carp',
    pondType: 'Earthen Semi-Intensive',
    lifeStage: 'Juvenile Grow-Out',
    surfaceAreaHectares: 2.2,
    meanDepthMeters: 1.7,
    stockingDensityPerM2: 4,
    estimatedBiomassKg: 11900,
    status: 'Healthy',
    healthScore: 91,
    primaryDiagnostic:
      'Balanced diatom-green algae ratio (38 NTU) with steady dissolved oxygen (6.4 mg/L) and low unionized ammonia.',
    aeratorActiveCount: 3,
    aeratorTotalCount: 4,
    currentReadings: {
      temperature: 27.9,
      ph: 7.62,
      dissolvedOxygen: 6.4,
      turbidity: 38.0,
      conductivity: 540,
      ammonia: 0.11,
      unionizedAmmonia: calculateUnionizedAmmonia(0.11, 27.9, 7.62),
    },
    deltas24h: {
      temperature: -0.2,
      ph: +0.03,
      dissolvedOxygen: +0.2,
      turbidity: +1.1,
      conductivity: -8,
      ammonia: -0.01,
    },
    history24h: [],
    history30d: [],
  },
  {
    id: 'pond-05',
    code: 'AQ-POND-05',
    name: 'Tuticorin Bio-Nursery RAS N1',
    sector: 'Biosecure Hatchery Wing · Block N',
    coordinates: { lat: 8.7642, lng: 78.1348, gridX: 64, gridY: 72 },
    species: 'Recirculating Nursery Post-Larvae',
    scientificName: 'Litopenaeus vannamei (PL-15)',
    speciesProfileId: 'ras_nursery',
    pondType: 'RAS Nursery',
    lifeStage: 'Fingerling / Post-Larvae',
    surfaceAreaHectares: 0.25,
    meanDepthMeters: 1.3,
    stockingDensityPerM2: 180,
    estimatedBiomassKg: 1850,
    status: 'Healthy',
    healthScore: 97,
    primaryDiagnostic:
      'Moving-bed biofilm reactor (MBBR) nitrification operating at 98.4% conversion efficiency. Ultra-low TAN (0.04 mg/L).',
    aeratorActiveCount: 4,
    aeratorTotalCount: 4,
    currentReadings: {
      temperature: 28.9,
      ph: 7.88,
      dissolvedOxygen: 7.2,
      turbidity: 11.4,
      conductivity: 22900,
      ammonia: 0.04,
      unionizedAmmonia: calculateUnionizedAmmonia(0.04, 28.9, 7.88),
    },
    deltas24h: {
      temperature: +0.1,
      ph: -0.02,
      dissolvedOxygen: +0.3,
      turbidity: -0.6,
      conductivity: +45,
      ammonia: -0.01,
    },
    history24h: [],
    history30d: [],
  },
];

// Populate histories
INITIAL_PONDS.forEach((pond) => {
  pond.history24h = build24hHistory(pond.currentReadings, pond.status);
  pond.history30d = build30dHistory(pond.currentReadings, pond.status);
});

export const INITIAL_SENSORS: SensorProbe[] = [
  {
    id: 'SNS-101A',
    pondId: 'pond-01',
    model: 'AquaSonde Pro Multi-6X Optical',
    parametersMeasured: ['Temperature', 'pH', 'Optical DO', 'Turbidity', 'Conductivity', 'NH₄⁺ ISE'],
    status: 'Online',
    batteryPct: 94,
    lastCalibrated: '2026-10-18',
    firmwareVersion: 'v4.2.1- LoRaWAN',
    depthMeters: 1.1,
  },
  {
    id: 'SNS-204B',
    pondId: 'pond-02',
    model: 'AquaSonde Pro Multi-6X Optical',
    parametersMeasured: ['Temperature', 'pH', 'Optical DO', 'Turbidity', 'Conductivity', 'NH₄⁺ ISE'],
    status: 'Online',
    batteryPct: 87,
    lastCalibrated: '2026-10-14',
    firmwareVersion: 'v4.2.1-LoRaWAN',
    depthMeters: 1.3,
  },
  {
    id: 'SNS-205B',
    pondId: 'pond-02',
    model: 'HydroBenthic Bottom DO Node',
    parametersMeasured: ['Temperature', 'Optical DO', 'ORP'],
    status: 'Calibration Due',
    batteryPct: 71,
    lastCalibrated: '2026-09-19',
    firmwareVersion: 'v3.9.4-Modbus',
    depthMeters: 1.75,
  },
  {
    id: 'SNS-309C',
    pondId: 'pond-03',
    model: 'AquaSonde Pro Multi-6X Optical',
    parametersMeasured: ['Temperature', 'pH', 'Optical DO', 'Turbidity', 'Conductivity', 'NH₄⁺ ISE'],
    status: 'Online',
    batteryPct: 91,
    lastCalibrated: '2026-10-20',
    firmwareVersion: 'v4.2.1-LoRaWAN',
    depthMeters: 1.4,
  },
  {
    id: 'SNS-402D',
    pondId: 'pond-04',
    model: 'AquaSonde Standard 5-Ch',
    parametersMeasured: ['Temperature', 'pH', 'Optical DO', 'Turbidity', 'Conductivity'],
    status: 'Online',
    batteryPct: 89,
    lastCalibrated: '2026-10-11',
    firmwareVersion: 'v4.1.0-LoRaWAN',
    depthMeters: 1.2,
  },
  {
    id: 'SNS-501N',
    pondId: 'pond-05',
    model: 'BioSecure RAS Inline Manifold',
    parametersMeasured: ['Temperature', 'pH', 'Optical DO', 'Turbidity', 'Conductivity', 'NH₄⁺ ISE'],
    status: 'Online',
    batteryPct: 100,
    lastCalibrated: '2026-10-24',
    firmwareVersion: 'v4.3.0-Ethernet',
    depthMeters: 0.9,
  },
];

export const INITIAL_ALERTS: PondAlert[] = [
  {
    id: 'ALT-9041',
    pondId: 'pond-02',
    pondCode: 'AQ-POND-02',
    pondName: 'Pulicat Intensive Shrimp Basin B4',
    severity: 'Critical',
    parameter: 'Dissolved Oxygen (DO)',
    currentReading: '3.30 mg/L',
    thresholdRange: '5.20 – 8.50 mg/L (L. vannamei)',
    timestamp: '2026-10-26 09:14',
    acknowledged: false,
    resolved: false,
    diagnosticCause:
      'High benthic organic oxygen demand combined with 32.4°C water temperature reducing oxygen solubility by 14.2%.',
    recommendedAction:
      'Engage emergency Venturi bottom injectors immediately, suspend afternoon feed ration by 100%, and initiate 15% cooler reservoir bottom-water exchange.',
  },
  {
    id: 'ALT-9042',
    pondId: 'pond-02',
    pondCode: 'AQ-POND-02',
    pondName: 'Pulicat Intensive Shrimp Basin B4',
    severity: 'Critical',
    parameter: 'Total Ammonia (TAN / NH₃)',
    currentReading: '0.48 mg/L (NH₃: 0.112 mg/L)',
    thresholdRange: '≤ 0.15 mg/L TAN (≤ 0.025 mg/L NH₃)',
    timestamp: '2026-10-26 09:11',
    acknowledged: false,
    resolved: false,
    diagnosticCause:
      'Elevated pH (8.58) and temperature (32.4°C) shifted the NH₄⁺/NH₃ equilibrium toward toxic unionized NH₃ (23.3% unionized fraction).',
    recommendedAction:
      'Apply food-grade molasses (C:N ratio 15:1) with Bacillus spp. consortium to immobilize TAN, and buffer pH down toward 7.9 using agricultural dolomite.',
  },
  {
    id: 'ALT-9039',
    pondId: 'pond-03',
    pondCode: 'AQ-POND-03',
    pondName: 'Godavari Seabass Grow-Out C2',
    severity: 'Warning',
    parameter: 'pH Level & Turbidity Surge',
    currentReading: '8.46 pH · 51.2 NTU',
    thresholdRange: '7.40 – 8.30 pH · 12 – 35 NTU',
    timestamp: '2026-10-26 08:45',
    acknowledged: false,
    resolved: false,
    diagnosticCause:
      'Dense phytoplankton bloom stripping dissolved CO₂ during peak sunlight, elevating pH and increasing risk of pre-dawn algal crash.',
    recommendedAction:
      'Activate standby paddlewheel aerators #5 and #6 prior to 20:00 and perform 10% surface skimming water exchange.',
  },
  {
    id: 'ALT-9035',
    pondId: 'pond-03',
    pondCode: 'AQ-POND-03',
    pondName: 'Godavari Seabass Grow-Out C2',
    severity: 'Warning',
    parameter: 'Dissolved Oxygen (DO)',
    currentReading: '4.40 mg/L',
    thresholdRange: '5.00 – 8.50 mg/L (L. calcarifer)',
    timestamp: '2026-10-26 08:20',
    acknowledged: true,
    resolved: false,
    diagnosticCause:
      'Sub-optimal dissolved oxygen for high-biomass sub-adult Asian Seabass (16,400 kg) with 2 of 6 aerators on standby.',
    recommendedAction:
      'Bring standby aerators online and reduce midday pelleted feed ration by 25% until DO exceeds 5.2 mg/L.',
  },
  {
    id: 'ALT-9028',
    pondId: 'pond-02',
    pondCode: 'AQ-POND-02',
    pondName: 'Pulicat Intensive Shrimp Basin B4',
    severity: 'Advisory',
    parameter: 'Sensor Calibration Schedule',
    currentReading: 'SNS-205B (37 days since calibration)',
    thresholdRange: '≤ 30 days interval',
    timestamp: '2026-10-26 06:00',
    acknowledged: true,
    resolved: false,
    diagnosticCause:
      'Bottom optical DO and ORP probe SNS-205B has exceeded the 30-day biofilm wipe and 2-point calibration schedule.',
    recommendedAction:
      'Retrieve bottom sonde SNS-205B for optical cap cleaning and saturated-air calibration check.',
  },
];

export const INITIAL_MAINTENANCE: MaintenanceRecord[] = [
  {
    id: 'MNT-401',
    pondId: 'pond-01',
    pondName: 'Kaveri Delta Bio-Basin A1',
    date: '2026-10-25',
    category: 'Probiotic Dose',
    action: 'Dosed 4.5 kg Bacillus subtilis & Nitrosomonas water-column consortium',
    operator: 'R. Karthikeyan (Lead Biologist)',
    outcome: 'TAN stabilized at 0.09 mg/L; Secchi transparency steady at 34 cm.',
  },
  {
    id: 'MNT-402',
    pondId: 'pond-05',
    pondName: 'Tuticorin Bio-Nursery RAS N1',
    date: '2026-10-24',
    category: 'Sensor Calibration',
    action: '2-point pH (7.00 / 10.01) & optical DO zero-point verification on SNS-501N',
    operator: 'S. Meenakshi (IoT Instrumentation)',
    outcome: 'Sensor drift < 0.02 pH units; telemetry verified nominal.',
  },
  {
    id: 'MNT-403',
    pondId: 'pond-03',
    pondName: 'Godavari Seabass Grow-Out C2',
    date: '2026-10-23',
    category: 'Water Exchange',
    action: '12% tidal sand-filtered intake exchange to dilute suspended solids',
    operator: 'V. Prakash (Farm Supervisor)',
    outcome: 'Turbidity reduced from 58 NTU to 44 NTU over 6 hours.',
  },
  {
    id: 'MNT-404',
    pondId: 'pond-04',
    pondName: 'Thanjavur Polyculture Reservoir D1',
    date: '2026-10-21',
    category: 'Lime Buffering',
    action: 'Applied 65 kg/ha agricultural CaCO₃ to maintain total alkalinity > 110 mg/L',
    operator: 'R. Karthikeyan (Lead Biologist)',
    outcome: 'Diurnal pH swing narrowed from 0.65 to 0.32 units.',
  },
];

// Deterministic Scientific Rule-Based Engine for AquaSense AI
export function generateRuleBasedInsights(ponds: PondProfile[]): AIInsight[] {
  const insights: AIInsight[] = [];

  ponds.forEach((pond) => {
    const profile = SPECIES_PROFILES[pond.speciesProfileId];
    const r = pond.currentReadings;
    const nh3 = calculateUnionizedAmmonia(r.ammonia, r.temperature, r.ph);

    // 1. Critical Hypoxia & Unionized Ammonia Synergy check
    if (r.dissolvedOxygen < profile.ranges.dissolvedOxygen.minWarning || nh3 > 0.05) {
      insights.push({
        id: `INS-${pond.id}-CRIT`,
        pondId: pond.id,
        pondName: pond.name,
        category: 'Anomaly Detection',
        severity: 'Critical',
        headline: `${pond.code}: Compound Hypoxia (${r.dissolvedOxygen} mg/L) & Toxic Unionized NH₃ (${nh3} mg/L) Synergy`,
        supportingReadings: [
          `Dissolved O₂: ${r.dissolvedOxygen} mg/L (Optimal ${profile.ranges.dissolvedOxygen.minOptimal}–${profile.ranges.dissolvedOxygen.maxOptimal} mg/L)`,
          `Water Temp: ${r.temperature}°C (24h Δ: +${pond.deltas24h.temperature}°C)`,
          `pH: ${r.ph} · TAN: ${r.ammonia} mg/L → Unionized NH₃: ${nh3} mg/L`,
          `Turbidity: ${r.turbidity} NTU`,
        ],
        scientificReasoning: `At ${r.temperature}°C and pH ${r.ph}, the unionized ammonia (NH₃) fraction rises to ${((nh3 / Math.max(0.001, r.ammonia)) * 100).toFixed(1)}% of Total Ammonia Nitrogen. Simultaneously, water at ${r.temperature}°C holds ~14% less saturation oxygen than at 26°C, while shrimp/fish gill epithelium is stressed by elevated NH₃.`,
        possibleCauses: [
          'Accumulated benthic feed sludge and organic detritus accelerating microbial oxygen consumption.',
          'Afternoon solar thermal stratification reducing bottom-layer vertical mixing.',
          'Photosynthetic CO₂ depletion by dense microalgae (68.5 NTU) driving pH above 8.5.',
        ],
        recommendedSteps: [
          'Decision Support Step 1: Halt all feed dispensing immediately for the next 12 hours to eliminate post-prandial oxygen demand.',
          'Decision Support Step 2: Run 100% of paddlewheel and bottom Venturi aerators continuously; initiate 15–20% bottom-drain water exchange using cooler reservoir water.',
          'Decision Support Step 3: Dose carbon source (molasses at 15:1 C:N ratio) with heterotrophic Bacillus probiotics to convert TAN into microbial biomass.',
        ],
        confidenceNote:
          'Decision-support analysis derived from current pond telemetry and thermodynamic NH₄⁺/NH₃ dissociation equations. Verify with on-site titration before large chemical treatments.',
        engineSource: 'AquaSense Rule-Based Engine',
        generatedAt: '2026-10-26 09:18',
      });
    } else if (
      r.ph > profile.ranges.ph.maxOptimal ||
      r.turbidity > profile.ranges.turbidity.maxOptimal ||
      r.dissolvedOxygen < profile.ranges.dissolvedOxygen.minOptimal
    ) {
      insights.push({
        id: `INS-${pond.id}-WARN`,
        pondId: pond.id,
        pondName: pond.name,
        category: 'Trend Risk Prediction',
        severity: 'Warning',
        headline: `${pond.code}: Pre-Dawn Oxygen Sag & Algal Bloom Instability Forecast within 14 Hours`,
        supportingReadings: [
          `pH Level: ${r.ph} (Optimal ≤ ${profile.ranges.ph.maxOptimal})`,
          `Turbidity: ${r.turbidity} NTU (24h Δ: +${pond.deltas24h.turbidity} NTU)`,
          `Dissolved O₂: ${r.dissolvedOxygen} mg/L (${pond.aeratorActiveCount}/${pond.aeratorTotalCount} aerators active)`,
          `Water Temp: ${r.temperature}°C`,
        ],
        scientificReasoning: `Rising turbidity (${r.turbidity} NTU) paired with alkaline pH (${r.ph}) indicates high phytoplankton density. While daytime photosynthesis supplements oxygen, night-time algal respiration between 02:00 and 06:00 is projected to draw Dissolved Oxygen down by an additional 1.4–1.8 mg/L.`,
        possibleCauses: [
          'Elevated dissolved nitrogen and phosphorus from high-protein feed input (16,400 kg standing biomass).',
          'Two of six mechanical aerators currently in standby mode during warm coastal weather (30.8°C).',
        ],
        recommendedSteps: [
          `Decision Support Step 1: Activate standby aerators #5 and #6 in ${pond.code} before sunset (18:00) to prevent nocturnal stratification.`,
          'Decision Support Step 2: Reduce afternoon feed ration by 20% and perform a 10% surface water exchange to thin excess phytoplankton.',
          'Decision Support Step 3: Monitor carbonate alkalinity; apply 40 kg/ha agricultural limestone if morning-to-afternoon pH swing exceeds 0.5 units.',
        ],
        confidenceNote:
          'Forecast based on 24-hour diurnal telemetry slope and species respiratory load for Lates calcarifer.',
        engineSource: 'AquaSense Rule-Based Engine',
        generatedAt: '2026-10-26 09:18',
      });
    } else {
      insights.push({
        id: `INS-${pond.id}-OK`,
        pondId: pond.id,
        pondName: pond.name,
        category: 'Management Action',
        severity: 'Healthy',
        headline: `${pond.code}: Stable Hydro-Biological Equilibrium & Optimal Feed Conversion Window`,
        supportingReadings: [
          `Dissolved O₂: ${r.dissolvedOxygen} mg/L (Optimal > ${profile.ranges.dissolvedOxygen.minOptimal} mg/L)`,
          `pH Level: ${r.ph} · Temp: ${r.temperature}°C`,
          `Total Ammonia: ${r.ammonia} mg/L (Unionized NH₃: ${nh3} mg/L)`,
          `Turbidity: ${r.turbidity} NTU`,
        ],
        scientificReasoning: `All six water-quality parameters reside squarely within the target physiological corridor for ${pond.species} (${pond.lifeStage}). Low unionized ammonia (${nh3} mg/L) and high dissolved oxygen (${r.dissolvedOxygen} mg/L) support peak metabolic feed conversion efficiency.`,
        possibleCauses: [
          'Consistent probiotic nitrification and well-buffered carbonate alkalinity.',
          'Continuous mechanical aeration matching current standing biomass demand.',
        ],
        recommendedSteps: [
          'Decision Support Step 1: Maintain standard 100% scheduled feed ration split across 4 daily feedings.',
          'Decision Support Step 2: Continue routine weekly probiotic maintenance dosing and scheduled optical sensor wipe.',
        ],
        confidenceNote:
          'Validated against species-specific reference thresholds and 24-hour sensor stability.',
        engineSource: 'AquaSense Rule-Based Engine',
        generatedAt: '2026-10-26 09:18',
      });
    }
  });

  return insights;
}

export function answerPondQuestionRuleBased(
  question: string,
  ponds: PondProfile[],
  selectedPondId: string
): {
  answer: string;
  citedReadings: string[];
  reasoning: string;
  recommendedActions: string[];
  engineSource: 'AquaSense Rule-Based Engine' | 'AquaSense Gemini AI';
} {
  const q = question.toLowerCase();
  const focusPond = ponds.find((p) => p.id === selectedPondId) || ponds[1];
  const profile = SPECIES_PROFILES[focusPond.speciesProfileId];
  const r = focusPond.currentReadings;
  const nh3 = calculateUnionizedAmmonia(r.ammonia, r.temperature, r.ph);

  if (q.includes('ammonia') || q.includes('nh3') || q.includes('tan') || q.includes('toxic')) {
    return {
      answer: `In ${focusPond.name} (${focusPond.code}), Total Ammonia Nitrogen (TAN) is currently ${r.ammonia} mg/L. Because water temperature is ${r.temperature}°C and pH is ${r.ph}, the toxic unionized ammonia (NH₃) concentration is ${nh3} mg/L (${((nh3 / Math.max(0.001, r.ammonia)) * 100).toFixed(1)}% of TAN). ${
        nh3 > 0.05
          ? 'This exceeds the safe chronic threshold (0.025 mg/L NH₃) for L. vannamei and requires immediate carbon-probiotic dosing and water exchange.'
          : 'This remains well within the safe physiological limit for ' + focusPond.species + '.'
      }`,
      citedReadings: [
        `${focusPond.code} TAN: ${r.ammonia} mg/L`,
        `${focusPond.code} Unionized NH₃: ${nh3} mg/L`,
        `${focusPond.code} pH: ${r.ph} · Temp: ${r.temperature}°C`,
      ],
      reasoning:
        'Ammonia exists in water as non-toxic ammonium ions (NH₄⁺) and toxic unionized ammonia (NH₃). Every 1.0 unit increase in pH roughly increases the toxic NH₃ fraction tenfold, and warmer temperatures shift the dissociation constant (pKa) further toward NH₃.',
      recommendedActions:
        nh3 > 0.05
          ? [
              'Halt high-protein feed input for 12 hours to stop additional gill ammonia excretion.',
              'Dose carbohydrate source (molasses) + Bacillus subtilis to promote heterotrophic nitrogen uptake.',
              'Buffer pH down toward 7.8–8.0 using agricultural dolomite and exchange 15% bottom water.',
            ]
          : [
              'Maintain current biofilter/probiotic schedule and monitor afternoon pH to keep NH₃ fraction below 0.025 mg/L.',
            ],
      engineSource: 'AquaSense Rule-Based Engine',
    };
  }

  if (q.includes('oxygen') || q.includes('do') || q.includes('aerat') || q.includes('hypoxi')) {
    return {
      answer: `Dissolved Oxygen in ${focusPond.name} (${focusPond.code}) is currently ${r.dissolvedOxygen} mg/L (24h change: ${focusPond.deltas24h.dissolvedOxygen > 0 ? '+' : ''}${focusPond.deltas24h.dissolvedOxygen} mg/L), compared to the optimal range of ${profile.ranges.dissolvedOxygen.minOptimal}–${profile.ranges.dissolvedOxygen.maxOptimal} mg/L for ${focusPond.species}. Currently ${focusPond.aeratorActiveCount} of ${focusPond.aeratorTotalCount} aerators are active.`,
      citedReadings: [
        `${focusPond.code} Dissolved O₂: ${r.dissolvedOxygen} mg/L`,
        `${focusPond.code} Water Temp: ${r.temperature}°C`,
        `${focusPond.code} Active Aerators: ${focusPond.aeratorActiveCount}/${focusPond.aeratorTotalCount}`,
      ],
      reasoning:
        'Dissolved oxygen saturation decreases as water temperature and salinity (conductivity) rise. In addition, high phytoplankton turbidity (currently ' +
        r.turbidity +
        ' NTU) creates large nocturnal respiratory oxygen demand between 02:00 and 06:00.',
      recommendedActions:
        r.dissolvedOxygen < profile.ranges.dissolvedOxygen.minOptimal
          ? [
              'Engage all standby paddlewheel and Venturi aerators immediately.',
              'Withhold next feed ration to prevent post-feeding metabolic oxygen consumption.',
              'Exchange 10–15% surface water to reduce excess algal respiration load.',
            ]
          : [
              'Keep pre-dawn aeration automated between 22:00 and 07:00 to buffer against early-morning DO sags.',
            ],
      engineSource: 'AquaSense Rule-Based Engine',
    };
  }

  // General summary across all ponds or selected pond
  const critPonds = ponds.filter((p) => p.status === 'Critical');
  const warnPonds = ponds.filter((p) => p.status === 'Warning');

  return {
    answer: `Across your ${ponds.length} monitored aquaculture basins, ${critPonds.length} pond is in Critical state (AQ-POND-02 at 52/100 health score) and ${warnPonds.length} pond is in Warning state (AQ-POND-03 at 73/100). Focusing on ${focusPond.name} (${focusPond.code}), current health score is ${focusPond.healthScore}/100 (${focusPond.status}): ${focusPond.primaryDiagnostic}`,
    citedReadings: [
      `${focusPond.code} Temp: ${r.temperature}°C · pH: ${r.ph}`,
      `${focusPond.code} DO: ${r.dissolvedOxygen} mg/L · Turbidity: ${r.turbidity} NTU`,
      `${focusPond.code} Conductivity: ${r.conductivity.toLocaleString()} µS/cm · TAN: ${r.ammonia} mg/L`,
    ],
    reasoning: `Parameter evaluation compares live telemetry against species-specific thresholds for ${focusPond.species} (${focusPond.scientificName}) at the ${focusPond.lifeStage} stage in a ${focusPond.pondType} system.`,
    recommendedActions: [
      focusPond.status === 'Critical'
        ? 'Prioritize emergency bottom aeration and ammonia mitigation in AQ-POND-02 immediately.'
        : focusPond.status === 'Warning'
        ? 'Bring standby aerators #5 and #6 online in AQ-POND-03 before dusk to prevent a pre-dawn oxygen sag.'
        : `Maintain current feeding and probiotic schedule in ${focusPond.code}; all parameters are within optimal ranges.`,
      'Verify field readings with handheld optical DO and titration kit before applying chemical treatments.',
    ],
    engineSource: 'AquaSense Rule-Based Engine',
  };
}
