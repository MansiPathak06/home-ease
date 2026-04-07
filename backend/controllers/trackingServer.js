// server/tracking.js  — Add this to your Express server
const WebSocket = require("ws");

/**
 * Call setupTrackingServer(server) from your main server.js
 * after you create the http.Server.
 *
 * e.g.:
 *   const server = http.createServer(app);
 *   setupTrackingServer(server);
 *   server.listen(5000);
 */

function setupTrackingServer(httpServer) {
  const wss = new WebSocket.Server({ server: httpServer, path: "/tracking" });

  // Map: bookingId -> { vendor: ws, users: Set<ws>, admins: Set<ws>, path: [], status: string }
  const rooms = new Map();

  function getRoom(bookingId) {
    if (!rooms.has(bookingId)) {
      rooms.set(bookingId, { vendor: null, users: new Set(), admins: new Set(), path: [], status: "idle" });
    }
    return rooms.get(bookingId);
  }

  function broadcast(room, data, exclude = null) {
    const msg = JSON.stringify(data);
    [room.vendor, ...room.users, ...room.admins]
      .filter((ws) => ws && ws !== exclude && ws.readyState === WebSocket.OPEN)
      .forEach((ws) => ws.send(msg));
  }

  wss.on("connection", (ws, req) => {
    const url = new URL(req.url, "ws://localhost");
    const bookingId = url.searchParams.get("bookingId");
    const role = url.searchParams.get("role") || "user";

    if (!bookingId) return ws.close();

    const room = getRoom(bookingId);

    // Register client
    if (role === "vendor") room.vendor = ws;
    else if (role === "admin") room.admins.add(ws);
    else room.users.add(ws);

    // Send existing path + status to newcomer
    ws.send(JSON.stringify({ type: "path_history", path: room.path }));
    ws.send(JSON.stringify({ type: "status_update", status: room.status }));

    ws.on("message", (raw) => {
      let data;
      try { data = JSON.parse(raw); } catch { return; }

      switch (data.type) {
        case "location_update":
          room.path.push(data.location);
          if (room.path.length > 500) room.path = room.path.slice(-500);
          // Compute simple ETA (placeholder — replace with real routing API)
          const eta = computeEta(data.location, room.userLocation);
          broadcast(room, { type: "location_update", location: data.location, eta }, ws);
          break;

        case "status_update":
          room.status = data.status;
          broadcast(room, { type: "status_update", status: data.status });
          break;

        case "user_location":
          room.userLocation = data.location;
          break;
      }
    });

    ws.on("close", () => {
      if (role === "vendor") room.vendor = null;
      else if (role === "admin") room.admins.delete(ws);
      else room.users.delete(ws);
    });
  });

  console.log("✅ Tracking WebSocket server ready on /tracking");
  return wss;
}

// Haversine distance in km
function haversine(a, b) {
  if (!a || !b) return null;
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function computeEta(vendorLoc, userLoc) {
  const dist = haversine(vendorLoc, userLoc);
  if (!dist) return null;
  const avgSpeedKmh = 30;
  const minutes = Math.round((dist / avgSpeedKmh) * 60);
  return { minutes, distance: dist.toFixed(2) };
}

module.exports = { setupTrackingServer };