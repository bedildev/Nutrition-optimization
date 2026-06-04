const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const openapiSpec = require("../openapi.json");

const optimizeRoutes = require("./routes/optimize");
const authRoutes = require("./routes/auth");
const storageRoutes = require("./routes/storage");
const { notFoundHandler } = require("./middleware/notFoundHandler");
const { errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiSpec));

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Nutrition Optimization API sudah aktif. Silakan gunakan endpoint /v1/optimizes untuk mendapatkan rekomendasi menu.",
    data: {}
  });
});

app.use("/v1/auth", authRoutes);
app.use("/v1/storage", storageRoutes);
app.use("/v1", optimizeRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
