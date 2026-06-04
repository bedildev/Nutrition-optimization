const fs = require('fs');
const path = require('path');
const { supabase, hasSupabase, hasAdmin } = require('./supabaseClient');

const dbFilePath = path.join(__dirname, '../../data/db.json');

const defaultData = {
  users: [
    {
      name: 'Demo User',
      email: 'demo@nutriai.local',
      password: 'password123',
      bio: 'Mencintai meal prep sehat dan menu tinggi protein.',
    },
  ],
  profiles: [
    {
      email: 'demo@nutriai.local',
      goal: 'Jaga Kesehatan',
      budget: 15000,
      age: 25,
      weight: 65,
      height: 165,
      activity: 'Sedang',
    },
  ],
  savedMenus: [],
  optimizerResults: [],
};

function ensureDb() {
  if (!fs.existsSync(dbFilePath)) {
    fs.mkdirSync(path.dirname(dbFilePath), { recursive: true });
    fs.writeFileSync(dbFilePath, JSON.stringify(defaultData, null, 2));
  }
}

function readDb() {
  ensureDb();
  return JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
}

function writeDb(data) {
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
}

function sanitizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

async function resolveUserIdByEmail(email) {
  if (!hasAdmin()) {
    return null;
  }

  try {
    const normalized = sanitizeEmail(email);
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.warn('[resolveUserIdByEmail] Supabase error:', error.message);
      return null;
    }
    const user = (data?.users || []).find((u) => sanitizeEmail(u.email) === normalized);
    return user?.id || null;
  } catch (err) {
    console.warn('[resolveUserIdByEmail] Exception caught:', err.message);
    return null;
  }
}

async function findUserByEmail(email) {
  const normalized = sanitizeEmail(email);

  if (hasAdmin()) {
    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) {
        console.warn('[findUserByEmail] Supabase error:', error.message);
        return null;
      }
      const user = (data?.users || []).find((u) => sanitizeEmail(u.email) === normalized);
      return user || null;
    } catch (err) {
      console.warn('[findUserByEmail] Exception caught:', err.message);
      return null;
    }
  }

  const db = readDb();
  return db.users.find((user) => sanitizeEmail(user.email) === normalized);
}

async function createUser(userPayload) {
  const normalizedEmail = sanitizeEmail(userPayload.email);
  const existing = await findUserByEmail(normalizedEmail);

  if (existing) {
    throw new Error('Email sudah terdaftar.');
  }

  const nextUser = {
    name: userPayload.name.trim(),
    email: normalizedEmail,
    password: userPayload.password,
    bio: userPayload.bio || 'Pengguna baru NutriAI.',
  };

  if (hasAdmin()) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password: userPayload.password,
      email_confirm: true,
      user_metadata: {
        name: nextUser.name,
        bio: nextUser.bio,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    const profile = {
      user_id: data?.user?.id,
      email: normalizedEmail,
      goal: 'Jaga Kesehatan',
      budget: 15000,
      age: 18,
      weight: 60,
      height: 160,
      activity: 'Sedang',
      name: nextUser.name,
      bio: nextUser.bio,
    };
    const { error: profileError } = await supabase.from('profiles').upsert([profile]);
    if (profileError) {
      throw new Error(profileError.message);
    }

    return {
      id: data?.user?.id,
      name: nextUser.name,
      email: data?.user?.email || normalizedEmail,
      bio: nextUser.bio,
    };
  }

  const db = readDb();
  db.users.push(nextUser);
  db.profiles.push({
    email: normalizedEmail,
    goal: 'Jaga Kesehatan',
    budget: 15000,
    age: 18,
    weight: 60,
    height: 160,
    activity: 'Sedang',
  });
  writeDb(db);

  return { ...nextUser, password: undefined };
}

async function verifyUser(email, password) {
  if (hasSupabase()) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: sanitizeEmail(email),
      password,
    });

    if (error) {
      return null;
    }

    return data?.user || null;
  }

  const user = await findUserByEmail(email);
  if (!user) return null;
  return user.password === password ? user : null;
}

