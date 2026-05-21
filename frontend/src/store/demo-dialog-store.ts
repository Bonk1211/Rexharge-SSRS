import { create } from 'zustand'

interface DemoDialogState {
  open: boolean
  openDialog: () => void
  closeDialog: () => void
}

export const useDemoDialog = create<DemoDialogState>((set) => ({
  open: false,
  openDialog: () => set({ open: true }),
  closeDialog: () => set({ open: false }),
}))
