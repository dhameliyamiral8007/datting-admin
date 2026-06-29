import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/admin-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, X } from "lucide-react";

export const Route = createFileRoute("/admin/notifications")({
  component: TemplatesPage,
});

function TemplatesPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [type, setType] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  function load() {
    setLoading(true);
    api<any>("/admin/notifications")
      .then((r) => {
        const arr = r?.data ?? r;
        setList(Array.isArray(arr) ? arr : arr?.templates || arr?.items || []);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function reset() {
    setEditing(null);
    setType("");
    setMessage("");
  }

  function startEdit(t: any) {
    setEditing(t);
    setType(t.type || "");
    setMessage(t.message || "");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (editing) {
        await api(`/admin/notifications/${editing._id || editing.id}`, { method: "PUT", body: { message } });
        toast.success("Template updated");
      } else {
        await api(`/admin/notifications`, { method: "POST", body: { type, message } });
        toast.success("Template created");
      }
      reset();
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(t: any) {
    if (!confirm(`Delete "${t.type}" template?`)) return;
    try {
      await api(`/admin/notifications/${t._id || t.id}`, { method: "DELETE" });
      toast.success("Deleted");
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Notification Templates</h1>
        <p className="text-muted-foreground text-sm">Create and manage reusable notification templates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>All Templates</CardTitle></CardHeader>
          <CardContent>
            {loading ? <div className="text-sm text-muted-foreground">Loading...</div> :
              list.length === 0 ? <div className="text-sm text-muted-foreground py-6 text-center">No templates yet</div> :
              <div className="space-y-3">
                {list.map((t) => (
                  <div key={t._id || t.id} className="flex items-start justify-between gap-3 p-4 rounded-lg border border-border hover:bg-secondary/40">
                    <div className="min-w-0 flex-1">
                      <div className="inline-block px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium mb-1">{t.type}</div>
                      <div className="text-sm">{t.message}</div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="icon" variant="ghost" onClick={() => startEdit(t)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(t)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
              </div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">{editing ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {editing ? "Edit Template" : "New Template"}</span>
              {editing && <Button size="icon" variant="ghost" onClick={reset}><X className="w-4 h-4" /></Button>}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={save} className="space-y-3">
              <div className="space-y-2">
                <Label>Type</Label>
                <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="welcome_offer" disabled={!!editing} required />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} required />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>{editing ? "Update" : "Create"}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}