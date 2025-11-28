import { Button } from "@/components/ui/button";
import Link from "next/link";
import { NotFound } from "@/components/status/not-found";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <NotFound message="Oops! This page has gone missing." />
      <Button asChild className="mt-6">
        <Link href="/dashboard">Go back to Dashboard</Link>
      </Button>
    </div>
  );
}
