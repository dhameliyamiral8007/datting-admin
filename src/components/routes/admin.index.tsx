import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/admin-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX, Bell, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function StatCard({ label, value, icon: Icon, tint }: { label: string; value: any; icon: any; tint: string }) {
  return (
    <Card className="border-border/60">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="text-2xl font-semibold mt-1">{value ?? "—"}</div>
          </div>
          <div className={`w-11 h-11 rounded-xl grid place-items-center ${tint}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<any>("/admin/dashboard")
      .then((r) => setData(r?.data ?? r))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const stats = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Overview of platform activity</p>
      </div>

      {error && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={stats.totalUsers ?? stats.users} icon={Users} tint="bg-primary/10 text-primary" />
          <StatCard label="Active Users" value={stats.activeUsers ?? stats.active} icon={UserCheck} tint="bg-emerald-100 text-emerald-700" />
          <StatCard label="Blocked Users" value={stats.blockedUsers ?? stats.blocked} icon={UserX} tint="bg-red-100 text-red-700" />
          <StatCard label="Notifications" value={stats.totalNotifications ?? stats.notifications} icon={Bell} tint="bg-amber-100 text-amber-700" />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Activity className="w-4 h-4" /> Raw response</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-secondary p-4 rounded-md overflow-auto max-h-80">{JSON.stringify(data, null, 2)}</pre>
        </CardContent>
      </Card>
    </div>
  );
}