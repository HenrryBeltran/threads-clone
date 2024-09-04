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
  data: { open: boolean; content?: string; id?: string; rootId: string | null; parentId: string | null };
  toggle: () => void;
  show: (content?: string, id?: string, rootId?: string | null, parentId?: string | null) => void;
  hide: () => void;
};

export const useCreateThreadStore = create<CreateThreadState>()((set) => ({
  data: { open: false, rootId: null, parentId: null },
  toggle: () =>
    set((state) => ({ data: { open: !state.data.open, rootId: state.data.rootId, parentId: state.data.parentId } })),
  show: (content?: string, id?: string, rootId?: string | null, parentId?: string | null) =>
    set((state) => ({
      data: {
        open: true,
        content,
        id,
        rootId: rootId === undefined ? state.data.rootId : rootId,
        parentId: parentId === undefined ? state.data.parentId : parentId,
      },
    })),
  hide: () => set({ data: { open: false, rootId: null, parentId: null } }),
}));
