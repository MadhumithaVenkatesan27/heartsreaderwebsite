const { Server } = require("socket.io");
const User = require("../models/User");
const { verifyAccessToken } = require("../utils/jwt");

let io;

const userRoom = (userId) => `user:${userId}`;
const roleRoom = (role) => `role:${role}`;

const normaliseOriginList = (origins = []) =>
  origins.map((origin) => String(origin).trim()).filter(Boolean);

const initSocket = (server, { allowedOrigins = [], isAllowedDevOrigin } = {}) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (
          !origin ||
          normaliseOriginList(allowedOrigins).includes(origin) ||
          (typeof isAllowedDevOrigin === "function" && isAllowedDevOrigin(origin))
        ) {
          return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const authHeader = socket.handshake.headers.authorization || "";
      const bearerToken = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;
      const token = socket.handshake.auth?.token || bearerToken;

      if (!token) return next(new Error("Not authenticated."));

      const decoded = verifyAccessToken(token, "user");
      const user = await User.findById(decoded.id).select("+passwordChangedAt");

      if (!user || !user.isActive || user.status !== "active") {
        return next(new Error("User is not active."));
      }
      if (user.passwordChangedAfter && user.passwordChangedAfter(decoded.iat)) {
        return next(new Error("Password was changed. Please log in again."));
      }

      socket.user = {
        id: user._id.toString(),
        role: user.role,
        email: user.email,
      };
      return next();
    } catch (err) {
      return next(new Error("Invalid token."));
    }
  });

  io.on("connection", (socket) => {
    socket.join(userRoom(socket.user.id));
    socket.join(roleRoom(socket.user.role || "user"));

    socket.emit("socket:ready", {
      userId: socket.user.id,
      role: socket.user.role,
    });
  });

  return io;
};

const getIO = () => io;

const emitToUser = (userId, event, payload) => {
  if (!io || !userId) return false;
  io.to(userRoom(userId.toString())).emit(event, payload);
  return true;
};

const emitToRole = (role, event, payload) => {
  if (!io || !role) return false;
  io.to(roleRoom(role)).emit(event, payload);
  return true;
};

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  emitToRole,
};
