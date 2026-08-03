"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getAuthErrorMessage, resetPassword } from "@/lib/services/auth";
import { FormMessage } from "@/components/shell/FormMessage";
import { inputClass, labelClass, primaryButtonClass } from "@/lib/ui/formStyles";

const forgotPasswordSchema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (values: ForgotPasswordValues) => {
    setSubmitError(null);
    try {
      await resetPassword(values.email);
      setSent(true);
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error));
    }
  };

  if (sent) {
    return (
      <div className="flex w-full flex-col gap-4 text-center">
        <FormMessage variant="success">
          Falls ein Konto mit dieser E-Mail-Adresse existiert, wurde eine E-Mail zum Zurücksetzen des
          Passworts verschickt.
        </FormMessage>
        <Link href="/login" className="text-sm font-medium text-accent hover:underline">
          Zurück zur Anmeldung
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col gap-4" noValidate>
      <div>
        <label htmlFor="email" className={labelClass}>
          E-Mail
        </label>
        <input id="email" type="email" autoComplete="email" {...register("email")} className={inputClass} />
        {errors.email && <FormMessage variant="error">{errors.email.message}</FormMessage>}
      </div>

      {submitError && <FormMessage variant="error">{submitError}</FormMessage>}

      <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
        {isSubmitting ? "Senden…" : "Link zum Zurücksetzen senden"}
      </button>

      <p className="text-center text-sm text-text-secondary">
        <Link href="/login" className="font-medium text-accent hover:underline">
          Zurück zur Anmeldung
        </Link>
      </p>
    </form>
  );
}
