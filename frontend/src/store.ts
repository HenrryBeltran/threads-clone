import { create } from "zustand";

type BackdropState = {
  open: boolean;
  toggle: () => void;
  show: () => void;
  hide: () => void;
};

export const useBackdropStore = create<BackdropState>()((set) => ({
  open: false,
  toggle: () => set((state) => ({ open: !state.open })),
  show: () => set({ open: true }),
  hide: () => set({ open: false }),
}));

type CreateThreadState = {
  data: { open: boolean; content?: string };
  toggle: () => void;
  show: (content?: string) => void;
  hide: () => void;
};

export const useCreateThreadStore = create<CreateThreadState>()((set) => ({
  data: { open: false },
  toggle: () => set((state) => ({ data: { open: !state.data.open } })),
  show: (content?: string) => set({ data: { open: true, content } }),
  hide: () => set({ data: { open: false } }),
}));
