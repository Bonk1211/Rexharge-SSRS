import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listProjects,
  getProject,
  createProject,
  type NewProjectInput,
} from '../lib/projects-api'
import type { Project } from '../data/projects'
import {
  buildGaugeValues,
  buildHourlyPowerCurve,
  buildMonthlyYieldVsTarget,
} from '../lib/dashboard-series'

// ---------- query keys ----------

const KEYS = {
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
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

export function usePortfolioCharts() {
  const { data: projects = [] } = useProjects()
  return {
    powerCurve: buildHourlyPowerCurve(projects),
    monthly: buildMonthlyYieldVsTarget(projects),
    gauges: buildGaugeValues(projects),
  }
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: NewProjectInput) => createProject(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.projects }),
  })
}

