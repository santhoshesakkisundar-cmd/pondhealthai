export type HealthStatus = 'Healthy' | 'Warning' | 'Critical';

export type TelemetrySourceMode = 'SIMULATED_DEMO' | 'MQTT_LIVE_STREAM';

export interface WaterParameters {
  temperature: number; // °C
  ph: number; // pH units (0-14)
  dissolvedOxygen: number; // mg/L
  turbidity: number; // NTU
  conductivity: number; // µS/cm
  ammonia: number; // TAN mg/L (Total Ammonia Nitrogen)
   unionizedAmmonia?: number; // NH3 mg/L calculated from Temp & pH
}

export interface HistoricalReading extends WaterParameters {
  timestamp: string;
  dateLabel: string;
  healthScore: number;
}

export interface ParameterRange {
  minOptimal: number;
  maxOptimal: number;
  minWarning: number;
  maxWarning: number;
  unit: string;
  label: string;
}

export interface SpeciesThresholdProfile {
  speciesId: string;
  commonName: string;
  scientificName: string;
  pondType: 'Earthen Semi-Intensive' | 'HDPE Lined Intensive' | 'Biofloc Tank' | 'RAS Nursery';
  lifeStage: 'Fingerling / Post-Larvae' | 'Juvenile Grow-Out' | 'Market Sub-Adult' | 'Broodstock';
  notes: string;
  ranges: {
    temperature: ParameterRange;
    ph: ParameterRange;
    dissolvedOxygen: ParameterRange;
    turbidity: ParameterRange;
    conductivity: ParameterRange;
    ammonia: ParameterRange;
  };
}

export interface SensorProbe {
  id: string;
  pondId: string;
  model: string;
  parametersMeasured: string[];
  status: 'Online' | 'Calibration Due' | 'Signal Degraded';
  batteryPct: number;
  lastCalibrated: string;
  firmwareVersion: string;
  depthMeters: number;
}

export interface MaintenanceRecord {
  id: string;
  pondId: string;
  pondName: string;
  date: string;
  category: 'Aeration' | 'Water Exchange' | 'Probiotic Dose' | 'Sensor Calibration' | 'Lime Buffering';
  action: string;
  operator: string;
  outcome: string;
}

export interface PondAlert {
  id: string;
  pondId: string;
  pondCode: string;
  pondName: string;
  severity: 'Critical' | 'Warning' | 'Advisory';
  parameter: string;
  currentReading: string;
  thresholdRange: string;
  timestamp: string;
  acknowledged: boolean;
  resolved: boolean;
  diagnosticCause: string;
  recommendedAction: string;
}

export interface AIInsight {
  id: string;
  pondId: string;
  pondName: string;
  category: 'Anomaly Detection' | 'Early Warning' | 'Trend Risk Prediction' | 'Management Action';
  severity: HealthStatus;
  headline: string;
  supportingReadings: string[];
  scientificReasoning: string;
  possibleCauses: string[];
  recommendedSteps: string[];
  confidenceNote: string;
  engineSource: 'AquaSense Gemini AI' | 'AquaSense Rule-Based Engine';
  generatedAt: string;
}

export interface PondProfile {
  id: string;
  code: string;
  name: string;
  sector: string;
  coordinates: {
    lat: number;
    lng: number;
    gridX: number; // % on spatial telemetry grid
    gridY: number; // % on spatial telemetry grid
  };
  species: string;
  scientificName: string;
  speciesProfileId: string;
  pondType: 'Earthen Semi-Intensive' | 'HDPE Lined Intensive' | 'Biofloc Tank' | 'RAS Nursery';
  lifeStage: 'Fingerling / Post-Larvae' | 'Juvenile Grow-Out' | 'Market Sub-Adult' | 'Broodstock';
  surfaceAreaHectares: number;
  meanDepthMeters: number;
  stockingDensityPerM2: number;
  estimatedBiomassKg: number;
  status: HealthStatus;
  healthScore: number;
  primaryDiagnostic: string;
  aeratorActiveCount: number;
  aeratorTotalCount: number;
  currentReadings: WaterParameters;
  deltas24h: {
    temperature: number;
    ph: number;
    dissolvedOxygen: number;
    turbidity: number;
    conductivity: number;
    ammonia: number;
  };
  history24h: HistoricalReading[];
  history30d: HistoricalReading[];
}
