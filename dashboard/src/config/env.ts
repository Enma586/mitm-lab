const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://192.168.56.20:4000";

export const env = {
  apiBaseUrl,
  wsUrl: import.meta.env.VITE_WS_URL ?? `${apiBaseUrl.replace(/^http/, "ws")}/ws/events`,
};
