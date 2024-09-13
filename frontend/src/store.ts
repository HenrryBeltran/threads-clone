import { create } from "zustand";
import { Resource } from "./components/upload-album-view";

type BackdropStore = {
  open: boolean;
  toggle: () => void;
  show: () => void;
  hide: () => void;
};

export const useBackdropStore = create<BackdropStore>()((set) => ({
  open: false,
  toggle: () => set((state) => ({ open: !state.open })),
  show: () => set({ open: true }),
  hide: () => set({ open: false }),
}));

type ThreadModalStore = {
  data: { open: boolean; id?: string; rootId: string | null; parentId: string | null };
  toggle: () => void;
  show: (id?: string, rootId?: string | null, parentId?: string | null) => void;
  hide: () => void;
};

export const useThreadModalStore = create<ThreadModalStore>()((set) => ({
  data: { open: false, rootId: null, parentId: null },
  toggle: () =>
    set((state) => ({ data: { open: !state.data.open, rootId: state.data.rootId, parentId: state.data.parentId } })),
  show: (id?: string, rootId?: string | null, parentId?: string | null) =>
    set((state) => ({
      data: {
        open: true,
        id,
        rootId: rootId === undefined ? state.data.rootId : rootId,
        parentId: parentId === undefined ? state.data.parentId : parentId,
      },
    })),
  hide: () => set({ data: { open: false, rootId: null, parentId: null } }),
}));

export type Thread = {
  text: string;
  images: Resource[];
};

type ThreadStore = {
  thread: Thread[];
  currentIndex: number;
  changeCurrentIndexTo: (index: number) => void;
  editTextFromThread: (index: number, text: string, mention?: string) => void;
  addImageToThread: (index: number, images: Resource[], imageLimitCallback?: () => void) => void;
  removeImageToThread: (threadIndex: number, imageIndex: number) => void;
  addThread: (mention?: string) => void;
  removeThread: (index: number) => void;
  resetThread: () => void;
};

export const useThreadStore = create<ThreadStore>()((set) => ({
  thread: [{ text: "", images: [] }],
  currentIndex: 0,
  changeCurrentIndexTo: (index: number) => set((state) => ({ thread: state.thread, currentIndex: index })),
  editTextFromThread: (index: number, text: string, mention?: string) =>
    set((state) => {
      const newThread = state.thread.map((t, i) => {
        if (i === index) {
          return {
            text,
            images: t.images,
          };
        }
        return t;
      });

      return { thread: newThread, currentIndex: state.currentIndex };
    }),
  addImageToThread: (index: number, newImages: Resource[], imageLimitCallback?: () => void) =>
    set((state) => {
      const thread = state.thread[state.currentIndex];
      const totalLength = thread.images.length + newImages.length;

      if (totalLength >= 10) {
        if (imageLimitCallback !== undefined) {
          imageLimitCallback();
        }

        const upTo10List: Resource[] = [];

        for (let i = 0; i < 10; i++) {
          const newItem = thread.images[i] !== undefined ? thread.images[i] : newImages[i - thread.images.length];
          upTo10List.push(newItem);
        }

        const newThreads = state.thread.map((t, i) => {
          if (i === state.currentIndex) {
            return {
              text: t.text,
              images: upTo10List,
            };
          }
          return t;
        });

        return {
          thread: newThreads,
        };
      }

      const newThreads = state.thread.map((t, i) => {
        if (i === state.currentIndex) {
          return {
            text: t.text,
            images: [...thread.images, ...newImages],
          };
        }
        return t;
      });

      return { thread: newThreads, currentIndex: state.currentIndex };
    }),
  removeImageToThread: (threadIndex: number, imageIndex: number) =>
    set((state) => {
      const newThread = state.thread.map((t, idx) => {
        if (idx === threadIndex) {
          return {
            text: t.text,
            images: t.images.filter((_, i) => i !== imageIndex),
          };
        }

        return t;
      });

      return { thread: newThread, currentIndex: state.currentIndex };
    }),
  addThread: (mention?: string) =>
    set((state) => {
      const newThread = { text: "", images: [] };
      const newThreadList = [...state.thread, newThread];

      return { thread: newThreadList, currentIndex: state.currentIndex };
    }),
  removeThread: (index: number) =>
    set((state) => {
      const newThread = state.thread.filter((_, i) => i !== index);

      return { thread: newThread, currentIndex: newThread.length - 1 };
    }),
  resetThread: () =>
    set(() => ({
      thread: [{ text: "", images: [] }],
    })),
}));
