import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  BellRing,
  FileSpreadsheet,
  Printer,
  Plus,
  Wrench,
  Radio,
  Sliders,
  ShieldAlert,
} from 'lucide-react';
import {
  PondProfile,
  SensorProbe,
  PondAlert,
  MaintenanceRecord,
  AIInsight,
  TelemetrySourceMode,
} from '../types/aquaculture';
import { SPECIES_PROFILES } from '../data/aquacultureData';

interface PondManagementViewProps {
  ponds: PondProfile[];
  sensors: SensorProbe[];
  maintenanceRecords: MaintenanceRecord[];
  selectedPondId: string;
  onSelectPond: (id: string) => void;
  onAddMaintenance: (record: Omit<MaintenanceRecord, 'id'>) => void;
  onToggleAerator: (pondId: string) => void;
}

export const PondManagementView: React.FC<PondManagementViewProps> = ({
  ponds,
  sensors,
  maintenanceRecords,
  selectedPondId,
  onSelectPond,
  onAddMaintenance,
  onToggleAerator,
}) => {
  const [category, setCategory] = useState<MaintenanceRecord['category']>('Probiotic Dose');
  const [actionText, setActionText] = useState('');
  const [operatorName, setOperatorName] = useState('R. Karthikeyan (Lead Biologist)');
  const [outcomeText, setOutcomeText] = useState('');

  const activePond = ponds.find((p) => p.id === selectedPondId) || ponds[0];
  const pondSensors = sensors.filter((s) => s.pondId === activePond.id);

  const handleSubmitMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionText.trim()) return;
    onAddMaintenance({
      pondId: activePond.id,
      pondName: activePond.name,
      date: new Date().toISOString().slice(0, 10),
      category,
      action: actionText.trim(),
      operator: operatorName.trim() || 'Field Technician',
      outcome: outcomeText.trim() || 'Logged in pond management ledger; monitoring telemetry response.',
    });
    setActionText('');
    setOutcomeText('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs font-bold tracking-wider text-[#059669] uppercase">
            Aquaculture Asset & Sonde Inventory
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mt-1">
            Pond Management, Species Profiles & Maintenance Ledger
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage pond stocking specifications, mechanical aeration units, optical sonde calibration schedules, and field treatment logs.
          </p>
        </div>

        <select
          aria-label="Select pond to manage"
          value={activePond.id}
          onChange={(e) => onSelectPond(e.target.value)}
          className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-[#0F172A]"
        >
          {ponds.map((p) => (
            <option key={p.id} value={p.id}>
              {p.code} · {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Selected Pond Detailed Profile Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-mono font-bold text-[#059669]">{activePond.code}</span>
              <span aria-hidden="true">·</span>
              <span>{activePond.sector}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">
                {activePond.coordinates.lat}° N, {activePond.coordinates.lng}° E
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-[#0F172A] mt-1">{activePond.name}</h2>
            <p className="text-xs text-slate-600 mt-1">{activePond.primaryDiagnostic}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggleAerator(activePond.id)}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0F172A] hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Toggle Standby Aerator ({activePond.aeratorActiveCount}/{activePond.aeratorTotalCount} Running)
            </button>
          </div>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <p className="text-xs text-slate-500">Cultured Species</p>
            <p className="text-sm font-bold text-[#0F172A] mt-1">{activePond.species}</p>
            <p className="text-xs italic text-slate-500">{activePond.scientificName}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <p className="text-xs text-slate-500">System & Stage</p>
            <p className="text-sm font-bold text-[#0F172A] mt-1">{activePond.pondType}</p>
            <p className="text-xs text-slate-500">{activePond.lifeStage}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 font-mono tabular-nums">
            <p className="text-xs text-slate-500 font-sans">Surface & Depth</p>
            <p className="text-sm font-bold text-[#0F172A] mt-1">
              {activePond.surfaceAreaHectares} ha
            </p>
            <p className="text-xs text-slate-500">{activePond.meanDepthMeters}m mean depth</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 font-mono tabular-nums">
            <p className="text-xs text-slate-500 font-sans">Stocking Density</p>
            <p className="text-sm font-bold text-[#0F172A] mt-1">
              {activePond.stockingDensityPerM2} ind/m²
            </p>
            <p className="text-xs text-slate-500">Calibrated ration</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 font-mono tabular-nums">
            <p className="text-xs text-slate-500 font-sans">Standing Biomass</p>
            <p className="text-sm font-bold text-[#0F172A] mt-1">
              {activePond.estimatedBiomassKg.toLocaleString()} kg
            </p>
            <p className="text-xs text-slate-500">Est. current crop</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] font-mono tabular-nums">
            <p className="text-xs text-[#047857] font-sans font-semibold">Health Score</p>
            <p className="text-lg font-extrabold text-[#059669] mt-0.5">
              {activePond.healthScore}/100
            </p>
            <p className="text-xs text-[#047857] font-sans">{activePond.status}</p>
          </div>
        </div>
      </div>

      {/* Sensor Inventory & Maintenance Log Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sensor Inventory Table */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0F172A]">
                Deployed IoT Sensor Probe Inventory
              </h2>
              <p className="text-xs text-slate-500">
                Showing optical & ion-selective sondes across facility ({pondSensors.length} in {activePond.code})
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <th className="py-2.5 pr-3">Sonde ID</th>
                  <th className="py-2.5 px-3">Pond</th>
                  <th className="py-2.5 px-3">Battery & Depth</th>
                  <th className="py-2.5 pl-3 text-right">Calibration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {sensors.map((s) => (
                  <tr
                    key={s.id}
                    className={s.pondId === activePond.id ? 'bg-[#ECFDF5]/40' : 'hover:bg-slate-50'}
                  >
                    <td className="py-3 pr-3">
                      <div className="font-mono font-bold text-[#0F172A]">{s.id}</div>
                      <div className="text-slate-500">{s.model}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">
                      {ponds.find((p) => p.id === s.pondId)?.code}
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums text-slate-700">
                      {s.batteryPct}% · {s.depthMeters}m
                    </td>
                    <td className="py-3 pl-3 text-right">
                      <div
                        className={`font-semibold ${
                          s.status === 'Online' ? 'text-[#059669]' : 'text-amber-600'
                        }`}
                      >
                        {s.status}
                      </div>
                      <div className="font-mono text-slate-400">Cal: {s.lastCalibrated}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Log New Maintenance Record Form */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#059669]" />
              Record Pond Intervention or Calibration ({activePond.code})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Append probiotic dosing, water exchange, or sensor calibration events to the audit log
            </p>
          </div>

          <form onSubmit={handleSubmitMaintenance} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Intervention Category
                </label>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as MaintenanceRecord['category'])
                  }
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-[#0F172A]"
                >
                  <option value="Probiotic Dose">Probiotic Dose</option>
                  <option value="Aeration">Aeration Adjustment</option>
                  <option value="Water Exchange">Water Exchange</option>
                  <option value="Lime Buffering">Lime Buffering</option>
                  <option value="Sensor Calibration">Sensor Calibration</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Operator / Biologist
                </label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-[#0F172A]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Action Performed
              </label>
              <input
                type="text"
                required
                value={actionText}
                onChange={(e) => setActionText(e.target.value)}
                placeholder="e.g., Applied 50 kg/ha agricultural dolomite & 15% bottom drain exchange"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-[#0F172A]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observed Outcome / Target Metric
              </label>
              <input
                type="text"
                value={outcomeText}
                onChange={(e) => setOutcomeText(e.target.value)}
                placeholder="e.g., Target pH stabilization at 7.9 and DO recovery > 5.0 mg/L"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-[#0F172A]"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Save Maintenance Record
            </button>
          </form>
        </div>
      </div>

      {/* Maintenance History Ledger */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-[#0F172A]">
          Recent Pond Operations & Maintenance Log
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                <th className="py-2.5 pr-4">Date</th>
                <th className="py-2.5 px-4">Pond</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Action & Operator</th>
                <th className="py-2.5 pl-4">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {maintenanceRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50">
                  <td className="py-3 pr-4 font-mono text-slate-600 whitespace-nowrap">
                    {rec.date}
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#0F172A]">{rec.pondName}</td>
                  <td className="py-3 px-4 font-medium text-[#059669]">{rec.category}</td>
                  <td className="py-3 px-4 text-slate-700">
                    <div>{rec.action}</div>
                    <div className="text-slate-400">By {rec.operator}</div>
                  </td>
                  <td className="py-3 pl-4 text-slate-600">{rec.outcome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface AlertsViewProps {
  alerts: PondAlert[];
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  onAcknowledgeAll: () => void;
}

export const AlertsNotificationsView: React.FC<AlertsViewProps> = ({
  alerts,
  onAcknowledge,
  onResolve,
  onAcknowledgeAll,
}) => {
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'Critical' | 'Warning' | 'Advisory'>('ALL');
  const [showResolved, setShowResolved] = useState(false);

  const filtered = alerts.filter((a) => {
    if (!showResolved && a.resolved) return false;
    if (severityFilter !== 'ALL' && a.severity !== severityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <p className="text-xs font-bold tracking-wider text-[#E11D48] uppercase">
            Real-Time Threshold Incident Engine
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mt-1">
            Smart Alerts & Threshold Incident Response
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Automated detection of dissolved oxygen sags, unionized ammonia spikes, diurnal pH surges, and sensor calibration intervals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
            {(['ALL', 'Critical', 'Warning', 'Advisory'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  severityFilter === sev
                    ? 'bg-[#0F172A] text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {sev === 'ALL' ? 'All Severities' : sev}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowResolved((prev) => !prev)}
            className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 whitespace-nowrap shrink-0"
          >
            {showResolved ? 'Hide Resolved' : 'Show Resolved Incidents'}
          </button>

          <button
            onClick={onAcknowledgeAll}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Acknowledge All Active
          </button>
        </div>
      </div>

      {/* Alert List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#059669] mx-auto" />
            <h3 className="text-base font-bold text-[#0F172A]">
              No Matching Threshold Incidents
            </h3>
            <p className="text-xs text-slate-500">
              All monitored parameters for the selected filter are currently acknowledged or within safe corridors.
            </p>
          </div>
        ) : (
          filtered.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white border rounded-2xl p-6 space-y-4 ${
                alert.severity === 'Critical'
                  ? 'border-rose-200'
                  : alert.severity === 'Warning'
                  ? 'border-amber-200'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`font-bold ${
                        alert.severity === 'Critical'
                          ? 'text-[#E11D48]'
                          : alert.severity === 'Warning'
                          ? 'text-amber-600'
                          : 'text-slate-600'
                      }`}
                    >
                      {alert.severity} Severity
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono font-bold text-[#0F172A]">{alert.pondCode}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-600">{alert.pondName}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-slate-500">{alert.timestamp}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0F172A] mt-1">
                    {alert.parameter} — Reading:{' '}
                    <span className="font-mono text-[#E11D48]">{alert.currentReading}</span>{' '}
                    <span className="text-xs font-normal text-slate-500">
                      (Reference: {alert.thresholdRange})
                    </span>
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {!alert.acknowledged && (
                    <button
                      onClick={() => onAcknowledge(alert.id)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-[#0F172A] bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      Acknowledge
                    </button>
                  )}
                  {!alert.resolved ? (
                    <button
                      onClick={() => onResolve(alert.id)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] rounded-lg transition-colors whitespace-nowrap shrink-0"
                    >
                      Mark Resolved
                    </button>
                  ) : (
                    <span className="text-xs font-semibold text-[#059669]">Resolved</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span className="font-bold text-[#0F172A] block mb-1">
                    Diagnostic Cause:
                  </span>
                  <span className="text-slate-600 leading-relaxed">{alert.diagnosticCause}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#ECFDF5]/60 border border-[#A7F3D0]">
                  <span className="font-bold text-[#047857] block mb-1">
                    Recommended Corrective Action:
                  </span>
                  <span className="text-[#0F172A] leading-relaxed">{alert.recommendedAction}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

interface ReportsViewProps {
  ponds: PondProfile[];
  alerts: PondAlert[];
  insights: AIInsight[];
  maintenanceRecords: MaintenanceRecord[];
  onExportCSV: (pondId?: string) => void;
}

export const ReportsExportView: React.FC<ReportsViewProps> = ({
  ponds,
  alerts,
  insights,
  maintenanceRecords,
  onExportCSV,
}) => {
  const [reportPondFilter, setReportPondFilter] = useState<string>('ALL');

  const targetPonds =
    reportPondFilter === 'ALL'
      ? ponds
      : ponds.filter((p) => p.id === reportPondFilter);

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200 no-print">
        <div>
          <p className="text-xs font-bold tracking-wider text-[#059669] uppercase">
            Compliance & Executive Aquaculture Reporting
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mt-1">
            Water Quality Reports, AI Insights & Telemetry Export
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Generate structured CSV datasets and printable PDF water-health audit reports including readings, alerts, and AquaSense AI recommendations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            aria-label="Filter report scope"
            value={reportPondFilter}
            onChange={(e) => setReportPondFilter(e.target.value)}
            className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-300 rounded-lg text-[#0F172A]"
          >
            <option value="ALL">All 5 Monitored Basins</option>
            {ponds.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} · {p.name}
              </option>
            ))}
          </select>

          <button
            onClick={() =>
              onExportCSV(reportPondFilter === 'ALL' ? undefined : reportPondFilter)
            }
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#059669] hover:bg-[#047857] rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Telemetry CSV
          </button>

          <button
            onClick={handlePrintPDF}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0F172A] hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF Report
          </button>
        </div>
      </div>

      {/* Printable Report Document Sheet */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="text-lg font-extrabold tracking-tight text-[#0F172A]">
              PondHealth <span className="text-[#059669]">AI</span> — Official Water Quality & Ecosystem Audit Report
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Generated: 2026-10-26 09:20 IST · Telemetry Source: Calibrated Optical Sondes (DEMO Simulation Mode)
            </p>
          </div>
          <div className="text-right font-mono text-xs text-slate-600">
            <div>Doc ID: RPT-2026-1026-AQ</div>
            <div>Scope: {targetPonds.length} Basin(s)</div>
          </div>
        </div>

        {/* Section 1: Telemetry Summary Table */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
            01. Current Multi-Parameter Water Quality Readings
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                  <th className="py-2.5 pr-3">Pond Code & Name</th>
                  <th className="py-2.5 px-3">Species</th>
                  <th className="py-2.5 px-3 text-right">Temp (°C)</th>
                  <th className="py-2.5 px-3 text-right">pH</th>
                  <th className="py-2.5 px-3 text-right">DO (mg/L)</th>
                  <th className="py-2.5 px-3 text-right">Turbidity (NTU)</th>
                  <th className="py-2.5 px-3 text-right">EC (µS/cm)</th>
                  <th className="py-2.5 px-3 text-right">TAN / NH₃ (mg/L)</th>
                  <th className="py-2.5 pl-3 text-right">Health Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {targetPonds.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 pr-3 font-semibold text-[#0F172A]">
                      {p.code} · {p.name}
                    </td>
                    <td className="py-3 px-3 text-slate-600">{p.species}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      {p.currentReadings.temperature}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      {p.currentReadings.ph}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold">
                      {p.currentReadings.dissolvedOxygen}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      {p.currentReadings.turbidity}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      {p.currentReadings.conductivity.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      {p.currentReadings.ammonia} / {p.currentReadings.unionizedAmmonia}
                    </td>
                    <td className="py-3 pl-3 text-right font-bold">
                      <span
                        className={
                          p.status === 'Critical'
                            ? 'text-[#E11D48]'
                            : p.status === 'Warning'
                            ? 'text-amber-600'
                            : 'text-[#059669]'
                        }
                      >
                        {p.status} ({p.healthScore}%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: AquaSense AI Recommendations */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-[#0F172A] uppercase tracking-wider">
            02. AquaSense AI Diagnostic Findings & Decision-Support Plan
          </h2>
          <div className="space-y-3">
            {insights
              .filter(
                (i) => reportPondFilter === 'ALL' || i.pondId === reportPondFilter
              )
              .map((ins) => (
                <div
                  key={ins.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs"
                >
                  <div className="font-bold text-[#0F172A]">{ins.headline}</div>
                  <p className="text-slate-600">{ins.scientificReasoning}</p>
                  <div className="text-[#047857] font-medium">
                    Recommended Actions: {ins.recommendedSteps.join(' | ')}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Section 3: Active Alerts & Recent Maintenance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              03. Logged Threshold Incidents ({alerts.length})
            </h3>
            <ul className="space-y-2 text-xs text-slate-700">
              {alerts.slice(0, 4).map((a) => (
                <li key={a.id} className="p-3 rounded-lg border border-slate-200">
                  <strong className="text-[#0F172A]">
                    [{a.severity}] {a.pondCode} — {a.parameter}:
                  </strong>{' '}
                  {a.currentReading}. {a.recommendedAction}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              04. Recent Field Maintenance ({maintenanceRecords.length})
            </h3>
            <ul className="space-y-2 text-xs text-slate-700">
              {maintenanceRecords.slice(0, 4).map((m) => (
                <li key={m.id} className="p-3 rounded-lg border border-slate-200">
                  <strong className="text-[#0F172A]">
                    {m.date} · {m.pondName} ({m.category}):
                  </strong>{' '}
                  {m.action}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SettingsViewProps {
  telemetryMode: TelemetrySourceMode;
  onChangeTelemetryMode: (mode: TelemetrySourceMode) => void;
  simulationRunning: boolean;
  onToggleSimulation: () => void;
  mqttEndpoint: string;
  onChangeMqttEndpoint: (url: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  telemetryMode,
  onChangeTelemetryMode,
  simulationRunning,
  onToggleSimulation,
  mqttEndpoint,
  onChangeMqttEndpoint,
}) => {
  return (
    <div className="space-y-8 max-w-4xl">
      <div className="pb-6 border-b border-slate-200">
        <p className="text-xs font-bold tracking-wider text-[#059669] uppercase">
          IoT Telemetry & Platform Configuration
        </p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mt-1">
          Sensor Integration, Data Provenance & Alert Settings
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Configure LoRaWAN / MQTT broker ingestion or control the realistic DEMO aquaculture simulation engine.
        </p>
      </div>

      {/* Telemetry Mode Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 text-xs font-bold text-[#059669] uppercase tracking-wider">
          <Radio className="w-4 h-4" />
          Sensor Data Source & Provenance Transparency
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onChangeTelemetryMode('SIMULATED_DEMO')}
            className={`p-5 rounded-xl border text-left transition-all ${
              telemetryMode === 'SIMULATED_DEMO'
                ? 'border-[#10B981] bg-[#ECFDF5]/60'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#0F172A]">
                Simulated IoT Monitoring Mode (DEMO)
              </span>
              <span className="text-xs font-mono font-bold text-[#059669]">ACTIVE DEFAULT</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Streams scientifically modeled 6-parameter aquaculture telemetry (including diurnal DO cycles and NH₄⁺/NH₃ equilibrium). Clearly labeled as DEMO across the UI so simulated values are never mistaken for physical hardware readings.
            </p>
          </button>

          <button
            type="button"
            onClick={() => onChangeTelemetryMode('MQTT_LIVE_STREAM')}
            className={`p-5 rounded-xl border text-left transition-all ${
              telemetryMode === 'MQTT_LIVE_STREAM'
                ? 'border-[#10B981] bg-[#ECFDF5]/60'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#0F172A]">
                External MQTT / HTTP Webhook Ingestion
              </span>
              <span className="text-xs font-mono text-slate-500">/api/telemetry/validate</span>
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Connects to physical LoRaWAN/Modbus pond sondes via MQTT-over-WebSockets or HTTP POST payloads to `/api/telemetry/validate`. Falls back to clearly labeled DEMO data when no physical gateway is connected.
            </p>
          </button>
        </div>

        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[#0F172A]">
              Real-Time DEMO Telemetry Stream Stepping
            </p>
            <p className="text-xs text-slate-500">
              When enabled, simulated optical sonde readings update every 5 seconds with realistic micro-fluctuations.
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleSimulation}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 ${
              simulationRunning
                ? 'bg-[#059669] text-white'
                : 'bg-slate-200 text-slate-800'
            }`}
          >
            {simulationRunning ? 'DEMO Stream: Running (Pause)' : 'DEMO Stream: Paused (Resume)'}
          </button>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            MQTT / LoRaWAN Gateway Endpoint URL (Optional Hardware Bridge)
          </label>
          <input
            type="text"
            value={mqttEndpoint}
            onChange={(e) => onChangeMqttEndpoint(e.target.value)}
            placeholder="wss://mqtt.your-aquaculture-farm.local:8883/telemetry"
            className="w-full px-3.5 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg text-[#0F172A]"
          />
          <p className="text-xs text-slate-500">
            Status: {mqttEndpoint ? 'Awaiting physical gateway handshake (using labeled DEMO stream until verified)' : 'No physical gateway configured — operating in labeled DEMO mode.'}
          </p>
        </div>
      </div>

      {/* Scientific Integrity & Safety Notice */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A] uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-[#059669]" />
          Decision-Support & Scientific Governance
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          PondHealth AI and AquaSense AI are designed as environmental decision-support tools for aquaculture operators. Water-quality thresholds depend on species, stocking density, alkalinity, and local climate. Always verify critical dissolved oxygen sags or ammonia spikes with calibrated field titration kits before applying large-scale chemical treatments or emergency harvests.
        </p>
      </div>
    </div>
  );
};
