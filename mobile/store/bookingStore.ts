import { create } from 'zustand';
import { BookingDraft } from '@/types';

interface BookingState extends BookingDraft {
  setService: (service: BookingDraft['service']) => void;
  setDate: (date: string) => void;
  setSlotAndBarber: (slot: string, barber: BookingDraft['barber']) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  service: null,
  date: null,
  slot: null,
  barber: null,
  setService: (service) => set({ service, date: null, slot: null, barber: null }),
  setDate: (date) => set({ date, slot: null, barber: null }),
  setSlotAndBarber: (slot, barber) => set({ slot, barber }),
  reset: () => set({ service: null, date: null, slot: null, barber: null }),
}));
