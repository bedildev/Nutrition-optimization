const axios = require("axios");
const Joi = require("joi");

const schema = Joi.object({
  budget_maksimal: Joi.number().integer().min(0).required(),
  target_kalori: Joi.number().integer().min(0).required()
});

module.exports = async (req, res) => {
  console.log("[OPTIMIZE] FASTAPI_BASE_URL:", process.env.FASTAPI_BASE_URL);
  
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      status: "fail",
      message: "Method not allowed",
      data: {}
    });
  }

  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({
      status: "fail",
      message: "Validation error",
      data: {
        errors: error.details.map((detail) => detail.message)
      }
    });
  }

  const baseUrl = process.env.FASTAPI_BASE_URL || "http://localhost:8000";
  const fastapiUrl = baseUrl.endsWith('/') 
    ? `${baseUrl}optimizes` 
    : `${baseUrl}/optimizes`;
  
  console.log("[OPTIMIZE] Calling FastAPI:", fastapiUrl);

  try {
    const response = await axios.post(fastapiUrl, value, {
      timeout: 60000
    });
    console.log("[OPTIMIZE] FastAPI response:", response.data);
    const payload = response.data || {};

    return res.status(200).json({
      status: payload.status || "success",
      message: payload.pesan || "Request berhasil diproses.",
      data: {
        parameter_pencarian: payload.parameter_pencarian || {
          budget: value.budget_maksimal,
          kalori: value.target_kalori
        },
        rekomendasi_menu: payload.rekomendasi_menu || [],
        ringkasan: payload.ringkasan || {}
      }
    });
  } catch (err) {
    console.error("[OPTIMIZE] Error:", err.message);
    if (err.response) {
      console.error("[OPTIMIZE] FastAPI error:", err.response.data);
      return res.status(err.response.status).json({
        status: "fail",
        message: "FastAPI error",
        data: {
          details: err.response.data
        }
      });
    }

    return res.status(502).json({
      status: "fail",
      message: "FastAPI unreachable",
      data: {
        base_url: fastapiUrl,
        error: err.message
      }
    });
  }
};
