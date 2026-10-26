/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutGrid,
  Activity,
  BarChart3,
  BrainCircuit,
  Waves,
  Bell,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  PondProfile,
  SensorProbe,
  PondAlert,
  MaintenanceRecord,
  TelemetrySourceMode,
  HealthStatus,
} from './types/aquaculture';
import {
  INITIAL_PONDS,
  INITIAL_SENSORS,
  INITIAL_ALERTS,
  INITIAL_MAINTENANCE,
  SPECIES_PROFILES,
  calculateUnionizedAmmonia,
  generateRuleBasedInsights,
} from './data/aquacultureData';
import {
  WaterQualityAnalysisView,
  AquaSenseAIView,
} from './components/AnalyticsAndAIViews';
import {
  PondManagementView,
  AlertsNotificationsView,
  ReportsExportView,
  SettingsView,
} from './components/OperationsAndReportsViews';

type ModuleKey =
  | 'overview'
  | 'live'
  | 'analytics'
  | 'ai'
  | 'management'
  | 'alerts'
  | 'reports'
  | 'settings';

const ARCHITECTURE_STEPS = [
  {
    id: '01',
    shortTitle: 'Acquire',
    subtitle: '6-Ch Optical Sondes',
    detail:
      '01. Acquire: Optical luminescence DO, ion-selective NH₄⁺, pH, nephelometric turbidity (NTU), and EC sondes sample pond water column every 5 seconds via LoRaWAN.',
  },
  {
    id: '02',
    shortTitle: 'Detect',
    subtitle: 'Hypoxia & NH₃ Surge',
    detail:
      '02. Detect: Identifies dissolved oxygen sags below species safety floors (<4.0 mg/L) and computes toxic unionized ammonia (NH₃) from real-time pH and temperature dissociation.',
  },
  {
    id: '03',
    shortTitle: 'Correlate',
    subtitle: 'Algal & Diurnal Load',
    detail:
      '03. Correlate: Cross-references afternoon algal turbidity (NTU) and solar pH elevation against nocturnal respiratory oxygen demand and standing fish/shrimp biomass.',
  },
  {
    id: '04',
    shortTitle: 'Predict',
    subtitle: 'Pre-Dawn Risk Window',
    detail:
      '04. Predict: AquaSense AI projects 12-hour pre-dawn dissolved oxygen trajectories and flags impending algal crash or benthic ammonia accumulation before mortality occurs.',
  },
  {
    id: '05',
    shortTitle: 'Intervene',
    subtitle: 'Aeration & Bio-Buffer',
    detail:
      '05. Intervene: Recommends targeted paddlewheel/Venturi aeration activation, feed ration suspension, C:N molasses probiotic dosing, and bottom-water exchange.',
  },
];

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleKey>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [ponds, setPonds] = useState<PondProfile[]>(INITIAL_PONDS);
  const [selectedPondId, setSelectedPondId] = useState<string>('pond-02');
  const [sensors] = useState<SensorProbe[]>(INITIAL_SENSORS);
  const [alerts, setAlerts] = useState<PondAlert[]>(INITIAL_ALERTS);
  const [maintenanceRecords, setMaintenanceRecords] =
    useState<MaintenanceRecord[]>(INITIAL_MAINTENANCE);
  const [telemetryMode, setTelemetryMode] =
    useState<TelemetrySourceMode>('SIMULATED_DEMO');
  const [simulationRunning, setSimulationRunning] = useState<boolean>(true);
  const [mqttEndpoint, setMqttEndpoint] = useState<string>('');
  const [activeArchStep, setActiveArchStep] = useState<number>(1); // Default to "02. Detect" like reference image
  const [lastTickTime, setLastTickTime] = useState<string>('09:19:37 IST');

  const selectedPond = useMemo(
    () => ponds.find((p) => p.id === selectedPondId) || ponds[0],
    [ponds, selectedPondId]
  );

  const selectedSpeciesProfile = useMemo(
    () =>
      SPECIES_PROFILES[selectedPond.speciesProfileId] ||
      SPECIES_PROFILES.nile_tilapia,
    [selectedPond]
  );

  const insights = useMemo(() => generateRuleBasedInsights(ponds), [ponds]);

  const unacknowledgedAlertsCount = useMemo(
    () => alerts.filter((a) => !a.resolved && !a.acknowledged).length,
    [alerts]
  );

  // Step realistic micro-fluctuations in DEMO mode
  const stepSimulationTelemetry = () => {
    setPonds((prevPonds) =>
      prevPonds.map((pond) => {
        const r = pond.currentReadings;
        const jitter = (Math.random() - 0.48) * 0.08;
        const newTemp = Number(
          Math.max(24.0, Math.min(34.5, r.temperature + jitter * 0.5)).toFixed(1)
        );
        const newPh = Number(
          Math.max(6.8, Math.min(9.0, r.ph + jitter * 0.15)).toFixed(2)
        );
        const newDO = Number(
          Math.max(2.4, Math.min(8.8, r.dissolvedOxygen - jitter * 0.35)).toFixed(2)
        );
        const newTurb = Number(
          Math.max(8.0, Math.min(85.0, r.turbidity + jitter * 1.8)).toFixed(1)
        );
        const newAmm = Number(
          Math.max(0.02, Math.min(0.85, r.ammonia + jitter * 0.04)).toFixed(2)
        );
        const newNh3 = calculateUnionizedAmmonia(newAmm, newTemp, newPh);

        const profile =
          SPECIES_PROFILES[pond.speciesProfileId] ||
          SPECIES_PROFILES.nile_tilapia;

        let newStatus: HealthStatus = 'Healthy';
        if (
          newDO < profile.ranges.dissolvedOxygen.minWarning ||
          newAmm > profile.ranges.ammonia.maxWarning ||
          newNh3 > 0.05
        ) {
          newStatus = 'Critical';
        } else if (
          newDO < profile.ranges.dissolvedOxygen.minOptimal ||
          newPh > profile.ranges.ph.maxOptimal ||
          newTurb > profile.ranges.turbidity.maxOptimal
        ) {
          newStatus = 'Warning';
        }

        const newScore =
          newStatus === 'Critical'
            ? Math.max(42, Math.min(62, Math.round(52 + (newDO - 3.3) * 8)))
            : newStatus === 'Warning'
            ? Math.max(65, Math.min(82, Math.round(73 + (newDO - 4.4) * 5)))
            : Math.max(88, Math.min(98, Math.round(93 + (newDO - 6.5) * 3)));

        return {
          ...pond,
          status: newStatus,
          healthScore: newScore,
          currentReadings: {
            ...r,
            temperature: newTemp,
            ph: newPh,
            dissolvedOxygen: newDO,
            turbidity: newTurb,
            ammonia: newAmm,
            unionizedAmmonia: newNh3,
          },
        };
      })
    );
    const now = new Date();
    setLastTickTime(now.toTimeString().slice(0, 8) + ' IST');
  };

  useEffect(() => {
    if (!simulationRunning) return;
    const interval = setInterval(() => {
      stepSimulationTelemetry();
    }, 5000);
    return () => clearInterval(interval);
  }, [simulationRunning]);

  // Interactive Scenario Restoration or Stress Test for Live Demo
  const handleRestoreOptimalInSelectedPond = () => {
    const profile = selectedSpeciesProfile;
    const optimalTemp = Number(
      ((profile.ranges.temperature.minOptimal + profile.ranges.temperature.maxOptimal) / 2).toFixed(1)
    );
    const optimalPh = Number(
      ((profile.ranges.ph.minOptimal + profile.ranges.ph.maxOptimal) / 2).toFixed(2)
    );
    const optimalDO = 6.6;
    const optimalTurb = Number(
      ((profile.ranges.turbidity.minOptimal + profile.ranges.turbidity.maxOptimal) / 2).toFixed(1)
    );
    const optimalAmm = 0.08;
    const nh3 = calculateUnionizedAmmonia(optimalAmm, optimalTemp, optimalPh);

    setPonds((prev) =>
      prev.map((p) =>
        p.id === selectedPond.id
          ? {
              ...p,
              status: 'Healthy',
              healthScore: 94,
              aeratorActiveCount: p.aeratorTotalCount,
              primaryDiagnostic:
                'Emergency aeration and water exchange stabilized dissolved oxygen and reduced unionized NH3 to safe baseline.',
              currentReadings: {
                ...p.currentReadings,
                temperature: optimalTemp,
                ph: optimalPh,
                dissolvedOxygen: optimalDO,
                turbidity: optimalTurb,
                ammonia: optimalAmm,
                unionizedAmmonia: nh3,
              },
            }
          : p
      )
    );
  };

  const handleTriggerStressTestInSelectedPond = () => {
    const stressTemp = 32.6;
    const stressPh = 8.62;
    const stressDO = 3.15;
    const stressTurb = 71.0;
    const stressAmm = 0.52;
    const nh3 = calculateUnionizedAmmonia(stressAmm, stressTemp, stressPh);

    setPonds((prev) =>
      prev.map((p) =>
        p.id === selectedPond.id
          ? {
              ...p,
              status: 'Critical',
              healthScore: 49,
              primaryDiagnostic:
                'SIMULATED STRESS TEST: Severe dissolved oxygen sag (3.15 mg/L) and elevated unionized ammonia (NH3) detected.',
              currentReadings: {
                ...p.currentReadings,
                temperature: stressTemp,
                ph: stressPh,
                dissolvedOxygen: stressDO,
                turbidity: stressTurb,
                ammonia: stressAmm,
                unionizedAmmonia: nh3,
              },
            }
          : p
      )
    );

    const newAlert: PondAlert = {
      id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
      pondId: selectedPond.id,
      pondCode: selectedPond.code,
      pondName: selectedPond.name,
      severity: 'Critical',
      parameter: 'Dissolved O₂ & Unionized NH₃ (Demo Stress Test)',
      currentReading: `${stressDO} mg/L DO · ${stressAmm} mg/L TAN (NH₃: ${nh3} mg/L)`,
      thresholdRange: `≥ ${selectedSpeciesProfile.ranges.dissolvedOxygen.minOptimal} mg/L DO`,
      timestamp: `2026-10-26 ${new Date().toTimeString().slice(0, 5)}`,
      acknowledged: false,
      resolved: false,
      diagnosticCause:
        'User-triggered DEMO stress simulation modeling afternoon thermal stratification and benthic oxygen demand.',
      recommendedAction:
        'Click "Stabilize Pond Parameters" or engage 100% mechanical aeration and 15% bottom-water exchange.',
    };
    setAlerts((prev) => [newAlert, ...prev]);
  };

  // CSV Export Handler
  const handleExportCSV = (pondFilterId?: string) => {
    const targetPonds = pondFilterId
      ? ponds.filter((p) => p.id === pondFilterId)
      : ponds;

    const headers = [
      'Pond_Code',
      'Pond_Name',
      'Species',
      'Pond_Type',
      'Data_Source_Mode',
      'Timestamp',
      'Temperature_C',
      'pH_Level',
      'Dissolved_Oxygen_mgL',
      'Turbidity_NTU',
      'Conductivity_uScm',
      'Total_Ammonia_TAN_mgL',
      'Unionized_NH3_mgL',
      'Health_Score',
      'Health_Status',
    ];

    const rows: string[][] = [];
    targetPonds.forEach((p) => {
      // Current row
      rows.push([
        p.code,
        `"${p.name}"`,
        `"${p.species}"`,
        `"${p.pondType}"`,
        telemetryMode,
        '2026-10-26 NOW',
        String(p.currentReadings.temperature),
        String(p.currentReadings.ph),
        String(p.currentReadings.dissolvedOxygen),
        String(p.currentReadings.turbidity),
        String(p.currentReadings.conductivity),
        String(p.currentReadings.ammonia),
        String(
          p.currentReadings.unionizedAmmonia ??
            calculateUnionizedAmmonia(
              p.currentReadings.ammonia,
              p.currentReadings.temperature,
              p.currentReadings.ph
            )
        ),
        String(p.healthScore),
        p.status,
      ]);

      // Historical 24h rows
      p.history24h.forEach((h) => {
        rows.push([
          p.code,
          `"${p.name}"`,
          `"${p.species}"`,
          `"${p.pondType}"`,
          telemetryMode,
          h.timestamp,
          String(h.temperature),
          String(h.ph),
          String(h.dissolvedOxygen),
          String(h.turbidity),
          String(h.conductivity),
          String(h.ammonia),
          String(h.unionizedAmmonia ?? 0),
          String(h.healthScore),
          p.status,
        ]);
      });
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `PondHealth_AI_Telemetry_${pondFilterId || 'All_Basins'}_20261026.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Maintenance & Alert Handlers
  const handleAddMaintenance = (record: Omit<MaintenanceRecord, 'id'>) => {
    const newRec: MaintenanceRecord = {
      ...record,
      id: `MNT-${Math.floor(500 + Math.random() * 499)}`,
    };
    setMaintenanceRecords((prev) => [newRec, ...prev]);
  };

  const handleToggleAerator = (pondId: string) => {
    setPonds((prev) =>
      prev.map((p) => {
        if (p.id !== pondId) return p;
        const nextCount =
          p.aeratorActiveCount < p.aeratorTotalCount
            ? p.aeratorTotalCount
            : Math.max(1, p.aeratorTotalCount - 1);
        return {
          ...p,
          aeratorActiveCount: nextCount,
        };
      })
    );
  };

  const handleAcknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
  };

  const handleResolveAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, acknowledged: true, resolved: true } : a
      )
    );
  };

  const handleAcknowledgeAll = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
  };

  // Helper to evaluate a single parameter against selectedPond species profile
  const evaluateParamStatus = (
    key: keyof typeof selectedSpeciesProfile.ranges,
    val: number
  ): HealthStatus => {
    const r = selectedSpeciesProfile.ranges[key];
    if (val >= r.minOptimal && val <= r.maxOptimal) return 'Healthy';
    if (val >= r.minWarning && val <= r.maxWarning) return 'Warning';
    return 'Critical';
  };

  const sidebarItems: Array<{
    key: ModuleKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    count?: number;
    countColor?: string;
  }> = [
    { key: 'overview', label: 'Overview', icon: LayoutGrid },
    { key: 'live', label: 'Live Monitoring', icon: Activity },
    { key: 'analytics', label: 'Water Quality Analysis', icon: BarChart3 },
    {
      key: 'ai',
      label: 'AI Predictions',
      icon: BrainCircuit,
      count: insights.filter((i) => i.severity !== 'Healthy').length,
      countColor: 'text-amber-600',
    },
    { key: 'management', label: 'Pond Management', icon: Waves },
    {
      key: 'alerts',
      label: 'Alerts & Notifications',
      icon: Bell,
      count: unacknowledgedAlertsCount,
      countColor: 'text-[#E11D48]',
    },
    { key: 'reports', label: 'Reports', icon: FileText },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  const criticalPondCount = ponds.filter((p) => p.status === 'Critical').length;
  const fleetAvgHealth = Math.round(
    ponds.reduce((acc, p) => acc + p.healthScore, 0) / ponds.length
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* TOP NAVIGATION BAR — Strict 3-Zone Contract matching reference image */}
      <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200/90 no-print">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#overview"
          onClick={(e) => {
            e.preventDefault();
            setActiveModule('overview');
          }}
          className="text-xl font-extrabold tracking-tight text-[#0F172A] whitespace-nowrap shrink-0"
        >
          PondHealth<span className="text-[#059669]"> AI</span>
        </a>

        {/* Zone 2: 5 Concise Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          {(
            [
              ['overview', 'Overview'],
              ['live', 'Live Monitoring'],
              ['analytics', 'Water Analytics'],
              ['ai', 'AquaSense AI'],
              ['management', 'Pond Operations'],
            ] as const
          ).map(([key, label]) => {
            const isActive = activeModule === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveModule(key)}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                  isActive
                    ? 'text-[#047857] font-semibold border-[#059669]'
                    : 'border-transparent hover:text-[#0F172A]'
                }`}
              >
                {label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleExportCSV()}
            className="px-4 py-2 text-xs font-bold text-white bg-[#0F172A] hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Export Telemetry CSV
          </button>
        </div>
      </header>

      {/* MAIN WORKSPACE BODY */}
      <div className="flex-1 flex min-h-0">
        {/* COLLAPSIBLE LEFT SIDEBAR — Matching reference image styling */}
        <aside
          className={`${
            sidebarCollapsed ? 'w-16' : 'w-64'
          } shrink-0 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-all duration-150 no-print`}
        >
          <div className="p-3.5 space-y-4">
            {/* Sidebar Section Header & Collapse Button */}
            <div className="flex items-center justify-between px-2 pt-2">
              {!sidebarCollapsed && (
                <span className="text-[11px] font-mono font-semibold tracking-wider text-slate-400 uppercase">
                  AQUACULTURE MODULES
                </span>
              )}
              <button
                type="button"
                onClick={() => setSidebarCollapsed((prev) => !prev)}
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeModule === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveModule(item.key)}
                    title={item.label}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] font-semibold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-[#0F172A] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-[#059669]' : 'text-slate-400'
                        }`}
                      />
                      {!sidebarCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </div>
                    {!sidebarCollapsed &&
                      item.count !== undefined &&
                      item.count > 0 && (
                        <span
                          className={`font-mono font-bold text-xs ${
                            item.countColor || 'text-slate-500'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Bottom Data Provenance Notice */}
          {!sidebarCollapsed && (
            <div className="p-4 m-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <div className="text-[11px] font-bold text-[#0F172A] uppercase tracking-wider">
                Telemetry Source
              </div>
              <p className="text-xs font-semibold text-[#059669]">
                {telemetryMode === 'SIMULATED_DEMO'
                  ? 'DEMO Simulation Stream'
                  : 'MQTT Webhook Bridge'}
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Last tick: <span className="font-mono">{lastTickTime}</span>. Values labeled DEMO are simulated for demonstration.
              </p>
            </div>
          )}
        </aside>

        {/* MAIN VIEWPORT CONTAINER */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-[1380px] mx-auto">
            {/* =========================================================
                MODULE 1: OVERVIEW (Matches Reference Image Split Design)
               ========================================================= */}
            {activeModule === 'overview' && (
              <div className="space-y-8">
                {/* Main White Outer Surface Card matching image_1258c3d2.png */}
                <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xs">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
                    {/* LEFT COLUMN: Editorial Hero + Closed-Loop Architecture */}
                    <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
                      <div className="space-y-5">
                        <p className="text-xs font-extrabold tracking-wider text-[#059669] uppercase">
                          AI-POWERED AQUACULTURE WATER INTELLIGENCE
                        </p>

                        <h1
                          className="text-4xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight leading-[1.1]"
                          style={{ textWrap: 'balance' }}
                        >
                          Detect Pond Water Risks{' '}
                          <span className="text-[#059669] block sm:inline">
                            Before They Escalate.
                          </span>
                        </h1>

                        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                          Transform 6-channel optical sonde telemetry (Dissolved O₂, pH, Temperature, Turbidity, Conductivity, and Unionized NH₃) and species-specific physiological models into early-warning aquaculture interventions.
                        </p>

                        {/* Primary Dual CTA Row matching reference image */}
                        <div className="flex flex-wrap items-center gap-3.5 pt-2">
                          <button
                            type="button"
                            onClick={() => setActiveModule('live')}
                            className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold text-white bg-[#0F172A] hover:bg-slate-800 rounded-xl transition-colors whitespace-nowrap shrink-0"
                          >
                            <span>Explore Live Ponds</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSimulationRunning((prev) => !prev);
                              stepSimulationTelemetry();
                            }}
                            className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-bold text-white bg-[#059669] hover:bg-[#047857] rounded-xl transition-colors whitespace-nowrap shrink-0"
                          >
                            {simulationRunning ? (
                              <>
                                <Pause className="w-4 h-4" />
                                <span>DEMO Simulation Active (Step)</span>
                              </>
                            ) : (
                              <>
                                <Play className="w-4 h-4" />
                                <span>Run Hydro-Simulation</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Unboxed Provenance Metadata Line (Zero-Pill Discipline) */}
                        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono">
                          <strong className="font-sans font-bold text-[#0F172A]">
                            DEMO Simulation Environment
                          </strong>
                          <span aria-hidden="true">·</span>
                          <span>Calibrated 6-Channel Optical Sondes & Species Models</span>
                          <span aria-hidden="true">·</span>
                          <strong className="text-[#0F172A]">
                            {ponds.length} Monitored Basins
                          </strong>
                        </div>
                      </div>

                      {/* CLOSED-LOOP AQUACULTURE ARCHITECTURE (5 interactive cards) */}
                      <div className="pt-6 border-t border-slate-100 space-y-3.5">
                        <p className="text-[11px] font-mono font-semibold tracking-wider text-slate-400 uppercase">
                          CLOSED-LOOP HYDRO-BIOLOGICAL PROTECTION ARCHITECTURE
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                          {ARCHITECTURE_STEPS.map((step, idx) => {
                            const isSelected = activeArchStep === idx;
                            return (
                              <button
                                key={step.id}
                                type="button"
                                onClick={() => setActiveArchStep(idx)}
                                className={`p-3 rounded-xl border text-left transition-all ${
                                  isSelected
                                    ? 'bg-[#ECFDF5]/70 border-[#10B981]'
                                    : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300'
                                }`}
                              >
                                <div className="text-xs font-bold text-[#0F172A]">
                                  {step.shortTitle}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                                  {step.subtitle}
                                </div>
                              </button>
                            );
                          })}
                        </div>

                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
                          <strong className="text-[#0F172A]">
                            {ARCHITECTURE_STEPS[activeArchStep].detail.split(':')[0]}:
                          </strong>
                          {ARCHITECTURE_STEPS[activeArchStep].detail.substring(
                            ARCHITECTURE_STEPS[activeArchStep].detail.indexOf(':') + 1
                          )}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: Signature White Telemetry Frame with Dual Deep-Navy Panels */}
                    <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
                      {/* Window Header */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex items-center gap-1.5" aria-hidden="true">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]" />
                            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                          </div>
                          <span className="text-xs font-semibold text-slate-700">
                            IoT Hydro-Surveillance · Coastal Farm Grid
                          </span>
                        </div>

                        <div className="px-2.5 py-1 rounded-md bg-[#ECFDF5] border border-[#A7F3D0] text-[11px] font-mono font-semibold text-[#047857] whitespace-nowrap shrink-0">
                          DEMO · {lastTickTime}
                        </div>
                      </div>

                      {/* Dark Panel 1: Spatial Basin Telemetry Grid */}
                      <div className="telemetry-grid-bg rounded-xl p-4 border border-slate-800 relative h-52 flex flex-col justify-between overflow-hidden">
                        {/* Subtle SVG Hydro-Contour Lines */}
                        <svg
                          className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
                          viewBox="0 0 400 200"
                        >
                          <path
                            d="M 10 80 Q 120 30, 220 90 T 390 70"
                            fill="none"
                            stroke="#10B981"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M 10 140 Q 150 100, 260 150 T 390 130"
                            fill="none"
                            stroke="#38BDF8"
                            strokeWidth="1"
                          />
                        </svg>

                        {/* Interactive Pond Nodes on the Spatial Grid */}
                        <div className="relative flex-1">
                          {ponds.map((pond) => {
                            const isSelected = pond.id === selectedPond.id;
                            const nodeColor =
                              pond.status === 'Critical'
                                ? 'bg-[#F43F5E] ring-[#F43F5E]/30'
                                : pond.status === 'Warning'
                                ? 'bg-[#F59E0B] ring-[#F59E0B]/30'
                                : 'bg-[#10B981] ring-[#10B981]/30';
                            const labelColor =
                              pond.status === 'Critical'
                                ? 'text-[#FB7185]'
                                : pond.status === 'Warning'
                                ? 'text-[#FBBF24]'
                                : 'text-[#34D399]';

                            return (
                              <button
                                key={pond.id}
                                type="button"
                                onClick={() => setSelectedPondId(pond.id)}
                                style={{
                                  left: `${pond.coordinates.gridX}%`,
                                  top: `${pond.coordinates.gridY}%`,
                                }}
                                className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group focus:outline-none ${
                                  isSelected ? 'z-20 scale-105' : 'z-10 opacity-90 hover:opacity-100'
                                }`}
                              >
                                <span
                                  className={`w-4 h-4 rounded-full ring-8 transition-transform ${nodeColor} ${
                                    isSelected ? 'ring-white/40 scale-110' : ''
                                  }`}
                                />
                                <span
                                  className={`mt-2 text-[11px] font-mono font-semibold whitespace-nowrap px-1.5 py-0.5 rounded bg-[#0B132B]/90 ${labelColor}`}
                                >
                                  {pond.code.replace('AQ-', '')} ({pond.currentReadings.dissolvedOxygen} mg/L)
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Bottom Bar inside Map */}
                        <div className="relative z-20 flex items-center justify-between gap-2 pt-2">
                          <span className="px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700/80 text-[11px] font-mono text-slate-300">
                            {selectedPond.code}: {selectedPond.coordinates.lat}° N,{' '}
                            {selectedPond.coordinates.lng}° E
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveModule('live')}
                            className="text-xs font-mono font-semibold text-[#10B981] hover:text-[#34D399] whitespace-nowrap shrink-0"
                          >
                            Launch Full Pond Grid →
                          </button>
                        </div>
                      </div>

                      {/* Dark Panel 2: Selected Pond Telemetry Diagnostic Card */}
                      <div className="bg-[#0B132B] rounded-xl p-4 sm:p-5 border border-slate-800 space-y-4 text-white">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-xs font-mono truncate">
                            <span className="text-[#FB7185] font-bold">{selectedPond.code}</span>
                            <span className="text-slate-500 mx-1.5">·</span>
                            <span className="text-slate-200 font-semibold">
                              {selectedPond.name}
                            </span>
                          </div>
                          <span
                            className={`px-2.5 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap shrink-0 ${
                              selectedPond.status === 'Critical'
                                ? 'bg-rose-950/90 border border-rose-700/70 text-rose-300'
                                : selectedPond.status === 'Warning'
                                ? 'bg-amber-950/90 border border-amber-700/70 text-amber-300'
                                : 'bg-emerald-950/90 border border-emerald-700/70 text-emerald-300'
                            }`}
                          >
                            {selectedPond.status === 'Critical'
                              ? 'P1 Hypoxia Alert'
                              : selectedPond.status === 'Warning'
                              ? 'Algal Surge Watch'
                              : 'Optimal Equilibrium'}
                          </span>
                        </div>

                        {/* 4 Key Readouts */}
                        <div className="grid grid-cols-4 gap-2 text-center pt-1">
                          <div>
                            <div className="text-[11px] text-slate-400">Dissolved O₂</div>
                            <div
                              className={`text-base sm:text-lg font-mono font-extrabold tabular-nums mt-0.5 ${
                                selectedPond.currentReadings.dissolvedOxygen < 4.0
                                  ? 'text-[#FB7185]'
                                  : selectedPond.currentReadings.dissolvedOxygen < 5.0
                                  ? 'text-[#FBBF24]'
                                  : 'text-[#34D399]'
                              }`}
                            >
                              {selectedPond.currentReadings.dissolvedOxygen} mg/L
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] text-slate-400">Water Temp</div>
                            <div className="text-base sm:text-lg font-mono font-extrabold tabular-nums text-[#FBBF24] mt-0.5">
                              {selectedPond.currentReadings.temperature}°C
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] text-slate-400">pH Level</div>
                            <div className="text-base sm:text-lg font-mono font-extrabold tabular-nums text-[#FB7185] mt-0.5">
                              {selectedPond.currentReadings.ph}
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] text-slate-400">Unionized NH₃</div>
                            <div className="text-base sm:text-lg font-mono font-extrabold tabular-nums text-white mt-0.5">
                              {selectedPond.currentReadings.unionizedAmmonia ??
                                calculateUnionizedAmmonia(
                                  selectedPond.currentReadings.ammonia,
                                  selectedPond.currentReadings.temperature,
                                  selectedPond.currentReadings.ph
                                )}
                            </div>
                          </div>
                        </div>

                        {/* Diagnostic Explanation Box */}
                        <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                          <strong className="text-[#FBBF24]">Hydro-Biological Diagnostic: </strong>
                          {selectedPond.primaryDiagnostic}
                        </div>
                      </div>

                      {/* Bottom 3-Column Summary Stat Row matching reference image */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90">
                          <div className="text-xs text-slate-500 font-medium">Monitored Ponds</div>
                          <div className="text-2xl font-extrabold font-mono tabular-nums text-[#0F172A] mt-1">
                            {ponds.length}
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#FFF1F2] border border-[#FECDD3]">
                          <div className="text-xs text-[#E11D48] font-semibold">Critical Basins</div>
                          <div className="text-2xl font-extrabold font-mono tabular-nums text-[#E11D48] mt-1">
                            {criticalPondCount}
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]">
                          <div className="text-xs text-[#047857] font-semibold">Fleet Health</div>
                          <div className="text-2xl font-extrabold font-mono tabular-nums text-[#059669] mt-1">
                            {fleetAvgHealth}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* INTERACTIVE 6-PARAMETER WATER QUALITY METRIC STRIP FOR SELECTED POND */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-extrabold text-[#0F172A]">
                        Real-Time 6-Parameter Telemetry — {selectedPond.code} ({selectedPond.name})
                      </h2>
                      <p className="text-xs text-slate-500">
                        Species Reference: {selectedPond.species} ({selectedPond.scientificName}) ·{' '}
                        {selectedPond.pondType} · Source: {telemetryMode === 'SIMULATED_DEMO' ? 'DEMO Simulation' : 'Live Stream'}
                      </p>
                    </div>

                    {/* Quick Pond Switcher */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {ponds.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedPondId(p.id)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                            p.id === selectedPond.id
                              ? 'bg-[#0F172A] text-white border-[#0F172A]'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {p.code.replace('AQ-', '')} · {p.status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 6 Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                    {(
                      [
                        {
                          key: 'temperature',
                          label: 'Water Temperature',
                          value: `${selectedPond.currentReadings.temperature}°C`,
                          raw: selectedPond.currentReadings.temperature,
                          delta: `${selectedPond.deltas24h.temperature > 0 ? '+' : ''}${selectedPond.deltas24h.temperature}°C`,
                          opt: `${selectedSpeciesProfile.ranges.temperature.minOptimal}–${selectedSpeciesProfile.ranges.temperature.maxOptimal}°C`,
                        },
                        {
                          key: 'ph',
                          label: 'pH Level',
                          value: `${selectedPond.currentReadings.ph} pH`,
                          raw: selectedPond.currentReadings.ph,
                          delta: `${selectedPond.deltas24h.ph > 0 ? '+' : ''}${selectedPond.deltas24h.ph}`,
                          opt: `${selectedSpeciesProfile.ranges.ph.minOptimal}–${selectedSpeciesProfile.ranges.ph.maxOptimal}`,
                        },
                        {
                          key: 'dissolvedOxygen',
                          label: 'Dissolved Oxygen',
                          value: `${selectedPond.currentReadings.dissolvedOxygen} mg/L`,
                          raw: selectedPond.currentReadings.dissolvedOxygen,
                          delta: `${selectedPond.deltas24h.dissolvedOxygen > 0 ? '+' : ''}${selectedPond.deltas24h.dissolvedOxygen} mg/L`,
                          opt: `${selectedSpeciesProfile.ranges.dissolvedOxygen.minOptimal}–${selectedSpeciesProfile.ranges.dissolvedOxygen.maxOptimal} mg/L`,
                        },
                        {
                          key: 'turbidity',
                          label: 'Turbidity',
                          value: `${selectedPond.currentReadings.turbidity} NTU`,
                          raw: selectedPond.currentReadings.turbidity,
                          delta: `${selectedPond.deltas24h.turbidity > 0 ? '+' : ''}${selectedPond.deltas24h.turbidity} NTU`,
                          opt: `${selectedSpeciesProfile.ranges.turbidity.minOptimal}–${selectedSpeciesProfile.ranges.turbidity.maxOptimal} NTU`,
                        },
                        {
                          key: 'conductivity',
                          label: 'Conductivity (EC)',
                          value: `${selectedPond.currentReadings.conductivity.toLocaleString()} µS/cm`,
                          raw: selectedPond.currentReadings.conductivity,
                          delta: `${selectedPond.deltas24h.conductivity > 0 ? '+' : ''}${selectedPond.deltas24h.conductivity}`,
                          opt: `${selectedSpeciesProfile.ranges.conductivity.minOptimal.toLocaleString()}–${selectedSpeciesProfile.ranges.conductivity.maxOptimal.toLocaleString()}`,
                        },
                        {
                          key: 'ammonia',
                          label: 'Ammonia (TAN)',
                          value: `${selectedPond.currentReadings.ammonia} mg/L`,
                          raw: selectedPond.currentReadings.ammonia,
                          delta: `NH₃: ${selectedPond.currentReadings.unionizedAmmonia} mg/L`,
                          opt: `≤ ${selectedSpeciesProfile.ranges.ammonia.maxOptimal} mg/L`,
                        },
                      ] as const
                    ).map((card) => {
                      const st = evaluateParamStatus(card.key, card.raw);
                      return (
                        <div
                          key={card.key}
                          onClick={() => setActiveModule('analytics')}
                          className={`cursor-pointer bg-white border rounded-2xl p-4 transition-all hover:shadow-xs ${
                            st === 'Critical'
                              ? 'border-rose-300 bg-[#FFF1F2]/30'
                              : st === 'Warning'
                              ? 'border-amber-300 bg-amber-50/20'
                              : 'border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-600">{card.label}</span>
                            <span
                              className={`font-bold ${
                                st === 'Critical'
                                  ? 'text-[#E11D48]'
                                  : st === 'Warning'
                                  ? 'text-amber-600'
                                  : 'text-[#059669]'
                              }`}
                            >
                              {st}
                            </span>
                          </div>
                          <div className="text-xl font-extrabold font-mono tabular-nums text-[#0F172A] mt-2">
                            {card.value}
                          </div>
                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                            <span>Opt: {card.opt}</span>
                            <span>{card.delta}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* OVERVIEW BOTTOM ROW: 24h Diurnal Trend + Recent Alerts */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-[#0F172A]">
                          24-Hour Diurnal Dissolved Oxygen & Hypoxia Floor ({selectedPond.code})
                        </h3>
                        <p className="text-xs text-slate-500">
                          Continuous optical sonde log with species optimal threshold ({selectedSpeciesProfile.ranges.dissolvedOxygen.minOptimal} mg/L)
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveModule('analytics')}
                        className="text-xs font-semibold text-[#059669] hover:text-[#047857]"
                      >
                        Full Analytics →
                      </button>
                    </div>

                    <div className="h-60 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={selectedPond.history24h}
                          margin={{ top: 10, right: 12, left: -12, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="overviewDoFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#059669" stopOpacity={0.28} />
                              <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                          <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: '#64748B' }} />
                          <YAxis domain={[2, 9]} tick={{ fontSize: 11, fill: '#64748B' }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0B132B',
                              borderColor: '#1E293B',
                              borderRadius: '10px',
                              color: '#F8FAFC',
                              fontSize: '12px',
                            }}
                          />
                          <ReferenceLine
                            y={selectedSpeciesProfile.ranges.dissolvedOxygen.minOptimal}
                            stroke="#059669"
                            strokeDasharray="4 4"
                          />
                          <ReferenceLine
                            y={selectedSpeciesProfile.ranges.dissolvedOxygen.minWarning}
                            stroke="#E11D48"
                            strokeDasharray="3 3"
                          />
                          <Area
                            type="monotone"
                            dataKey="dissolvedOxygen"
                            name="Dissolved O₂ (mg/L)"
                            stroke="#059669"
                            strokeWidth={2.5}
                            fill="url(#overviewDoFill)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Active Threshold Alerts & AquaSense Summary */}
                  <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-[#0F172A]">
                          Active Threshold Alerts
                        </h3>
                        <p className="text-xs text-slate-500">
                          Real-time notifications requiring operator review
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveModule('alerts')}
                        className="text-xs font-semibold text-[#059669] hover:text-[#047857]"
                      >
                        Manage All ({alerts.filter((a) => !a.resolved).length}) →
                      </button>
                    </div>

                    <div className="space-y-3">
                      {alerts
                        .filter((a) => !a.resolved)
                        .slice(0, 3)
                        .map((al) => (
                          <div
                            key={al.id}
                            className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                              al.severity === 'Critical'
                                ? 'bg-[#FFF1F2]/60 border-[#FECDD3]'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between font-semibold">
                              <span
                                className={
                                  al.severity === 'Critical'
                                    ? 'text-[#E11D48]'
                                    : 'text-amber-600'
                                }
                              >
                                [{al.severity}] {al.pondCode} · {al.parameter}
                              </span>
                              <span className="font-mono text-slate-500">{al.currentReading}</span>
                            </div>
                            <p className="text-slate-600 leading-relaxed">
                              {al.recommendedAction}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================
                MODULE 2: LIVE MONITORING (Interactive Pond Cards + Demo Controls)
               ========================================================= */}
            {activeModule === 'live' && (
              <div className="space-y-8">
                {/* Header & Interactive Demo Controls */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                  <div>
                    <p className="text-xs font-bold tracking-wider text-[#059669] uppercase">
                      Interactive Multi-Pond IoT Surveillance · DEMO Mode Labeled
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mt-1">
                      Live Pond Monitoring & Telemetry Simulation Controls
                    </h1>
                    <p className="text-sm text-slate-600 mt-1">
                      Select any pond basin below to inspect its live 6-parameter readings, sensor status, and test real-time hypoxia/recovery scenarios.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={stepSimulationTelemetry}
                      className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-[#0F172A] hover:bg-slate-50 whitespace-nowrap shrink-0"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#059669]" />
                      Step Sensor Reading
                    </button>

                    <button
                      type="button"
                      onClick={handleTriggerStressTestInSelectedPond}
                      className="px-3.5 py-2 text-xs font-semibold text-[#E11D48] bg-[#FFF1F2] border border-[#FECDD3] hover:bg-rose-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      Simulate Hypoxia Surge ({selectedPond.code})
                    </button>

                    <button
                      type="button"
                      onClick={handleRestoreOptimalInSelectedPond}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      Stabilize Pond Parameters ({selectedPond.code})
                    </button>
                  </div>
                </div>

                {/* All Connected Ponds Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {ponds.map((pond) => {
                    const isSelected = pond.id === selectedPond.id;
                    return (
                      <button
                        key={pond.id}
                        type="button"
                        onClick={() => setSelectedPondId(pond.id)}
                        className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-4 ${
                          isSelected
                            ? 'bg-[#0B132B] text-white border-[#0B132B] shadow-sm'
                            : 'bg-white text-[#0F172A] border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span
                              className={
                                isSelected ? 'text-[#10B981] font-bold' : 'text-slate-500'
                              }
                            >
                              {pond.code}
                            </span>
                            <span
                              className={`font-sans font-bold ${
                                pond.status === 'Critical'
                                  ? 'text-[#FB7185]'
                                  : pond.status === 'Warning'
                                  ? 'text-[#FBBF24]'
                                  : 'text-[#10B981]'
                              }`}
                            >
                              {pond.status} ({pond.healthScore}%)
                            </span>
                          </div>
                          <div className="text-sm font-bold leading-snug">{pond.name}</div>
                          <div
                            className={`text-xs ${
                              isSelected ? 'text-slate-300' : 'text-slate-500'
                            }`}
                          >
                            {pond.species}
                          </div>
                        </div>

                        <div
                          className={`pt-3 border-t grid grid-cols-3 gap-2 text-xs font-mono tabular-nums ${
                            isSelected ? 'border-slate-800' : 'border-slate-100'
                          }`}
                        >
                          <div>
                            <span className="block text-[10px] text-slate-400">DO</span>
                            <span className="font-bold">
                              {pond.currentReadings.dissolvedOxygen}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-400">Temp</span>
                            <span className="font-bold">
                              {pond.currentReadings.temperature}°
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-slate-400">pH</span>
                            <span className="font-bold">{pond.currentReadings.ph}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Pond Full Profile & Live Sensor Feed */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
                  <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                        <span className="font-bold text-[#059669]">{selectedPond.code}</span>
                        <span aria-hidden="true">·</span>
                        <span>DEMO TELEMETRY FEED</span>
                        <span aria-hidden="true">·</span>
                        <span>
                          Aerators: {selectedPond.aeratorActiveCount}/{selectedPond.aeratorTotalCount} Active
                        </span>
                      </div>
                      <h2 className="text-xl font-extrabold text-[#0F172A] mt-1">
                        {selectedPond.name} — {selectedPond.species} ({selectedPond.scientificName})
                      </h2>
                      <p className="text-xs text-slate-600 mt-1">
                        {selectedPond.primaryDiagnostic}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setActiveModule('ai')}
                        className="px-4 py-2 text-xs font-semibold text-white bg-[#0F172A] hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
                      >
                        Diagnose in AquaSense AI →
                      </button>
                    </div>
                  </div>

                  {/* Detailed 6 Parameters with Threshold Progress Bars */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(
                      [
                        {
                          key: 'dissolvedOxygen',
                          title: 'Dissolved Oxygen (DO)',
                          val: selectedPond.currentReadings.dissolvedOxygen,
                          unit: 'mg/L',
                          range: selectedSpeciesProfile.ranges.dissolvedOxygen,
                          desc: 'Primary metabolic oxygen reserve for gill respiration and nitrifying bacteria.',
                        },
                        {
                          key: 'temperature',
                          title: 'Water Temperature',
                          val: selectedPond.currentReadings.temperature,
                          unit: '°C',
                          range: selectedSpeciesProfile.ranges.temperature,
                          desc: 'Governs metabolic rate, oxygen solubility, and unionized ammonia dissociation.',
                        },
                        {
                          key: 'ph',
                          title: 'pH Level',
                          val: selectedPond.currentReadings.ph,
                          unit: 'pH',
                          range: selectedSpeciesProfile.ranges.ph,
                          desc: 'Logarithmic acid-base balance; afternoon spikes increase NH3 toxicity.',
                        },
                        {
                          key: 'ammonia',
                          title: 'Total Ammonia (TAN)',
                          val: selectedPond.currentReadings.ammonia,
                          unit: 'mg/L',
                          range: selectedSpeciesProfile.ranges.ammonia,
                          desc: `Includes toxic unionized NH₃ (${selectedPond.currentReadings.unionizedAmmonia} mg/L at current pH/Temp).`,
                        },
                        {
                          key: 'turbidity',
                          title: 'Turbidity (Suspended Solids)',
                          val: selectedPond.currentReadings.turbidity,
                          unit: 'NTU',
                          range: selectedSpeciesProfile.ranges.turbidity,
                          desc: 'Reflects phytoplankton bloom density and suspended sediment.',
                        },
                        {
                          key: 'conductivity',
                          title: 'Electrical Conductivity (EC)',
                          val: selectedPond.currentReadings.conductivity,
                          unit: 'µS/cm',
                          range: selectedSpeciesProfile.ranges.conductivity,
                          desc: 'Tracks ionic mineral content and salinity stability.',
                        },
                      ] as const
                    ).map((item) => {
                      const status = evaluateParamStatus(item.key, item.val);
                      return (
                        <div
                          key={item.key}
                          className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#0F172A]">
                              {item.title}
                            </span>
                            <span
                              className={`text-xs font-bold ${
                                status === 'Critical'
                                  ? 'text-[#E11D48]'
                                  : status === 'Warning'
                                  ? 'text-amber-600'
                                  : 'text-[#059669]'
                              }`}
                            >
                              {status === 'Healthy' && (
                                <CheckCircle2 className="w-3.5 h-3.5 inline mr-1" />
                              )}
                              {status === 'Warning' && (
                                <Info className="w-3.5 h-3.5 inline mr-1" />
                              )}
                              {status === 'Critical' && (
                                <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                              )}
                              {status}
                            </span>
                          </div>

                          <div className="flex items-baseline justify-between font-mono tabular-nums">
                            <span className="text-2xl font-extrabold text-[#0F172A]">
                              {item.val.toLocaleString()} {item.unit}
                            </span>
                            <span className="text-xs text-slate-500">
                              Optimal: {item.range.minOptimal}–{item.range.maxOptimal} {item.unit}
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================
                MODULE 3: WATER QUALITY ANALYSIS
               ========================================================= */}
            {activeModule === 'analytics' && (
              <WaterQualityAnalysisView
                ponds={ponds}
                selectedPondId={selectedPondId}
                onSelectPond={setSelectedPondId}
                onExportCSV={handleExportCSV}
              />
            )}

            {/* =========================================================
                MODULE 4: AI PREDICTIONS (AquaSense AI)
               ========================================================= */}
            {activeModule === 'ai' && (
              <AquaSenseAIView
                ponds={ponds}
                insights={insights}
                selectedPondId={selectedPondId}
                onSelectPond={(id) => {
                  setSelectedPondId(id);
                  setActiveModule('live');
                }}
              />
            )}

            {/* =========================================================
                MODULE 5: POND MANAGEMENT
               ========================================================= */}
            {activeModule === 'management' && (
              <PondManagementView
                ponds={ponds}
                sensors={sensors}
                maintenanceRecords={maintenanceRecords}
                selectedPondId={selectedPondId}
                onSelectPond={setSelectedPondId}
                onAddMaintenance={handleAddMaintenance}
                onToggleAerator={handleToggleAerator}
              />
            )}

            {/* =========================================================
                MODULE 6: ALERTS & NOTIFICATIONS
               ========================================================= */}
            {activeModule === 'alerts' && (
              <AlertsNotificationsView
                alerts={alerts}
                onAcknowledge={handleAcknowledgeAlert}
                onResolve={handleResolveAlert}
                onAcknowledgeAll={handleAcknowledgeAll}
              />
            )}

            {/* =========================================================
                MODULE 7: REPORTS & EXPORT
               ========================================================= */}
            {activeModule === 'reports' && (
              <ReportsExportView
                ponds={ponds}
                alerts={alerts}
                insights={insights}
                maintenanceRecords={maintenanceRecords}
                onExportCSV={handleExportCSV}
              />
            )}

            {/* =========================================================
                MODULE 8: SETTINGS
               ========================================================= */}
            {activeModule === 'settings' && (
              <SettingsView
                telemetryMode={telemetryMode}
                onChangeTelemetryMode={setTelemetryMode}
                simulationRunning={simulationRunning}
                onToggleSimulation={() => setSimulationRunning((prev) => !prev)}
                mqttEndpoint={mqttEndpoint}
                onChangeMqttEndpoint={setMqttEndpoint}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
