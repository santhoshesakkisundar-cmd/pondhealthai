# PondHealth AI — Intelligent Water Quality Monitoring & Aquaculture Management Platform

**PondHealth AI** is a commercial-grade environmental intelligence and aquaculture water-quality management platform powered by **AquaSense AI**. It monitors multi-parameter pond water telemetry, computes thermodynamic unionized ammonia ($\text{NH}_3$) dissociation, detects early hypoxia and algal crash risks, and provides species-calibrated decision support for aquaculture farmers.

---

## Key Capabilities

1. **Executive Overview & Spatial Basin Surveillance**
   - Interactive spatial aquaculture grid displaying live status across 5 diverse aquaculture basins (*Litopenaeus vannamei*, *Oreochromis niloticus*, *Lates calcarifer*, *Labeo rohita*, and RAS Nursery post-larvae).
   - 5-stage interactive **Closed-Loop Hydro-Biological Protection Architecture** (*01. Acquire*, *02. Detect*, *03. Correlate*, *04. Predict*, *05. Intervene*).
2. **Real-Time 6-Parameter Water Quality Monitoring**
   - Tracks **Water Temperature (°C)**, **pH Level**, **Dissolved Oxygen (mg/L)**, **Turbidity (NTU)**, **Electrical Conductivity (µS/cm)**, and **Total / Unionized Ammonia ($\text{TAN} / \text{NH}_3\text{ mg/L}$)**.
   - Transparently distinguishes between **Simulated DEMO Mode** and external **MQTT / HTTP Webhook** sensor streams.
3. **AquaSense AI — Pond Intelligence & Natural-Language Assistant**
   - Combines server-side **Gemini AI** (`@google/genai` on `/api/aquasense/ask`) with a deterministic thermodynamic & biological aquaculture rule engine so insights and natural-language Q&A always work—even offline or without paid API keys.
   - Displays exact supporting sensor readings, hydro-chemical reasoning, probable root causes, and decision-support management steps.
4. **Advanced Water Quality Analytics & Species Reference Matrix**
   - Interactive Recharts visualizations for 24-hour diurnal dissolved oxygen cycles, temperature-pH co-variation, turbidity vs. ammonia, and multi-pond comparisons.
   - Configurable species and life-stage threshold tables explaining why safe corridors vary across species and growth phases.
5. **Smart Threshold Alerts, Pond Operations & Audit Reports**
   - Acknowledge or resolve threshold incidents, toggle mechanical aerators, log probiotic/calibration maintenance events, and export full telemetry to **CSV** or printable **PDF** audit reports.

---

## Setup & Running Locally

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Configure GEMINI_API_KEY in .env for live LLM synthesis
# If omitted, AquaSense AI automatically uses its built-in deterministic scientific rule engine.

# 3. Start the full-stack Express + Vite server on port 3000
npm run dev
```
