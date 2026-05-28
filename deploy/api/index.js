/**
 * Vercel Serverless Entry Point
 *
 * Meng-wrap seluruh Express app sebagai satu Serverless Function.
 * Semua route (/v1/auth, /v1/storage, /v1/optimizes, /docs) ditangani di sini.
 *
 * Referensi: https://vercel.com/docs/functions/serverless-functions/runtimes/node-js
 */

require("dotenv").config();

const app = require("../backend/src/app");

module.exports = app;
