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
  bmr: 0,
  tdee: 0,
  target: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
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

async function fetchSupabaseProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data;
}

async function fetchSupabaseSavedMenuIds(userId) {
  const { data, error } = await supabase.from('saved_menus').select('menu_id').eq('user_id', userId);
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
  const [activeLunchMenus, setActiveLunchMenus] = useState(() => readStorage('nutriai-menus', lunchMenus));

  useEffect(() => {
    localStorage.setItem('nutriai-menus', JSON.stringify(activeLunchMenus));
  }, [activeLunchMenus]);

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
      // Gunakan supabase.auth.signUp agar konsisten dengan login (signInWithPassword)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: { name, bio: '' },
        },
      });
      if (signUpError) {
        throw new Error(signUpError.message);
      }
      if (data?.user) {
        const { error: profileError } = await supabase.from('profiles').upsert([{
          user_id: data.user.id,
          email: normalizedEmail,
          name,
          bio: '',
          goal: '',
          budget: 0,
          age: 0,
          weight: 0,
          height: 0,
          activity: '',
        }]);
        if (profileError) {
          console.warn('[register] Profile upsert warning:', profileError.message);
        }
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
      bio: '',
    };

    setUsers((currentUsers) => [...currentUsers, nextUser]);
  }

  async function login({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
    const isDemoAccount = normalizedEmail === 'demo@nutriai.local';

    if (!isDemoAccount && useBackendStorage) {
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

    if (!isDemoAccount && useSupabaseDirect) {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (signInError) {
        throw new Error('Email atau password tidak sesuai.');
      }

      const authUser = authData?.user;
      const userId = authUser?.id;
      const userName = authUser?.user_metadata?.name || normalizedEmail.split('@')[0];

      const profileData = await fetchSupabaseProfile(userId);
      const savedMenuIdsData = await fetchSupabaseSavedMenuIds(userId);
      const nextAuthUser = { id: userId, name: userName, email: normalizedEmail, bio: profileData?.bio || '' };

      setAuthUser(nextAuthUser);
      setProfile({
        name: userName,
        email: normalizedEmail,
        bio: profileData?.bio || '',
        goal: profileData?.goal || '',
        budget: profileData?.budget || 0,
        age: profileData?.age || 0,
        weight: profileData?.weight || 0,
        height: profileData?.height || 0,
        activity: profileData?.activity || '',
      });
      setSavedMenuIds(savedMenuIdsData || []);
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

    if (useSupabaseDirect && authUser?.id) {
      const { error } = await supabase.from('profiles').upsert([{ ...updatedProfile, user_id: authUser.id, email: authUser.email }]);
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

    if (useSupabaseDirect && authUser?.id) {
      const { error } = await supabase.from('optimizer_results').insert([{ user_id: authUser.id, result, created_at: new Date().toISOString() }]);
      if (error) {
        console.warn('[saveOptimizerResult]', error.message);
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

      if (useSupabaseDirect && authUser?.id) {
        (async () => {
          const { data: existing, error: existingError } = await supabase.from('saved_menus').select('*').eq('user_id', authUser.id).eq('menu_id', menuId).maybeSingle();
          if (existingError) {
            return;
          }
          if (existing) {
            await supabase.from('saved_menus').delete().eq('user_id', authUser.id).eq('menu_id', menuId);
          } else {
            await supabase.from('saved_menus').insert([{ user_id: authUser.id, menu_id: menuId }]);
          }
        })();
      }

      return updatedIds;
    });
  }

  function addGeneratedMenus(newMenus) {
    setActiveLunchMenus((current) => {
      const existingIds = new Set(current.map((m) => m.id));
      const menusToAdd = newMenus.filter((m) => !existingIds.has(m.id));
      return [...menusToAdd, ...current];
    });
  }

  const contextValue = useMemo(() => ({
    authUser,
    login,
    logout,
    lunchMenus: activeLunchMenus,
    optimizerResult,
    profile,
    register,
    savedMenuIds,
    saveOptimizerResult,
    toggleSavedMenu,
    updateProfile,
    addGeneratedMenus,
  }), [authUser, optimizerResult, profile, savedMenuIds, activeLunchMenus]);

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
