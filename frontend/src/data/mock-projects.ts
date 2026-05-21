import {
  CASE_STUDY_BUILDINGS,
  type CaseStudyBuilding,
} from "./case-study-buildings";

export type ProjectStatus = "ready" | "processing" | "draft" | "failed";
export type IntakeMode = "drone_video" | "photos" | "demo";

export interface Project {
  id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  intakeMode: IntakeMode;
  status: ProjectStatus;
  capturedAt: string;
  thumbnailHue: number;
  kwp: number;
  annualKwh: number;
  annualSavingsRm: number;
  paybackYears: number;
  monthlyKwh: number[];
  panels: number;
  planes: number;
  obstacles: number;
  capacityFactor: number;
  reportId?: string | null;
  modelGlbPath?: string | null;
  measurementImgPath?: string | null;
  dataJsonPath?: string | null;
  thumbnailUrl?: string | null;
  irradianceWm2?: number;
  ambientTempC?: number;
  windSpeedMs?: number;
  humidityPercent?: number;
  cloudCoverPercent?: number;
  roofCoveragePercent?: number;
  shadingLossPercent?: number;
  inverterModelSku?: string;
  inverterUnitCapacityKw?: number;
  monthlyUsageKwh?: number;
  nemSellbackEnabled?: boolean;
  tariffType?: string;
}

const CAPTURED_AT = "2026-05-22T10:00:00+08:00";

const MONTHLY_SHAPE = [
  0.0855, 0.0844, 0.0867, 0.0850, 0.0841, 0.0827,
  0.0832, 0.0838, 0.0835, 0.0825, 0.0796, 0.0790,
];

function monthly(annual: number): number[] {
  if (!annual) return [];
  return MONTHLY_SHAPE.map((f) => Math.round(annual * f));
}

type PerfOverride = Pick<
  Project,
  | "kwp"
  | "annualKwh"
  | "annualSavingsRm"
  | "paybackYears"
  | "panels"
  | "capacityFactor"
>;

const PERF_OVERRIDES: Record<string, PerfOverride> = {
  "ssu-um": {
    kwp: 116.6,
    annualKwh: 162900,
    annualSavingsRm: 33327,
    paybackYears: 13.3,
    panels: 188,
    capacityFactor: 0.159,
  },
  "eco-horizon": {
    kwp: 64.5,
    annualKwh: 90100,
    annualSavingsRm: 3716,
    paybackYears: 65.9,
    panels: 104,
    capacityFactor: 0.161,
  },
};

function makeProject(b: CaseStudyBuilding): Project {
  const perf = PERF_OVERRIDES[b.reportId];
  return {
    id: b.uuid,
    name: b.name,
    address: b.address,
    lat: b.lat,
    lon: b.lon,
    intakeMode: "drone_video",
    status: "ready",
    capturedAt: CAPTURED_AT,
    thumbnailHue: b.thumbnailHue,
    kwp: perf?.kwp ?? 0,
    annualKwh: perf?.annualKwh ?? 0,
    annualSavingsRm: perf?.annualSavingsRm ?? 0,
    paybackYears: perf?.paybackYears ?? 0,
    monthlyKwh: perf?.annualKwh ? monthly(perf.annualKwh) : [],
    panels: perf?.panels ?? 0,
    planes: 0,
    obstacles: 0,
    capacityFactor: perf?.capacityFactor ?? 0,
    reportId: b.reportId,
    modelGlbPath: b.modelGlbUrl,
    measurementImgPath: b.measurementImgUrl,
    thumbnailUrl: b.thumbnailUrl,
    monthlyUsageKwh: b.monthlyUsageKwh,
    tariffType: b.tariffCode,
  };
}

export const MOCK_PROJECTS: Project[] = CASE_STUDY_BUILDINGS.map(makeProject);
