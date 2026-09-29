// TypeScript Domain Models for PackSmart AI (SIH26236)

export type CommodityCategory =
  | 'Fresh Produce'
  | 'Dry Grains & Pulses'
  | 'Fat-Rich & Oils'
  | 'Dairy & Processed'
  | 'Bakery & Confectionery'
  | 'Meat & Marine'
  | 'Noodles & Pasta';

export type StorageType = 'ambient' | 'chilled' | 'frozen';

export type TransportCondition = 'local' | 'long_distance' | 'refrigerated';

export type CostPriority = 'low' | 'balanced' | 'premium';

export type SustainabilityPreference = 'any' | 'recyclable' | 'biodegradable';

export type MAPRequirement = 'none' | 'consider' | 'required';

export interface Commodity {
  id: string;
  name: string;
  scientificName?: string;
  category: CommodityCategory;
  moisturePercent: { min: number; max: number; typical: number };
  fatOilPercent: { min: number; max: number; typical: number };
  typicalPh: { min: number; max: number; typical: number };
  respirationRate?: {
    rateAtAmbient?: number; // mg CO2/kg·h
    rateAtChilled?: number;
    unit: string;
    level: 'Very Low' | 'Low' | 'Moderate' | 'High' | 'Extremely High' | 'Non-respiring';
  };
  ethyleneSensitivity?: 'Low' | 'Moderate' | 'High' | 'Not Applicable';
  recommendedStorage: {
    tempC: { min: number; max: number; typical: number };
    rhPercent: { min: number; max: number; typical: number };
    typicalShelfLifeDays: number;
  };
  primarySpoilageRisks: string[];
  keyPackagingConsiderations: string[];
  description: string;
  isVerified: boolean;
}

export type MaterialCategory =
  | 'Polyolefin Films'
  | 'PET and Polyester Films'
  | 'Aluminium and Metallized Laminates'
  | 'High-Barrier Films'
  | 'Paper-Based Packaging'
  | 'Bio-Based and Compostable Materials'
  | 'Specialty Packaging Films'
  | 'Polyolefins'
  | 'Barrier Films'
  | 'Foil & Metalized Laminates'
  | 'Bio-based & Compostable'
  | 'Paper & Fibre Composites'
  | 'Speciality MAP Films'
  | string;

export interface MaterialCategoryItem {
  id: string;
  name: string;
  count: number;
  description?: string;
}

export interface PackagingMaterial {
  id: string;
  code: string;
  name: string;
  layerStructure?: string;
  category: MaterialCategory;
  description: string;
  // Gas and water barrier properties
  otr: {
    value: number | null; // cc / m² · 24h · 1 atm at 23°C, 0% RH
    unit: string;
    level: 'Very Low Barrier' | 'Moderate Barrier' | 'High Barrier' | 'Ultra-High Barrier' | 'High Breathability' | 'Unknown';
    isIllustrative: boolean;
  };
  wvtr: {
    value: number | null; // g / m² · 24h at 38°C, 90% RH
    unit: string;
    level: 'Poor' | 'Moderate Barrier' | 'High Barrier' | 'Ultra-High Barrier' | 'Unknown';
    isIllustrative: boolean;
  };
  thicknessRangeMicrons: { min: number; max: number; typical: number };
  sealability: 'Moderate' | 'Good' | 'Excellent' | 'Hermetic Heat-Seal';
  mechanicalStrength: {
    tensileRating: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Superior';
    punctureResistance: 'Moderate' | 'Good' | 'High' | 'Superior';
  };
  sustainability: {
    type: 'Conventional Plastic' | 'Recyclable Mono-material' | 'Bio-based Compostable' | 'Fibre Hybrid';
    recyclingCode?: string;
    compostableStandard?: string;
    recyclabilityRating: string;
    carbonFootprintNote: string;
  };
  indicativeCostTier: 'Low ($)' | 'Moderate ($$)' | 'Premium ($$$)';
  indicativePricePerKgRange: string; // e.g. "$1.80 - $2.40 / kg"
  typicalApplications: string[];
  idealCommodityCategories: CommodityCategory[];
  keyLimitations: string[];
  isVerified: boolean;
  sourceAttribution: string;
}

