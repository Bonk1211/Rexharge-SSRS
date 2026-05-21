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
