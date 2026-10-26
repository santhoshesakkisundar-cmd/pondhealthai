import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import {
  INITIAL_PONDS,
  SPECIES_PROFILES,
  answerPondQuestionRuleBased,
  calculateUnionizedAmmonia,
} from './src/data/aquacultureData.ts';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  // Check if a valid Gemini API key is configured
  const hasGeminiKey = Boolean(
    process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' &&
      process.env.GEMINI_API_KEY.trim().length > 10
  );

  // Health & Telemetry Capabilities status endpoint
  app.get('/api/status', (_req, res) => {
    res.json({
      status: 'ok',
      platform: 'PondHealth AI Telemetry & AquaSense Core',
      geminiConfigured: hasGeminiKey,
      mqttBrokerStatus: process.env.MQTT_BROKER_URL ? 'CONNECTED' : 'SIMULATED_DEMO_FALLBACK',
      timestamp: new Date().toISOString(),
    });
  });

  // IoT Sensor Ingestion & Validation Endpoint (supports external HTTP/MQTT bridge webhooks or simulated packets)
  app.post('/api/telemetry/validate', (req, res) => {
    try {
      const { pondId, readings, speciesProfileId } = req.body;
      const profile = SPECIES_PROFILES[speciesProfileId] || SPECIES_PROFILES.nile_tilapia;
      if (!readings) {
        res.status(400).json({ error: 'Missing sensor readings payload' });
        return;
      }

      const nh3 = calculateUnionizedAmmonia(
        Number(readings.ammonia || 0),
        Number(readings.temperature || 28),
        Number(readings.ph || 7.5)
      );

      const violations: Array<{
        parameter: string;
        severity: 'Critical' | 'Warning';
        reading: string;
        optimalRange: string;
      }> = [];

      // Check DO
      if (readings.dissolvedOxygen < profile.ranges.dissolvedOxygen.minWarning) {
        violations.push({
          parameter: 'Dissolved Oxygen',
          severity: 'Critical',
          reading: `${readings.dissolvedOxygen} mg/L`,
          optimalRange: `${profile.ranges.dissolvedOxygen.minOptimal}–${profile.ranges.dissolvedOxygen.maxOptimal} mg/L`,
        });
      } else if (readings.dissolvedOxygen < profile.ranges.dissolvedOxygen.minOptimal) {
        violations.push({
          parameter: 'Dissolved Oxygen',
          severity: 'Warning',
          reading: `${readings.dissolvedOxygen} mg/L`,
          optimalRange: `${profile.ranges.dissolvedOxygen.minOptimal}–${profile.ranges.dissolvedOxygen.maxOptimal} mg/L`,
        });
      }

      // Check Ammonia
      if (readings.ammonia > profile.ranges.ammonia.maxWarning || nh3 > 0.05) {
        violations.push({
          parameter: 'Total Ammonia (TAN / NH₃)',
          severity: 'Critical',
          reading: `${readings.ammonia} mg/L (NH₃: ${nh3} mg/L)`,
          optimalRange: `≤ ${profile.ranges.ammonia.maxOptimal} mg/L`,
        });
      } else if (readings.ammonia > profile.ranges.ammonia.maxOptimal) {
        violations.push({
          parameter: 'Total Ammonia (TAN / NH₃)',
          severity: 'Warning',
          reading: `${readings.ammonia} mg/L`,
          optimalRange: `≤ ${profile.ranges.ammonia.maxOptimal} mg/L`,
        });
      }

      // Check pH
      if (readings.ph < profile.ranges.ph.minWarning || readings.ph > profile.ranges.ph.maxWarning) {
        violations.push({
          parameter: 'pH Level',
          severity: 'Critical',
          reading: `${readings.ph} pH`,
          optimalRange: `${profile.ranges.ph.minOptimal}–${profile.ranges.ph.maxOptimal} pH`,
        });
      } else if (readings.ph < profile.ranges.ph.minOptimal || readings.ph > profile.ranges.ph.maxOptimal) {
        violations.push({
          parameter: 'pH Level',
          severity: 'Warning',
          reading: `${readings.ph} pH`,
          optimalRange: `${profile.ranges.ph.minOptimal}–${profile.ranges.ph.maxOptimal} pH`,
        });
      }

      res.json({
        pondId,
        unionizedAmmonia: nh3,
        violations,
        validatedAt: new Date().toISOString(),
      });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Telemetry validation error' });
    }
  });

  // AquaSense AI Natural-Language & Diagnostic Endpoint
  app.post('/api/aquasense/ask', async (req, res) => {
    const { question, ponds = INITIAL_PONDS, selectedPondId = 'pond-02' } = req.body;

    if (!question || typeof question !== 'string') {
      res.status(400).json({ error: 'Please provide a question for AquaSense AI.' });
      return;
    }

    // Always compute the deterministic scientific baseline first
    const fallbackResult = answerPondQuestionRuleBased(question, ponds, selectedPondId);

    if (!hasGeminiKey) {
      res.json(fallbackResult);
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const focusPond = ponds.find((p: { id: string }) => p.id === selectedPondId) || ponds[0];
      const profile = SPECIES_PROFILES[focusPond.speciesProfileId] || SPECIES_PROFILES.nile_tilapia;

      const telemetryContext = JSON.stringify(
        ponds.map((p: typeof INITIAL_PONDS[0]) => ({
          code: p.code,
          name: p.name,
          species: `${p.species} (${p.scientificName})`,
          lifeStage: p.lifeStage,
          pondType: p.pondType,
          status: p.status,
          healthScore: p.healthScore,
          currentReadings: p.currentReadings,
          deltas24h: p.deltas24h,
          aerators: `${p.aeratorActiveCount}/${p.aeratorTotalCount}`,
        })),
        null,
        2
      );

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `User question about pond water quality / aquaculture management: "${question}"\nSelected Focus Pond: ${focusPond.code} (${focusPond.name})\nSpecies Reference Ranges for Focus Pond: ${JSON.stringify(profile.ranges)}\nCurrent Multi-Pond Telemetry Snapshot:\n${telemetryContext}`,
        config: {
          systemInstruction:
            'You are AquaSense AI, a senior aquaculture water-quality scientist and IoT decision-support assistant for PondHealth AI. Analyze the exact sensor telemetry provided, explain the thermodynamic and biological reasoning (such as unionized ammonia NH3 equilibrium with pH and temperature, diurnal dissolved oxygen cycles, and species-specific tolerances), and give actionable decision-support recommendations. Never invent sensor readings not in the snapshot. Always remind the farmer that recommendations are decision support and should be verified with field testing.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              answer: {
                type: Type.STRING,
                description: 'Clear, scientifically grounded response citing exact pond readings.',
              },
              citedReadings: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 to 4 exact metric readings from the telemetry snapshot used in the diagnosis.',
              },
              reasoning: {
                type: Type.STRING,
                description: 'Hydro-chemical and biological explanation of why these readings matter.',
              },
              recommendedActions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2 to 4 concrete, prioritized aquaculture management steps.',
              },
            },
            required: ['answer', 'citedReadings', 'reasoning', 'recommendedActions'],
          },
        },
      });

      const rawText = response.text;
      if (rawText) {
        const parsed = JSON.parse(rawText.trim());
        res.json({
          ...parsed,
          engineSource: 'AquaSense Gemini AI',
        });
        return;
      }

      res.json(fallbackResult);
    } catch (_error) {
      // Gracefully fall back to the deterministic scientific rule engine so the user always gets a real analysis
      res.json(fallbackResult);
    }
  });

  // Vite middleware in development, static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PondHealth AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
