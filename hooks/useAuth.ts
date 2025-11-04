import { useState, useEffect } from 'react';

interface AuthSession {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
  };
  expires: string;
}

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("sessionToken");
      if (token) {
        try {
          const sessionRes = await fetch(`/api/auth/getSession?token=${token}`);
          if (sessionRes.ok) {
            const data = await sessionRes.json();
            if (data && data.user) {
              setSession(data);
            } else {
              // Token is invalid or expired
              localStorage.removeItem("sessionToken");
              setSession(null);
            }
          } else {
             localStorage.removeItem("sessionToken");
             setSession(null);
          }
        } catch (error) {
          console.error("Failed to fetch session:", error);
          setSession(null);
        }
      } else {
        setSession(null);
      }
      setIsLoading(false);
    };

    getSession();
  }, []);

  return { session, isLoading };
}