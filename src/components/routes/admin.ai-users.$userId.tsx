import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/admin-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { ArrowLeft, User as UserIcon, Mail, Phone, MapPin, Calendar, Activity, Bot } from "lucide-react";

export const Route = createFileRoute("/admin/ai-users/$userId")({
  component: AIUserDetails,
});

function AIUserDetails() {
  const { userId } = Route.useParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api<any>(`/admin/users/ai/${userId}`)
      .then((r) => setUser(r?.data ?? r))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [userId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild size="sm" variant="ghost"><Link to="/admin/ai-users"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Link></Button>
        <h1 className="text-2xl font-semibold">AI User Details</h1>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
          <CardContent>
            {loading ? <div className="text-muted-foreground text-sm">Loading...</div> :
              <ProfileDetail user={user} />}
          </CardContent>
        </Card>
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
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
              <Bot className="w-3.5 h-3.5 mr-1.5" /> AI Profile
            </Badge>
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
        </div>
      </div>

      <div className="border-t border-border" />

      {u.aiPersona && (
        <>
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" /> AI Persona Details
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-secondary/30 p-4 rounded-xl border border-border/50 shadow-sm space-y-4 text-sm h-full flex flex-col">
                  <div>
                    <span className="font-semibold text-foreground/80 block mb-2">Tone & Traits</span>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {u.aiPersona.traits?.map((t: string) => (
                        <Badge key={t} variant="secondary" className="bg-background font-normal border shadow-sm px-2 py-0.5">
                          {t}
                        </Badge>
                      ))}
                    </div>
                    <div className="bg-background rounded-md p-2 border shadow-sm">
                      <span className="text-muted-foreground mr-2 font-medium">Speaking Tone:</span>
                      <span className="text-foreground">{u.aiPersona.speakingTone || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-border/60 pt-4">
                    <span className="font-semibold text-foreground/80 block mb-2">Communication Style</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-background rounded-md p-2.5 border shadow-sm">
                        <span className="text-muted-foreground block text-xs mb-1">Reply Length</span>
                        <span className="font-medium text-sm">{u.aiPersona.replyLengthHint || 'N/A'}</span>
                      </div>
                      <div className="bg-background rounded-md p-2.5 border shadow-sm">
                        <span className="text-muted-foreground block text-xs mb-1">Emoji Use</span>
                        <span className="font-medium text-sm">{u.aiPersona.emojiUseHint || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-border/60 pt-4 flex-1">
                    <span className="font-semibold text-foreground/80 block mb-2">Languages & Slang</span>
                    <div className="flex gap-4 flex-wrap">
                      <div className="flex-1 bg-background rounded-md p-2.5 border shadow-sm min-w-[120px]">
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Language Mix</span>
                        <div className="flex flex-wrap gap-1.5">
                          {u.aiPersona.languageMix?.length > 0 ? u.aiPersona.languageMix.map((l: string) => (
                            <Badge key={l} variant="default" className="text-[10px] px-1.5 py-0 h-5 bg-primary/80">
                              {l.toUpperCase()}
                            </Badge>
                          )) : <span className="text-xs text-muted-foreground">N/A</span>}
                        </div>
                      </div>
                      <div className="flex-1 bg-background rounded-md p-2.5 border shadow-sm min-w-[120px]">
                        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Example Slang</span>
                        <div className="flex flex-wrap gap-1.5">
                          {u.aiPersona.exampleSlang?.length > 0 ? u.aiPersona.exampleSlang.map((s: string) => (
                            <Badge key={s} variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-muted/50">
                              {s}
                            </Badge>
                          )) : <span className="text-xs text-muted-foreground">N/A</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-secondary/30 p-4 rounded-xl border border-border/50 shadow-sm h-full flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-foreground/80">System Prompt</span>
                    <Badge variant="outline" className="text-[10px] bg-background">Core Rules</Badge>
                  </div>
                  <div className="bg-[#1e1e2e] text-[#cdd6f4] rounded-lg p-3 text-xs font-mono overflow-y-auto max-h-[360px] whitespace-pre-wrap flex-1 border border-border shadow-inner custom-scrollbar">
                    {u.aiPersona.systemPrompt || 'No system prompt defined.'}
                  </div>
                </div>
              </div>
            </div>

            {u.aiPersona.imagePrompt && (
              <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl text-sm flex items-start gap-3 mt-2 shadow-sm">
                <div className="mt-0.5 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <span className="text-primary text-[10px]">✨</span>
                </div>
                <div>
                  <span className="font-semibold text-primary block mb-1 text-sm">Image Generation Prompt</span>
                  <p className="text-primary/80 italic text-xs leading-relaxed">{u.aiPersona.imagePrompt}</p>
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-border" />
        </>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2"><Calendar className="w-4 h-4" /> Demographics</h3>
          <div className="space-y-2 text-sm bg-secondary/30 p-3 rounded-md">
            <div className="flex justify-between"><span>Age / DOB</span> <span>{getAge(u.dob)} ({safeDate(u.dob)})</span></div>
            <div className="flex justify-between"><span>Gender</span> <span className="capitalize">{u.gender?.replace('_', ' ') || 'N/A'}</span></div>
            <div className="flex justify-between"><span>Looking For</span> <span className="capitalize">{u.lookingFor?.join(', ') || 'N/A'}</span></div>
            <div className="flex justify-between"><span>Religion</span> <span className="capitalize">{u.religionPreference || 'N/A'}</span></div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2"><Activity className="w-4 h-4" /> Engagement</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-secondary/30 p-3 rounded-md text-center"><div className="text-muted-foreground">Matches</div><div className="font-semibold text-xl">{u.totalMatches || 0}</div></div>
            <div className="bg-secondary/30 p-3 rounded-md text-center"><div className="text-muted-foreground">Likes Received</div><div className="font-semibold text-xl">{u.totalLikesReceived || 0}</div></div>
            <div className="bg-secondary/30 p-3 rounded-md text-center"><div className="text-muted-foreground">Login Streak</div><div className="font-semibold text-xl">{u.loginStreak || 0}</div></div>
            <div className="bg-secondary/30 p-3 rounded-md text-center"><div className="text-muted-foreground">Coins</div><div className="font-semibold text-xl">{u.sparqCoins || 0}</div></div>
          </div>
        </div>
      </div>

      <div className="border-t border-border" />

      <div>
        <h3 className="font-semibold mb-3">Photos</h3>
        {u.photos?.length > 0 ? (
          <div className="flex flex-wrap gap-4">
            {u.photos.map((p: any) => (
              <img key={p._id || p.url} src={p.url || p.thumbnailUrl} alt="User photo" className="w-32 h-40 object-cover rounded-md border shadow-sm" />
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground bg-secondary/30 p-4 rounded-md text-center">No photos uploaded.</div>
        )}
      </div>

      <div className="text-xs text-muted-foreground flex justify-between pt-4 border-t border-border">
        <span>Joined: {safeDateTime(u.createdAt)}</span>
        <span>Last Active: {safeDateTime(u.lastActiveAt || u.lastSeen)}</span>
      </div>
    </div>
  );
}
