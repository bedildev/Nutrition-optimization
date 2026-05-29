import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { lunchMenus } from '../data/mockData';
import { supabase, hasSupabase } from '../lib/supabaseClient';

const LocalContext = createContext(null);

// Strip localhost URL agar production gunakan relative path
const _rawUrl = import.meta.env.VITE_API_BASE_URL || '';
const apiBaseUrl = _rawUrl.startsWith('http://localhost') || _rawUrl.startsWith('https://localhost') ? '' : _rawUrl.replace(/\/$/, '');
// useBackendStorage aktif jika VITE_USE_BACKEND=true (relative URL juga didukung)
const useBackendStorage = import.meta.env.VITE_USE_BACKEND === 'true';
// useSupabaseDirect aktif jika Supabase tersedia dan tidak pakai backend
const useSupabaseDirect = hasSupabase && !useBackendStorage;

const initialUsers = [
  {
    name: 'Demo User',
    email: 'demo@nutriai.local',
    password: 'password123',
    bio: 'Mencintai meal prep sehat dan menu tinggi protein.',
  },
];

const initialProfile = {
  name: 'Demo User',
  email: 'demo@nutriai.local',
  bio: 'Mencintai meal prep sehat dan menu tinggi protein.',
  goal: 'Jaga Kesehatan',
  budget: 15000,
  age: 25,
  weight: 65,
  height: 165,
  activity: 'Sedang',
};

const initialOptimizerResult = {
  bmr: 1549,
  tdee: 2401,
  target: 2401,
  protein: 104,
  carbs: 270,
  fat: 67,
  recommended: lunchMenus.slice(0, 3),
};

function readStorage(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    localStorage.removeItem(key);
    return fallback;
  }
}

async function apiRequest(path, options = {}) {
  // apiBaseUrl kosong = gunakan relative URL (same-domain Vercel deployment)
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || 'Terjadi kesalahan pada server.');
  }

  return payload;
}

