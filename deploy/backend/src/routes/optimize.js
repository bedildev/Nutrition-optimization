const express = require("express");
const axios = require("axios");

const { validate } = require("../middleware/validate");
const { optimizeSchema } = require("../validators/optimize");

const router = express.Router();

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || "http://localhost:8000";

router.post("/optimizes", validate(optimizeSchema), async (req, res, next) => {
  try {
    const response = await axios.post(`${FASTAPI_BASE_URL}/optimizes`, req.body, {
      timeout: 60000
    });
    const fastapiData = response.data || {};

    return res.json({
      status: fastapiData.status || "success",
      message: fastapiData.pesan || "Request berhasil diproses.",
      data: {
        parameter_pencarian: fastapiData.parameter_pencarian || {
          budget: req.body.budget_maksimal,
          kalori: req.body.target_kalori
        },
        rekomendasi_menu: fastapiData.rekomendasi_menu || [],
        ringkasan: fastapiData.ringkasan || {}
      }
    });
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json({
        status: "fail",
        message: "FastAPI error",
        data: {
          details: error.response.data
        }
      });
    }

    if (error.request || error.code) {
      return res.status(502).json({
        status: "fail",
        message: "FastAPI unreachable",
        data: {
          base_url: FASTAPI_BASE_URL,
          code: error.code || null
        }
      });
    }

    return next(error);
  }
});

module.exports = router;
