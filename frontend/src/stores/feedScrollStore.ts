import { create } from 'zustand';
import type { PostSummary } from '../types/post';

const TTL_MS = 5 * 60 * 1000;

interface FeedSnapshot {
  items: PostSummary[];
  nextCursor: string | null;
  hasNext: boolean;
  scrollY: number;
  savedAt: number;
}

interface FeedScrollState {
  snapshot: FeedSnapshot | null;
  save: (snapshot: Omit<FeedSnapshot, 'savedAt'>) => void;
  consume: () => FeedSnapshot | null;
  clear: () => void;
}

export const useFeedScrollStore = create<FeedScrollState>((set, get) => ({
  snapshot: null,
  save: (snapshot) => set({ snapshot: { ...snapshot, savedAt: Date.now() } }),
  consume: () => {
    const snap = get().snapshot;
    if (!snap) return null;
    if (Date.now() - snap.savedAt > TTL_MS) {
      set({ snapshot: null });
      return null;
    }
    set({ snapshot: null });
    return snap;
  },
  clear: () => set({ snapshot: null }),
}));
