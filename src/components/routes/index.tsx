import { createFileRoute } from "@tanstack/react-router";
import { redirect } from "@tanstack/react-router";
import { getToken } from "@/lib/admin-api";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    if (typeof window === "undefined") return;
    if (getToken()) throw redirect({ to: "/admin" });
    throw redirect({ to: "/login" });
  },
  component: () => null,
});
