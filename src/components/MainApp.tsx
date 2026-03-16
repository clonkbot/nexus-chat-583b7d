import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ServerList } from "./ServerList";
import { ChannelList } from "./ChannelList";
import { ChatArea } from "./ChatArea";
import { MemberList } from "./MemberList";
import { UserPanel } from "./UserPanel";

export function MainApp() {
  const [selectedServerId, setSelectedServerId] = useState<Id<"servers"> | null>(null);
  const [selectedChannelId, setSelectedChannelId] = useState<Id<"channels"> | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMembers, setShowMembers] = useState(true);

  const servers = useQuery(api.servers.list);
  const channels = useQuery(
    api.channels.listByServer,
    selectedServerId ? { serverId: selectedServerId } : "skip"
  );

  // Auto-select first server and channel
  useEffect(() => {
    if (servers && servers.length > 0 && !selectedServerId) {
      setSelectedServerId(servers[0]._id);
    }
  }, [servers, selectedServerId]);

  useEffect(() => {
    if (channels && channels.length > 0 && !selectedChannelId) {
      const textChannel = channels.find((c: { type: string }) => c.type === "text");
      if (textChannel) {
        setSelectedChannelId(textChannel._id);
      }
    }
  }, [channels, selectedChannelId]);

  const handleServerSelect = (serverId: Id<"servers">) => {
    setSelectedServerId(serverId);
    setSelectedChannelId(null);
    setShowMobileMenu(false);
  };

  const handleChannelSelect = (channelId: Id<"channels">) => {
    setSelectedChannelId(channelId);
    setShowMobileMenu(false);
  };

  return (
    <div className="h-screen bg-[#0a0a0f] flex flex-col overflow-hidden">
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between p-3 bg-[#12121a] border-b border-white/5">
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-white font-semibold">NEXUS</span>
        <button
          onClick={() => setShowMembers(!showMembers)}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile overlay */}
        {showMobileMenu && (
          <div
            className="md:hidden fixed inset-0 bg-black/60 z-40"
            onClick={() => setShowMobileMenu(false)}
          />
        )}

        {/* Server list sidebar */}
        <div className={`
          ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          fixed md:relative z-50 md:z-auto
          h-full md:h-auto
          transition-transform duration-300 ease-out
          flex
        `}>
          <ServerList
            selectedServerId={selectedServerId}
            onServerSelect={handleServerSelect}
          />

          {/* Channel list */}
          {selectedServerId && (
            <ChannelList
              serverId={selectedServerId}
              selectedChannelId={selectedChannelId}
              onChannelSelect={handleChannelSelect}
            />
          )}
        </div>

        {/* Main chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedChannelId ? (
            <ChatArea
              channelId={selectedChannelId}
              showMembers={showMembers}
              onToggleMembers={() => setShowMembers(!showMembers)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-[#0f0f15]">
              <div className="text-center p-8">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-500/20 to-cyan-400/20 flex items-center justify-center">
                  <svg className="w-12 h-12 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Welcome to Nexus</h3>
                <p className="text-zinc-400 max-w-sm">Select a channel to start chatting, or create a new server to begin your journey.</p>
              </div>
            </div>
          )}
        </div>

        {/* Member list - desktop */}
        {selectedServerId && showMembers && (
          <div className="hidden lg:block">
            <MemberList serverId={selectedServerId} />
          </div>
        )}
      </div>

      {/* User panel */}
      <UserPanel />

      {/* Footer */}
      <div className="hidden md:block absolute bottom-0 left-1/2 -translate-x-1/2 pb-2 text-zinc-700 text-[10px]">
        Requested by @web-user · Built by @clonkbot
      </div>
    </div>
  );
}
