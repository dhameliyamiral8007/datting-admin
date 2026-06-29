import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/admin-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { ArrowLeft, Ban, Clock, ShieldCheck, CheckCircle2, XCircle, User as UserIcon, Mail, Phone, MapPin, Calendar, Activity } from "lucide-react";

export const Route = createFileRoute("/admin/users/$userId")({
  component: UserDetails,
});

function UserDetails() {
  const { userId } = Route.useParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [busy, setBusy] = useState(false);

  const u = user?.user || (Array.isArray(user?.users) ? user.users[0] : user);
  const isBlocked = u?.isBlocked || u?.blocked;
  const isSuspended = u?.isSuspended || u?.suspendedUntil;

  function load() {
    setLoading(true);
    api<any>(`/admin/users/${userId}`)
      .then((r) => setUser(r?.data ?? r))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, [userId]);

  async function action(path: string, body?: any, msg = "Done") {
    setBusy(true);
    try {
      await api(path, { method: "POST", body });
      toast.success(msg);
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild size="sm" variant="ghost"><Link to="/admin/users"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Link></Button>
        <h1 className="text-2xl font-semibold">User Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent>
            {loading ? <div className="text-muted-foreground text-sm">Loading...</div> :
              <ProfileDetail user={user} />}
          </CardContent>
        </Card>

        <div className="space-y-4">
          {(!isBlocked && !isSuspended) ? (
            <>
              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Ban className="w-4 h-4" /> Block</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">Permanently block this user.</p>
                  <Button variant="destructive" className="w-full" disabled={busy} onClick={() => action(`/admin/users/${userId}/block`, undefined, "User blocked")}>
                    Block permanently
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4" /> Suspend</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label>Duration (days)</Label>
                    <Input type="number" min={1} value={days} onChange={(e) => setDays(parseInt(e.target.value) || 1)} />
                  </div>
                  <Button className="w-full" disabled={busy} onClick={() => action(`/admin/users/${userId}/suspend`, { durationDays: days }, `Suspended for ${days} days`)}>
                    Suspend
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Restore</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  This user is currently {isBlocked ? "blocked" : "suspended"}.
                </p>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={busy} onClick={() => action(`/admin/users/${userId}/unblock`, undefined, "User restored")}>
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  {isBlocked ? "Unblock User" : "Unsuspend User"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileDetail({ user }: { user: any }) {
  const u = user?.user || (Array.isArray(user?.users) ? user.users[0] : user);
  if (!u) return <div className="p-4 text-center text-muted-foreground">User not found.</div>;

  const safeDate = (d: string) => {
    if (!d) return "N/A";
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? "N/A" : dt.toLocaleDateString();
  };

  const safeDateTime = (d: string) => {
    if (!d) return "N/A";
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? "N/A" : dt.toLocaleString();
  };

  const getAge = (dob: string) => {
    if (!dob) return "N/A";
    const dt = new Date(dob);
    if (isNaN(dt.getTime())) return "N/A";
    const ageDifMs = Date.now() - dt.getTime();
    const ageDate = new Date(ageDifMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970) + " yrs";
  };

  const mainPhoto = u.photos?.[0]?.url || "";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Avatar className="w-20 h-20">
          <AvatarImage src={mainPhoto} />
          <AvatarFallback><UserIcon className="w-8 h-8" /></AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            {u.name || "Unknown"}
            {u.isPremium && <Badge variant="default" className="bg-gradient-to-r from-yellow-400 to-amber-500 border-0">Premium</Badge>}
            {u.isPlatinum && <Badge variant="default" className="bg-gradient-to-r from-slate-300 to-slate-500 border-0">Platinum</Badge>}
          </h2>
          <div className="text-muted-foreground text-sm space-y-1 mt-1">
            <div className="flex items-center gap-1"><Mail className="w-4 h-4" /> {u.email || "No email"}</div>
            {u.phone && <div className="flex items-center gap-1"><Phone className="w-4 h-4" /> {u.phone}</div>}
            <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {u.city || "Unknown City"}</div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={u.isActive ? "default" : "secondary"}>
            {u.isActive ? "Active" : "Inactive"}
          </Badge>
          <div className="text-sm font-medium">Trust Score: {u.trustScore ?? 0}</div>
        </div>
      </div>

      <div className="border-t border-border" />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2"><Activity className="w-4 h-4" /> Verifications</h3>
          <div className="space-y-2 text-sm bg-secondary/30 p-3 rounded-md">
            <div className="flex items-center justify-between">
              <span>Email Verified</span>
              {u.isEmailVerified ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
            </div>
            <div className="flex items-center justify-between">
              <span>Phone Verified</span>
              {u.isPhoneVerified ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
            </div>
            <div className="flex items-center justify-between">
              <span>Selfie Verified</span>
              {u.isSelfieVerified ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
            </div>
            <div className="flex items-center justify-between">
              <span>Aadhaar Verified</span>
              {u.isAadhaarVerified ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2"><Calendar className="w-4 h-4" /> Demographics</h3>
          <div className="space-y-2 text-sm bg-secondary/30 p-3 rounded-md">
            <div className="flex justify-between"><span>Age / DOB</span> <span>{getAge(u.dob)} ({safeDate(u.dob)})</span></div>
            <div className="flex justify-between"><span>Gender</span> <span className="capitalize">{u.gender?.replace('_', ' ') || 'N/A'}</span></div>
            <div className="flex justify-between"><span>Looking For</span> <span className="capitalize">{u.lookingFor?.join(', ') || 'N/A'}</span></div>
            <div className="flex justify-between"><span>Religion</span> <span className="capitalize">{u.religionPreference || 'N/A'}</span></div>
          </div>
        </div>
      </div>

      <div className="border-t border-border" />

      <div>
        <h3 className="font-semibold mb-3">Photos</h3>
        {u.photos?.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {u.photos.map((p: any) => (
              <img key={p._id} src={p.url} alt="User photo" className="w-32 h-40 object-cover rounded-md border shadow-sm" />
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground bg-secondary/30 p-4 rounded-md text-center">No photos uploaded.</div>
        )}
      </div>

      <div className="border-t border-border" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-secondary/30 p-3 rounded-md text-center"><div className="text-muted-foreground">Matches</div><div className="font-semibold text-xl">{u.totalMatches || 0}</div></div>
        <div className="bg-secondary/30 p-3 rounded-md text-center"><div className="text-muted-foreground">Likes Received</div><div className="font-semibold text-xl">{u.totalLikesReceived || 0}</div></div>
        <div className="bg-secondary/30 p-3 rounded-md text-center"><div className="text-muted-foreground">Login Streak</div><div className="font-semibold text-xl">{u.loginStreak || 0}</div></div>
        <div className="bg-secondary/30 p-3 rounded-md text-center"><div className="text-muted-foreground">Coins</div><div className="font-semibold text-xl">{u.sparqCoins || 0}</div></div>
      </div>

      <div className="text-xs text-muted-foreground flex justify-between pt-4">
        <span>Joined: {safeDateTime(u.createdAt)}</span>
        <span>Last Active: {safeDateTime(u.lastActiveAt || u.lastSeen)}</span>
      </div>
    </div>
  );
}