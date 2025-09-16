import express from "express";
import { exec, spawn } from "child_process";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT_DIR = "/projects";

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
  const scriptDir = path.join(PROJECT_ROOT_DIR, "backend", "_bin");
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

// Stream logs
app.get("/api/service/:serviceId/logs", (req, res) => {
  const { serviceId } = req.params;
  const logDir = path.join(PROJECT_ROOT_DIR, "backend", "logs");
  const logFile = path.join(logDir, `${serviceId}.log`);

  // Set headers for SSE
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  // Send initial connection
  res.write(`event: message\n`);
  res.write(`data: Connected to log stream for ${serviceId}\n\n`);

  // Spawn tail -f
  const tail = spawn("tail", ["-f", logFile]);

  tail.stdout.on("data", (data) => {
    res.write(`event: message\n`);
    res.write(`data: ${data.toString()}\n\n`);
  });

  tail.stderr.on("data", (data) => {
    res.write(`event: error\n`);
    res.write(`data: ${data.toString()}\n\n`);
  });

  req.on("close", () => {
    console.log(`Client disconnected from ${serviceId} logs`);
    tail.kill();
  });
});

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