async function fetchSupabaseProfile(email) {
  const { data, error } = await supabase.from('profiles').select('*').eq('email', email).maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

async function fetchSupabaseSavedMenuIds(email) {
  const { data, error } = await supabase.from('saved_menus').select('menu_id').eq('email', email);
  if (error) {
    throw new Error(error.message);
  }
  return data.map((item) => item.menu_id);
}

function LocalProvider({ children }) {
  const [users, setUsers] = useState(() => readStorage('nutriai-users', initialUsers));
  const [authUser, setAuthUser] = useState(() => readStorage('nutriai-auth-user', null));
  const [profile, setProfile] = useState(() => ({ ...initialProfile, ...readStorage('nutriai-profile', {}) }));
  const [savedMenuIds, setSavedMenuIds] = useState(() => readStorage('nutriai-saved-menus', [lunchMenus[0].id]));
  const [optimizerResult, setOptimizerResult] = useState(() => readStorage('nutriai-optimizer-result', initialOptimizerResult));

  useEffect(() => {
    localStorage.setItem('nutriai-users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (authUser) {
      localStorage.setItem('nutriai-auth-user', JSON.stringify(authUser));
      return;
    }

    localStorage.removeItem('nutriai-auth-user');
  }, [authUser]);

  useEffect(() => {
    localStorage.setItem('nutriai-profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('nutriai-saved-menus', JSON.stringify(savedMenuIds));
  }, [savedMenuIds]);

  useEffect(() => {
    localStorage.setItem('nutriai-optimizer-result', JSON.stringify(optimizerResult));
  }, [optimizerResult]);

  async function register({ name, email, password }) {
    const normalizedEmail = email.trim().toLowerCase();

    if (useBackendStorage) {
      await apiRequest('/v1/auth/register', {
        method: 'POST',
        body: { name, email: normalizedEmail, password },
      });
      return;
    }

    if (useSupabaseDirect) {
      const { data: existing, error: findError } = await supabase.from('users').select('email').eq('email', normalizedEmail).maybeSingle();
      if (findError) {
        throw new Error(findError.message);
      }
      if (existing) {
        throw new Error('Email sudah terdaftar.');
      }

      const { error: insertError } = await supabase.from('users').insert([{ name, email: normalizedEmail, password, bio: 'Siap mengoptimalkan nutrisi harian dengan NutriAI.' }]);
      if (insertError) {
        throw new Error(insertError.message);
      }

      const { error: profileError } = await supabase.from('profiles').upsert([{ email: normalizedEmail, goal: 'Jaga Kesehatan', budget: 15000, age: 18, weight: 60, height: 160, activity: 'Sedang' }]);
      if (profileError) {
        throw new Error(profileError.message);
      }
      return;
    }

    const userExists = users.some((user) => user.email === normalizedEmail);

    if (userExists) {
      throw new Error('Email sudah terdaftar.');
    }

    const nextUser = {
      name: name.trim(),
      email: normalizedEmail,
      password,
      bio: 'Siap mengoptimalkan nutrisi harian dengan NutriAI.',
    };

    setUsers((currentUsers) => [...currentUsers, nextUser]);
  }

  async function login({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();

    if (useBackendStorage) {
      const payload = await apiRequest('/v1/auth/login', {
        method: 'POST',
        body: { email: normalizedEmail, password },
      });

      const { user, profile: remoteProfile, savedMenuIds: remoteSavedMenuIds } = payload.data;
      setAuthUser(user);
      setProfile({ ...initialProfile, ...remoteProfile });
      setSavedMenuIds(remoteSavedMenuIds || []);
      return;
    }

    if (useSupabaseDirect) {
      const { data: user, error } = await supabase.from('users').select('*').eq('email', normalizedEmail).maybeSingle();
      if (error) {
        throw new Error(error.message);
      }
      if (!user || user.password !== password) {
        throw new Error('Email atau password tidak sesuai.');
      }

      const profileData = await fetchSupabaseProfile(normalizedEmail);
      const savedMenuIdsData = await fetchSupabaseSavedMenuIds(normalizedEmail);
      const nextAuthUser = { name: user.name, email: user.email, bio: user.bio };

      setAuthUser(nextAuthUser);
      setProfile({ ...initialProfile, ...profileData, name: user.name, bio: user.bio });
      setSavedMenuIds(savedMenuIdsData);
      return;
    }

    const user = users.find((item) => item.email === normalizedEmail && item.password === password);

    if (!user) {
      throw new Error('Email atau password tidak sesuai.');
    }

    const nextAuthUser = { name: user.name, email: user.email, bio: user.bio };
    setAuthUser(nextAuthUser);
    setProfile((currentProfile) => ({
      ...currentProfile,
      name: user.name,
      email: user.email,
      bio: user.bio || currentProfile.bio,
    }));
  }

  function logout() {
    setAuthUser(null);
  }

  async function updateProfile(nextProfile) {
    const updatedProfile = { ...profile, ...nextProfile };

    if (useBackendStorage && authUser?.email) {
      const payload = await apiRequest('/v1/auth/profile', {
        method: 'PATCH',
        body: { ...updatedProfile, email: authUser.email },
      });

      setProfile(payload.data.profile);
      setAuthUser((currentAuthUser) => (
        currentAuthUser ? { ...currentAuthUser, name: payload.data.profile.name || currentAuthUser.name, bio: payload.data.profile.bio || currentAuthUser.bio } : null
      ));
      return;
    }

    if (useSupabaseDirect && authUser?.email) {
      const { error } = await supabase.from('profiles').upsert([{ ...updatedProfile, email: authUser.email }]);
      if (error) {
        throw new Error(error.message);
      }
      setProfile(updatedProfile);
      setAuthUser((currentAuthUser) => (
        currentAuthUser ? { ...currentAuthUser, name: updatedProfile.name, bio: updatedProfile.bio } : null
      ));
      return;
    }

    setProfile(updatedProfile);
    setAuthUser((currentAuthUser) => currentAuthUser ? { ...currentAuthUser, name: updatedProfile.name, email: updatedProfile.email, bio: updatedProfile.bio } : null);
  }

  async function saveOptimizerResult(result) {
    setOptimizerResult(result);

    if (useBackendStorage && authUser?.email) {
      apiRequest('/v1/storage/optimizer-results', {
        method: 'POST',
        body: { email: authUser.email, result },
      }).catch(() => {
        // optional backend sync failed, tetap biarkan UI berjalan
      });
      return;
    }

    if (useSupabaseDirect && authUser?.email) {
      const { error } = await supabase.from('optimizer_results').insert([{ email: authUser.email, result, created_at: new Date().toISOString() }]);
      if (error) {
        throw new Error(error.message);
      }
    }
  }

  function toggleSavedMenu(menuId) {
    const nextIds = (currentIds) => (
      currentIds.includes(menuId)
        ? currentIds.filter((id) => id !== menuId)
        : [...currentIds, menuId]
    );

    setSavedMenuIds((currentIds) => {
      const updatedIds = nextIds(currentIds);

      if (useBackendStorage && authUser?.email) {
        apiRequest('/v1/storage/saved-menus', {
          method: 'POST',
          body: { email: authUser.email, menuId },
        }).catch(() => {
          // ignore backend failure for now
        });
      }

      if (useSupabaseDirect && authUser?.email) {
        (async () => {
          const { data: existing, error: existingError } = await supabase.from('saved_menus').select('*').eq('email', authUser.email).eq('menu_id', menuId).maybeSingle();
          if (existingError) {
            return;
          }
          if (existing) {
            await supabase.from('saved_menus').delete().eq('email', authUser.email).eq('menu_id', menuId);
          } else {
            await supabase.from('saved_menus').insert([{ email: authUser.email, menu_id: menuId }]);
          }
        })();
      }

      return updatedIds;
    });
  }

  const contextValue = useMemo(() => ({
    authUser,
    login,
    logout,
    lunchMenus,
    optimizerResult,
    profile,
    register,
    savedMenuIds,
    saveOptimizerResult,
    toggleSavedMenu,
    updateProfile,
  }), [authUser, optimizerResult, profile, savedMenuIds]);

  return (
    <LocalContext.Provider value={contextValue}>
      {children}
    </LocalContext.Provider>
  );
}

function useLocal() {
  const context = useContext(LocalContext);

  if (!context) {
    throw new Error('useLocal harus digunakan di dalam LocalProvider.');
  }

  return context;
}

export { LocalProvider, useLocal };
