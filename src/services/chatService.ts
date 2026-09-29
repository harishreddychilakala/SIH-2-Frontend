import type {
  ChatMessage,
  ChatPromptPreset,
  RecommendationInput,
  Commodity,
  SustainabilityPreference,
  MAPRequirement,
  TransportCondition,
  CostPriority,
  CommodityCategory,
  StorageType,
  RecommendationResult,
} from '../types';
import { commodityService } from './commodityService';
import { recommendationService } from './recommendationService';
import { API_BASE } from './apiConfig';
import { estimateFoodProperties } from './foodScienceEstimator';

export const chatPromptPresets: ChatPromptPreset[] = [
  {
    id: 'preset-1',
    title: 'Fresh Table Tomatoes',
    prompt: 'I need packaging for fresh table tomatoes stored at 12°C with 88% RH for 14 days shelf life.',
    category: 'Fresh Produce',
  },
  {
    id: 'preset-2',
    title: 'Instant Fried Noodles Rancidity Defense',
    prompt: 'Recommend packaging for instant fried ramen noodles (18% fat, 3.5% moisture) at 25°C ambient storage to prevent lipid rancidity.',
    category: 'Noodles & Pasta',
  },
  {
    id: 'preset-3',
    title: 'Fresh Alkaline Ramen Noodles Cold Chain',
    prompt: 'What barrier packaging and storage temperature is required for fresh alkaline noodles (33% moisture) to prevent mold and enzymatic browning?',
    category: 'Noodles & Pasta',
  },
  {
    id: 'preset-4',
    title: 'Roasted Cashews Rancidity Defense',
    prompt: 'What is the best packaging for roasted cashew nuts (46% fat) to prevent lipid oxidation and loss of crispness?',
    category: 'Fat-Rich Foods',
  },
  {
    id: 'preset-5',
    title: 'Aged Basmati Rice Barrier',
    prompt: 'What moisture and aroma barrier film is required for packaging 5kg aged Basmati rice for 2 years?',
    category: 'Dry Grains',
  },
  {
    id: 'preset-6',
    title: 'Fresh Paneer Cold Chain',
    prompt: 'Recommend packaging for fresh cottage cheese (Paneer, 54% moisture) at 3°C cold chain.',
    category: 'Dairy & Processed',
  },
];

export const initialChatMessages: ChatMessage[] = [
  {
    id: 'msg-welcome',
    sender: 'bot',
    text: `Hello, I am **PackBot**, Senior Packaging Manager & Food Packaging Engineering Consultant for PackSmart AI (SIH26236).

Tell me which food product you want to package (e.g. Instant Fried Noodles, Fresh Udon, Mangoes, Fish, Paneer, Rice, Biscuits), or describe your processing and distribution parameters. I will assess barrier requirements (OTR, WVTR, light lockout) and provide a scientifically justified packaging recommendation.`,
    timestamp: 'Just now',
    quickReplies: [
      'Instant Fried Noodles Packaging',
      'Fresh Alkaline Noodles Packaging',
      'Cooked Noodles Safety & Storage',
      'Packaging for Fresh Tomatoes',
      'Basmati Rice Moisture Barrier',
      'Fresh Paneer Cold Chain',
    ],
  },
];

type ConversationPhase =
  | 'INITIAL_REQUEST'
  | 'COLLECTING_DETAILS'
  | 'GENERATING_RECOMMENDATION'
  | 'RECOMMENDATION_READY'
  | 'FOLLOW_UP';

interface ChatSessionState {
  phase: ConversationPhase;
  commodityId: string;
  commodityName: string;
  category: CommodityCategory;
  moistureContent: number;
  oilFatContent: number;
  ph: number;
  respirationRate: number;
  respirationUnit: string;
  storageType: StorageType;
  storageTempC: number;
  relativeHumidityPercent: number;
  desiredShelfLifeDays: number;
  transportCondition: TransportCondition;
  costPriority: CostPriority;
  sustainabilityPreference: SustainabilityPreference;
  mapRequirement: MAPRequirement;
  packagingFormat: string;
  lastRecommendationResult?: RecommendationResult | null;
  isPreliminaryAssumption: boolean;
}

let activeSession: ChatSessionState = {
  phase: 'INITIAL_REQUEST',
  commodityId: '',
  commodityName: '',
  category: 'Fresh Produce',
  moistureContent: 85,
  oilFatContent: 0.5,
  ph: 5.0,
  respirationRate: 20,
  respirationUnit: 'mg CO₂/kg·h',
  storageType: 'ambient',
  storageTempC: 22,
  relativeHumidityPercent: 65,
  desiredShelfLifeDays: 14,
  transportCondition: 'local',
  costPriority: 'balanced',
  sustainabilityPreference: 'recyclable',
  mapRequirement: 'consider',
  packagingFormat: 'Pouch / Bag',
  lastRecommendationResult: null,
  isPreliminaryAssumption: false,
};

