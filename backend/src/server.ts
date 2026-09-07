import express from "express";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Health-check route
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Library backend is running",
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
