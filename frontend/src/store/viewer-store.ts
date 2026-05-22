import { create } from "zustand";

export type Layer = "mesh" | "planes" | "obstacles" | "panels" | "shading" | "sunpath" | "grid" | "irradiance" | "wireframe";

interface ViewerState {
  layers: Record<Layer, boolean>;
  toggleLayer: (l: Layer) => void;
  hour: number; // 6-19 in solar hours
  setHour: (h: number) => void;
  edgeSetback: number;
  obstacleSetback: number;
  panelGap: number;
  moduleW: number; // watts
  selectedPanel: number | null;
  setSelectedPanel: (i: number | null) => void;
  setParam: (k: "edgeSetback" | "obstacleSetback" | "panelGap" | "moduleW", v: number) => void;
}

export const useViewerStore = create<ViewerState>((set) => ({
  layers: {
    mesh: true,
    planes: true,
    obstacles: true,
    panels: true,
    shading: false,
    sunpath: true,
    grid: true,
    irradiance: false,
    wireframe: false,
  },
  toggleLayer: (l) =>
    set((s) => ({ layers: { ...s.layers, [l]: !s.layers[l] } })),
  hour: 12.5,
  setHour: (h) => set({ hour: h }),
  edgeSetback: 0.4,
  obstacleSetback: 0.5,
  panelGap: 0.05,
  moduleW: 620,
  selectedPanel: null,
  setSelectedPanel: (i) => set({ selectedPanel: i }),
  setParam: (k, v) => set({ [k]: v } as Partial<ViewerState>),
}));
