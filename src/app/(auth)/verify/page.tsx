import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { trackUserLogin } from "@/services/user-session-tracker";

export default async function AuthVerifyPage() {
  const { userId } = await auth();

  // Ensure user is authenticated
  if (!userId) {
    redirect("/login");
  }

  // Track the user login event
  // This is the place since users only hit this page after successful login
  await trackUserLogin();

  // Redirect to dashboard immediately
  redirect("/dashboard");
  
  // This return is never reached due to redirects above, but satisfies TypeScript
  return null;
}
