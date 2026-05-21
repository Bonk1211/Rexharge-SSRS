export type TariffCode = "domestic" | "commercial_lv" | "commercial_mv";

export const TARIFF_LABELS: Record<TariffCode, string> = {
  domestic: "Domestik (Rumah)",
  commercial_lv: "Komersial Voltan Rendah",
  commercial_mv: "Komersial Voltan Sederhana",
};

const TARIFF_CODE_LOOKUP: Record<string, TariffCode> = {
  domestic: "domestic",
  commercial_lv: "commercial_lv",
  commercial_mv: "commercial_mv",
  Domestik: "domestic",
  "Domestik (Rumah)": "domestic",
  "Komersial Voltan Rendah": "commercial_lv",
  "Komersial Voltan Sederhana": "commercial_mv",
};

export interface CaseStudyBuilding {
  uuid: string;
  projectIdString: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  monthlyUsageKwh: number;
  tariffCode: TariffCode;
  modelGlbUrl: string;
  measurementImgUrl: string;
  thumbnailUrl: string;
  reportId: string;
  thumbnailHue: number;
}

export const CASE_STUDY_BUILDINGS: CaseStudyBuilding[] = [
  {
    uuid: "11111111-1111-4111-8111-111111111111",
    projectIdString: "PRJ-CS-SSU-UM",
    name: "SSU UM No.2 Electrical Substation",
    address: "University Malaya Campus, 50603 Kuala Lumpur",
    lat: 3.12808,
    lon: 101.65101,
    monthlyUsageKwh: 5000,
    tariffCode: "commercial_lv",
    modelGlbUrl: "https://solar.limziyang.ml/static/models/video_2/3DModel.glb",
    measurementImgUrl: "https://solar.limziyang.ml/static/measurement/ssu.png",
    thumbnailUrl: "https://solar.limziyang.ml/static/SSU.png",
    reportId: "ssu-um",
    thumbnailHue: 120,
  },
  {
    uuid: "22222222-2222-4222-8222-222222222222",
    projectIdString: "PRJ-CS-STAR-GROCER",
    name: "Star Grocer",
    address: "Taman Paramount, 46000 Petaling Jaya, Selangor",
    lat: 3.106827,
    lon: 101.624123,
    monthlyUsageKwh: 10000,
    tariffCode: "commercial_lv",
    modelGlbUrl: "https://solar.limziyang.ml/static/models/video_5/3DModel.glb",
    measurementImgUrl:
      "https://solar.limziyang.ml/static/measurement/star_grocer.png",
    thumbnailUrl: "https://solar.limziyang.ml/static/STAR_GROCER.jpg",
    reportId: "star-grocer",
    thumbnailHue: 30,
  },
  {
    uuid: "33333333-3333-4333-8333-333333333333",
    projectIdString: "PRJ-CS-RAINBOW",
    name: "Rainbow Recreation Center",
    address: "Taman Paramount, 46000 Petaling Jaya, Selangor",
    lat: 3.110072,
    lon: 101.622002,
    monthlyUsageKwh: 8000,
    tariffCode: "commercial_lv",
    modelGlbUrl: "https://solar.limziyang.ml/static/models/video_6/3DModel.glb",
    measurementImgUrl:
      "https://solar.limziyang.ml/static/measurement/rainbow.png",
    thumbnailUrl: "https://solar.limziyang.ml/static/RAINBOW.png",
    reportId: "rainbow",
    thumbnailHue: 260,
  },
  {
    uuid: "44444444-4444-4444-8444-444444444444",
    projectIdString: "PRJ-CS-HOUSEHOLD",
    name: "Household",
    address: "Taman Paramount, 46000 Petaling Jaya, Selangor",
    lat: 3.108156,
    lon: 101.622418,
    monthlyUsageKwh: 600,
    tariffCode: "domestic",
    modelGlbUrl: "https://solar.limziyang.ml/static/models/video_4/3DModel.glb",
    measurementImgUrl:
      "https://solar.limziyang.ml/static/measurement/household.png",
    thumbnailUrl: "https://solar.limziyang.ml/static/HOUSEHOLD.png",
    reportId: "household",
    thumbnailHue: 200,
  },
  {
    uuid: "55555555-5555-4555-8555-555555555555",
    projectIdString: "PRJ-CS-ECO-HORIZON",
    name: "Eco Horizon",
    address: "Eco Horizon, Batu Kawan, 14110 Pulau Pinang",
    lat: 5.237826,
    lon: 100.452277,
    monthlyUsageKwh: 700,
    tariffCode: "domestic",
    modelGlbUrl: "https://solar.limziyang.ml/static/models/video_7/3DModel.glb",
    measurementImgUrl:
      "https://solar.limziyang.ml/static/measurement/eco_horizon.png",
    thumbnailUrl: "https://solar.limziyang.ml/static/ECO_HORIZON.PNG",
    reportId: "eco-horizon",
    thumbnailHue: 90,
  },
];

export function tariffCodeFromString(
  t: string | null | undefined,
): TariffCode | undefined {
  if (!t) return undefined;
  const code = TARIFF_CODE_LOOKUP[t];
  if (!code && import.meta.env.DEV) {
    console.warn("[tariff] unknown tariff value:", t);
  }
  return code;
}

export function formatTariff(t: string | null | undefined): string {
  const code = tariffCodeFromString(t);
  return code ? TARIFF_LABELS[code] : "—";
}
