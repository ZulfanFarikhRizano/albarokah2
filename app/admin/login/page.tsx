"use client";

import { useFormState, useFormStatus } from "react-dom";
import { LogIn } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { loginAction } from "@/lib/actions";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="mt-1 justify-center disabled:opacity-60">
      <LogIn size={16} /> {pending ? "Memeriksa…" : "Masuk"}
    </Button>
  );
}

export default function AdminLoginPage() {
  const [state, formAction] = useFormState(loginAction, null);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm items-center px-5">
      <Card className="w-full p-6">
        <div className="mb-4 flex items-center gap-3">
          <Logo size={40} />
          <div>
            <p className="text-lg font-extrabold leading-tight text-primary-900">Masuk Admin</p>
            <p className="text-sm text-foreground/50">DKM Masjid Jami&apos; Al Barokah</p>
          </div>
        </div>
        <form action={formAction} className="grid gap-3">
          <div>
            <label htmlFor="username" className="mb-1.5 block text-sm font-semibold text-foreground/80">Username</label>
            <Input id="username" name="username" type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} required />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-foreground/80">Password</label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          {state && !state.ok && (
            <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">{state.message}</p>
          )}
          <Submit />
        </form>
      </Card>
    </div>
  );
}
