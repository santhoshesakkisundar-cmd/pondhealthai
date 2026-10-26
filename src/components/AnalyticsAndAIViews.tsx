import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from 'recharts';
import {
  Download,
  Send,
  BrainCircuit,
  SlidersHorizontal,
  AlertTriangle,
  CheckCircle2,
  Info,
  RefreshCw,
} from 'lucide-react';
import {
  PondProfile,
  AIInsight,
} from '../types/aquaculture';
import {
  SPECIES_PROFILES,
  calculateUnionizedAmmonia,
} from '../data/aquacultureData';

interface AnalyticsViewProps {
  ponds: PondProfile[];
  selectedPondId: string;
  onSelectPond: (id: string) => void;
  onExportCSV: (pondId?: string) => void;
}

export const WaterQualityAnalysisView: React.FC<AnalyticsViewProps> = ({
  ponds,
  selectedPondId,
  onSelectPond,
  onExportCSV,
}) => {
  const [timeRange, setTimeRange] = useState<'24h' | '14d'>('24h');
  const [comparisonPondId, setComparisonPondId] = useState<string>('pond-01');
  const [selectedSpeciesKey, setSelectedSpeciesKey] = useState<string>('');

  const activePond = ponds.find((p) => p.id === selectedPondId) || ponds[0];
  const comparePond =
    ponds.find((p) => p.id === comparisonPondId) ||
    ponds.find((p) => p.id !== activePond.id) ||
    ponds[0];

  const activeProfileKey = selectedSpeciesKey || activePond.speciesProfileId;
  const speciesProfile =
    SPECIES_PROFILES[activeProfileKey] || SPECIES_PROFILES.nile_tilapia;

  const chartData =
    timeRange === '24h' ? activePond.history24h : activePond.history30d;
  const compareData =
    timeRange === '24h' ? comparePond.history24h : comparePond.history30d;

  const mergedComparisonData = chartData.map((point, index) => ({
    dateLabel: point.dateLabel,
    primaryDO: point.dissolvedOxygen,
    compareDO: compareData[index]?.dissolvedOxygen ?? point.dissolvedOxygen,
    primaryTemp: point.temperature,
    compareTemp: compareData[index]?.temperature ?? point.temperature,
    primaryPH: point.ph,
    comparePH: compareData[index]?.ph ?? point.ph,
  }));

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs font-bold tracking-wider text-[#059669] uppercase">
            Multi-Parameter Hydro-Chemical Telemetry
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mt-1">
            Water Quality Analytics & Species Reference Ranges
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Inspect diurnal dissolved oxygen cycles, pH-temperature ammonia dissociation, and historical sensor stability across connected aquaculture basins.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Pond Selector */}
          <select
            aria-label="Select primary pond"
            value={activePond.id}
            onChange={(e) => onSelectPond(e.target.value)}
            className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#059669]"
          >
            {ponds.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} · {p.name} ({p.species})
              </option>
            ))}
          </select>

          {/* Timeframe Segmented Control */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setTimeRange('24h')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                timeRange === '24h'
                  ? 'bg-[#0F172A] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              24-Hour Diurnal
            </button>
            <button
              onClick={() => setTimeRange('14d')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                timeRange === '14d'
                  ? 'bg-[#0F172A] text-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              14-Day Trend
            </button>
          </div>

          <button
            onClick={() => onExportCSV(activePond.id)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Download Pond CSV
          </button>
        </div>
      </div>

      {/* Primary 2x2 Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Dissolved Oxygen vs Optimal Threshold */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">
                Dissolved Oxygen (mg/L) & Hypoxia Floor
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {activePond.code} · Optimal target{' '}
                {speciesProfile.ranges.dissolvedOxygen.minOptimal}–
                {speciesProfile.ranges.dissolvedOxygen.maxOptimal} mg/L for{' '}
                {speciesProfile.commonName}
              </p>
            </div>
            <div className="text-right font-mono tabular-nums">
              <div className="text-lg font-bold text-[#059669]">
                {activePond.currentReadings.dissolvedOxygen.toFixed(2)} mg/L
              </div>
              <div className="text-xs text-slate-500">Current Optical DO</div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="doFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis domain={[2, 10]} tick={{ fontSize: 11, fill: '#64748B' }} />
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
                  y={speciesProfile.ranges.dissolvedOxygen.minOptimal}
                  stroke="#059669"
                  strokeDasharray="4 4"
                  label={{
                    value: `Min Optimal (${speciesProfile.ranges.dissolvedOxygen.minOptimal} mg/L)`,
                    fill: '#059669',
                    fontSize: 11,
                    position: 'insideTopRight',
                  }}
                />
                <ReferenceLine
                  y={speciesProfile.ranges.dissolvedOxygen.minWarning}
                  stroke="#E11D48"
                  strokeDasharray="3 3"
                  label={{
                    value: `Hypoxia Limit (${speciesProfile.ranges.dissolvedOxygen.minWarning} mg/L)`,
                    fill: '#E11D48',
                    fontSize: 11,
                    position: 'insideBottomRight',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="dissolvedOxygen"
                  name="Dissolved O₂ (mg/L)"
                  stroke="#059669"
                  strokeWidth={2.5}
                  fill="url(#doFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Water Temperature & pH Variations */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">
                Water Temperature (°C) & pH Co-Variation
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Afternoon solar heating and algal photosynthesis drive simultaneous Temp & pH peaks
              </p>
            </div>
            <div className="text-right font-mono tabular-nums">
              <div className="text-lg font-bold text-[#0F172A]">
                {activePond.currentReadings.temperature}°C · {activePond.currentReadings.ph} pH
              </div>
              <div className="text-xs text-slate-500">Dual Sonde Feed</div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis
                  yAxisId="temp"
                  domain={[22, 35]}
                  tick={{ fontSize: 11, fill: '#0F172A' }}
                />
                <YAxis
                  yAxisId="ph"
                  orientation="right"
                  domain={[6.5, 9.2]}
                  tick={{ fontSize: 11, fill: '#0284C7' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B132B',
                    borderColor: '#1E293B',
                    borderRadius: '10px',
                    color: '#F8FAFC',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="temperature"
                  name="Water Temp (°C)"
                  stroke="#F59E0B"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  yAxisId="ph"
                  type="monotone"
                  dataKey="ph"
                  name="pH Level"
                  stroke="#0284C7"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Turbidity & Total Ammonia (TAN) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">
                Turbidity (NTU) & Total Ammonia Nitrogen (mg/L)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Suspended phytoplankton density vs dissolved nitrogenous waste accumulation
              </p>
            </div>
            <div className="text-right font-mono tabular-nums">
              <div className="text-lg font-bold text-[#E11D48]">
                {activePond.currentReadings.ammonia} mg/L TAN
              </div>
              <div className="text-xs text-slate-500">
                NH₃: {calculateUnionizedAmmonia(
                  activePond.currentReadings.ammonia,
                  activePond.currentReadings.temperature,
                  activePond.currentReadings.ph
                )}{' '}
                mg/L
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="dateLabel" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis yAxisId="turb" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis
                  yAxisId="amm"
                  orientation="right"
                  domain={[0, 0.7]}
                  tick={{ fontSize: 11, fill: '#E11D48' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B132B',
                    borderColor: '#1E293B',
                    borderRadius: '10px',
                    color: '#F8FAFC',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar
                  yAxisId="turb"
                  dataKey="turbidity"
                  name="Turbidity (NTU)"
                  fill="#0D9488"
                  radius={[4, 4, 0, 0]}
                />
                <Line
                  yAxisId="amm"
                  type="monotone"
                  dataKey="ammonia"
                  name="Total Ammonia (mg/L)"
                  stroke="#E11D48"
                  strokeWidth={2.5}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Cross-Pond Parameter Comparison */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">
                Multi-Pond Dissolved Oxygen Comparison
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Compare {activePond.code} against any reference pond in the facility
              </p>
            </div>
            <select
              aria-label="Select comparison pond"
              value={comparePond.id}
              onChange={(e) => setComparisonPondId(e.target.value)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg text-[#0F172A]"
            >
              {ponds.map((p) => (
                <option key={p.id} value={p.id}>
                  Compare: {p.code} ({p.species})
                </option>
              ))}
            </select>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mergedComparisonData} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
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
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="primaryDO"
                  name={`${activePond.code} DO (mg/L)`}
                  stroke="#059669"
                  strokeWidth={2.5}
                />
                <Line
                  type="monotone"
                  dataKey="compareDO"
                  name={`${comparePond.code} DO (mg/L)`}
                  stroke="#6366F1"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Species-Specific Reference Ranges & Biological Threshold Notice */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#059669] uppercase tracking-wider">
              <SlidersHorizontal className="w-4 h-4" />
              Species & Life-Stage Threshold Calibration
            </div>
            <h2 className="text-lg font-bold text-[#0F172A] mt-1">
              Biological Parameter Reference Matrix — {speciesProfile.commonName} (
              <span className="italic font-normal">{speciesProfile.scientificName}</span>)
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Pond Type: {speciesProfile.pondType} · Life Stage: {speciesProfile.lifeStage}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="species-preset" className="text-xs font-semibold text-slate-600">
              Inspect Species Preset:
            </label>
            <select
              id="species-preset"
              value={activeProfileKey}
              onChange={(e) => setSelectedSpeciesKey(e.target.value)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg text-[#0F172A]"
            >
              {Object.values(SPECIES_PROFILES).map((sp) => (
                <option key={sp.speciesId} value={sp.speciesId}>
                  {sp.commonName} ({sp.lifeStage})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Biological Variation Notice */}
        <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs text-[#047857] leading-relaxed">
          <strong className="font-bold">Important Biological Context:</strong> Safe water-quality thresholds vary substantially by cultured species, life stage (post-larvae/fingerlings vs. sub-adults), salinity regime, and local climate. Specifically, the toxic fraction of Total Ammonia Nitrogen (unionized NH₃) increases exponentially as water temperature and pH rise. Notice: {speciesProfile.notes}
        </div>

        {/* Reference Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-3 pr-4">Parameter</th>
                <th className="py-3 px-4">Current ({activePond.code})</th>
                <th className="py-3 px-4">Optimal Corridor</th>
                <th className="py-3 px-4">Warning Band</th>
                <th className="py-3 pl-4 text-right">Evaluation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {(
                [
                  ['temperature', activePond.currentReadings.temperature],
                  ['ph', activePond.currentReadings.ph],
                  ['dissolvedOxygen', activePond.currentReadings.dissolvedOxygen],
                  ['turbidity', activePond.currentReadings.turbidity],
                  ['conductivity', activePond.currentReadings.conductivity],
                  ['ammonia', activePond.currentReadings.ammonia],
                ] as const
              ).map(([key, val]) => {
                const range = speciesProfile.ranges[key];
                const isOptimal = val >= range.minOptimal && val <= range.maxOptimal;
                const isWarn =
                  !isOptimal && val >= range.minWarning && val <= range.maxWarning;
                return (
                  <tr key={key} className="hover:bg-slate-50/80">
                    <td className="py-3 pr-4 font-semibold text-[#0F172A]">{range.label}</td>
                    <td className="py-3 px-4 font-mono tabular-nums font-bold text-[#0F172A]">
                      {val} {range.unit}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-[#059669] font-medium">
                      {range.minOptimal} – {range.maxOptimal} {range.unit}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-amber-700">
                      {range.minWarning} – {range.maxWarning} {range.unit}
                    </td>
                    <td className="py-3 pl-4 text-right font-semibold">
                      {isOptimal ? (
                        <span className="text-[#059669]">Within Optimal Range</span>
                      ) : isWarn ? (
                        <span className="text-amber-600">Warning Deviation</span>
                      ) : (
                        <span className="text-[#E11D48]">Critical Threshold Breach</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface AquaSenseAIViewProps {
  ponds: PondProfile[];
  insights: AIInsight[];
  selectedPondId: string;
  onSelectPond: (id: string) => void;
}

export const AquaSenseAIView: React.FC<AquaSenseAIViewProps> = ({
  ponds,
  insights,
  selectedPondId,
  onSelectPond,
}) => {
  const [question, setQuestion] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [qaHistory, setQaHistory] = useState<
    Array<{
      question: string;
      answer: string;
      citedReadings: string[];
      reasoning: string;
      recommendedActions: string[];
      engineSource: string;
    }>
  >([
    {
      question: 'Why is Pulicat Intensive Shrimp Basin B4 (AQ-POND-02) flagged as Critical right now?',
      answer:
        'AQ-POND-02 is experiencing a compound hypoxia and unionized ammonia toxicity event. Dissolved oxygen has dropped to 3.30 mg/L (below the 4.0 mg/L critical hypoxia threshold for L. vannamei), while water temperature (32.4°C) and alkaline pH (8.58) have shifted Total Ammonia (0.48 mg/L) so that unionized NH₃ reaches 0.112 mg/L—more than 4× the safe chronic threshold (0.025 mg/L).',
      citedReadings: [
        'AQ-POND-02 Dissolved O₂: 3.30 mg/L (24h Δ: -2.1 mg/L)',
        'AQ-POND-02 Temp: 32.4°C · pH: 8.58',
        'AQ-POND-02 TAN: 0.48 mg/L → Unionized NH₃: 0.112 mg/L',
      ],
      reasoning:
        'Warm water (32.4°C) reduces oxygen solubility while elevating shrimp metabolic oxygen demand. Simultaneously, high pH (8.58) shifts the NH₄⁺/NH₃ chemical equilibrium strongly toward uncharged, gill-permeable NH₃.',
      recommendedActions: [
        'Engage all bottom Venturi injectors and paddlewheel aerators immediately; suspend feed dispensing for 12 hours.',
        'Exchange 15–20% bottom water with cooler reservoir water to reduce both temperature and suspended organic load.',
        'Apply molasses (15:1 C:N ratio) and Bacillus probiotic consortium to immobilize TAN.',
      ],
      engineSource: 'AquaSense Hybrid Diagnostic Engine',
    },
  ]);

  const presetQuestions = [
    'What is the unionized ammonia risk in AQ-POND-02 and how do I lower it?',
    'Which pond has the highest risk of a pre-dawn dissolved oxygen crash tonight?',
    'Explain how water temperature and pH affect ammonia toxicity in shrimp ponds.',
    'Compare feed readiness across all 5 ponds based on current dissolved oxygen.',
  ];

  const handleAsk = async (queryText?: string) => {
    const q = (queryText ?? question).trim();
    if (!q || loading) return;
    setLoading(true);
    if (!queryText) setQuestion('');

    try {
      const response = await fetch('/api/aquasense/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          ponds,
          selectedPondId,
        }),
      });
      const data = await response.json();
      setQaHistory((prev) => [
        {
          question: q,
          answer: data.answer || 'Analysis completed.',
          citedReadings: data.citedReadings || [],
          reasoning: data.reasoning || '',
          recommendedActions: data.recommendedActions || [],
          engineSource: data.engineSource || 'AquaSense Rule-Based Engine',
        },
        ...prev,
      ]);
    } catch (_err) {
      setQaHistory((prev) => [
        {
          question: q,
          answer:
            'Unable to reach server endpoint; local rule-based diagnostic recommends verifying Dissolved Oxygen (>5.0 mg/L) and unionized NH3 (<0.025 mg/L) in AQ-POND-02.',
          citedReadings: ['AQ-POND-02 DO: 3.3 mg/L', 'AQ-POND-02 TAN: 0.48 mg/L'],
          reasoning: 'Fallback local diagnostic rule triggered.',
          recommendedActions: ['Verify aeration and water exchange in AQ-POND-02.'],
          engineSource: 'AquaSense Rule-Based Engine',
        },
        ...prev,
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs font-bold tracking-wider text-[#059669] uppercase">
            AquaSense AI · Decision-Support & Risk Forecasting
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mt-1">
            AI-Powered Pond Intelligence & Early Warning
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">
            Every insight displays the exact sensor readings and hydro-chemical reasoning behind the diagnosis. AI recommendations serve as decision support alongside on-site field testing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            aria-label="Focus pond for AquaSense AI"
            value={selectedPondId}
            onChange={(e) => onSelectPond(e.target.value)}
            className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-[#0F172A]"
          >
            {ponds.map((p) => (
              <option key={p.id} value={p.id}>
                Focus Context: {p.code} · {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Natural Language Q&A Console */}
      <div className="bg-[#0B132B] text-white rounded-2xl p-6 sm:p-8 border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#10B981] uppercase tracking-wider">
              <BrainCircuit className="w-4 h-4" />
              AquaSense AI Natural-Language Diagnostic Assistant
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Ask About Water Parameters, Anomaly Causes, or Pond Management
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Mode: Server Gemini AI + Deterministic Thermodynamic Engine
          </span>
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask AquaSense AI e.g. 'Why is pH rising in AQ-POND-03 and what should we do before sunset?'"
            className="flex-1 px-4 py-3 text-sm bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder:text-slate-400 focus:outline-none focus:border-[#10B981]"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-xs font-bold text-white bg-[#059669] hover:bg-[#10B981] disabled:opacity-50 rounded-xl transition-colors whitespace-nowrap shrink-0"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing Telemetry...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Analyze with AquaSense
              </>
            )}
          </button>
        </form>

        {/* Quick Prompt Buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          {presetQuestions.map((pq) => (
            <button
              key={pq}
              type="button"
              onClick={() => handleAsk(pq)}
              className="px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors text-left"
            >
              {pq}
            </button>
          ))}
        </div>

        {/* Q&A Responses */}
        <div className="mt-6 space-y-4">
          {qaHistory.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <p className="text-sm font-bold text-[#10B981]">Q: {item.question}</p>
                <span className="text-xs font-mono text-slate-400">{item.engineSource}</span>
              </div>

              <p className="text-sm text-slate-200 leading-relaxed">{item.answer}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                  <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                    Supporting Sensor Readings & Reasoning
                  </p>
                  <ul className="space-y-1 text-xs font-mono text-slate-300 mb-2">
                    {item.citedReadings.map((r, i) => (
                      <li key={i}>• {r}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.reasoning}</p>
                </div>

                <div className="p-3.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
                  <p className="text-xs font-bold text-[#10B981] uppercase tracking-wider mb-2">
                    Recommended Decision-Support Steps
                  </p>
                  <ul className="space-y-1.5 text-xs text-slate-200">
                    {item.recommendedActions.map((act, i) => (
                      <li key={i} className="leading-relaxed">
                        {i + 1}. {act}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Automated Multi-Pond Anomaly & Early-Warning Cards */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[#0F172A]">
            Automated Pond Health Diagnostics & Trend Risk Predictions
          </h2>
          <p className="text-xs text-slate-500">
            Generated from live 6-parameter telemetry and species dissociation models across all 5 basins
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {insights.map((ins) => (
            <div
              key={ins.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <span className="font-bold text-[#0F172A]">{ins.pondName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{ins.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono">{ins.engineSource}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0F172A] mt-1">{ins.headline}</h3>
                </div>

                <div className="flex items-center gap-2 text-xs font-bold">
                  {ins.severity === 'Critical' ? (
                    <span className="inline-flex items-center gap-1.5 text-[#E11D48]">
                      <AlertTriangle className="w-4 h-4" />
                      Critical Priority
                    </span>
                  ) : ins.severity === 'Warning' ? (
                    <span className="inline-flex items-center gap-1.5 text-amber-600">
                      <Info className="w-4 h-4" />
                      Early Warning
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[#059669]">
                      <CheckCircle2 className="w-4 h-4" />
                      Healthy Equilibrium
                    </span>
                  )}
                </div>
              </div>

              {/* 3-Column Evidence, Causes, and Action Plan */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    1. Cited Telemetry & Reasoning
                  </p>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 font-mono text-xs text-[#0F172A]">
                    {ins.supportingReadings.map((sr, i) => (
                      <div key={i}>{sr}</div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {ins.scientificReasoning}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    2. Probable Root Causes
                  </p>
                  <ul className="space-y-2 text-xs text-slate-700 leading-relaxed">
                    {ins.possibleCauses.map((cause, i) => (
                      <li key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                        {cause}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-[#059669] uppercase tracking-wider">
                    3. Recommended Pond Management Steps
                  </p>
                  <ul className="space-y-2 text-xs text-[#0F172A] leading-relaxed">
                    {ins.recommendedSteps.map((step, i) => (
                      <li
                        key={i}
                        className="p-3 rounded-xl bg-[#ECFDF5]/70 border border-[#A7F3D0] font-medium"
                      >
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span>{ins.confidenceNote}</span>
                <button
                  onClick={() => onSelectPond(ins.pondId)}
                  className="font-semibold text-[#059669] hover:text-[#047857]"
                >
                  Inspect {ins.pondName} Profile →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