export interface RecommendationInput {
  commodityId?: string;
  customCommodityName?: string;
  category: CommodityCategory;
  moistureContent: number;
  oilFatContent: number;
  ph: number;
  respirationRate?: number;
  respirationUnit?: string;
  storageType: StorageType;
  storageTempC: number;
  relativeHumidityPercent: number;
  desiredShelfLifeDays: number;
  transportCondition: TransportCondition;
  costPriority: CostPriority;
  sustainabilityPreference: SustainabilityPreference;
  mapRequirement: MAPRequirement;
  packagingFormat?: string;
  noodleType?: string;
  notes?: string;
}

export interface MaterialComparisonItem {
  material: PackagingMaterial;
  suitabilityScoreText: string;
  keyTradeoff: string;
  pros: string[];
  cons: string[];
}

export interface PropertyValidation {
  isFullyValidated: boolean;
  statusLevel: string;
  missingProperties: string[];
  validationMessage: string;
  requiredStandards: string[];
}

export interface RecommendationResult {
  id: string;
  createdAt: string;
  input: RecommendationInput;
  commodityName: string;
  primaryMaterial: PackagingMaterial;
  alternativeMaterials: MaterialComparisonItem[];
  suitabilityExplanation: string;
  barrierRequirementsAnalysis: {
    oxygenSensitivity: string;
    moistureVulnerability: string;
    mechanicalDemands: string;
    temperatureCompliance: string;
  };
  mapGuidance?: {
    recommended: boolean;
    gasComposition?: string;
    rationale: string;
  };
  indicativeEconomics: {
    costTier: string;
    shelfLifeExtensionEstimate: string;
    costBenefitSummary: string;
  };
  sustainabilityAssessment: {
    ecoRating: string;
    disposalRoute: string;
    notes: string;
  };
  propertyValidation?: PropertyValidation;
  foodSafetyAlert?: FoodSafetyAlert;
  conflictingInputWarnings?: Array<{
    severity: string;
    title: string;
    description: string;
  }>;
  packagingSpecifications?: {
    otr: PackagingSpecificationItem;
    wvtr: PackagingSpecificationItem;
    filmThickness: PackagingSpecificationItem;
    sealability: PackagingSpecificationItem;
    gasPermeability: PackagingSpecificationItem;
    mechanicalStrength: PackagingSpecificationItem;
    mapSuitability: PackagingSpecificationItem;
    packagingStructure: PackagingSpecificationItem;
  };
  scientificAnalysis?: ScientificDegradationAnalysis;
  packagingEvaluation?: PackagingEvaluationData;
  aiCrossValidation?: AICrossValidationData;
  onlineResearch?: OnlineResearchSource[];
  shelfLifeAssessment?: Record<string, any>;
  labValidationPlan?: Record<string, any>;
  finalDecisionSummary?: Record<string, any>;
  sustainabilityConflict?: string | null;
  sectionA_ProductProfile?: Record<string, any>;
  sectionB_EvidenceProvenance?: Record<string, any>;
  sectionC_MaterialComparison?: Record<string, any>;
  sectionD_RecommendedSolution?: Record<string, any>;
  sectionE_ShelfLifeAssessment?: Record<string, any>;
  sectionF_SafetyAndRegulatory?: Record<string, any>;
  sectionG_ValidationSummary?: Record<string, any>;
  technicalDisclaimer: string;
}

export interface OnlineResearchSource {
  authority: string;
  documentTitle: string;
  regulationRef?: string;
  publicationDate?: string;
  url?: string;
  applicability?: string;
  verificationNotes?: string;
  status?: string;
}

export interface ScientificDegradationAnalysis {
  scientificName?: string;
  primaryDegradationMode?: string;
  oxygenSensitivity?: string;
  moistureVulnerability?: string;
  lightSensitivity?: string;
  criticalQualityLossMechanism?: string;
  modelProvider?: string;
  confidenceScore?: string;
  uncertaintyNotes?: string;
  criticalLimits?: Record<string, any>;
}

