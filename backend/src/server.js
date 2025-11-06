// 🧩 Load environment first!
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";

const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(` Access via: http://localhost:${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
});
