require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const healthRoutes = require("./routes/healthRoutes");
const binRoutes = require("./routes/binRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const priorityRoutes = require("./routes/priorityRoutes");
const truckRoutes = require("./routes/truckRoutes");
const routeRoutes = require("./routes/routeRoutes");
const mlRoutes = require("./routes/mlRoutes");
const collectionRoutes = require("./routes/collectionRoutes");
const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
}));

app.use(express.json({ limit: "1mb" }));

app.use("/api/health", healthRoutes);

// Priority route MUST come before binRoutes
app.use("/api/bins/priority", priorityRoutes);
app.use("/api/bins", binRoutes);
app.use("/api/trucks", truckRoutes);
app.use("/api/routes", routeRoutes);
app.use("/api/ml", mlRoutes);
app.use("/api/collections", collectionRoutes);

app.use(notFound);
app.use(errorHandler);

const startServer = async () => {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
