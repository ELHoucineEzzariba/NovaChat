import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-center text-2xl font-semibold text-text-primary">
        Konto erstellen
      </h1>
      <RegisterForm />
    </div>
  );
}
