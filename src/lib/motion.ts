// Emil Kowalski design-eng: custom easing curves
// framer-motion accepts cubic-bezier as array [x1, y1, x2, y2]
export const EASE_OUT = [0.23, 1, 0.32, 1] as const; // strong ease-out: entrances
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const; // strong ease-in-out: on-screen movement
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const; // iOS-like sheet