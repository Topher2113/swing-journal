// Set EXPO_PUBLIC_MOTION_TRACKING_ENABLED=false in .env to hide all motion tracking UI.
// Requires a Metro bundler restart after changing the value.
export const MOTION_TRACKING_ENABLED =
  process.env.EXPO_PUBLIC_MOTION_TRACKING_ENABLED !== 'false';
