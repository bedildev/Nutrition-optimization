const express = require('express');
const { validate } = require('../middleware/validate');
const { savedMenuSchema, optimizerResultSchema } = require('../validators/storage');
const {
  getSavedMenuIds,
  toggleSavedMenu,
  saveOptimizerResult,
  getOptimizerResults,
} = require('../services/storageService');

const router = express.Router();

router.get('/saved-menus', async (req, res, next) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({ status: 'fail', message: 'Email diperlukan untuk mengambil saved menus.' });
    }

    const savedMenuIds = await getSavedMenuIds(email);
    return res.json({ status: 'success', data: { savedMenuIds } });
  } catch (error) {
    return next(error);
  }
});

router.post('/saved-menus', validate(savedMenuSchema), async (req, res, next) => {
  try {
    const savedMenuIds = await toggleSavedMenu(req.body.email, req.body.menuId);
    return res.json({ status: 'success', message: 'Saved menu berhasil diperbarui.', data: { savedMenuIds } });
  } catch (error) {
    return next(error);
  }
});

router.post('/optimizer-results', validate(optimizerResultSchema), async (req, res, next) => {
  try {
    const saved = await saveOptimizerResult(req.body.email, req.body.result);
    return res.status(201).json({ status: 'success', message: 'Hasil optimizer tersimpan.', data: saved });
  } catch (error) {
    return next(error);
  }
});

router.get('/optimizer-results', async (req, res, next) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({ status: 'fail', message: 'Email diperlukan untuk mengambil riwayat optimizer.' });
    }

    const results = await getOptimizerResults(email);
    return res.json({ status: 'success', data: { results } });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
