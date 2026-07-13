import { create } from 'zustand';
import { type TrackedEvent } from '@ecom/types';

/**
 * Zustand store PRIVATE to the analytics MFE.
 *
 * It is fed exclusively by the event-bus bridge (useEventBridge): this MFE
 * observes the rest of the system through the shared event contract and never
 * reads another MFE's state directly.
 */

const MAX_EVENTS = 50;

interface AnalyticsState {
  events: TrackedEvent[];
  cartValue: number;
  record: (event: Omit<TrackedEvent, 'id' | 'timestamp'>) => void;
  addCartValue: (amount: number) => void;
  clear: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>()((set) => ({
  events: [],
  cartValue: 0,

  record: (event) =>
    set((state) => ({
      events: [{ ...event, id: crypto.randomUUID(), timestamp: Date.now() }, ...state.events].slice(
        0,
        MAX_EVENTS,
      ),
    })),

  addCartValue: (amount) => set((state) => ({ cartValue: state.cartValue + amount })),

  clear: () => set({ events: [], cartValue: 0 }),
}));

/** Derived KPI selectors. */
export const selectTotalEvents = (state: AnalyticsState) => state.events.length;
export const selectCountByName = (name: string) => (state: AnalyticsState) =>
  state.events.filter((event) => event.name === name).length;
