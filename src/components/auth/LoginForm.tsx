"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DEFAULT_AVATAR_URL } from "./AvatarSelection";
import { getAuthErrorMessage, loginAsGuest, loginWithEmail, loginWithGoogle } from "@/lib/services/auth";
import { ensureUserDocument } from "@/lib/repositories/users";
import { FormMessage } from "@/components/shell/FormMessage";
import { RouteTransitionOverlay } from "@/components/shell/RouteTransitionOverlay";
import { labelClass, primaryButtonClass, secondaryButtonClass } from "@/lib/ui/formStyles";

const REGISTER_TRANSITION_MS = 4000;

const loginSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z.string().min(1, "Passwort erforderlich"),
});

type LoginValues = z.infer<typeof loginSchema>;

function fieldClass(hasError: boolean) {
  const base =
    "mt-1 w-full rounded-md border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary transition-colors focus:outline-none focus:ring-2";
  return hasError
    ? `${base} border-danger focus:border-danger focus:ring-danger/30`
    : `${base} border-border focus:border-accent focus:ring-accent/40`;
}

export function LoginForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [navigatingToRegister, setNavigatingToRegister] = useState(false);
  const registerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), mode: "onBlur" });

  useEffect(() => {
    return () => {
      if (registerTimeoutRef.current) clearTimeout(registerTimeoutRef.current);
    };
  }, []);

  const handleRegisterClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setNavigatingToRegister(true);
    registerTimeoutRef.current = setTimeout(() => router.push("/register"), REGISTER_TRANSITION_MS);
  };

  const onSubmit = async (values: LoginValues) => {
    setSubmitError(null);
    try {
      await loginWithEmail(values.email, values.password);
      router.push("/chat");
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error));
    }
  };

  const onGoogleLogin = async () => {
    setSubmitError(null);
    setGoogleLoading(true);
    try {
      const user = await loginWithGoogle();
      await ensureUserDocument(user.uid, {
        name: user.displayName ?? "Unbenannt",
        email: user.email ?? "",
        avatarUrl: DEFAULT_AVATAR_URL,
      });
      router.push("/chat");
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error));
    } finally {
      setGoogleLoading(false);
    }
  };

  const onGuestLogin = async () => {
    setSubmitError(null);
    setGuestLoading(true);
    try {
      const user = await loginAsGuest();
      await ensureUserDocument(user.uid, {
        name: `Gast-${user.uid.slice(0, 5)}`,
        email: `${user.uid.slice(0, 8)}@guest.novachat.app`,
        avatarUrl: DEFAULT_AVATAR_URL,
      });
      router.push("/chat");
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error));
    } finally {
      setGuestLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-4" noValidate>
        <div>
          <label htmlFor="email" className={labelClass}>
            E-Mail
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="du@beispiel.de"
            {...register("email")}
            className={fieldClass(Boolean(errors.email))}
          />
          {errors.email && <FormMessage variant="error">{errors.email.message}</FormMessage>}
        </div>

        <div>
          <label htmlFor="password" className={labelClass}>
            Passwort
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Dein Passwort"
            {...register("password")}
            className={fieldClass(Boolean(errors.password))}
          />
          {errors.password && <FormMessage variant="error">{errors.password.message}</FormMessage>}
          <div className="mt-1 text-right">
            <Link href="/forgot-password" className="text-sm text-accent hover:underline">
              Passwort vergessen?
            </Link>
          </div>
        </div>

        {submitError && <FormMessage variant="error">{submitError}</FormMessage>}

        <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
          {isSubmitting ? "Anmelden…" : "Anmelden"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-text-tertiary">
        <div className="h-px flex-1 bg-border" />
        oder
        <div className="h-px flex-1 bg-border" />
      </div>

      <button
        type="button"
        onClick={onGoogleLogin}
        disabled={googleLoading}
        className={secondaryButtonClass}
      >
        {googleLoading ? "Verbinde…" : "Mit Google anmelden"}
      </button>

      <button
        type="button"
        onClick={onGuestLogin}
        disabled={guestLoading}
        className={secondaryButtonClass}
      >
        {guestLoading ? "Verbinde…" : "Als Gast fortfahren"}
      </button>

      <p className="text-center text-sm text-text-secondary">
        Noch kein Konto?{" "}
        <button
          type="button"
          onClick={handleRegisterClick}
          className="font-medium text-accent hover:underline"
        >
          Registrieren
        </button>
      </p>

      {navigatingToRegister && <RouteTransitionOverlay label="NovaChat lädt…" />}
    </div>
  );
}
