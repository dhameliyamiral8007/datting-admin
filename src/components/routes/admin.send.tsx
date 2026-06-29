import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/admin-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Send } from "lucide-react";

export const Route = createFileRoute("/admin/send")({
  component: SendPage,
});

function SendPage() {
  const [type, setType] = useState("");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  // Fetch notification types
  useEffect(() => {
    api<any>("/admin/notifications")
      .then((r) => {
        const arr = r?.data ?? r;
        if (Array.isArray(arr)) {
           // map the array of template objects to their 'type' property
           setTypes(arr.map((t: any) => t.type));
        } else if (arr?.types) {
           setTypes(arr.types);
        } else {
           setTypes([]);
        }
      })
      .catch(() => {});
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!type) { toast.error("Please select a type"); return; }
    
    setBusy(true);
    try {
      const body: any = { notificationType: type };
      
      if (type === "other") {
        if (!title.trim() || !message.trim()) {
           toast.error("Title and message are required for custom broadcasts");
           setBusy(false);
           return;
        }
        body.title = title;
        body.message = message;
      }
      
      await api("/admin/send-broadcast", { method: "POST", body });
      toast.success("Broadcast sent successfully!");
      setTitle("");
      setMessage("");
    } catch (e: any) {
      toast.error(e.message || "Failed to send broadcast");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Send Broadcast Notification</h1>
        <p className="text-muted-foreground text-sm">Deliver a templated or custom notification to all users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Send className="w-4 h-4" /> Compose Broadcast
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">

            {/* ── Notification Type ── */}
            <div className="space-y-2">
              <Label>Notification Type</Label>
              {types.length > 0 ? (
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger>
                  <SelectContent>
                    {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    <SelectItem value="other">other (custom)</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="welcome_offer" required />
              )}
            </div>

            {/* ── Custom Message (only for 'other') ── */}
            {type === "other" && (
              <>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    placeholder="E.g. Create your profile" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea 
                    rows={4} 
                    value={message} 
                    onChange={(e) => setMessage(e.target.value)} 
                    placeholder="Enter your message here..."
                    required 
                  />
                </div>
              </>
            )}

            <Button type="submit" disabled={busy || !type}>
              {busy ? "Sending Broadcast..." : "Send Broadcast"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}