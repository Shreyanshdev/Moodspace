"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignInButton() {
  return (
    <Button
      variant="gradient"
      onClick={() => signIn("google")}
      className="gap-2"
    >
      Sign In with Google
    </Button>
  );
}