export interface PackagingEvaluationData {
  recommendedPrimaryMaterialCode?: string;
  recommendedPrimaryMaterialName?: string;
  suitabilityRationale?: string;
  alternativeCandidateCodes?: string[];
  barrierDemands?: {
    targetOTR?: string;
    targetWVTR?: string;
    lightBarrierRequired?: boolean;
    punctureResistanceRequired?: string;
  };
  mapRecommendation?: {
    isRecommended?: boolean;
    targetGasComposition?: string;
    technicalRationale?: string;
  };
  criticalRisksAndHazards?: string[];
  shelfLifeRealismAssessment?: string;
  laboratoryValidationRequirements?: string[];
  modelProvider?: string;
}

export interface AICrossValidationData {
  validationStatus: string;
  integrityLevel: string;
  modelsInvoked: string[];
  hasDisagreements: boolean;
  disagreements: Array<{
    attribute: string;
    geminiClaim: string;
    groqClaim: string;
    resolution: string;
  }>;
  concordances: string[];
  laboratoryRequirement: string;
}

export interface ProductResearchResult {
  productName: string;
  identifiedCategory: CommodityCategory;
  isFreshProduce: boolean;
  properties: {
    moistureContent: number;
    oilFatContent: number;
    ph: number;
    waterActivity: number;
    respirationRate: number;
    respirationUnit: string;
    storageType: StorageType;
    storageTempC: number;
    relativeHumidityPercent: number;
    desiredShelfLifeDays: number;
    noodleType?: string | null;
  };
  propertyProvenance: Record<string, {
    value: string;
    source: string;
    status: 'measured' | 'sourced' | 'estimated' | 'user_provided' | 'verified';
    confidence: string;
  }>;
  scientificAnalysis: ScientificDegradationAnalysis;
  packagingEvaluation?: PackagingEvaluationData;
  crossValidation: AICrossValidationData;
  sources: OnlineResearchSource[];
  uncertaintyNotes: string;
}

export interface PackagingSpecificationItem {
  name: string;
  recommendedRequirement: string;
  measuredValue: string;
  unit: string;
  explanation: string;
  status: string;
  testMethod: string;
}

export interface FoodSafetyReference {
  authority: string;
  documentTitle: string;
  regulationRef: string;
  publicationDate: string;
  applicability: string;
  verificationNotes: string;
}

export interface FoodSafetyAlert {
  pathogenRisk: string;
  reviewStatus: 'reviewed' | 'pending_expert_review' | 'requires_correction';
  isVerifiedGuidance: boolean;
  sensoryWarning?: string;
  criticalControlPoints: string[];
  verifiedSources?: FoodSafetyReference[];
  regulatoryComplianceNotes?: string;
}


export interface RecommendationHistoryItem {
  id: string;
  date: string;
  commodityName: string;
  category: CommodityCategory;
  storageConditionSummary: string;
  primaryMaterialName: string;
  materialCategory: MaterialCategory;
  shelfLifeTarget: string;
  costTier: string;
  sustainabilityTier: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'success' | 'warning';
}

export interface UserSettings {
  userName: string;
  userRole: string;
  organization: string;
  unitSystem: 'metric' | 'imperial';
  theme: 'light' | 'dark';
  autoSaveHistory: boolean;
  enableRespirationAlerts: boolean;
  enableExportWatermark: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  quickReplies?: string[];
  recommendationData?: {
    commodityName: string;
    primaryMaterial: PackagingMaterial;
    explanation: string;
    resultId?: string;
    otr: string;
    wvtr: string;
    map?: string;
  };
}

export interface ChatPromptPreset {
  id: string;
  title: string;
  prompt: string;
  category: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  organization: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  organization?: string;
  role?: string;
}

export interface AuthResponseData {
  token: string;
  user: AuthUser;
  message: string;
}

export interface SystemHealthInfo {
  status: string;
  service: string;
  version: string;
  database: string;
  databaseProvider: string;
  sihProblemStatement: string;
  framework: string;
}

export interface ProfileUpdateData {
  fullName?: string;
  organization?: string;
  role?: string;
}


