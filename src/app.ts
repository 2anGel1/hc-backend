import express, { Application, Request, Response } from "express";
const compression = require('compression');
import bodyParser from "body-parser";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";


// import userRoutes from "./routes/userRoutes";
import adminRoutes from "./routes/adminRoutes";
import qrRoutes from "./routes/qrRoutes";

dotenv.config();

const app: Application = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(compression());

// HTML
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.get("/", (req: Request, res: Response): void => {
  res.redirect(301, "/event.html");
});
// app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/qr", qrRoutes);

export default app;
