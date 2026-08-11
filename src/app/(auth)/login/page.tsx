import { LoginScreen } from "@/components/auth/login-screen";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  return <LoginScreen initialEmail={params.email} />;
}
