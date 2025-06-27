// App constants
export const SHORTCUTS = {
  SHOW: "CommandOrControl+Shift+S",
  HIDE: "Escape",
};

export const DEVELOPMENT = {
  HOT_RELOAD_ENABLED: process.env.NODE_ENV === "development",
  DEV_TOOLS_ENABLED: process.env.NODE_ENV === "development",
};

export const WINDOW_CONFIG = {
  SHOW_INITIALLY: false,
  RESIZABLE: true,
  NODE_INTEGRATION: false,
  CONTEXT_ISOLATION: true,
};
