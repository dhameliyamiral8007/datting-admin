import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { api, setToken, setBaseUrl } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { LogIn, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Admin Sign In — SPARQ" }] }),
  component: LoginPage,
});

const DEFAULT_GOOGLE_ID_TOKEN = "eyJhbGciOiJSUzI1NiIsImtpZCI6ImQxMjk3OGJhNGMyOWVmMTE1NGEzNGU0ODcwYzdhM2E1MWQyNmRmMTAiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI1MzY2MDY2NzY5MzMtbXYwc2gyMzJhZmdmaGo5czFkazZ2bWcwMWZlaWF0ZWQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI1MzY2MDY2NzY5MzMtbWtpaDFna2FlbHI4N2Y1Zm5ydmUyMWVtdTFycTNvZGMuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDEzMTk4ODY4MDAxODc0NTQ3MzkiLCJlbWFpbCI6ImthdGhpcml5YXNhaGlsNjAyMkBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6InNhaGlsIGthdGhpcml5YSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLaV9YSnlsaGRjYVlmVEVBTy05RGt5QnhSczh5TnB1WHVCVmN5ZXhyd0RsbzJJcnc9czk2LWMiLCJnaXZlbl9uYW1lIjoic2FoaWwiLCJmYW1pbHlfbmFtZSI6ImthdGhpcml5YSIsImlhdCI6MTc4MjU1MjY4OSwiZXhwIjoxNzgyNTU2Mjg5fQ.espVvIaFRyOxJvS38Er26wWofkZ_Qz98Oh7IO0CdW8OMwC7w-eUre3cH5gWTcrkCW2JJsFZ9yQVbIs2KrhEeZOaakRWS9unMigZfEKZb84EoXpaLlgvxsDAU2ADSGuKUCLiW2ixLX49emR0e0N1i5yrAGeSNPoD5d9WAiFFLUUL0idxT_glLe5lCts2VqaTMOGUzAjfq7Wpmv84CyZ7MS_saIe1W2TOlRtiIfQoFooKLpf3Rr_2wgFAvyuEt1Zm1XuT6nOxZ2Ya_YXfokx-T_X9M--Ftfd9oWtrsoZzwyXM2ewuJ6ezey9UuVbMWiuo4L3ehhW9A0u3Aw_qE_D5Hqw";

