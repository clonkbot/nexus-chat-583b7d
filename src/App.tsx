import { useConvexAuth } from "convex/react";
import { AuthScreen } from "./components/AuthScreen";
import { MainApp } from "./components/MainApp";
import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

export default function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const heartbeat = useMutation(api.users.heartbeat);

  useEffect(() => {
    if (!isAuthenticated) return;

    heartbeat();
    const interval = setInterval(() => {
      heartbeat();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, heartbeat]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
          <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-cyan-400/20 border-b-cyan-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return <MainApp />;
}
