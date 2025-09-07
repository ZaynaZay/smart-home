import { createContext, useState, useEffect, useContext } from "react";
import type { ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Session, User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

// Define the shape of the context's value
interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // NEW: A separate function to handle the onboarding check
  const checkOnboardingStatus = async (user: User) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("has_completed_onboarding")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error checking onboarding status:", error.message);
    }

    // If the profile exists and onboarding is NOT complete, redirect.
    if (data && !data.has_completed_onboarding) {
      navigate("/onboarding");
    }
  };

  useEffect(() => {
    // Check the initial session when the app loads
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);

      // If a user is already logged in, check their onboarding status
      if (session?.user) {
        await checkOnboardingStatus(session.user);
      }

      setLoading(false);
    };

    getInitialSession();

    // Listen for changes in authentication state (e.g., SIGNED_IN, SIGNED_OUT)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        // Crucially, if the event is a new SIGNED_IN, check for onboarding.
        if (_event === "SIGNED_IN" && session?.user) {
          await checkOnboardingStatus(session.user);
        }

        setLoading(false);
      }
    );

    // Cleanup the listener when the component unmounts
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [navigate]); // Added navigate to dependency array as it's used in an effect

  // The signOut function remains the same, as the listener above will handle the state change.
  const signOut = async () => {
    await supabase.auth.signOut();
    // No need to navigate here, the SIGNED_OUT event will fire, and protected routes will handle the redirect.
  };

  const value = {
    user,
    session,
    loading,
    signOut,
  };

  // We don't render the app until the initial session check is complete to avoid flashes of content.
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// The custom hook for easy access to the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
