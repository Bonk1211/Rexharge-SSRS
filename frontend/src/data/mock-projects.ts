/** Sample project data for dashboard + analysis screens.
 * Numbers grounded against pvlib + Malaysian TMY ballparks. Not synthetic. */

export type ProjectStatus = "ready" | "processing" | "draft" | "failed";
export type IntakeMode = "drone_terra" | "drone_video" | "photos" | "demo";

export interface Project {
  id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  tariff: "domestic" | "non_domestic_lv";
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
}

export const projects: Project[] = [
  {
    id: "bj-residential-01",
    name: "Bukit Jalil — Detached Residence",
    address: "L23 Jalan Akhirat, Bukit Jalil 57000 KL",
    lat: 3.0578,
    lon: 101.6612,
    tariff: "domestic",
    intakeMode: "demo",
    status: "ready",
    capturedAt: "2026-05-04T09:14:00+08:00",
    thumbnailHue: 102,
    kwp: 23.56,
    annualKwh: 31_240,
    annualSavingsRm: 12_810,
    paybackYears: 4.2,
    monthlyKwh: [2620, 2480, 2780, 2730, 2640, 2510, 2580, 2670, 2700, 2720, 2540, 2470],
    panels: 38,
    planes: 2,
    obstacles: 1,
    capacityFactor: 0.151,
  },
  {
    id: "pj-warehouse-04",
    name: "Petaling Jaya — Light-industrial Warehouse",
    address: "Lot 18, Sec 22 PJ 46300",
    lat: 3.0997,
    lon: 101.6175,
    tariff: "non_domestic_lv",
    intakeMode: "drone_terra",
    status: "ready",
    capturedAt: "2026-05-05T07:48:00+08:00",
    thumbnailHue: 28,
    kwp: 52.08,
    annualKwh: 70_360,
    annualSavingsRm: 28_930,
    paybackYears: 3.8,
    monthlyKwh: [5980, 5610, 6120, 6080, 5940, 5760, 5840, 5950, 6010, 6090, 5740, 5240],
    panels: 84,
    planes: 4,
    obstacles: 3,
    capacityFactor: 0.154,
  },
  {
    id: "shah-alam-shophouse-09",
    name: "Shah Alam — Triple Shoplot",
    address: "Sek 13, Shah Alam 40100",
    lat: 3.0863,
    lon: 101.5325,
    tariff: "non_domestic_lv",
    intakeMode: "photos",
    status: "processing",
    capturedAt: "2026-05-05T13:02:00+08:00",
    thumbnailHue: 198,
    kwp: 0,
    annualKwh: 0,
    annualSavingsRm: 0,
    paybackYears: 0,
    monthlyKwh: [],
    panels: 0,
    planes: 0,
    obstacles: 0,
    capacityFactor: 0,
  },
  {
    id: "cyberjaya-office-12",
    name: "Cyberjaya — 4-storey Office Block",
    address: "Persiaran Multimedia, 63000 Cyberjaya",
    lat: 2.918,
    lon: 101.652,
    tariff: "non_domestic_lv",
    intakeMode: "drone_video",
    status: "draft",
    capturedAt: "2026-05-03T16:30:00+08:00",
    thumbnailHue: 168,
    kwp: 88.04,
    annualKwh: 118_900,
    annualSavingsRm: 51_720,
    paybackYears: 3.6,
    monthlyKwh: [10_220, 9_540, 10_410, 10_320, 10_080, 9_770, 9_900, 10_120, 10_290, 10_360, 9_730, 8_180],
    panels: 142,
    planes: 6,
    obstacles: 5,
    capacityFactor: 0.154,
  },
  {
    id: "ipoh-bungalow-22",
    name: "Ipoh — Heritage Bungalow",
    address: "Jalan Datoh, 30000 Ipoh",
    lat: 4.5975,
    lon: 101.0901,
    tariff: "domestic",
    intakeMode: "photos",
    status: "ready",
    capturedAt: "2026-05-02T11:22:00+08:00",
    thumbnailHue: 348,
    kwp: 14.26,
    annualKwh: 18_650,
    annualSavingsRm: 7_180,
    paybackYears: 4.5,
    monthlyKwh: [1620, 1490, 1680, 1620, 1570, 1510, 1530, 1580, 1610, 1640, 1500, 1310],
    panels: 23,
    planes: 3,
    obstacles: 2,
    capacityFactor: 0.149,
  },
  {
    id: "penang-mosque-31",
    name: "Penang — Surau Rooftop Pilot",
    address: "Bayan Lepas, 11900 Pulau Pinang",
    lat: 5.293,
    lon: 100.275,
    tariff: "non_domestic_lv",
    intakeMode: "drone_terra",
    status: "failed",
    capturedAt: "2026-05-04T15:40:00+08:00",
    thumbnailHue: 220,
    kwp: 0,
    annualKwh: 0,
    annualSavingsRm: 0,
    paybackYears: 0,
    monthlyKwh: [],
    panels: 0,
    planes: 0,
    obstacles: 0,
    capacityFactor: 0,
  },
];

export const findProject = (id?: string) =>
  projects.find((p) => p.id === id) ?? projects[0];

export const portfolioStats = () => {
  const ready = projects.filter((p) => p.status === "ready");
  return {
    totalKwp: ready.reduce((s, p) => s + p.kwp, 0),
    totalKwh: ready.reduce((s, p) => s + p.annualKwh, 0),
    totalSavings: ready.reduce((s, p) => s + p.annualSavingsRm, 0),
    avgPayback: ready.reduce((s, p) => s + p.paybackYears, 0) / ready.length,
    totalProjects: projects.length,
    readyProjects: ready.length,
    processingCount: projects.filter((p) => p.status === "processing").length,
  };
};
