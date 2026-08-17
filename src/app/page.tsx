import { auth } from "@/lib/auth";
import { LandingPage } from "@/components/landing/landing-page";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let isAuthed = false;
  try {
    const session = await auth();
    isAuthed = !!session?.user;
  } catch {
    // treat as not authenticated on landing page
  }

  return <LandingPage isAuthed={isAuthed} />;
}
