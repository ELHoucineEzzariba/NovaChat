import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-center text-2xl font-semibold text-text-primary">
        Passwort zurücksetzen
      </h1>
      <ForgotPasswordForm />
    </div>
  );
}
