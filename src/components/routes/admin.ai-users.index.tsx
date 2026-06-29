import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/admin-api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Bot, User, ChevronLeft, ChevronRight, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/ai-users/")({
  component: AIUsersList,
});

function AIUsersList() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDob, setNewDob] = useState("");
  const [newPhotoUrl, setNewPhotoUrl] = useState("");

  function loadUsers() {
    setLoading(true);
    setError(null);
    api<any>(`/admin/users/ai?page=${page}&limit=${limit}`)
      .then((r) => setData(r?.data ?? r))
      .catch((err) => {
        setError(err.message || "Failed to load AI users");
        toast.error(err.message || "Failed to load AI users");
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadUsers(); }, [page, limit]);

  async function handleCreateUser() {
    if (!newName || !newDob || !newPhotoUrl) {
      toast.error("Please fill all fields");
      return;
    }
    setCreating(true);
    try {
      await api("/admin/users/ai", {
        method: "POST",
        body: {
          name: newName,
          dob: newDob,
          photos: [
            {
              url: newPhotoUrl,
              thumbnailUrl: newPhotoUrl,
              order: 0,
              uploadedAt: new Date().toISOString()
            }
          ]
        }
      });
      toast.success("AI User created successfully");
      setCreateOpen(false);
      setNewName("");
      setNewDob("");
      setNewPhotoUrl("");
      loadUsers();
    } catch (err: any) {
      toast.error(err.message || "Failed to create AI user");
    } finally {
      setCreating(false);
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
              <Bot className="w-5 h-5 text-primary" />
            </span>
            AI Users
          </h1>
          <p className="text-muted-foreground text-sm mt-1 ml-1">
            Manage AI profiles
          </p>
        </div>
        <div className="flex items-center gap-4">
          {!loading && items.length > 0 && (
            <Badge variant="secondary" className="text-xs font-semibold px-3 py-1 h-8 flex items-center">
              {pagination?.total ?? items.length} profiles found
            </Badge>
          )}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Create AI User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create AI User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. નવું નામ" />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input type="date" value={newDob} onChange={(e) => setNewDob(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Photo URL</Label>
                  <Input value={newPhotoUrl} onChange={(e) => setNewPhotoUrl(e.target.value)} placeholder="https://..." />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>Cancel</Button>
                <Button disabled={creating} onClick={handleCreateUser}>
                  {creating ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <Bot className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg">No AI profiles found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {items.map((u: any) => {
            const id = u._id || u.id;
            const photos: any[] = u.photos || [];
            const photoUrl = photos[0]?.url || photos[0]?.thumbnailUrl;

            return (
              <div key={id} className="group rounded-2xl overflow-hidden border border-border/50 bg-card shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col">
                <div className="relative h-64 bg-muted overflow-hidden shrink-0">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={u.name || "Profile"}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                      <User className="w-14 h-14 opacity-30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="font-bold text-white text-base truncate drop-shadow-md">
                      {u.name || "Anonymous"}
                    </h3>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-2">
                    <span className="font-mono truncate opacity-60">ID: {id?.slice(-8)}</span>
                  </div>
                  <div className="mt-auto pt-1">
                    <Button asChild size="sm" variant="outline" className="w-full h-8 text-xs font-medium">
                      <Link to="/admin/ai-users/$userId" params={{ userId: id as string }}>
                        View Profile
                      </Link>
                    </Button>
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
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Prev
            </Button>
            <Button variant="outline" size="sm" disabled={pagination?.totalPages ? page >= pagination.totalPages : items.length < limit} onClick={() => setPage((p) => p + 1)}>
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
