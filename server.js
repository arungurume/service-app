import express from "express";
import { exec } from "child_process";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCRIPT_ROOT = "/projects";

const app = express();
const PORT = process.env.PORT || 5000;

// CORS only for dev
//if (process.env.NODE_ENV !== "production") {
app.use(
  cors({
    origin: "http://localhost:3000", // allow React app
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  })
);
//}

// Example API to run script.sh
app.get("/api/health", (req, res) => {
  console.log("/api/health endpoint called");
  return res.json({ "status": "UP" });
});

// Start API
app.post("/api/service/:serviceId/start", (req, res) => {
  console.log(`/api/service/${req.params.serviceId}/start endpoint called`);
  const { serviceId } = req.params;
  if (!serviceId) return res.status(400).json({ error: "serviceId required" });
  runScript("start", serviceId, res);
});

// Stop API
app.post("/api/service/:serviceId/stop", (req, res) => {
  console.log(`/api/service/${req.params.serviceId}/stop endpoint called`);
  const { serviceId } = req.params;
  if (!serviceId) return res.status(400).json({ error: "serviceId required" });
  runScript("stop", serviceId, res);
});

// Restart API
app.post("/api/service/:serviceId/restart", (req, res) => {
  console.log(`/api/service/${req.params.serviceId}/restart endpoint called`);
  const { serviceId } = req.params;
  if (!serviceId) return res.status(400).json({ error: "serviceId required" });
  runScript("restart", serviceId, res);
});

// Helper to run script
function runScript(action, serviceId, res) {
  // Base folder
  const scriptDir = path.join(SCRIPT_ROOT, "backend", "_bin");
  const scriptFile = `${action}_${serviceId}.sh`;

  // First cd into dir, then run script
  const cmd = `cd ${scriptDir} && ./${scriptFile}`;
  console.log(`Executing: ${cmd}`);

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error("Error:", error.message);
      return res.status(500).json({ error: error.message });
    }
    if (stderr) {
      console.error("Stderr:", stderr);
      return res.status(500).json({ error: stderr });
    }

    res.json({
      success: true,
      action,
      serviceId,
      output: stdout.trim(),
    });
  });
}


// --- Serve React build ---
/*const buildPath = path.join(__dirname, "build");
app.use(express.static(buildPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});*/

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});