import type { Project, ProjectStatus, IntakeMode } from '../data/projects'
import { PROJECTS } from '../data/projects'

// Frontend-only build: this module serves static demo data.
// There is no backend, database, or storage connection.

// ---------- types ----------

export interface NewProjectInput {
  name: string
  address?: string
  lat: number
  lon: number
  intakeMode: IntakeMode
  status?: ProjectStatus
}

export interface ProjectEvent {
  id: number
  projectId: string
  kind: string
  message: string | null
  meta: Record<string, unknown>
  createdAt: string
}

// ---------- API (static) ----------

export async function listProjects(): Promise<Project[]> {
  return PROJECTS
}

export async function getProject(id: string): Promise<Project | null> {
  return PROJECTS.find((p) => p.id === id) ?? null
}

/** Local-only project creation — fabricates a draft Project in memory.
 * Nothing is persisted; this exists so the New Project UI flow stays interactive. */
export async function createProject(input: NewProjectInput): Promise<Project> {
  return {
    id: `local-${Date.now()}`,
    name: input.name,
    address: input.address ?? '',
    lat: input.lat,
    lon: input.lon,
    intakeMode: input.intakeMode,
    status: input.status ?? 'draft',
    capturedAt: '',
    thumbnailHue: 120,
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
    thumbnailUrl: null,
  }
}

export async function listEvents(_projectId: string): Promise<ProjectEvent[]> {
  return []
}
