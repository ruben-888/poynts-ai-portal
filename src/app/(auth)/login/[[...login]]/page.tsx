import Image from "next/image";
import Link from "next/link";
import { SignIn } from "@clerk/nextjs";

// import { LoginForm } from "../components/login-form"

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image
              src="/img/poynts-temp-logo_purple.png"
              alt="Poynts AI Logo"
              width={48}
              height={48}
              priority
              className="h-12 w-auto dark:hidden"
            />
            <Image
              src="/img/poynts-temp-logo_white.png"
              alt="Poynts AI Logo"
              width={48}
              height={48}
              priority
              className="hidden h-12 w-auto dark:block"
            />
            <span className="font-inter text-4xl font-semibold tracking-tight text-brand dark:text-white">
              Poynts AI
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            {/* <LoginForm /> */}
            <SignIn redirectUrl="/verify" />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/img/poynts-temp-image.webp"
          alt="Poynts background"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          priority
        />
      </div>
    </div>
  );
}
