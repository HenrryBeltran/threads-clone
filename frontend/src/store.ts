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
  data: { open: boolean; content?: string; id?: string; rootId: string | null };
  toggle: () => void;
  show: (content?: string, id?: string, rootId?: string | null) => void;
  hide: () => void;
};

export const useCreateThreadStore = create<CreateThreadState>()((set) => ({
  data: { open: false, rootId: null },
  toggle: () => set((state) => ({ data: { open: !state.data.open, rootId: state.data.rootId } })),
  show: (content?: string, id?: string, rootId?: string | null) =>
    set((state) => ({ data: { open: true, content, id, rootId: rootId === undefined ? state.data.rootId : rootId } })),
  hide: () => set({ data: { open: false, rootId: null } }),
}));
