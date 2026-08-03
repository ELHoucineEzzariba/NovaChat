"use client";

/**
 * App-weiter Auth-Kontext: spiegelt Firebase Auths aktuellen Nutzer wider und
 * hält per watchSessionCookie ein Session-Cookie synchron, das proxy.ts für
 * serverseitige Routenschutz-Entscheidungen liest.
 */
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { watchSessionCookie } from "@/lib/services/auth";

interface AuthContextValue {
  user: FirebaseUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    const unsubscribeCookie = watchSessionCookie();

    return () => {
      unsubscribeAuth();
      unsubscribeCookie();
    };
  }, []);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
