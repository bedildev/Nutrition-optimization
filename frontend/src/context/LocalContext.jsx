import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { lunchMenus } from '../data/mockData';

const LocalContext = createContext(null);

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

  function register({ name, email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
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

  function login({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase();
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

  function updateProfile(nextProfile) {
    setProfile((currentProfile) => {
      const updated = { ...currentProfile, ...nextProfile };

      if (authUser) {
        const nextAuthUser = {
          ...authUser,
          name: updated.name,
          email: updated.email,
          bio: updated.bio,
        };

        setAuthUser(nextAuthUser);
        setUsers((currentUsers) => currentUsers.map((user) => (
          user.email === authUser.email
            ? { ...user, name: updated.name, email: updated.email, bio: updated.bio }
            : user
        )));
      }

      return updated;
    });
  }

  function saveOptimizerResult(result) {
    setOptimizerResult(result);
  }

  function toggleSavedMenu(menuId) {
    setSavedMenuIds((currentIds) => (
      currentIds.includes(menuId)
        ? currentIds.filter((id) => id !== menuId)
        : [...currentIds, menuId]
    ));
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
