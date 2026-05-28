const express = require('express');
const { validate } = require('../middleware/validate');
const { registerSchema, loginSchema, profileUpdateSchema } = require('../validators/auth');
const {
  createUser,
  verifyUser,
  getProfile,
  updateProfile,
  getSavedMenuIds,
} = require('../services/storageService');

const router = express.Router();

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const user = await createUser(req.body);
    return res.status(201).json({ status: 'success', message: 'Akun berhasil dibuat.', data: { user: sanitizeUser(user) } });
  } catch (error) {
    return res.status(400).json({ status: 'fail', message: error.message });
  }
});

router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const user = await verifyUser(req.body.email, req.body.password);

    if (!user) {
      return res.status(401).json({ status: 'fail', message: 'Email atau password tidak sesuai.' });
    }

    const profile = await getProfile(user.email);
    const savedMenuIds = await getSavedMenuIds(user.email);
    const safeUser = {
      id: user?.id,
      name: profile?.name || user?.user_metadata?.name || user?.name,
      email: user?.email,
      bio: profile?.bio || user?.user_metadata?.bio || user?.bio,
    };

    return res.json({
      status: 'success',
      message: 'Login berhasil.',
      data: {
        user: sanitizeUser(safeUser),
        profile,
        savedMenuIds,
      },
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/profile', async (req, res, next) => {
  try {
    const email = req.query.email;

    if (!email) {
      return res.status(400).json({ status: 'fail', message: 'Email diperlukan untuk mengambil profil.' });
    }

    const profile = await getProfile(email);

    if (!profile) {
      return res.status(404).json({ status: 'fail', message: 'Profil tidak ditemukan.' });
    }

    return res.json({ status: 'success', data: { profile } });
  } catch (error) {
    return next(error);
  }
});

router.patch('/profile', validate(profileUpdateSchema), async (req, res, next) => {
  try {
    const updatedProfile = await updateProfile(req.body.email, req.body);
    return res.json({ status: 'success', message: 'Profil berhasil disimpan.', data: { profile: updatedProfile } });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