async function getProfile(email) {
  const normalized = sanitizeEmail(email);

  if (hasSupabase()) {
    const userId = await resolveUserIdByEmail(normalized);
    if (!userId) {
      return null;
    }

    const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  const db = readDb();
  return db.profiles.find((profile) => sanitizeEmail(profile.email) === normalized);
}

async function updateProfile(email, updates) {
  const normalized = sanitizeEmail(email);
  const updatedProfile = {
    email: normalized,
    goal: updates.goal || 'Jaga Kesehatan',
    budget: updates.budget ?? 15000,
    age: updates.age ?? 18,
    weight: updates.weight ?? 60,
    height: updates.height ?? 160,
    activity: updates.activity || 'Sedang',
    name: updates.name,
    bio: updates.bio,
  };

  if (hasSupabase()) {
    const userId = await resolveUserIdByEmail(normalized);
    if (!userId) {
      throw Object.assign(new Error('User tidak ditemukan.'), { statusCode: 404 });
    }

    const { error } = await supabase.from('profiles').upsert([
      {
        ...updatedProfile,
        user_id: userId,
      },
    ]);
    if (error) {
      throw new Error(error.message);
    }
    return { ...updatedProfile, user_id: userId };
  }

  const db = readDb();
  let profile = db.profiles.find((item) => sanitizeEmail(item.email) === normalized);

  if (!profile) {
    profile = { email: normalized, goal: 'Jaga Kesehatan', budget: 15000, age: 18, weight: 60, height: 160, activity: 'Sedang' };
    db.profiles.push(profile);
  }

  const merged = {
    ...profile,
    ...updates,
    email: normalized,
  };

  db.profiles = db.profiles.map((item) => (
    sanitizeEmail(item.email) === normalized ? merged : item
  ));
  writeDb(db);

  return merged;
}

async function getSavedMenuIds(email) {
  const normalized = sanitizeEmail(email);

  if (hasSupabase()) {
    const userId = await resolveUserIdByEmail(normalized);
    if (!userId) {
      return [];
    }

    const { data, error } = await supabase.from('saved_menus').select('menu_id').eq('user_id', userId);
    if (error) {
      throw new Error(error.message);
    }
    return data.map((item) => item.menu_id);
  }

  const db = readDb();
  const row = db.savedMenus.find((item) => sanitizeEmail(item.email) === normalized);
  return row ? row.menuIds : [];
}

async function toggleSavedMenu(email, menuId) {
  const normalized = sanitizeEmail(email);

  if (hasSupabase()) {
    const userId = await resolveUserIdByEmail(normalized);
    if (!userId) {
      throw Object.assign(new Error('User tidak ditemukan.'), { statusCode: 404 });
    }

    const { data: existing, error: existingError } = await supabase
      .from('saved_menus')
      .select('*')
      .eq('user_id', userId)
      .eq('menu_id', menuId)
      .maybeSingle();
    if (existingError) {
      throw new Error(existingError.message);
    }

    if (existing) {
      const { error } = await supabase.from('saved_menus').delete().eq('user_id', userId).eq('menu_id', menuId);
      if (error) {
        throw new Error(error.message);
      }
    } else {
      const { error } = await supabase.from('saved_menus').insert([{ user_id: userId, menu_id: menuId }]);
      if (error) {
        throw new Error(error.message);
      }
    }

    return getSavedMenuIds(normalized);
  }

  const db = readDb();
  let row = db.savedMenus.find((item) => sanitizeEmail(item.email) === normalized);

  if (!row) {
    row = { email: normalized, menuIds: [] };
    db.savedMenus.push(row);
  }

  if (row.menuIds.includes(menuId)) {
    row.menuIds = row.menuIds.filter((id) => id !== menuId);
  } else {
    row.menuIds.push(menuId);
  }

  writeDb(db);
  return row.menuIds;
}

async function saveOptimizerResult(email, optimizerResult) {
  const normalized = sanitizeEmail(email);

  if (hasSupabase()) {
    const userId = await resolveUserIdByEmail(normalized);
    if (!userId) {
      throw Object.assign(new Error('User tidak ditemukan.'), { statusCode: 404 });
    }

    const entry = {
      user_id: userId,
      result: optimizerResult,
      created_at: new Date().toISOString(),
    };
    const { data, error } = await supabase.from('optimizer_results').insert([entry]).select().single();
    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  const db = readDb();
  const row = {
    email: normalized,
    result: optimizerResult,
    createdAt: new Date().toISOString(),
  };

  db.optimizerResults.unshift(row);
  if (db.optimizerResults.length > 20) {
    db.optimizerResults = db.optimizerResults.slice(0, 20);
  }

  writeDb(db);
  return row;
}

async function getOptimizerResults(email) {
  const normalized = sanitizeEmail(email);

  if (hasSupabase()) {
    const userId = await resolveUserIdByEmail(normalized);
    if (!userId) {
      return [];
    }

    const { data, error } = await supabase
      .from('optimizer_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) {
      throw new Error(error.message);
    }
    return data.map((item) => ({
      email: item.email,
      result: item.result,
      createdAt: item.created_at || item.createdAt,
    }));
  }

  const db = readDb();
  return db.optimizerResults.filter((item) => sanitizeEmail(item.email) === normalized);
}

module.exports = {
  createUser,
  findUserByEmail,
  verifyUser,
  getProfile,
  updateProfile,
  getSavedMenuIds,
  toggleSavedMenu,
  saveOptimizerResult,
  getOptimizerResults,
};
