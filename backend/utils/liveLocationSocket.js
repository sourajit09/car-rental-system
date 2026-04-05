import { WebSocket, WebSocketServer } from "ws";
import { getAuthenticatedUserFromToken } from "../middleware/authMiddleware.js";
import { saveBookingLocationUpdate } from "../services/bookingTrackingService.js";

const liveLocationClients = new Map();
let nextClientId = 1;

export const LIVE_LOCATION_SOCKET_PATH = "/ws/live-location";

const getBookingUserId = (booking) =>
  String(booking?.user?._id || booking?.user || "");

const getOwnerId = (booking) => {
  const owner = booking?.owner?._id || booking?.owner || booking?.car?.owner;
  if (!owner) {
    return "";
  }
  return String(owner._id || owner);
};

const canReceiveBookingUpdate = (booking, client) => {
  if (getBookingUserId(booking) === client.userId) {
    return true;
  }
  const carOwnerId = getOwnerId(booking);
  if (carOwnerId && carOwnerId === client.userId) {
    return true;
  }
  // Platform-style admin (elevated but not registering as fleet owner)
  if (client.isAdmin && client.role === "customer") {
    return true;
  }
  return false;
};

const sendSocketMessage = (socket, payload) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return false;
  }

  socket.send(JSON.stringify(payload));
  return true;
};

const sendSocketError = (socket, error) => {
  sendSocketMessage(socket, {
    type: "error",
    message: error.message || "Live location update failed",
    statusCode: error.statusCode || 500,
  });
};

const removeClient = (clientId) => {
  liveLocationClients.delete(clientId);
};

export const broadcastBookingLocation = (booking) => {
  for (const [clientId, client] of liveLocationClients.entries()) {
    if (!canReceiveBookingUpdate(booking, client)) {
      continue;
    }

    try {
      const sent = sendSocketMessage(client.socket, {
        type: "booking-location",
        booking,
        emittedAt: new Date().toISOString(),
      });

      if (!sent) {
        liveLocationClients.delete(clientId);
      }
    } catch (_error) {
      liveLocationClients.delete(clientId);
    }
  }
};

const handleSocketMessage = async (socket, user, rawMessage) => {
  let message;

  try {
    message = JSON.parse(rawMessage.toString());
  } catch (_error) {
    sendSocketError(
      socket,
      Object.assign(new Error("Invalid WebSocket message format"), {
        statusCode: 400,
      })
    );
    return;
  }

  const payload = message?.payload || {};

  switch (message?.type) {
    case "share-location": {
      const booking = await saveBookingLocationUpdate({
        bookingId: payload.bookingId,
        actor: user,
        latitude: payload.latitude,
        longitude: payload.longitude,
        accuracy: payload.accuracy,
        sharingEnabled: true,
      });

      broadcastBookingLocation(booking.toObject());
      break;
    }

    case "stop-sharing": {
      const booking = await saveBookingLocationUpdate({
        bookingId: payload.bookingId,
        actor: user,
        sharingEnabled: false,
      });

      broadcastBookingLocation(booking.toObject());
      break;
    }

    default:
      sendSocketError(
        socket,
        Object.assign(new Error("Unsupported WebSocket message type"), {
          statusCode: 400,
        })
      );
  }
};

export const initLiveLocationWebSocketServer = (server) => {
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", async (req, socket, head) => {
    const requestUrl = new URL(
      req.url || LIVE_LOCATION_SOCKET_PATH,
      `http://${req.headers.host || "localhost"}`
    );

    if (requestUrl.pathname !== LIVE_LOCATION_SOCKET_PATH) {
      socket.destroy();
      return;
    }

    try {
      const token = requestUrl.searchParams.get("token");
      if (!token) {
        throw Object.assign(new Error("Authorization token missing"), {
          statusCode: 401,
        });
      }

      const user = await getAuthenticatedUserFromToken(token);

      wss.handleUpgrade(req, socket, head, (webSocket) => {
        webSocket.authenticatedUser = user;
        wss.emit("connection", webSocket);
      });
    } catch (error) {
      const statusLine =
        error.statusCode === 401 ? "401 Unauthorized" : "400 Bad Request";
      socket.write(`HTTP/1.1 ${statusLine}\r\n\r\n`);
      socket.destroy();
    }
  });

  wss.on("connection", (socket) => {
    const user = socket.authenticatedUser;
    const clientId = nextClientId++;

    liveLocationClients.set(clientId, {
      socket,
      userId: String(user.id),
      isAdmin: Boolean(user.isAdmin),
      isOwner: Boolean(user.isOwner),
      role: user.role || "customer",
    });

    sendSocketMessage(socket, {
      type: "connection",
      success: true,
      connectedAt: new Date().toISOString(),
    });

    socket.on("message", (message) => {
      handleSocketMessage(socket, user, message).catch((error) => {
        sendSocketError(socket, error);
      });
    });

    socket.on("close", () => {
      removeClient(clientId);
    });

    socket.on("error", () => {
      removeClient(clientId);
    });
  });

  return wss;
};
