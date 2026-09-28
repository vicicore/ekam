"use client";

import { useCallback, useEffect, useState } from "react";
import { authApi } from "./api";

const TOKEN_KEY = "setu-auth-token";
const CITIZEN_ID_KEY = "setu-auth-citizen-id";
const ROLE_KEY = "setu-auth-role";
const NAME_KEY = "setu-auth-name";

const KNOWN_IDENTIFIERS: Record<string, string> = {
  "9876543210": "Rahul Sharma",
  "9822012345": "Sunita Patil",
  "9850011223": "Ramesh Jadhav",
  "demo-college-admission-scholarship": "Rahul Sharma",
  admin: "Admin Officer",
};

export interface AuthState {
  token: string | null;
  citizenId: string | null;
  role: "citizen" | "admin" | null;
  name: string | null;
  isLoggedIn: boolean;
}

function readStoredAuth(): AuthState {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const citizenId = localStorage.getItem(CITIZEN_ID_KEY);
    const role = localStorage.getItem(ROLE_KEY) as "citizen" | "admin" | null;
    const name = localStorage.getItem(NAME_KEY);
    return { token, citizenId, role, name, isLoggedIn: Boolean(token && citizenId) };
  } catch {
    return { token: null, citizenId: null, role: null, name: null, isLoggedIn: false };
  }
}

// NavBar and whichever page the citizen is on each call useAuth()
// independently — plain useState alone would leave every instance but
// the one that actually called login()/logout() showing stale state
// (e.g. NavBar still showing "Log in" right after /login redirects
// away). This event is how every other instance in the same tab knows
// to re-read localStorage.
const AUTH_CHANGED_EVENT = "setu-auth-changed";

/** There is no Supabase Auth wired up yet (see docs/DECISIONS.md) — this
 * is real server-verified authentication (a bearer token the backend
 * issues and checks on every request), just not Aadhaar/Supabase-backed
 * yet. Token is stored in localStorage; api.ts reads it directly for
 * the Authorization header on every citizen-scoped call. */
export function useAuth() {
  const [state, setState] = useState<AuthState>({
    token: null,
    citizenId: null,
    role: null,
    name: null,
    isLoggedIn: false,
  });

  useEffect(() => {
    // Reading localStorage — unavailable during SSR — is the documented
    // "synchronize with an external system" case.
    const stored = readStoredAuth();
    setState(stored);

    // Verify persisted session with backend if a token exists
    if (stored.token) {
      authApi
        .me(stored.token)
        .then((me) => {
          if (me.citizen_id !== stored.citizenId || me.role !== stored.role) {
            try {
              localStorage.setItem(CITIZEN_ID_KEY, me.citizen_id);
              localStorage.setItem(ROLE_KEY, me.role);
            } catch {
              // best-effort
            }
            setState((prev) => ({
              ...prev,
              token: stored.token,
              citizenId: me.citizen_id,
              role: me.role as "citizen" | "admin",
              isLoggedIn: true,
            }));
          }
        })
        .catch((err) => {
          // If server rejects token as 401 expired or invalid, invalidate local session
          if (err?.status === 401) {
            try {
              localStorage.removeItem(TOKEN_KEY);
              localStorage.removeItem(CITIZEN_ID_KEY);
              localStorage.removeItem(ROLE_KEY);
              localStorage.removeItem(NAME_KEY);
            } catch {
              // best-effort
            }
            setState({ token: null, citizenId: null, role: null, name: null, isLoggedIn: false });
            window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
          }
        });
    }

    const resync = () => setState(readStoredAuth());
    window.addEventListener(AUTH_CHANGED_EVENT, resync);
    return () => window.removeEventListener(AUTH_CHANGED_EVENT, resync);
  }, []);

  const login = useCallback(async (identifier: string) => {
    const session = await authApi.login(identifier);
    const derivedName =
      KNOWN_IDENTIFIERS[identifier] ||
      (session.role === "admin" ? "Admin Officer" : "Demo Citizen");
    try {
      localStorage.setItem(TOKEN_KEY, session.token);
      localStorage.setItem(CITIZEN_ID_KEY, session.citizen_id);
      localStorage.setItem(ROLE_KEY, session.role);
      localStorage.setItem(NAME_KEY, derivedName);
    } catch {
      // best-effort only
    }
    setState({
      token: session.token,
      citizenId: session.citizen_id,
      role: session.role as "citizen" | "admin",
      name: derivedName,
      isLoggedIn: true,
    });
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
    return session;
  }, []);

  const logout = useCallback(async () => {
    const token = state.token ?? getStoredAuthToken();
    if (token) {
      authApi.logout(token).catch(() => {});
    }
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(CITIZEN_ID_KEY);
      localStorage.removeItem(ROLE_KEY);
      localStorage.removeItem(NAME_KEY);
    } catch {
      // best-effort only
    }
    setState({ token: null, citizenId: null, role: null, name: null, isLoggedIn: false });
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }, [state.token]);

  const setName = useCallback((newName: string) => {
    try {
      localStorage.setItem(NAME_KEY, newName);
    } catch {
      // best-effort
    }
    setState((prev) => ({ ...prev, name: newName }));
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
  }, []);

  return { ...state, login, logout, setName };
}

/** Read directly (not via the hook) for api.ts's request() helper, which
 * is a plain module outside React. */
export function getStoredAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
