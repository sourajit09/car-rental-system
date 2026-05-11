export const buildLiveLocationSocketUrl = (baseUrl, token) => {
  if (!baseUrl || !token) {
    return null;
  }

  const origin =
    typeof window !== "undefined" ? window.location.origin : "http://localhost";
  const socketUrl = new URL(baseUrl, origin);

  socketUrl.protocol = socketUrl.protocol === "https:" ? "wss:" : "ws:";
  socketUrl.pathname = "/ws/live-location";
  socketUrl.search = new URLSearchParams({ token }).toString();
  socketUrl.hash = "";

  return socketUrl.toString();
};

export const parseLiveLocationSocketMessage = (event) => {
  try {
    return JSON.parse(event.data);
  } catch (_error) {
    return null;
  }
};

export const isLiveLocationSocketOpen = (socket) =>
  typeof WebSocket !== "undefined" &&
  socket &&
  socket.readyState === WebSocket.OPEN;
