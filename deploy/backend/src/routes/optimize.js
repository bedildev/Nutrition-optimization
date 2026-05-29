const express = require("express");
const axios = require("axios");

const { validate } = require("../middleware/validate");
const { optimizeSchema } = require("../validators/optimize");

const router = express.Router();

const FASTAPI_BASE_URL = process.env.FASTAPI_BASE_URL || "http://localhost:8000";
console.log("[OPTIMIZE] FASTAPI_BASE_URL:", FASTAPI_BASE_URL);

router.post("/optimizes", validate(optimizeSchema), async (req, res, next) => {
  try {
    console.log("[OPTIMIZE] Calling FastAPI:", `${FASTAPI_BASE_URL}/optimizes`);
    const response = await axios.post(`${FASTAPI_BASE_URL}/optimizes`, req.body, {
      timeout: 60000
    });
    console.log("[OPTIMIZE] FastAPI response:", response.data);
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
    console.error("[OPTIMIZE] Error:", error.message);
    if (error.response) {
      console.error("[OPTIMIZE] FastAPI error response:", error.response.data);
      return res.status(error.response.status).json({
        status: "fail",
        message: "FastAPI error",
        data: {
          details: error.response.data
        }
      });
    }

    if (error.request || error.code) {
      console.error("[OPTIMIZE] FastAPI unreachable - base_url:", FASTAPI_BASE_URL);
      return res.status(502).json({
        status: "fail",
         message: "FastAPI unreachable",
         data: {
           base_url: FASTAPI_BASE_URL,
           code: error.code || null
         }
       });
     }

     console.error("[OPTIMIZE] Unexpected error:", error.message);
     return next(error);
   }
});

module.exports = router;