export function resetChatSession() {
  activeSession = {
    phase: 'INITIAL_REQUEST',
    commodityId: '',
    commodityName: '',
    category: 'Fresh Produce',
    moistureContent: 85,
    oilFatContent: 0.5,
    ph: 5.0,
    respirationRate: 20,
    respirationUnit: 'mg CO₂/kg·h',
    storageType: 'ambient',
    storageTempC: 22,
    relativeHumidityPercent: 65,
    desiredShelfLifeDays: 14,
    transportCondition: 'local',
    costPriority: 'balanced',
    sustainabilityPreference: 'recyclable',
    mapRequirement: 'consider',
    packagingFormat: 'Pouch / Bag',
    lastRecommendationResult: null,
    isPreliminaryAssumption: false,
  };
}

export const chatService = {
  getPresets(): ChatPromptPreset[] {
    return chatPromptPresets;
  },

  async processUserMessage(userText: string): Promise<ChatMessage> {
    const textLower = userText.toLowerCase().trim();

    await new Promise((resolve) => setTimeout(resolve, 350));

    // -------------------------------------------------------------------------
    // 1. Direct Recommendation Engine Navigation Query
    // -------------------------------------------------------------------------
    if (
      textLower.includes('go to recommend') ||
      textLower.includes('open recommend') ||
      textLower.includes('new recommend') ||
      textLower.includes('full recommend') ||
      textLower.includes('recommendation page') ||
      textLower.includes('recommendation form') ||
      textLower.includes('recommendation engine')
    ) {
      return {
        id: 'msg-' + Date.now(),
        sender: 'bot',
        text: `### 🚀 PackSmart AI Packaging Recommendation Engine

To generate a full technical packaging dossier with certified barrier parameters (ASTM D3985 OTR, ASTM F1249 WVTR), 4-tier shelf-life estimation, sustainability index, and MAP gas protocol, please launch the dedicated recommendation engine:

[👉 **Click here to Open the Full Packaging Recommendation Engine**](/recommend)

You can specify your exact storage temperature, humidity, distribution chain, and custom shelf-life goals.`,
        timestamp: 'Just now',
        quickReplies: [
          'Packaging for Fresh Tomatoes',
          'Instant Fried Noodles Packaging',
          'Fresh Paneer Cold Chain',
          'Roasted Cashews Barrier',
        ],
      };
    }

    // -------------------------------------------------------------------------
    // 2. Identify Commodity / Food Matrix Context
    // -------------------------------------------------------------------------
    let allCommodities: Commodity[] = [];
    try {
      allCommodities = await commodityService.getAll();
    } catch {
      allCommodities = [];
    }

    let matchedCommodity = allCommodities.find((c) =>
      textLower.includes(c.name.toLowerCase())
    );

    if (!matchedCommodity) {
      const keywords: [string[], string][] = [
        [['potato chip', 'potato chips', 'crisp', 'crisps', 'wafer', 'namkeen', 'sev', 'bhujia'], 'potato chip'],
        [['tomato', 'tomatoes'], 'tomato'],
        [['mango', 'mangoes', 'alphonso'], 'mango'],
        [['banana', 'bananas', 'cavendish'], 'banana'],
        [['apple', 'apples', 'gala'], 'apple'],
        [['rice', 'basmati'], 'rice'],
        [['flour', 'wheat', 'atta'], 'flour'],
        [['dal', 'toor', 'pigeon pea', 'lentil', 'pulses'], 'dal'],
        [['cashew', 'cashews', 'kaju', 'roasted cashew', 'nut', 'nuts', 'almond', 'walnut'], 'cashew'],
        [['paneer', 'cottage cheese'], 'paneer'],
        [['cheese', 'cheddar', 'mozzarella'], 'cheese'],
        [['noodle', 'noodles', 'ramen', 'instant noodle', 'pasta', 'macaroni', 'spaghetti'], 'noodle'],
        [['fish', 'marine fish', 'salmon', 'seafood', 'prawn', 'shrimp'], 'fish'],
        [['chicken', 'poultry', 'meat', 'mutton', 'pork', 'beef'], 'chicken'],
        [['milk', 'dairy'], 'milk'],
        [['curd', 'dahi', 'yogurt'], 'curd'],
        [['biscuit', 'biscuits', 'cookie', 'cookies', 'cracker', 'crackers'], 'biscuit'],
        [['bread', 'loaf', 'bakery'], 'bread'],
        [['spice', 'spices', 'turmeric', 'chilli powder', 'pepper', 'masala'], 'spice'],
        [['coffee', 'coffee beans', 'roasted coffee'], 'coffee'],
        [['spinach', 'leafy', 'greens', 'lettuce', 'herb', 'coriander'], 'spinach'],
        [['strawberry', 'strawberries', 'berry', 'berries'], 'strawberry'],
      ];

      for (const [kws, commKeyword] of keywords) {
        if (kws.some((kw) => textLower.includes(kw))) {
          matchedCommodity = allCommodities.find((c) =>
            c.name.toLowerCase().includes(commKeyword)
          );
          if (matchedCommodity) break;
        }
      }
    }

    const estimated = estimateFoodProperties(userText, matchedCommodity?.category);
    const commName = matchedCommodity?.name || (estimated.rationale ? userText.trim().replace(/(packaging|package|pack|for|the|recommend|best|what is|how to)\s*/gi, '').trim() : undefined);

    // -------------------------------------------------------------------------
    // 3. Evaluate User Query via Smart Switching AI Backend (Gemini & Groq)
    // -------------------------------------------------------------------------
    try {
      const aiPayload = {
        message: userText,
        context: {
          commodityName: matchedCommodity?.name || commName || null,
          category: matchedCommodity?.category || estimated.category,
          moistureContent: matchedCommodity?.moisturePercent.typical || estimated.moistureContent,
          oilFatContent: matchedCommodity?.fatOilPercent.typical || estimated.oilFatContent,
          ph: matchedCommodity?.typicalPh.typical || estimated.ph,
          respirationRate: matchedCommodity?.respirationRate?.rateAtAmbient || estimated.respirationRate,
          storageTempC: matchedCommodity?.recommendedStorage.tempC.typical || estimated.storageTempC,
          relativeHumidityPercent: matchedCommodity?.recommendedStorage.rhPercent.typical || estimated.relativeHumidityPercent,
          desiredShelfLifeDays: matchedCommodity?.recommendedStorage.typicalShelfLifeDays || estimated.desiredShelfLifeDays,
        },
        provider: 'auto',
      };

      const res = await fetch(`${API_BASE}/chat/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aiPayload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.text && data.text.trim().length > 20) {
          let responseText = data.text.trim();

          // If a commodity was identified, add a recommendation engine call-to-action
          if (commName || matchedCommodity) {
            const targetName = matchedCommodity?.name || commName || 'this food product';
            responseText += `\n\n---\n💡 **Need a complete multi-tier technical dossier with certified ASTM standards?**\n👉 [**Open Packaging Recommendation Engine for ${targetName}**](/recommend?commodity=${encodeURIComponent(targetName)})`;
          }

          // Build dynamic quick replies based on context
          const quickReplies: string[] = [];
          if (matchedCommodity || commName) {
            const name = matchedCommodity?.name || commName || '';
            quickReplies.push(`Packaging for ${name}`);
            quickReplies.push('Why this material?');
            quickReplies.push('Compare with Alternatives');
            quickReplies.push('Check Sustainability');
          } else {
            quickReplies.push('Packaging for Fresh Tomatoes');
            quickReplies.push('Instant Fried Noodles Packaging');
            quickReplies.push('Fresh Paneer Cold Chain');
            quickReplies.push('What is OTR and WVTR?');
          }

          return {
            id: 'msg-' + Date.now(),
            sender: 'bot',
            text: responseText,
            timestamp: 'Just now',
            quickReplies,
          };
        }
      }
    } catch {
      // Backend fetch failed; fall through to local domain rule engine
    }

    // -------------------------------------------------------------------------
    // 4. Fallback: Local Food Science Domain Engine
    // -------------------------------------------------------------------------
    if (
      textLower.includes('what is map') ||
      textLower.includes('what is otr') ||
      textLower.includes('what is wvtr') ||
      textLower.includes('explain otr') ||
      textLower.includes('explain map') ||
      textLower.includes('explain barrier')
    ) {
      return {
        id: 'msg-' + Date.now(),
        sender: 'bot',
        text: `### 🔬 Food Packaging Barrier Engineering Principles

- **Oxygen Transmission Rate (OTR)**: Measured in $\\text{cc}/\\text{m}^2\\cdot24\\text{h}\\cdot1\\,\\text{atm}$ (at 23°C, 0% RH, ASTM D3985). Controls oxygen flux to inhibit lipid auto-oxidation (rancidity in high-fat foods, fried snacks, and dairy) and aerobic microbial spoilage.
- **Water Vapor Transmission Rate (WVTR)**: Measured in $\\text{g}/\\text{m}^2\\cdot24\\text{h}$ (at 38°C, 90% RH, ASTM F1249). Prevents moisture uptake in dry goods (loss of crispness/caking) and prevents dehydration/weight loss in high-moisture fresh produce.
- **Modified Atmosphere Packaging (MAP)**: Headspace gas modification (typically $3\\text{--}5\\%\\, O_2, 5\\text{--}8\\%\\, CO_2, \\text{bal. } N_2$) designed to retard crop respiration and suppress microbial kinetics.

Which food product are you evaluating?`,
        timestamp: 'Just now',
        quickReplies: [
          'Packaging for Fresh Tomatoes',
          'Packaging for Instant Fried Noodles',
          'Packaging for Fresh Paneer',
          'Packaging for Roasted Cashews',
        ],
      };
    }

    if (matchedCommodity) {
      return await this.generateDirectRecommendation(matchedCommodity, textLower);
    }

    return {
      id: 'msg-' + Date.now(),
      sender: 'bot',
      text: `Hello! I can evaluate your food preservation requirements and answer queries regarding barrier materials, OTR/WVTR specifications, modified atmosphere gas compositions, and post-harvest shelf-life kinetics.

Tell me about your product or inquiry (e.g. *Instant Fried Noodles, Fresh Paneer, Fresh Tomatoes, Marine Fish, Roasted Cashews, Basmati Rice*), or [launch the full recommendation engine](/recommend).`,
      timestamp: 'Just now',
      quickReplies: [
        'Packaging for Fresh Tomatoes',
        'Instant Fried Noodles Packaging',
        'Fresh Paneer Cold Chain',
        'Roasted Cashews Barrier',
        'What is OTR and WVTR?',
      ],
    };
  },

  async generateDirectRecommendation(commodity: Commodity, textLower: string): Promise<ChatMessage> {
    const isBio = textLower.includes('bio') || textLower.includes('compost') || textLower.includes('sustainable') || textLower.includes('eco');
    const isLowCost = textLower.includes('cheap') || textLower.includes('budget') || textLower.includes('low cost');
    const isChilled = textLower.includes('chill') || textLower.includes('cold') || textLower.includes('refrigerat');
    const isFrozen = textLower.includes('frozen') || textLower.includes('deep freeze');

    const shelfLifeMatch = textLower.match(/(\d+)\s*(day|days|month|months|year|years|week|weeks)/i);
    let shelfLife = commodity.recommendedStorage.typicalShelfLifeDays;
    if (shelfLifeMatch) {
      const num = parseInt(shelfLifeMatch[1], 10);
      if (shelfLifeMatch[2].startsWith('month')) shelfLife = num * 30;
      else if (shelfLifeMatch[2].startsWith('year')) shelfLife = num * 365;
      else if (shelfLifeMatch[2].startsWith('week')) shelfLife = num * 7;
      else shelfLife = num;
    }

    const tempMatch = textLower.match(/(-?\d+)\s*°?c/i);
    const temp = tempMatch
      ? parseInt(tempMatch[1], 10)
      : isFrozen
      ? -18
      : isChilled
      ? 4
      : commodity.recommendedStorage.tempC.typical;

    const input: RecommendationInput = {
      commodityId: commodity.id,
      category: commodity.category,
      moistureContent: commodity.moisturePercent.typical,
      oilFatContent: commodity.fatOilPercent.typical,
      ph: commodity.typicalPh.typical,
      respirationRate: commodity.respirationRate?.rateAtAmbient || 0,
      respirationUnit: commodity.respirationRate?.unit || 'mg CO₂/kg·h',
      storageType: temp < 0 ? 'frozen' : temp < 10 ? 'chilled' : 'ambient',
      storageTempC: temp,
      relativeHumidityPercent: commodity.recommendedStorage.rhPercent.typical,
      desiredShelfLifeDays: shelfLife,
      transportCondition: textLower.includes('export') || textLower.includes('distance') ? 'long_distance' : 'local',
      costPriority: isLowCost ? 'low' : 'balanced',
      sustainabilityPreference: isBio ? 'biodegradable' : 'recyclable',
      mapRequirement: 'consider',
    };

    activeSession.commodityId = commodity.id;
    activeSession.commodityName = commodity.name;
    activeSession.category = commodity.category;

    return await this.executeRecommendation(input, commodity.name);
  },

  async finalizeRecommendation(session: ChatSessionState): Promise<ChatMessage> {
    const input: RecommendationInput = {
      commodityId: session.commodityId || undefined,
      customCommodityName: !session.commodityId ? session.commodityName : undefined,
      category: session.category,
      moistureContent: session.moistureContent,
      oilFatContent: session.oilFatContent,
      ph: session.ph,
      respirationRate: session.respirationRate,
      respirationUnit: session.respirationUnit,
      storageType: session.storageType,
      storageTempC: session.storageTempC,
      relativeHumidityPercent: session.relativeHumidityPercent,
      desiredShelfLifeDays: session.desiredShelfLifeDays,
      transportCondition: session.transportCondition,
      costPriority: session.costPriority,
      sustainabilityPreference: session.sustainabilityPreference,
      mapRequirement: session.mapRequirement,
      packagingFormat: session.packagingFormat,
    };

    return await this.executeRecommendation(input, session.commodityName || 'Food Item');
  },

  async executeRecommendation(input: RecommendationInput, commodityName: string): Promise<ChatMessage> {
    try {
      // Ensure commodityId is populated if empty
      let safeCommodityId = input.commodityId;
      if (!safeCommodityId) {
        try {
          const all = await commodityService.getAll();
          const match = all.find((c) => c.name.toLowerCase().includes(commodityName.toLowerCase()) || c.category === input.category);
          safeCommodityId = match?.id || all[0]?.id || 'comm-tomato';
        } catch {
          safeCommodityId = 'comm-tomato';
        }
      }

      const safeInput: RecommendationInput = {
        ...input,
        commodityId: safeCommodityId,
        customCommodityName: commodityName,
      };

      const result = await recommendationService.generateRecommendation(safeInput);

      activeSession.phase = 'RECOMMENDATION_READY';
      activeSession.lastRecommendationResult = result;

      // Validate and enrich via backend Gemini/Groq Smart Switching AI API
      let aiValidationNote = '';
      try {
        const aiRes = await fetch(`${API_BASE}/chat/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Scientifically validate packaging recommendation for ${commodityName} (${input.category}) at ${input.storageTempC}°C for ${input.desiredShelfLifeDays} days with primary substrate ${result.primaryMaterial.name}. Verify barrier adequacy and preservation mechanisms.`,
            context: {
              commodityName,
              category: input.category,
              moistureContent: input.moistureContent,
              oilFatContent: input.oilFatContent,
              storageTempC: input.storageTempC,
              relativeHumidityPercent: input.relativeHumidityPercent,
              desiredShelfLifeDays: input.desiredShelfLifeDays,
              primaryMaterial: result.primaryMaterial.name,
              otr: result.primaryMaterial.otr,
              wvtr: result.primaryMaterial.wvtr,
              mapGas: result.mapGuidance?.gasComposition,
            },
            provider: 'auto',
          }),
        });
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          if (aiData?.text) {
            aiValidationNote = aiData.text;
          }
        }
      } catch {
        // Fallback gracefully without external LLM
      }

      const isProduce = input.category === 'Fresh Produce';
      const commLower = commodityName.toLowerCase();
      const isFatRich = input.category === 'Fat-Rich & Oils' || (input.oilFatContent || 0) > 15 || commLower.includes('fried') || commLower.includes('chip') || commLower.includes('cashew') || commLower.includes('nut');
      const isDairy = input.category === 'Dairy & Processed' || commLower.includes('paneer') || commLower.includes('cheese') || commLower.includes('curd');
      const isMarineOrMeat = input.category === 'Meat & Marine' || commLower.includes('fish') || commLower.includes('salmon') || commLower.includes('meat');

      // 1. Respiration & Spoilage Dynamics
      const respSummary = isProduce
        ? `${input.respirationRate || 12} ${input.respirationUnit || 'mg CO₂/kg·h'} (Active post-harvest cellular respiration)`
        : '0.0 mg CO₂/kg·h (Non-respiring food matrix)';

      const primarySpoilage = isProduce
        ? 'Transpiration moisture loss, rapid ripening/senescence, Botrytis cinerea gray mold, and chilling injury (< 12°C for tomatoes)'
        : isFatRich
        ? 'Free-radical auto-oxidation of unsaturated lipids forming hexanal rancidity, and moisture sorption crispness loss'
        : isDairy
        ? 'Psychrotrophic bacterial proliferation (Listeria monocytogenes), lipolysis, and surface mold growth'
        : isMarineOrMeat
        ? 'Psychrotrophic bacterial breakdown, trimethylamine off-odors, and Clostridium botulinum Type E neurotoxin hazard if held > 3.0°C'
        : 'Moisture vapor sorption, starch caking, and potential storage insect/weevil infestation';

      // 2. Thickness derivation & justification
      const thicknessSpec = result.packagingSpecifications?.filmThickness;
      const thicknessVal = thicknessSpec?.measuredValue || `${result.primaryMaterial.thicknessRangeMicrons.typical} µm (Range: ${result.primaryMaterial.thicknessRangeMicrons.min}–${result.primaryMaterial.thicknessRangeMicrons.max} µm)`;
      const thicknessJustification = thicknessSpec?.explanation ||
        (isProduce
          ? '40 µm mono-LDPE provides optimal mechanical puncture resistance against calyx stems while remaining flexible for precision laser micro-perforations.'
          : isFatRich
          ? '45–72 µm multi-layer barrier structure provides light-blocking opacity and puncture defense against crisp edges.'
          : 'Standard gauge selected to balance puncture protection, barrier integrity, and heat-seal strength.');

      // 3. Barrier values & confidence labels
      const otrVal =
        result.primaryMaterial.otr.value !== null
          ? `${result.primaryMaterial.otr.value} ${result.primaryMaterial.otr.unit || 'cc/m²·24h·atm'} (ASTM D3985: 23°C, 0% RH)`
          : 'Provisional Range: 5,000–35,000 cc/m²·24h·atm (Laser micro-perforation tuned)';
      const wvtrVal =
        result.primaryMaterial.wvtr.value !== null
          ? `${result.primaryMaterial.wvtr.value} ${result.primaryMaterial.wvtr.unit || 'g/m²·24h'} (ASTM F1249: 38°C, 90% RH)`
          : 'Base Film: 12.0 g/m²·24h @ 38°C, 90% RH (ASTM F1249 flat sheet)';

      const otrStatus = isProduce ? 'Insufficient data' : (result.primaryMaterial.isVerified ? 'Verified' : 'Literature-based');
      const wvtrStatus = result.primaryMaterial.isVerified ? 'Verified' : 'Literature-based';

      // 4. MAP guidance
      const mapSuitability = isProduce
        ? 'Beneficial — 3%–5% O₂, 5%–8% CO₂, Balance N₂ (Equilibrium MAP via laser micro-perforations)'
        : isFatRich
        ? 'Highly Recommended — 99.5% N₂ Inert Gas Flushing (Displaces headspace O₂ < 0.5–1.0%)'
        : isDairy
        ? 'Conditionally Suitable — 70% N₂ + 30% CO₂ (Unvalidated Candidate — CO₂ dissolution trial required)'
        : isMarineOrMeat
        ? 'Required — 40%–60% CO₂ + Balance N₂ (Microbiostatic preservation; strictly requires ≤ 3.0°C cold chain)'
        : 'Unnecessary — Ambient air sealed (Low water activity Aw < 0.60 already provides microbiological stability)';

      const mapText = result.mapGuidance?.gasComposition ||
        (isProduce
          ? '3%–5% O₂, 5%–8% CO₂, Balance N₂ (Micro-perforated)'
          : isFatRich
          ? '99.5% N₂ Flush (Headspace O₂ < 1.0%)'
          : isDairy
          ? '70% N₂ + 30% CO₂ (Unvalidated Candidate)'
          : isMarineOrMeat
          ? '40%–60% CO₂ / Bal. N₂'
          : 'Ambient Atmospheric Air (Hermetic seal)');

      // 5. Shelf-life status
      const modelShelfLife = isProduce
        ? 'Insufficient data for a reliable shelf-life estimate without empirical storage trials under 10°C and 88% RH. (Literature range: 10–14 days for mature fruit at 12–15°C; 14-day target is NOT guaranteed).'
        : `Theoretical compatibility indicated for ${input.desiredShelfLifeDays} days under continuous ${input.storageTempC}°C holding; commercial shelf life is NOT guaranteed without laboratory challenge testing.`;

      const alt1Name = result.alternativeMaterials?.[0]?.material?.name || 'Mono-PE Recyclable Film';
      const alt1Tradeoff = result.alternativeMaterials?.[0]?.keyTradeoff || 'Readily recyclable in standard streams; moderate barrier performance.';
      const alt2Name = result.alternativeMaterials?.[1]?.material?.name || 'Bio-based Compostable Substrate';
      const alt2Tradeoff = result.alternativeMaterials?.[1]?.keyTradeoff || 'Industrially compostable; higher cost per kg.';

      const qualificationHeader = activeSession.isPreliminaryAssumption
        ? `> ⚠️ **Preliminary Recommendation**: Generated using baseline scientific parameters for ${commodityName}. Target shelf life is user-specified and requires empirical confirmation.\n\n`
        : '';

      // Final Structured 13-Section Response Format
      const reportText = `${qualificationHeader}### 1. Product Assessment
| Parameter | Value | Assessment Context |
| :--- | :--- | :--- |
| **Commodity Name** | **${commodityName}** | Category: \`${input.category}\` |
| **Moisture Content** | ${input.moistureContent}% | Proximate water fraction |
| **Lipid / Fat Content** | ${input.oilFatContent}% | ${input.oilFatContent > 15 ? 'High lipid — extreme rancidity vulnerability' : 'Low lipid fraction'} |
| **Matrix pH** | ${input.ph} | ${input.ph < 4.6 ? 'High acid (C. botulinum inhibited)' : 'Low acid (pH ≥ 4.6 — strict microbial control required)'} |
| **Respiration Rate** | ${respSummary} | ${isProduce ? 'Requires breathable gas exchange' : 'Zero respiration'} |
| **Primary Spoilage Vector** | ${primarySpoilage} | Dominant degradation kinetic |

### 2. Recommended Packaging Material
- **Primary Material:** **${result.primaryMaterial.name}**
- **Material Category:** \`${result.primaryMaterial.category}\`
- **Recycling Classification:** \`${result.primaryMaterial.sustainability.recyclingCode || result.primaryMaterial.sustainability.type}\` (${result.primaryMaterial.sustainability.recyclabilityRating})
- **Cost Tier:** ${result.primaryMaterial.indicativeCostTier} (${result.primaryMaterial.indicativePricePerKgRange})

### 3. Material Structure and Thickness
- **Structure:** \`${result.primaryMaterial.layerStructure || 'Engineered Mono-layer / Co-extrusion'}\`
- **Recommended Thickness:** **${thicknessVal}**
- **Technical Explanation:** ${thicknessJustification}

### 4. OTR and WVTR Specifications
| Barrier Metric | Recommended Target | Measured / Reference Value | Reference Test Conditions | Confidence Status |
| :--- | :--- | :--- | :--- | :--- |
| **Oxygen Transmission Rate (OTR)** | ${isProduce ? '5,000–35,000 cc/m²·24h' : '< 25 cc/m²·24h'} | ${otrVal} | ASTM D3985 (23°C, 0% RH, 1 atm) | \`${otrStatus}\` |
| **Water Vapor Transmission (WVTR)** | ${isProduce ? '150–250 g/m²·24h (Pack)' : '< 1.0–4.0 g/m²·24h'} | ${wvtrVal} | ASTM F1249 (38°C, 90% RH) | \`${wvtrStatus}\` |
${isProduce ? '> *Missing Data Notice:* Package dimensions (L × W), fill weight (kg), and laser micro-perforation geometry (50–100 µm count) are required to calculate the exact equilibrium numerical OTR.' : ''}

### 5. MAP Suitability and Gas Composition
- **Suitability:** ${mapSuitability}
- **Headspace Gas Formulation:** ${mapText}
- **Gas Exchange & Safety Thresholds:** ${isProduce ? 'Headspace O₂ must remain ≥ 2.0% to prevent hypoxic ethanol fermentation; CO₂ must not exceed 8.0% to avoid internal physiological browning.' : 'Hermetic flush prevents oxygen-driven spoilage; residual O₂ must remain < 1.0%.'}

### 6. Packaging Format
- **Selected Format:** **${isMarineOrMeat ? 'Thermoformed Barrier Tray with Lidding Film' : input.packagingFormat || 'Flexible Pouch / Pillow Bag'}**
- **Functional Configuration:** ${isMarineOrMeat ? 'Rigid base tray with vacuum skin or hermetic lidding and absorbent drip pad' : isFatRich ? 'Nitrogen-flushed pillow pouch with pneumatic shock-absorption cushion' : 'Flexible sealed pouch with anti-fog additive and perimeter heat seals'}

### 7. Sealability and Mechanical Requirements
- **Heat Sealability:** **${result.primaryMaterial.sealability}** (Peel strength verification required via ASTM F1921 / ASTM F2096 bubble leak test)
- **Mechanical Strength:** Tensile Modulus: **${result.primaryMaterial.mechanicalStrength.tensileRating}** | Puncture Resistance: **${result.primaryMaterial.mechanicalStrength.punctureResistance}** (ASTM D3763 / ASTM D1709)

### 8. Recommended Storage and Transportation Conditions
- **Storage Regime:** **${input.storageType.toUpperCase()}** held at **${input.storageTempC}°C** with **${input.relativeHumidityPercent}% RH**
- **Logistics Mode:** ${input.transportCondition === 'local' ? 'Local Urban Distribution (< 100 km)' : 'Inter-State Long-Distance Logistics'}
${input.storageTempC <= 10 && commLower.includes('tomato') ? '> ⚠️ **Chilling Injury Warning:** 10°C is at the critical lower threshold for fresh table tomatoes. Optimal holding is 12–15°C; storage ≤ 10°C suppresses aroma volatiles and induces mealiness.' : ''}

### 9. Shelf-Life Assessment
- **User Requested Shelf Life:** **${input.desiredShelfLifeDays} Days** *(Commercial target)*
- **Model Estimated Shelf Life:** ${modelShelfLife}
- **Critical Spoilage Accelerators:** Temperature fluctuations, relative humidity extremes, micro-pinholes, initial microbial load at filling, and seal micro-channel leaks.
- **Testing Protocol:** Empirical real-time storage trials (ISO 11035 / FDA BAM) and ASLT Arrhenius kinetics (ISO 16779) are required. Packaging material alone never guarantees shelf life.

### 10. Sustainable Alternatives
1. **${alt1Name}**: ${alt1Tradeoff}
2. **${alt2Name}**: ${alt2Tradeoff}
- *Infrastructure Notice:* Material recyclability (e.g. RIC 4 / RIC 5) is distinct from local municipal curbside collection availability.

### 11. Reasons for Selecting the Material
1. **Targeted Degradation Prevention:** Directly matches the product\'s moisture, fat, and respiration vulnerabilities.
2. **Mechanical & Processing Compatibility:** Delivers required seal integrity and puncture resistance for ${input.packagingFormat || 'flexible pouch'} format under ${input.transportCondition} distribution.
3. **Balanced Commercial Feasibility:** Achieves functional barrier without costly over-specification or unrecyclable multi-layer waste where mono-material solutions are feasible.

### 12. Important Limitations and Validation Requirements
- **Batch Verification:** Supplier roll stock must undergo certified ASTM D3985 (OTR) and ASTM F1249 (WVTR) verification before industrial filling.
- **Integrity & Microbiology:** Seal hermeticity must be validated per ASTM F2096, and real-time microbial challenge testing executed under actual transit conditions.${aiValidationNote}

### 13. Scientific Sources and Confidence Labels
- **Statutory & Standard References:** Codex Alimentarius (CXC 53-2003 / CXS 249-2006), USDA ARS Handbook 66, FSSAI Packaging Regulations 2018, US FDA 21 CFR § 177, ASTM D3985 / ASTM F1249.
- **Evidence Confidence Level:** \`${result.sectionG_ValidationSummary?.overallEvidenceLevel || 'Partially supported — Laboratory Validation Required'}\``;

      return {
        id: 'msg-' + Date.now(),
        sender: 'bot',
        text: reportText,
        timestamp: 'Just now',
        quickReplies: [
          'Why this material?',
          'Compare with Alternatives',
          'Check Sustainability',
          '+ New Chat',
        ],
        recommendationData: {
          commodityName,
          primaryMaterial: result.primaryMaterial,
          explanation: result.suitabilityExplanation,
          resultId: result.id,
          otr: result.primaryMaterial.otr.level,
          wvtr: result.primaryMaterial.wvtr.level,
          map: result.mapGuidance?.gasComposition,
        },
      };
    } catch {
      // Dynamic commodity-aware fallback with 13-section structure
      const commLower = commodityName.toLowerCase();
      const isChips = commLower.includes('chip') || commLower.includes('crisp') || commLower.includes('namkeen');
      const isFish = commLower.includes('fish') || commLower.includes('salmon') || input.category === 'Meat & Marine';
      const isDairy = commLower.includes('paneer') || commLower.includes('cheese') || input.category === 'Dairy & Processed';

      const fallbackMat = isChips
        ? { name: 'BOPP / Metallized Cast PP (BOPP/Met-CPP)', structure: '20µm BOPP / 25µm Met-CPP', thickness: '45 µm', otr: '< 25.0 cc/m²·day (ASTM D3985: 23°C, 0% RH)', wvtr: '< 1.0 g/m²·day (ASTM F1249: 38°C, 90% RH)', map: '99.5% N₂ Pillow Cushion (Headspace O₂ < 1.0%)', tier: 'Grade B (RIC 5 PP Recyclable)' }
        : isFish
        ? { name: 'High-Barrier Co-ex PA/EVOH/PE Pouch', structure: '15µm PA / 5µm EVOH / 60µm PE', thickness: '80 µm', otr: '< 2.5 cc/m²·day (ASTM D3985: 23°C, 0% RH)', wvtr: '< 4.0 g/m²·day (ASTM F1249: 38°C, 90% RH)', map: '40% CO₂ / 60% N₂ (Microbiostatic Headspace)', tier: 'Grade C (Multi-Material Barrier)' }
        : isDairy
        ? { name: 'Vacuum Barrier PA/PE Co-extruded Film', structure: '20µm BOPA / 60µm LLDPE', thickness: '80 µm', otr: '< 20.0 cc/m²·day (ASTM D3985: 23°C, 0% RH)', wvtr: '< 3.0 g/m²·day (ASTM F1249: 38°C, 90% RH)', map: 'Vacuum Degassed Pack (Hermetic Seal)', tier: 'Grade C (Multi-Layer Barrier)' }
        : { name: 'Laser Micro-Perforated MAP LDPE Film', structure: 'Co-extruded LDPE with Laser Micro-perforations (50-100µm)', thickness: '40 µm', otr: 'Provisional: 5,000–35,000 cc/m²·day (Breathable)', wvtr: '12.0 g/m²·day (ASTM F1249 base film)', map: '3-5% O₂, 5-8% CO₂, bal. N₂', tier: 'Grade B (Recyclable LDPE RIC 4)' };

      return {
        id: 'msg-' + Date.now(),
        sender: 'bot',
        text: `### 1. Product Assessment
- **Commodity:** ${commodityName} (${input.category})
- **Moisture:** ${input.moistureContent}% | **Lipid/Fat:** ${input.oilFatContent}% | **pH:** ${input.ph}

### 2. Recommended Packaging Material
**${fallbackMat.name}** (${fallbackMat.tier})

### 3. Material Structure and Thickness
- Structure: \`${fallbackMat.structure}\` | Thickness: **${fallbackMat.thickness}**

### 4. OTR and WVTR Specifications
| Parameter | Value | Test Standard | Status |
| :--- | :--- | :--- | :--- |
| **OTR** | ${fallbackMat.otr} | ASTM D3985 (23°C, 0% RH) | \`Literature-based\` |
| **WVTR** | ${fallbackMat.wvtr} | ASTM F1249 (38°C, 90% RH) | \`Literature-based\` |

### 5. MAP Suitability and Gas Composition
- **Atmosphere:** ${fallbackMat.map}

### 6. Packaging Format
- **Format:** ${input.packagingFormat || 'Flexible Pouch / Pillow Bag'}

### 7. Sealability and Mechanical Requirements
- **Seal:** Hermetic thermal heat-seal (ASTM F1921 / ASTM F2096 tested)

### 8. Recommended Storage and Transportation Conditions
- **Conditions:** ${input.storageType.toUpperCase()} at ${input.storageTempC}°C (${input.relativeHumidityPercent}% RH)

### 9. Shelf-Life Assessment
- **User Target:** ${input.desiredShelfLifeDays} Days *(Commercial target — not guaranteed)*
- **Model Estimate:** Insufficient data for a reliable shelf-life estimate without empirical storage trials.

### 10. Sustainable Alternatives
- **Alternative:** High-barrier Recyclable Mono-Material (RIC 4 / RIC 5 where collection infrastructure exists).

### 11. Reasons for Selecting the Material
- Selected to match critical barrier vulnerabilities and prevent oxidation/decay.

### 12. Important Limitations and Validation Requirements
- Batch verification per ASTM D3985/F1249 and microbial challenge trials required prior to commercial sealing.

### 13. Scientific Sources and Confidence Labels
- **Reference Standards:** Codex Alimentarius, USDA ARS Handbook 66, FSSAI Packaging Reg 2018. Status: \`Literature-based\``,
        timestamp: 'Just now',
        quickReplies: ['Why this material?', 'Compare with Alternatives', 'Check Sustainability', '+ New Chat'],
      };
    }
  },
};
