"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { FormMessage } from "@/components/shell/FormMessage";
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from "@/lib/ui/formStyles";
import type { User } from "@/types/user";

const channelSchema = z.object({
  name: z.string().min(2, "Mindestens 2 Zeichen").max(60, "Maximal 60 Zeichen"),
  description: z.string().max(200, "Maximal 200 Zeichen"),
});

export type ChannelFormValues = z.infer<typeof channelSchema>;

interface ChannelFormProps {
  mode: "create" | "edit";
  initialValues?: ChannelFormValues;
  availableUsers?: User[];
  submitLabel: string;
  onSubmit: (values: ChannelFormValues & { memberIds: string[] }) => Promise<void>;
  onCancel: () => void;
}

export function ChannelForm({
  mode,
  initialValues,
  availableUsers = [],
  submitLabel,
  onSubmit,
  onCancel,
}: ChannelFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChannelFormValues>({
    resolver: zodResolver(channelSchema),
    defaultValues: initialValues ?? { name: "", description: "" },
  });

  const toggleMember = (uid: string) => {
    setSelectedMemberIds((prev) => (prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]));
  };

  const submit = async (values: ChannelFormValues) => {
    setSubmitError(null);
    try {
      await onSubmit({ ...values, memberIds: selectedMemberIds });
    } catch {
      setSubmitError("Etwas ist schiefgelaufen. Bitte erneut versuchen.");
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4" noValidate>
      <div>
        <label htmlFor="channel-name" className={labelClass}>
          Name
        </label>
        <input id="channel-name" type="text" {...register("name")} className={inputClass} />
        {errors.name && <FormMessage variant="error">{errors.name.message}</FormMessage>}
      </div>

      <div>
        <label htmlFor="channel-description" className={labelClass}>
          Beschreibung
        </label>
        <textarea id="channel-description" rows={2} {...register("description")} className={inputClass} />
        {errors.description && <FormMessage variant="error">{errors.description.message}</FormMessage>}
      </div>

      {mode === "create" && availableUsers.length > 0 && (
        <div>
          <span className={labelClass}>Mitglieder hinzufügen</span>
          <ul className="mt-2 flex max-h-40 flex-col gap-1 overflow-y-auto">
            {availableUsers.map((availableUser) => (
              <li key={availableUser.uid}>
                <label className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-secondary transition-colors hover:bg-hover">
                  <input
                    type="checkbox"
                    checked={selectedMemberIds.includes(availableUser.uid)}
                    onChange={() => toggleMember(availableUser.uid)}
                    className="h-4 w-4 rounded border-border accent-accent"
                  />
                  <Image
                    src={availableUser.avatarUrl}
                    alt=""
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                  {availableUser.name}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {submitError && <FormMessage variant="error">{submitError}</FormMessage>}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className={secondaryButtonClass}>
          Abbrechen
        </button>
        <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
          {isSubmitting ? "Speichern…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
