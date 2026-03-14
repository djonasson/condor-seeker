import { create } from 'zustand'

type UiState = {
  activeModal: string | null
  isLoading: boolean
  currentTab: string
  setActiveModal: (modal: string | null) => void
  setIsLoading: (loading: boolean) => void
  setCurrentTab: (tab: string) => void
}

export const useUiStore = create<UiState>()((set) => ({
  activeModal: null,
  isLoading: false,
  currentTab: '',
  setActiveModal: (activeModal) => set({ activeModal }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setCurrentTab: (currentTab) => set({ currentTab }),
}))
