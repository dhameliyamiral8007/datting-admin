import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/admin-api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  MapPin, Ban, Clock, ShieldCheck,
  ChevronLeft, ChevronRight, User, Zap, Star, Heart,
  Bot, Crown, Wifi, Check, Send
} from "lucide-react";

export const Route = createFileRoute("/admin/users/")({
  component: UsersList,
});

function UsersList() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [tab, setTab] = useState("all");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState<string | null>(null);

  const [notifyUser, setNotifyUser] = useState<string | null>(null);
  const [notificationTemplates, setNotificationTemplates] = useState<any[]>([]);
  const [notificationType, setNotificationType] = useState("other");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [sendingNotification, setSendingNotification] = useState(false);

  function loadUsers() {
    setLoading(true);
    setError(null);
    const endpoint = tab === "hidden" ? "/admin/users/hidden" : "/admin/users";
    api<any>(`${endpoint}?page=${page}&limit=${limit}`)
      .then((r) => setData(r?.data ?? r))
      .catch((err) => {
        setError(err.message || "Failed to load users");
        toast.error(err.message || "Failed to load users");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadUsers(); }, [page, limit, tab]);

  useEffect(() => {
    api<any>("/admin/notifications")
      .then((res) => setNotificationTemplates(res?.data || []))
      .catch((err) => console.error("Failed to load notification templates", err));
  }, []);

  async function handleModeration(userId: string, actionType: "block" | "suspend" | "unblock" | "approve", durationDays = 7) {
    setActionBusy(userId);
    try {
      if (actionType === "approve") {
        await api(`/admin/users/${userId}/show`, {
          method: "POST",
          body: { isShow: true }
        });
        toast.success("User approved successfully");
      } else {
        const body = actionType === "suspend" ? { durationDays } : undefined;
        await api(`/admin/users/${userId}/${actionType}`, { method: "POST", body });
        toast.success(`User ${actionType}ed successfully`);
      }
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Action failed");
    } finally {
      setActionBusy(null);
    }
  }

  function handleNotify(userId: string) {
    setNotifyUser(userId);
    setNotificationType("other");
    setNotificationMessage("");
  }

  async function submitNotification() {
    if (!notifyUser) return;
    if (notificationType === "other" && !notificationMessage.trim()) {
      toast.error("Message is required for custom notifications");
      return;
    }
    
    setSendingNotification(true);
    try {
      await api(`/admin/send-notification`, {
        method: "POST",
        body: {
          userId: notifyUser,
          notificationType,
          message: notificationType === "other" ? notificationMessage : undefined
        }
      });
      toast.success("Notification sent successfully");
      setNotifyUser(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to send notification");
    } finally {
      setSendingNotification(false);
    }
  }

  const items: any[] = data?.users || data?.items || data?.feed || (Array.isArray(data) ? data : []);
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </span>
            Users
          </h1>
          <p className="text-muted-foreground text-sm mt-1 ml-1">
            Manage active and pending approval profiles
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Tabs value={tab} onValueChange={(v) => { setTab(v); setPage(1); }} className="w-full sm:w-auto">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="all" className="flex-1 sm:flex-none">Active</TabsTrigger>
              <TabsTrigger value="hidden" className="flex-1 sm:flex-none">Pending Approval</TabsTrigger>
            </TabsList>
          </Tabs>
          {!loading && items.length > 0 && (
            <Badge variant="secondary" className="text-xs font-semibold px-3 py-1 h-8 flex items-center">
              {pagination?.total ?? items.length} profiles found
            </Badge>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive font-medium">{error}</CardContent>
        </Card>
      )}

      {/* Feed Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-border/60 bg-card shadow-sm">
              <Skeleton className="h-64 w-full rounded-none" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-3.5 w-full" />
                <div className="flex gap-1.5 pt-1">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-12 rounded-full" />
                </div>
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-8 flex-1 rounded-lg" />
                  <Skeleton className="h-8 flex-1 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg">No profiles found</h3>
          <p className="text-muted-foreground text-sm mt-1 max-w-xs">
            There are no users in this list.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((u: any) => {
            const id = u._id || u.id;
            const photos: any[] = u.photos || [];
            const photoUrl = photos[0]?.url || photos[0]?.thumbnailUrl;
            const blocked = u.isBlocked || u.blocked;
            const suspended = u.isSuspended || u.suspendedUntil;
            const distKm = u.distanceKm ?? u.distance;
            const busy = actionBusy === id;

            return (
              <div key={id} className="group rounded-2xl overflow-hidden border border-border/50 bg-card shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col">

                {/* ── Photo Area ── */}
                <div className="relative h-64 bg-gradient-to-br from-secondary to-muted overflow-hidden shrink-0">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={u.name || "Profile"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { (e.target as HTMLImageElement).src = ""; (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <User className="w-14 h-14 opacity-30" />
                      <span className="text-xs opacity-50">No photo</span>
                    </div>
                  )}

                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  {/* Top left badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {blocked ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-500 text-white shadow-md">
                        <Ban className="w-3 h-3" /> Blocked
                      </span>
                    ) : suspended ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-amber-900 shadow-md">
                        <Clock className="w-3 h-3" /> Suspended
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-400/90 text-emerald-900 shadow-md">
                        <Wifi className="w-3 h-3" /> Active
                      </span>
                    )}
                    {u.isAiUser && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-violet-500 text-white shadow-md">
                        <Bot className="w-3 h-3" /> AI
                      </span>
                    )}
                  </div>

                  {/* Top right badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                    {u.isPlatinum && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-cyan-400 text-cyan-900 shadow-md">
                        <Zap className="w-3 h-3" /> Platinum
                      </span>
                    )}
                    {u.isPremium && !u.isPlatinum && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-amber-900 shadow-md">
                        <Crown className="w-3 h-3" /> Premium
                      </span>
                    )}
                  </div>

                  {/* Bottom overlay: name + age */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <div className="flex items-end justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-base leading-tight truncate drop-shadow-md">
                          {u.name || u.username || "Anonymous"}
                          {u.age ? <span className="font-normal text-white/80">, {u.age}</span> : ""}
                        </h3>
                        {(u.locationCity || u.city) && (
                          <p className="text-white/70 text-xs flex items-center gap-1 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {u.locationCity || u.city}
                            {distKm !== undefined && (
                              <span className="text-white/50 ml-1">· {Number(distKm).toFixed(0)} km</span>
                            )}
                          </p>
                        )}
                      </div>
                      {u.compatibilityScore !== undefined && (
                        <div className="shrink-0 flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-0.5">
                          <Heart className="w-3 h-3 text-pink-300 fill-pink-300" />
                          <span className="text-white text-xs font-bold">{u.compatibilityScore}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Card Body ── */}
                <div className="p-4 flex-1 flex flex-col gap-3">
                  {/* Bio */}
                  {u.bio && (
                    <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2 italic">
                      "{u.bio}"
                    </p>
                  )}

                  {/* Interests */}
                  {Array.isArray(u.interests) && u.interests.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {u.interests.slice(0, 4).map((tag: string, i: number) => (
                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/8 text-primary text-[11px] font-medium border border-primary/15">
                          {tag}
                        </span>
                      ))}
                      {u.interests.length > 4 && (
                        <span className="text-[11px] text-muted-foreground self-center font-medium">+{u.interests.length - 4}</span>
                      )}
                    </div>
                  )}

                  {/* Stats row */}
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground border-t border-border/40 pt-2">
                    {u.trustScore !== undefined && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        Trust {u.trustScore}
                      </span>
                    )}
                    {u.currentMode && (
                      <span className="capitalize">{u.currentMode}</span>
                    )}
                    <span className="ml-auto font-mono truncate max-w-[90px] opacity-60" title={id}>{id?.slice(-8)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 mt-auto pt-1">
                    <div className="grid grid-cols-2 gap-1.5">
                      <Button asChild size="sm" variant="outline" className="h-8 text-xs font-medium">
                        <Link to="/admin/users/$userId" params={{ userId: id }}>
                          View Profile
                        </Link>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 text-xs font-medium text-blue-600 border-blue-200 hover:bg-blue-50" 
                        onClick={() => handleNotify(id)}
                      >
                        <Send className="w-3 h-3 mr-1" /> Notify
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {tab === "hidden" ? (
                        <Button
                          size="sm"
                          className="col-span-2 h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          disabled={busy}
                          onClick={() => handleModeration(id, "approve")}
                        >
                          <Check className="w-3.5 h-3.5 mr-1" />
                          {busy ? "..." : "Approve User"}
                        </Button>
                      ) : (blocked || suspended) ? (
                        <Button
                          size="sm"
                          className="col-span-2 h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                          disabled={busy}
                          onClick={() => handleModeration(id, "unblock")}
                        >
                          <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                          {busy ? "..." : blocked ? "Unblock User" : "Unsuspend User"}
                        </Button>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                            disabled={busy}
                            onClick={() => handleModeration(id, "block")}
                          >
                            <Ban className="w-3.5 h-3.5 mr-1" />
                            {busy ? "..." : "Block"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs text-amber-600 border-amber-200 hover:bg-amber-50 hover:border-amber-300"
                            disabled={busy}
                            onClick={() => handleModeration(id, "suspend", 7)}
                          >
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            {busy ? "..." : "Suspend"}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && items.length > 0 && (
        <div className="flex items-center justify-between pt-2">
          <div className="text-sm text-muted-foreground">
            Page <span className="font-semibold text-foreground">{page}</span>
            {pagination?.totalPages && (
              <span> of {pagination.totalPages}</span>
            )}
            {pagination?.total && (
              <span className="ml-2 text-xs">({pagination.total} total)</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>
            <Button variant="outline" size="sm" className="gap-1" disabled={pagination?.totalPages ? page >= pagination.totalPages : items.length < limit} onClick={() => setPage((p) => p + 1)}>
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Notify Dialog */}
      <Dialog open={!!notifyUser} onOpenChange={(o) => !o && setNotifyUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Notification Type</Label>
              <Select value={notificationType} onValueChange={setNotificationType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="other">Custom Text (Other)</SelectItem>
                  {notificationTemplates.map(t => (
                    <SelectItem key={t._id} value={t.type}>{t.type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {notificationType === "other" && (
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea 
                  placeholder="Type your custom warning or message here..."
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  rows={4}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNotifyUser(null)} disabled={sendingNotification}>Cancel</Button>
            <Button disabled={sendingNotification} onClick={submitNotification}>
              {sendingNotification ? "Sending..." : "Send Notification"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}