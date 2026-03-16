import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface ChannelListProps {
  serverId: Id<"servers">;
  selectedChannelId: Id<"channels"> | null;
  onChannelSelect: (channelId: Id<"channels">) => void;
}

export function ChannelList({ serverId, selectedChannelId, onChannelSelect }: ChannelListProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const server = useQuery(api.servers.get, { serverId });
  const channels = useQuery(api.channels.listByServer, { serverId });
  const createChannel = useMutation(api.channels.create);

  type Channel = { _id: Id<"channels">; name: string; type: "text" | "voice" };
  const textChannels = channels?.filter((c: Channel) => c.type === "text") || [];
  const voiceChannels = channels?.filter((c: Channel) => c.type === "voice") || [];

  return (
    <>
      <div className="w-60 bg-[#0f0f15] flex flex-col border-r border-white/5">
        {/* Server header */}
        <div className="h-12 px-4 flex items-center justify-between border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors group">
          <h2 className="font-bold text-white truncate">{server?.name || "Server"}</h2>
          <svg className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4 scrollbar-thin">
          {/* Text Channels */}
          <ChannelCategory
            name="Text Channels"
            onAddClick={() => setShowCreateModal(true)}
          >
            {textChannels.map((channel: Channel) => (
              <ChannelButton
                key={channel._id}
                name={channel.name}
                type="text"
                isSelected={selectedChannelId === channel._id}
                onClick={() => onChannelSelect(channel._id)}
              />
            ))}
          </ChannelCategory>

          {/* Voice Channels */}
          {voiceChannels.length > 0 && (
            <ChannelCategory name="Voice Channels">
              {voiceChannels.map((channel: Channel) => (
                <ChannelButton
                  key={channel._id}
                  name={channel.name}
                  type="voice"
                  isSelected={selectedChannelId === channel._id}
                  onClick={() => onChannelSelect(channel._id)}
                />
              ))}
            </ChannelCategory>
          )}
        </div>
      </div>

      {/* Create Channel Modal */}
      {showCreateModal && (
        <CreateChannelModal
          onClose={() => setShowCreateModal(false)}
          onCreate={async (name, type) => {
            const id = await createChannel({ serverId, name, type });
            onChannelSelect(id);
            setShowCreateModal(false);
          }}
        />
      )}
    </>
  );
}

function ChannelCategory({
  name,
  children,
  onAddClick
}: {
  name: string;
  children: React.ReactNode;
  onAddClick?: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div>
      <div className="flex items-center justify-between px-1 mb-1 group">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs font-semibold text-zinc-400 uppercase tracking-wider hover:text-zinc-300 transition-colors"
        >
          <svg
            className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {name}
        </button>
        {onAddClick && (
          <button
            onClick={onAddClick}
            className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-300 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>
      {isExpanded && (
        <div className="space-y-0.5">
          {children}
        </div>
      )}
    </div>
  );
}

function ChannelButton({
  name,
  type,
  isSelected,
  onClick
}: {
  name: string;
  type: "text" | "voice";
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-all group ${
        isSelected
          ? 'bg-white/10 text-white'
          : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-300'
      }`}
    >
      {type === "text" ? (
        <svg className="w-5 h-5 flex-shrink-0 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
      ) : (
        <svg className="w-5 h-5 flex-shrink-0 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.728-2.728" />
        </svg>
      )}
      <span className="truncate text-sm">{name}</span>
      <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-1 hover:bg-white/10 rounded transition-colors">
          <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </button>
  );
}

function CreateChannelModal({
  onClose,
  onCreate
}: {
  onClose: () => void;
  onCreate: (name: string, type: "text" | "voice") => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"text" | "voice">("text");

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-[#12121a] rounded-2xl p-6 w-full max-w-md border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-6">Create Channel</h2>

        {/* Channel Type */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Channel Type
          </label>
          <div className="space-y-2">
            <button
              onClick={() => setType("text")}
              className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                type === "text"
                  ? 'bg-violet-500/20 border-2 border-violet-500'
                  : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
              }`}
            >
              <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              <div className="text-left">
                <p className="text-white font-medium">Text</p>
                <p className="text-zinc-500 text-sm">Send messages, images, and more</p>
              </div>
            </button>
            <button
              onClick={() => setType("voice")}
              className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                type === "voice"
                  ? 'bg-violet-500/20 border-2 border-violet-500'
                  : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
              }`}
            >
              <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.728-2.728" />
              </svg>
              <div className="text-left">
                <p className="text-white font-medium">Voice</p>
                <p className="text-zinc-500 text-sm">Hang out with voice and video</p>
              </div>
            </button>
          </div>
        </div>

        {/* Channel Name */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Channel Name
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">#</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              className="w-full pl-8 pr-4 py-3 bg-[#1a1a25] border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
              placeholder="new-channel"
              autoFocus
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => name.trim() && onCreate(name.trim(), type)}
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
