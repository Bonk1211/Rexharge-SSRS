import { supabase } from './supabase'
import type { Project, ProjectStatus, IntakeMode } from '../data/mock-projects'

const DEV_OWNER_ID = import.meta.env.VITE_DEV_OWNER_ID as string

// ---------- types ----------

export interface NewProjectInput {
  name: string
  address?: string
  lat: number
  lon: number
  tariff: 'domestic' | 'non_domestic_lv'
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

type AssetKind = 'source_video' | 'source_photo' | 'obj' | 'glb' | 'measurement' | 'report_pdf' | 'data_json'

// ---------- helpers ----------

function bucketFor(kind: AssetKind): string {
  if (kind === 'glb' || kind === 'obj') return 'project-models'
  if (kind === 'measurement') return 'project-images'
  return 'project-data'
}

const num = (v: unknown, d = 0): number => {
  if (v === null || v === undefined) return d
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(n) ? n : d
}

function rowToProject(row: Record<string, unknown>): Project {
  return {
    id:               row.id as string,
    name:             row.name as string,
    address:          (row.address as string) ?? '',
    lat:              num(row.lat),
    lon:              num(row.lon),
    tariff:           row.tariff as Project['tariff'],
    intakeMode:       row.intake_mode as IntakeMode,
    status:           row.status as ProjectStatus,
    capturedAt:       (row.captured_at as string) ?? '',
    thumbnailHue:     num(row.thumbnail_hue, 120),
    kwp:              num(row.kwp),
    annualKwh:        num(row.annual_kwh),
    annualSavingsRm:  num(row.annual_savings_rm),
    paybackYears:     num(row.payback_years),
    monthlyKwh:       Array.isArray(row.monthly_kwh)
                        ? (row.monthly_kwh as unknown[]).map(x => num(x))
                        : [],
    panels:           num(row.panels),
    planes:           num(row.planes),
    obstacles:        num(row.obstacles),
    capacityFactor:     num(row.capacity_factor),
    reportId:           (row.report_id as string | null) ?? null,
    modelGlbPath:       (row.model_glb_path as string | null) ?? null,
    measurementImgPath: (row.measurement_img_path as string | null) ?? null,
    dataJsonPath:       (row.data_json_path as string | null) ?? null,
  }
}

function projectToRow(input: NewProjectInput) {
  return {
    owner_id:     DEV_OWNER_ID,
    name:         input.name,
    address:      input.address ?? null,
    lat:          input.lat,
    lon:          input.lon,
    tariff:       input.tariff,
    intake_mode:  input.intakeMode,
    status:       input.status ?? 'draft',
  }
}

// ---------- API ----------

export async function listProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as Record<string, unknown>[]).map(rowToProject)
}

export async function getProject(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()
  if (error) { if (error.code === 'PGRST116') return null; throw error }
  return rowToProject(data as Record<string, unknown>)
}

export async function createProject(input: NewProjectInput): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert(projectToRow(input))
    .select()
    .single()
  if (error) throw error
  return rowToProject(data as Record<string, unknown>)
}

export async function updateProject(id: string, patch: Partial<Project> & Record<string, unknown>): Promise<Project> {
  // accept both camelCase (from callers) and snake_case patch keys
  const snakePatch: Record<string, unknown> = {}
  const camelToSnake: Record<string, string> = {
    intakeMode: 'intake_mode',
    thumbnailHue: 'thumbnail_hue',
    annualKwh: 'annual_kwh',
    annualSavingsRm: 'annual_savings_rm',
    paybackYears: 'payback_years',
    monthlyKwh: 'monthly_kwh',
    capacityFactor: 'capacity_factor',
    capturedAt: 'captured_at',
    dataJsonPath: 'data_json_path',
    measurementImgPath: 'measurement_img_path',
    modelGlbPath: 'model_glb_path',
  }
  for (const [k, v] of Object.entries(patch)) {
    snakePatch[camelToSnake[k] ?? k] = v
  }
  const { data, error } = await supabase
    .from('projects')
    .update(snakePatch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return rowToProject(data as Record<string, unknown>)
}

export async function uploadAsset(
  projectId: string,
  file: File,
  kind: AssetKind,
): Promise<{ path: string; bucket: string }> {
  const bucket = bucketFor(kind)
  const safeName = file.name.replace(/[^A-Za-z0-9._-]+/g, '_')
  const path = `${DEV_OWNER_ID}/${projectId}/${Date.now()}_${safeName}`
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true })
  if (error) throw error

  await supabase.from('project_assets').insert({
    project_id: projectId,
    kind,
    bucket,
    path,
    size_bytes: file.size,
    mime: file.type || null,
  })

  return { path, bucket }
}

export async function getSignedUrl(bucket: string, path: string, expiresIn = 3600): Promise<string> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresIn)
  if (error) throw error
  return data.signedUrl
}

export async function listEvents(projectId: string): Promise<ProjectEvent[]> {
  const { data, error } = await supabase
    .from('project_events')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data as Record<string, unknown>[]).map(row => ({
    id:        row.id as number,
    projectId: row.project_id as string,
    kind:      row.kind as string,
    message:   row.message as string | null,
    meta:      (row.meta as Record<string, unknown>) ?? {},
    createdAt: row.created_at as string,
  }))
}

export async function logEvent(
  projectId: string,
  kind: string,
  message?: string,
  meta?: Record<string, unknown>,
): Promise<void> {
  const { error } = await supabase.from('project_events').insert({
    project_id: projectId,
    kind,
    message: message ?? null,
    meta: meta ?? {},
  })
  if (error) throw error
}
