import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listProjects,
  getProject,
  createProject,
  uploadAsset,
  getSignedUrl,
  type NewProjectInput,
} from '../lib/projects-api'
import type { Project } from '../data/mock-projects'

// ---------- query keys ----------

const KEYS = {
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  signedUrl: (bucket: string, path: string) => ['signed-url', bucket, path] as const,
}

// ---------- hooks ----------

export function useProjects() {
  return useQuery({
    queryKey: KEYS.projects,
    queryFn: listProjects,
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: KEYS.project(id),
    queryFn: () => getProject(id),
    enabled: !!id,
  })
}

export function usePortfolioStats() {
  const { data: projects = [] } = useProjects()
  const ready = projects.filter((p: Project) => p.status === 'ready')
  return {
    totalKwp:       ready.reduce((s: number, p: Project) => s + p.kwp, 0),
    totalKwh:       ready.reduce((s: number, p: Project) => s + p.annualKwh, 0),
    totalSavings:   ready.reduce((s: number, p: Project) => s + p.annualSavingsRm, 0),
    avgPayback:     ready.length ? ready.reduce((s: number, p: Project) => s + p.paybackYears, 0) / ready.length : 0,
    totalProjects:  projects.length,
    readyProjects:  ready.length,
    processingCount: projects.filter((p: Project) => p.status === 'processing').length,
  }
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: NewProjectInput) => createProject(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.projects }),
  })
}

export function useUploadAsset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      projectId,
      file,
      kind,
    }: {
      projectId: string
      file: File
      kind: Parameters<typeof uploadAsset>[2]
    }) => uploadAsset(projectId, file, kind),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: KEYS.project(vars.projectId) }),
  })
}

export function useSignedUrl(bucket: string | undefined, path: string | undefined) {
  return useQuery({
    queryKey: KEYS.signedUrl(bucket ?? '', path ?? ''),
    queryFn: () => getSignedUrl(bucket!, path!),
    enabled: !!bucket && !!path,
    staleTime: 50 * 60 * 1000, // refresh before 1-hour expiry
  })
}
