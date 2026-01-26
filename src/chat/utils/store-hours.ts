export type StoreHours = {
    open: string;   // "09:00"
    close: string;  // "19:00"
};

export const DEFAULT_STORE_HOURS: Record<number, StoreHours | null> = {
    0: null, // Sunday closed
    1: { open: '09:00', close: '19:00' },
    2: { open: '09:00', close: '19:00' },
    3: { open: '09:00', close: '19:00' },
    4: { open: '09:00', close: '19:00' },
    5: { open: '09:00', close: '19:00' },
    6: { open: '09:00', close: '18:00' }, // Saturday shorter
};
