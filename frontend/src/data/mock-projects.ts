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
}

/* Seeded portfolio — used as a fallback when Supabase is empty / unavailable
 * so Monitoring, Clients and the dashboard remain explorable in the demo. */
export const MOCK_PROJECTS: Project[] = [
  {
    id: "PRJ-2026-0001",
    name: "Bukit Jalil — Detached Residence",
    address: "Jalan Jalil Perkasa 3, Bukit Jalil, 57000 Kuala Lumpur",
    lat: 3.0578,
    lon: 101.6612,
    intakeMode: "photos",
    status: "ready",
    capturedAt: "2026-04-12T10:24:00+08:00",
    thumbnailHue: 120,
    kwp: 12.4,
    annualKwh: 17280,
    annualSavingsRm: 9240,
    paybackYears: 5.9,
    // 12 monthly values summing ≈ 17280; slight dip in Nov–Dec
    monthlyKwh: [1480, 1460, 1500, 1470, 1455, 1430, 1440, 1450, 1445, 1420, 1370, 1360],
    panels: 22,
    planes: 3,
    obstacles: 2,
    capacityFactor: 0.159,
    reportId: null,
    modelGlbPath: null,
    measurementImgPath: null,
    dataJsonPath: null,
  },
  {
    id: "PRJ-2026-0002",
    name: "Petaling Jaya — Light-industrial",
    address: "Jalan 51A/225, Section 51A, 46100 Petaling Jaya, Selangor",
    lat: 3.1073,
    lon: 101.6068,
    intakeMode: "drone_video",
    status: "ready",
    capturedAt: "2026-04-22T09:08:00+08:00",
    thumbnailHue: 200,
    kwp: 52.08,
    annualKwh: 74200,
    annualSavingsRm: 38600,
    paybackYears: 6.1,
    // sums ≈ 74200
    monthlyKwh: [6360, 6280, 6420, 6310, 6260, 6140, 6190, 6230, 6210, 6100, 5880, 5820],
    panels: 84,
    planes: 4,
    obstacles: 3,
    capacityFactor: 0.163,
    reportId: null,
    modelGlbPath: null,
    measurementImgPath: null,
    dataJsonPath: null,
  },
  {
    id: "PRJ-2026-0003",
    name: "Shah Alam — Triple Shoplot",
    address: "Jalan Plumbum P7/P, Seksyen 7, 40000 Shah Alam, Selangor",
    lat: 3.0735,
    lon: 101.5185,
    intakeMode: "photos",
    status: "processing",
    capturedAt: "2026-05-19T13:02:00+08:00",
    thumbnailHue: 50,
    kwp: 0,
    annualKwh: 0,
    annualSavingsRm: 0,
    paybackYears: 0,
    monthlyKwh: [],
    panels: 0,
    planes: 0,
    obstacles: 0,
    capacityFactor: 0,
    reportId: null,
    modelGlbPath: null,
    measurementImgPath: null,
    dataJsonPath: null,
  },
  {
    id: "PRJ-2026-0004",
    name: "Cyberjaya — Office Block",
    address: "Persiaran APEC, 63000 Cyberjaya, Selangor",
    lat: 2.9213,
    lon: 101.6559,
    intakeMode: "drone_video",
    status: "draft",
    capturedAt: "2026-05-10T15:40:00+08:00",
    thumbnailHue: 280,
    kwp: 0,
    annualKwh: 0,
    annualSavingsRm: 0,
    paybackYears: 0,
    monthlyKwh: [],
    panels: 0,
    planes: 0,
    obstacles: 0,
    capacityFactor: 0,
    reportId: null,
    modelGlbPath: null,
    measurementImgPath: null,
    dataJsonPath: null,
  },
  {
    id: "PRJ-2026-0005",
    name: "Ipoh — Heritage Bungalow",
    address: "Jalan Sultan Idris Shah, 30000 Ipoh, Perak",
    lat: 4.5975,
    lon: 101.0901,
    intakeMode: "demo",
    status: "ready",
    capturedAt: "2026-04-05T11:22:00+08:00",
    thumbnailHue: 30,
    kwp: 9.6,
    annualKwh: 13560,
    annualSavingsRm: 7280,
    paybackYears: 6.4,
    // sums ≈ 13560
    monthlyKwh: [1160, 1145, 1175, 1150, 1140, 1120, 1130, 1135, 1130, 1115, 1085, 1075],
    panels: 17,
    planes: 2,
    obstacles: 2,
    capacityFactor: 0.161,
    reportId: null,
    modelGlbPath: null,
    measurementImgPath: null,
    dataJsonPath: null,
  },
  {
    id: "PRJ-2026-0006",
    name: "Penang — Surau Pilot",
    address: "Jalan Masjid Negeri, 11600 Jelutong, Pulau Pinang",
    lat: 5.4141,
    lon: 100.3288,
    intakeMode: "drone_video",
    status: "failed",
    capturedAt: "2026-05-08T09:40:00+08:00",
    thumbnailHue: 90,
    kwp: 0,
    annualKwh: 0,
    annualSavingsRm: 0,
    paybackYears: 0,
    monthlyKwh: [],
    panels: 0,
    planes: 0,
    obstacles: 0,
    capacityFactor: 0,
    reportId: null,
    modelGlbPath: null,
    measurementImgPath: null,
    dataJsonPath: null,
  },
  {
    id: "PRJ-2026-0007",
    name: "Johor Bahru — Warehouse Roof",
    address: "Jalan Tampoi, Kawasan Perindustrian Tampoi, 81200 Johor Bahru, Johor",
    lat: 1.4655,
    lon: 103.7578,
    intakeMode: "photos",
    status: "ready",
    capturedAt: "2026-04-28T08:55:00+08:00",
    thumbnailHue: 160,
    kwp: 84.2,
    annualKwh: 118480,
    annualSavingsRm: 61300,
    paybackYears: 6.0,
    // sums ≈ 118480
    monthlyKwh: [10160, 10010, 10250, 10080, 9990, 9810, 9880, 9930, 9900, 9750, 9400, 9320],
    panels: 136,
    planes: 5,
    obstacles: 4,
    capacityFactor: 0.161,
    reportId: null,
    modelGlbPath: null,
    measurementImgPath: null,
    dataJsonPath: null,
  },
];
