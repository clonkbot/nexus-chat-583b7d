import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface ChatAreaProps {
  channelId: Id<"channels">;
  showMembers: boolean;
  onToggleMembers: () => void;
}

export function ChatArea({ channelId, showMembers, onToggleMembers }: ChatAreaProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channel = useQuery(api.channels.get, { channelId });
  const messages = useQuery(api.messages.listByChannel, { channelId });
  const sendMessage = useMutation(api.messages.send);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    await sendMessage({ channelId, content: message.trim() });
    setMessage("");
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  };

  const getAvatarColor = (userId: string) => {
    const colors = [
      'from-violet-500 to-purple-600',
      'from-cyan-500 to-blue-600',
      'from-rose-500 to-pink-600',
      'from-emerald-500 to-green-600',
      'from-amber-500 to-orange-600',
      'from-fuchsia-500 to-purple-600',
    ];
    const index = userId.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Define message type
  type Message = {
    _id: string;
    channelId: Id<"channels">;
    userId: string;
    content: string;
    createdAt: number;
    edited?: boolean;
    user?: { email?: string } | null;
    profile?: { displayName?: string } | null;
  };

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  let currentDate = "";

  messages?.forEach((msg: Message) => {
    const msgDate = formatDate(msg.createdAt);
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groupedMessages.push({ date: msgDate, messages: [] });
    }
    groupedMessages[groupedMessages.length - 1].messages?.push(msg);
  });

  return (
    <div className="flex-1 flex flex-col bg-[#0f0f15] min-h-0">
      {/* Channel header */}
      <div className="h-12 px-4 flex items-center justify-between border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
          <span className="font-semibold text-white">{channel?.name}</span>
          {channel?.topic && (
            <>
              <div className="w-px h-5 bg-white/10 mx-2" />
              <span className="text-zinc-400 text-sm truncate">{channel.topic}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors hidden sm:block">
            <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors hidden sm:block">
            <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
          <button
            onClick={onToggleMembers}
            className={`p-2 rounded-lg transition-colors hidden lg:block ${showMembers ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-zinc-400'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </button>
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Search"
              className="w-40 px-3 py-1.5 bg-[#1a1a25] border border-white/10 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 transition-all"
            />
            <svg className="w-4 h-4 text-zinc-500 absolute right-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin min-h-0">
        {/* Welcome message */}
        <div className="mb-8 pt-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500/20 to-cyan-400/20 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Welcome to #{channel?.name}!</h2>
          <p className="text-zinc-400">This is the start of the #{channel?.name} channel.</p>
        </div>

        {/* Message groups by date */}
        {groupedMessages.map((group, groupIndex) => (
          <div key={groupIndex}>
            {/* Date divider */}
            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs font-semibold text-zinc-500">{group.date}</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Messages */}
            {group.messages?.map((msg: Message, msgIndex: number) => {
              const prevMsg = msgIndex > 0 ? group.messages[msgIndex - 1] : null;
              const isCompact = prevMsg &&
                prevMsg.userId === msg.userId &&
                msg.createdAt - prevMsg.createdAt < 5 * 60 * 1000;

              return (
                <div
                  key={msg._id}
                  className={`group flex items-start gap-4 hover:bg-white/[0.02] rounded-lg px-2 py-0.5 -mx-2 transition-colors ${isCompact ? 'mt-0' : 'mt-4'}`}
                >
                  {isCompact ? (
                    <div className="w-10 flex-shrink-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-zinc-600">{formatTime(msg.createdAt)}</span>
                    </div>
                  ) : (
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(msg.userId)} flex-shrink-0 flex items-center justify-center text-white font-bold text-sm`}>
                      {(msg.profile?.displayName || msg.user?.email || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {!isCompact && (
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-white hover:underline cursor-pointer">
                          {msg.profile?.displayName || msg.user?.email?.split('@')[0] || "User"}
                        </span>
                        <span className="text-xs text-zinc-500">{formatTime(msg.createdAt)}</span>
                        {msg.edited && (
                          <span className="text-xs text-zinc-600">(edited)</span>
                        )}
                      </div>
                    )}
                    <p className="text-zinc-300 break-words whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {/* Message actions */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 -mt-1">
                    <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
                      <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                    <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
                      <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                    </button>
                    <button className="p-1.5 hover:bg-white/10 rounded transition-colors">
                      <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="px-4 pb-4 md:pb-6 flex-shrink-0">
        <form onSubmit={handleSend} className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <button type="button" className="p-1.5 hover:bg-white/10 rounded-full transition-colors">
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message #${channel?.name}`}
            className="w-full pl-12 pr-24 py-3 bg-[#1a1a25] border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500/30 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button type="button" className="p-1.5 hover:bg-white/10 rounded-full transition-colors hidden sm:block">
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button type="button" className="p-1.5 hover:bg-white/10 rounded-full transition-colors hidden sm:block">
              <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            <button
              type="submit"
              disabled={!message.trim()}
              className="p-1.5 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
