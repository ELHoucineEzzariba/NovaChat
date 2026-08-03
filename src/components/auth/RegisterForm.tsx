"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { AvatarSelection, DEFAULT_AVATAR_URL } from "./AvatarSelection";
import { getAuthErrorMessage, registerWithEmail } from "@/lib/services/auth";
import { ensureUserDocument } from "@/lib/repositories/users";
import { FormMessage } from "@/components/shell/FormMessage";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/ui/formStyles";

const registerSchema = z
  .object({
    name: z.string().min(2, "Mindestens 2 Zeichen"),
    email: z.string().email("Ungültige E-Mail-Adresse"),
    password: z.string().min(6, "Mindestens 6 Zeichen"),
    confirmPassword: z.string(),
    avatarUrl: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwörter stimmen nicht überein",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { avatarUrl: DEFAULT_AVATAR_URL },
  });

  const avatarUrl = useWatch({ control, name: "avatarUrl" });

  const onSubmit = async (values: RegisterValues) => {
    setSubmitError(null);
    try {
      const user = await registerWithEmail(values.name, values.email, values.password);
      await ensureUserDocument(user.uid, {
        name: values.name,
        email: values.email,
        avatarUrl: values.avatarUrl,
      });
      router.push("/chat");
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-4" noValidate>
      <div>
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input id="name" type="text" autoComplete="name" {...register("name")} className={inputClass} />
        {errors.name && <FormMessage variant="error">{errors.name.message}</FormMessage>}
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          E-Mail
        </label>
        <input id="email" type="email" autoComplete="email" {...register("email")} className={inputClass} />
        {errors.email && <FormMessage variant="error">{errors.email.message}</FormMessage>}
      </div>

      <div>
        <label htmlFor="password" className={labelClass}>
          Passwort
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register("password")}
          className={inputClass}
        />
        {errors.password && <FormMessage variant="error">{errors.password.message}</FormMessage>}
      </div>

      <div>
        <label htmlFor="confirmPassword" className={labelClass}>
          Passwort bestätigen
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          {...register("confirmPassword")}
          className={inputClass}
        />
        {errors.confirmPassword && <FormMessage variant="error">{errors.confirmPassword.message}</FormMessage>}
      </div>

      <div>
        <span className={labelClass}>Avatar</span>
        <div className="mt-2">
          <AvatarSelection
            value={avatarUrl}
            onChange={(url) => setValue("avatarUrl", url, { shouldValidate: true })}
          />
        </div>
      </div>

      {submitError && <FormMessage variant="error">{submitError}</FormMessage>}

      <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
        {isSubmitting ? "Registrieren…" : "Registrieren"}
      </button>

      <p className="text-center text-sm text-text-secondary">
        Schon ein Konto?{" "}
        <Link href="/login" className="font-medium text-accent hover:underline">
          Anmelden
        </Link>
      </p>
    </form>
  );
}
