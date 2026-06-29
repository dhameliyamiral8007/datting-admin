import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { getBaseUrl, setBaseUrl } from "@/lib/admin-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const [url, setUrl] = useState(getBaseUrl());
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm">Configure your API connection</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">API Base URL</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Base URL</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder={import.meta.env.VITE_API_BASE_URL || "http://143.244.139.153:12500/api/v1"} />
          </div>
          <Button onClick={() => { setBaseUrl(url); toast.success("Saved"); }}>Save</Button>
        </CardContent>
      </Card>
    </div>
  );
}