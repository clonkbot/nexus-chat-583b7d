import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface ServerListProps {
  selectedServerId: Id<"servers"> | null;
  onServerSelect: (serverId: Id<"servers">) => void;
}

export function ServerList({ selectedServerId, onServerSelect }: ServerListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const servers = useQuery(api.servers.list);
  const createServer = useMutation(api.servers.create);

  const getServerInitials = (name: string) => {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  };

  const getServerColor = (id: string) => {
    const colors = [
      'from-violet-500 to-purple-600',
      'from-cyan-500 to-blue-600',
      'from-rose-500 to-pink-600',
      'from-emerald-500 to-green-600',
      'from-amber-500 to-orange-600',
      'from-fuchsia-500 to-purple-600',
    ];
    const index = id.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <>
      <div className="w-[72px] bg-[#08080c] flex flex-col items-center py-3 gap-2 overflow-y-auto scrollbar-hide">
        {/* Home button */}
        <button className="group relative w-12 h-12 rounded-2xl bg-[#12121a] hover:bg-violet-600 flex items-center justify-center transition-all duration-200 hover:rounded-xl">
          <svg className="w-6 h-6 text-zinc-400 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          <div className="absolute left-0 w-1 h-5 bg-white rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity -translate-x-[2px]" />
        </button>

        <div className="w-8 h-px bg-white/10 my-1" />

        {/* Server list */}
        {servers?.map((server: { _id: Id<"servers">; name: string; icon?: string } | null) => server && (
          <button
            key={server._id}
            onClick={() => onServerSelect(server._id)}
            className={`group relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 hover:rounded-xl ${
              selectedServerId === server._id
                ? `bg-gradient-to-br ${getServerColor(server._id)} rounded-xl`
                : 'bg-[#12121a] hover:bg-violet-600'
            }`}
          >
            {server.icon ? (
              <img src={server.icon} alt={server.name} className="w-full h-full object-cover rounded-inherit" />
            ) : (
              <span className={`text-sm font-bold ${selectedServerId === server._id ? 'text-white' : 'text-zinc-400 group-hover:text-white'} transition-colors`}>
                {getServerInitials(server.name)}
              </span>
            )}
            <div className={`absolute left-0 w-1 rounded-r-full -translate-x-[2px] transition-all ${
              selectedServerId === server._id
                ? 'h-10 bg-white'
                : 'h-5 bg-white opacity-0 group-hover:opacity-100'
            }`} />

            {/* Tooltip */}
            <div className="absolute left-full ml-4 px-3 py-2 bg-[#18181f] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
              <span className="text-sm font-semibold text-white">{server.name}</span>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#18181f] rotate-45" />
            </div>
          </button>
        ))}

        {/* Add server button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="group relative w-12 h-12 rounded-2xl bg-[#12121a] hover:bg-emerald-600 flex items-center justify-center transition-all duration-200 hover:rounded-xl"
        >
          <svg className="w-6 h-6 text-emerald-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {/* Explore servers */}
        <button
          onClick={() => setShowJoinModal(true)}
          className="group relative w-12 h-12 rounded-2xl bg-[#12121a] hover:bg-emerald-600 flex items-center justify-center transition-all duration-200 hover:rounded-xl"
        >
          <svg className="w-6 h-6 text-emerald-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      {/* Create Server Modal */}
      {showCreateModal && (
        <CreateServerModal
          onClose={() => setShowCreateModal(false)}
          onCreate={async (name) => {
            const id = await createServer({ name });
            onServerSelect(id);
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Join Server Modal */}
      {showJoinModal && (
        <JoinServerModal
          onClose={() => setShowJoinModal(false)}
          onJoin={(serverId) => {
            onServerSelect(serverId);
            setShowJoinModal(false);
          }}
        />
      )}
    </>
  );
}

function CreateServerModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string) => void }) {
  const [name, setName] = useState("");

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-[#12121a] rounded-2xl p-6 w-full max-w-md border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-2">Create a server</h2>
        <p className="text-zinc-400 text-sm mb-6">Your server is where you and your friends hang out. Make yours and start talking.</p>

        <div className="mb-6">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Server Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-[#1a1a25] border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
            placeholder="My Awesome Server"
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => name.trim() && onCreate(name.trim())}
            disabled={!name.trim()}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

function JoinServerModal({ onClose, onJoin }: { onClose: () => void; onJoin: (serverId: Id<"servers">) => void }) {
  const allServers = useQuery(api.servers.listAll);
  const myServers = useQuery(api.servers.list);
  const joinServer = useMutation(api.servers.join);

  const myServerIds = new Set(myServers?.map((s: { _id: Id<"servers"> }) => s._id) || []);
  const availableServers = allServers?.filter((s: { _id: Id<"servers"> }) => !myServerIds.has(s._id)) || [];

  const handleJoin = async (serverId: Id<"servers">) => {
    await joinServer({ serverId });
    onJoin(serverId);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-[#12121a] rounded-2xl p-6 w-full max-w-md border border-white/10 shadow-2xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-2">Explore Servers</h2>
        <p className="text-zinc-400 text-sm mb-6">Join a community and start chatting</p>

        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {availableServers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-zinc-500">No servers to join yet</p>
              <p className="text-zinc-600 text-sm mt-1">Create one to get started!</p>
            </div>
          ) : (
            availableServers.map((server: { _id: Id<"servers">; name: string; icon?: string }) => (
              <button
                key={server._id}
                onClick={() => handleJoin(server._id)}
                className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl flex items-center gap-4 transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center text-white font-bold">
                  {server.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-white font-semibold">{server.name}</h3>
                  <p className="text-zinc-500 text-sm">Click to join</p>
                </div>
                <svg className="w-5 h-5 text-zinc-500 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            ))
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
}
