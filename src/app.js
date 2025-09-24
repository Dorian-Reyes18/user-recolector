import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit"; // <-- importamos express-rate-limit
import routes from "./routes/index.js";
import authRoutes from "./routes/auth.js";
import usuariosSystem from "./routes/usuarios_system.js";
import { verifyToken, isAdmin } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();

// Seguridad con headers HTTP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// Rate Limiting general
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 solicitudes por IP por ventana
  message: {
    message:
      "Demasiadas solicitudes desde esta IP, por favor intenta más tarde.",
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

//  rate limit a todas las rutas
app.use(limiter);

app.use(cors());
app.use(express.json());

// Rutas
app.use("/api", routes);
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", verifyToken, isAdmin, usuariosSystem);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