function LoginPage() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("Super Admin");
  const [email, setEmail] = useState("admin@sparq.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-set base URL from environment variable on mount
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://143.244.139.153:12500/api/v1";

  // Google sign in states
  const [googleToken, setGoogleToken] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // Always use env base URL for admin API
      setBaseUrl(envBaseUrl);

      if (isRegister) {
        // Register Admin Route: /admin/register
        await api<any>("/admin/register", {
          method: "POST",
          auth: false,
          body: { name, email, password },
        });
        toast.success("Administrator registered successfully! You can now sign in.");
        setIsRegister(false);
        setPassword("");
      } else {
        // Login Admin Route: /admin/login
        const res = await api<any>("/admin/login", {
          method: "POST",
          auth: false,
          body: { email, password },
        });
        const token = res?.data?.accessToken || res?.accessToken;
        if (!token) throw new Error("No access token returned");
        setToken(token);
        toast.success("Welcome back!");
        navigate({ to: "/admin" });
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!googleToken) {
      toast.error("Please enter a Google ID Token");
      return;
    }

    setGoogleLoading(true);
    try {
      setBaseUrl(envBaseUrl);
      // Login Google Route: /auth/google (base URL already has /api/v1)
      const res = await api<any>("/auth/google", {
        method: "POST",
        auth: false,
        body: { idToken: googleToken },
      });

      const token = res?.data?.accessToken || res?.accessToken;
      if (!token) throw new Error("No access token returned");

      setToken(token);
      toast.success("Google sign-in successful!");
      setDialogOpen(false);
      navigate({ to: "/admin" });
    } catch (err: any) {
      toast.error(err.message || "Google Authentication failed");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 p-4 font-sans select-none text-slate-100 dark">
      <Toaster position="top-center" richColors />
      
      <Card className="w-full max-w-sm shadow-2xl border-slate-800/80 bg-slate-900/80 backdrop-blur-xl relative overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <CardHeader className="space-y-1.5 text-center pt-6 pb-4">
          <div className="mx-auto w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-500 text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg shadow-primary/20">
            S
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-white mt-1">
            {isRegister ? "Create Admin Account" : "SPARQ Admin"}
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            {isRegister ? "Setup a new administrator login" : "Sign in to manage the dating platform"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4 px-6 pb-6">
          <form onSubmit={onSubmit} className="space-y-3">
            {isRegister && (
              <div className="space-y-1">
                <Label htmlFor="name" className="text-slate-300 text-xs font-medium">Name</Label>
                <Input 
                  id="name" 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  className="bg-slate-950/40 border-slate-800/80 text-sm h-10 text-slate-100 placeholder-slate-500 focus-visible:ring-primary"
                  placeholder="Super Admin"
                />
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="email" className="text-slate-300 text-xs font-medium">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                className="bg-slate-950/40 border-slate-800/80 text-sm h-10 text-slate-100 placeholder-slate-500 focus-visible:ring-primary"
                placeholder="admin@sparq.com"
              />
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="password" className="text-slate-300 text-xs font-medium">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="bg-slate-950/40 border-slate-800/80 text-sm h-10 text-slate-100 placeholder-slate-500 focus-visible:ring-primary"
                placeholder="••••••••"
              />
            </div>

            <Button type="submit" className="w-full h-10 mt-2 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 text-white font-medium shadow-lg shadow-primary/10 transition-all duration-200" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Authenticating...
                </span>
              ) : isRegister ? (
                <span className="flex items-center justify-center gap-1.5"><UserPlus className="w-4 h-4" /> Create Account</span>
              ) : (
                <span className="flex items-center justify-center gap-1.5"><LogIn className="w-4 h-4" /> Sign In</span>
              )}
            </Button>
          </form>

          {!isRegister && (
            <div className="space-y-3 pt-1">
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800/60" />
                <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Or connect using</span>
                <div className="flex-grow border-t border-slate-800/60" />
              </div>

              {/* Google Login Dialog */}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full h-10 gap-2 border-slate-800 bg-slate-950/30 hover:bg-slate-900 text-slate-300 hover:text-white transition-all duration-200">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                      <g transform="matrix(1, 0, 0, 1, 0, 0)">
                        <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.6h3.29c1.92,-1.78 3.02,-4.4 3.02,-7.4C21.65,11.83 21.55,11.43 21.35,11.1z" fill="#4285F4" />
                        <path d="M12,20.62c2.43,0 4.47,-0.8 5.96,-2.2l-3.29,-2.6c-0.9,0.6 -2.07,0.98 -3.37,0.98 -2.6,0 -4.8,-1.76 -5.58,-4.13H2.33v2.7C3.81,18.3 7.62,20.62 12,20.62z" fill="#34A853" />
                        <path d="M6.42,12.67c-0.2,-0.6 -0.31,-1.24 -0.31,-1.9c0,-0.66 0.11,-1.3 0.31,-1.9V6.17H2.33C1.68,7.46 1.3,8.9 1.3,10.77c0,1.87 0.38,3.31 1.03,4.6l3.29,-2.7H6.42z" fill="#FBBC05" />
                        <path d="M12,6.1c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.46,3.43 14.43,2.78 12,2.78c-4.38,0 -8.19,2.32 -9.67,5.12l3.29,2.7C6.4,8.23 8.6,6.1 12,6.1z" fill="#EA4335" />
                      </g>
                    </svg>
                    Google Authentication
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-slate-100">
                  <DialogHeader>
                    <DialogTitle className="text-white text-lg">Google ID Token Login</DialogTitle>
                    <DialogDescription className="text-slate-400 text-sm">
                      Provide a valid Google ID token (`idToken`) to authenticate with the backend.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleGoogleLogin} className="space-y-4 pt-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="idToken" className="text-slate-300 text-xs font-semibold">Google ID Token</Label>
                      <Input 
                        id="idToken" 
                        value={googleToken} 
                        onChange={(e) => setGoogleToken(e.target.value)} 
                        placeholder="eyJhbGciOiJSUzI1..." 
                        required 
                        className="bg-slate-950 border-slate-800 text-slate-200 focus-visible:ring-primary"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        onClick={() => {
                          setGoogleToken(DEFAULT_GOOGLE_ID_TOKEN);
                          toast.success("Demo token autofilled!");
                        }}
                      >
                        Autofill Demo Token
                      </Button>
                    </div>

                    <DialogFooter className="sm:justify-start pt-2 border-t border-slate-800/50">
                      <Button 
                        type="submit" 
                        disabled={googleLoading} 
                        className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white"
                      >
                        {googleLoading ? "Authenticating..." : "Authenticate"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          )}

          <div className="text-center pt-1 border-t border-slate-800/40">
            <Button
              type="button"
              variant="link"
              className="text-xs text-primary hover:text-primary-foreground font-semibold py-0 h-auto"
              onClick={() => {
                setIsRegister(!isRegister);
                setPassword("");
              }}
            >
              {isRegister ? "Already have an account? Sign In" : "Need an admin account? Register"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}