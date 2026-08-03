"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Modal } from "@/components/shell/Modal";
import { AvatarSelection } from "@/components/auth/AvatarSelection";
import { FormMessage } from "@/components/shell/FormMessage";
import { inputClass, labelClass, primaryButtonClass, secondaryButtonClass } from "@/lib/ui/formStyles";
import { getAuthErrorMessage, updateAuthEmail, updateAuthProfile } from "@/lib/services/auth";
import { updateUserProfile } from "@/lib/repositories/users";
import type { User } from "@/types/user";

const profileSchema = z.object({
  name: z.string().min(2, "Mindestens 2 Zeichen"),
  email: z.string().email("Ungültige E-Mail-Adresse"),
  avatarUrl: z.string(),
});

type ProfileValues = z.infer<typeof profileSchema>;

interface ProfileSettingsProps {
  currentUser: User;
  onClose: () => void;
}

export function ProfileSettings({ currentUser, onClose }: ProfileSettingsProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: currentUser.name,
      email: currentUser.email,
      avatarUrl: currentUser.avatarUrl,
    },
  });

  const avatarUrl = useWatch({ control, name: "avatarUrl" });

  const onSubmit = async (values: ProfileValues) => {
    setSubmitError(null);
    try {
      await updateAuthProfile(values.name);
      if (values.email !== currentUser.email) {
        await updateAuthEmail(values.email);
      }
      await updateUserProfile(currentUser.uid, {
        name: values.name,
        email: values.email,
        avatarUrl: values.avatarUrl,
      });
      onClose();
    } catch (error) {
      setSubmitError(getAuthErrorMessage(error));
    }
  };

  return (
    <Modal title="Profil bearbeiten" onClose={onClose}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <div>
          <label htmlFor="profile-name" className={labelClass}>
            Name
          </label>
          <input id="profile-name" type="text" {...register("name")} className={inputClass} />
          {errors.name && <FormMessage variant="error">{errors.name.message}</FormMessage>}
        </div>

        <div>
          <label htmlFor="profile-email" className={labelClass}>
            E-Mail
          </label>
          <input id="profile-email" type="email" {...register("email")} className={inputClass} />
          {errors.email && <FormMessage variant="error">{errors.email.message}</FormMessage>}
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

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={secondaryButtonClass}>
            Abbrechen
          </button>
          <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
            {isSubmitting ? "Speichern…" : "Speichern"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
