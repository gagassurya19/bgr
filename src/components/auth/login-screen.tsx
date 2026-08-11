"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/actions/auth.actions";
import { DEMO_FILL_EVENT } from "@/components/auth/demo-guide-fab";
import { Button, Input, Label, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

const DEMO_PASSWORD = "Password123!";

export function LoginScreen({ initialEmail }: { initialEmail?: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(initialEmail ?? "");
  const [password, setPassword] = useState(initialEmail ? DEMO_PASSWORD : "");

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
      setPassword(DEMO_PASSWORD);
    }
  }, [initialEmail]);

  useEffect(() => {
    function onDemoFill(event: Event) {
      const detail = (event as CustomEvent<{ email: string }>).detail;
      if (detail?.email) {
        setEmail(detail.email);
        setPassword(DEMO_PASSWORD);
        setError(null);
      }
    }

    window.addEventListener(DEMO_FILL_EVENT, onDemoFill);
    return () => window.removeEventListener(DEMO_FILL_EVENT, onDemoFill);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (!result.success) {
      setError(result.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#004a82] to-[#0066AE] p-6 pb-24">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center text-white">
          <div className="text-3xl font-bold tracking-tight">BGR</div>
          <p className="mt-1 text-sm text-white/80">Business Group Referral</p>
        </div>

        <Card className="w-full border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Masuk ke BGR</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="admin@example.local"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Memproses..." : "Masuk"}
              </Button>
            </form>
            <p className="mt-4 text-center text-xs text-slate-500">
              Gunakan tombol <strong>Panduan Demo</strong> di kanan bawah layar.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
