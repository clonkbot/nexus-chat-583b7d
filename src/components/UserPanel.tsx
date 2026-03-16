import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../convex/_generated/api";

export function UserPanel() {
  const [showSettings, setShowSettings] = useState(false);
  const { signOut } = useAuthActions();
  const currentUser = useQuery(api.users.current);
  const updatePresence = useMutation(api.users.updatePresence);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "online": return "bg-emerald-500";
      case "idle": return "bg-amber-500";
      case "dnd": return "bg-red-500";
      default: return "bg-zinc-500";
    }
  };

  const displayName = currentUser?.profile?.displayName || currentUser?.user?.email?.split('@')[0] || "User";
  const status = currentUser?.presence?.status || "online";

  return (
    <>
      <div className="bg-[#08080c] border-t border-white/5 px-2 py-2 flex items-center gap-2">
        {/* User avatar */}
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-bold text-sm">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${getStatusColor(status)} rounded-full border-2 border-[#08080c]`} />
        </div>

        {/* User info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{displayName}</p>
          <p className="text-xs text-zinc-500 truncate capitalize">{status}</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-0.5">
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414" />
            </svg>
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onSignOut={signOut}
          currentStatus={status}
          onStatusChange={(newStatus) => updatePresence({ status: newStatus })}
        />
      )}
    </>
  );
}

function SettingsModal({
  onClose,
  onSignOut,
  currentStatus,
  onStatusChange,
}: {
  onClose: () => void;
  onSignOut: () => void;
  currentStatus: string;
  onStatusChange: (status: "online" | "idle" | "dnd" | "offline") => void;
}) {
  const [activeTab, setActiveTab] = useState("account");

  const statuses = [
    { id: "online" as const, label: "Online", color: "bg-emerald-500", description: "Ready to chat" },
    { id: "idle" as const, label: "Idle", color: "bg-amber-500", description: "Away from keyboard" },
    { id: "dnd" as const, label: "Do Not Disturb", color: "bg-red-500", description: "No notifications" },
    { id: "offline" as const, label: "Invisible", color: "bg-zinc-500", description: "Appear offline" },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex z-50" onClick={onClose}>
      <div
        className="flex-1 flex max-w-5xl mx-auto my-4 md:my-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar - hidden on mobile */}
        <div className="hidden md:flex w-56 bg-[#0a0a0f] flex-col p-4 rounded-l-2xl">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-3 mb-2">User Settings</h2>

          <nav className="space-y-0.5">
            <button
              onClick={() => setActiveTab("account")}
              className={`w-full px-3 py-2 rounded-lg text-left text-sm transition-all ${
                activeTab === "account" ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-300'
              }`}
            >
              My Account
            </button>
            <button
              onClick={() => setActiveTab("status")}
              className={`w-full px-3 py-2 rounded-lg text-left text-sm transition-all ${
                activeTab === "status" ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-300'
              }`}
            >
              Status
            </button>
            <button
              onClick={() => setActiveTab("appearance")}
              className={`w-full px-3 py-2 rounded-lg text-left text-sm transition-all ${
                activeTab === "appearance" ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-300'
              }`}
            >
              Appearance
            </button>
          </nav>

          <div className="mt-auto pt-4 border-t border-white/10">
            <button
              onClick={onSignOut}
              className="w-full px-3 py-2 rounded-lg text-left text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-[#12121a] rounded-2xl md:rounded-l-none overflow-y-auto">
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-white">
                {activeTab === "account" && "My Account"}
                {activeTab === "status" && "Status"}
                {activeTab === "appearance" && "Appearance"}
              </h1>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile nav */}
            <div className="md:hidden flex gap-2 mb-6 overflow-x-auto pb-2">
              {["account", "status", "appearance"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                    activeTab === tab ? 'bg-violet-600 text-white' : 'bg-white/5 text-zinc-400'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {activeTab === "status" && (
              <div className="space-y-3">
                {statuses.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onStatusChange(s.id)}
                    className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all ${
                      currentStatus === s.id
                        ? 'bg-violet-500/20 border-2 border-violet-500'
                        : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full ${s.color}`} />
                    <div className="text-left">
                      <p className="text-white font-medium">{s.label}</p>
                      <p className="text-zinc-500 text-sm">{s.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {activeTab === "account" && (
              <div className="bg-[#1a1a25] rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white text-3xl font-bold">
                    U
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">User</h3>
                    <p className="text-zinc-400">Nexus Member</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      placeholder="How others see you"
                      className="w-full px-4 py-3 bg-[#12121a] border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                      Bio
                    </label>
                    <textarea
                      placeholder="Tell us about yourself"
                      rows={3}
                      className="w-full px-4 py-3 bg-[#12121a] border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div className="bg-[#1a1a25] rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Theme</h3>
                  <div className="flex gap-4 flex-wrap">
                    <button className="w-24 h-16 rounded-xl bg-[#0a0a0f] border-2 border-violet-500 flex items-center justify-center">
                      <span className="text-xs text-zinc-400">Dark</span>
                    </button>
                    <button className="w-24 h-16 rounded-xl bg-zinc-200 border-2 border-transparent flex items-center justify-center opacity-50 cursor-not-allowed">
                      <span className="text-xs text-zinc-600">Light</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile sign out */}
            <div className="md:hidden mt-8 pt-4 border-t border-white/10">
              <button
                onClick={onSignOut}
                className="w-full py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium rounded-xl transition-all"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
