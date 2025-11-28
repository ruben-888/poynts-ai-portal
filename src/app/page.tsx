import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  // Check if user is authenticated
  const user = await currentUser();

  // If user is authenticated, redirect to verification page which will handle org checks
  if (user) {
    redirect("/verify");
  } else {
    // If user is not authenticated, redirect to login
    redirect("/login");
  }

  // This part won't be reached due to redirects, but kept for type safety
  return null;
}
