import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface MemberListProps {
  serverId: Id<"servers">;
}

interface Member {
  _id: string;
  userId: Id<"users">;
  role: "owner" | "admin" | "member";
  user?: { email?: string } | null;
  profile?: { displayName?: string } | null;
  presence?: { status?: string; customStatus?: string } | null;
};

export function MemberList({ serverId }: MemberListProps) {
  const members = useQuery(api.servers.getMembers, { serverId });

  const onlineMembers = members?.filter((m: Member) => m.presence?.status === "online" || m.presence?.status === "idle") || [];
  const offlineMembers = members?.filter((m: Member) => !m.presence || m.presence.status === "offline" || m.presence.status === "dnd") || [];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "online": return "bg-emerald-500";
      case "idle": return "bg-amber-500";
      case "dnd": return "bg-red-500";
      default: return "bg-zinc-500";
    }
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

  const getRoleBadge = (role: string) => {
    if (role === "owner") {
      return (
        <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 rounded">
          Owner
        </span>
      );
    }
    if (role === "admin") {
      return (
        <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold uppercase bg-violet-500/20 text-violet-400 rounded">
          Admin
        </span>
      );
    }
    return null;
  };

  return (
    <div className="w-60 bg-[#0f0f15] border-l border-white/5 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin">
        {/* Online members */}
        {onlineMembers.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-2 mb-2">
              Online — {onlineMembers.length}
            </h3>
            <div className="space-y-0.5">
              {onlineMembers.map((member: Member) => (
                <MemberItem
                  key={member._id}
                  name={member.profile?.displayName || member.user?.email?.split('@')[0] || "User"}
                  status={member.presence?.status}
                  customStatus={member.presence?.customStatus}
                  role={member.role}
                  avatarColor={getAvatarColor(member.userId)}
                  statusColor={getStatusColor(member.presence?.status)}
                  roleBadge={getRoleBadge(member.role)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Offline members */}
        {offlineMembers.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider px-2 mb-2">
              Offline — {offlineMembers.length}
            </h3>
            <div className="space-y-0.5">
              {offlineMembers.map((member: Member) => (
                <MemberItem
                  key={member._id}
                  name={member.profile?.displayName || member.user?.email?.split('@')[0] || "User"}
                  status="offline"
                  role={member.role}
                  avatarColor={getAvatarColor(member.userId)}
                  statusColor={getStatusColor("offline")}
                  roleBadge={getRoleBadge(member.role)}
                  isOffline
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MemberItem({
  name,
  status,
  customStatus,
  role,
  avatarColor,
  statusColor,
  roleBadge,
  isOffline = false,
}: {
  name: string;
  status?: string;
  customStatus?: string;
  role: string;
  avatarColor: string;
  statusColor: string;
  roleBadge: React.ReactNode;
  isOffline?: boolean;
}) {
  return (
    <button className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors group ${isOffline ? 'opacity-50' : ''}`}>
      <div className="relative flex-shrink-0">
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-sm font-semibold`}>
          {name.charAt(0).toUpperCase()}
        </div>
        <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 ${statusColor} rounded-full border-2 border-[#0f0f15]`} />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center">
          <span className={`text-sm font-medium truncate ${isOffline ? 'text-zinc-500' : 'text-zinc-300 group-hover:text-white'} transition-colors`}>
            {name}
          </span>
          {roleBadge}
        </div>
        {customStatus && (
          <p className="text-xs text-zinc-500 truncate">{customStatus}</p>
        )}
      </div>
    </button>
  );
}
