/** Lädt Nachrichten-Anhänge (Bild/GIF/Audio/Datei) zu Firebase Storage hoch und erkennt den Anhang-Typ am MIME-Type. */
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/lib/firebase/storage";
import type { ConversationPath } from "./messages";
import type { Attachment, AttachmentType } from "@/types/message";

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024;

export class AttachmentUploadError extends Error {}

function detectAttachmentType(mimeType: string): AttachmentType {
  if (mimeType === "image/gif") return "gif";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("audio/")) return "audio";
  return "file";
}

export async function uploadAttachment(
  path: ConversationPath,
  file: Blob,
  fileName: string,
  mimeType: string
): Promise<Attachment> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new AttachmentUploadError("Datei ist größer als 15 MB.");
  }

  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_") || "datei";
  const storagePath = `attachments/${path.collection}/${path.id}/${Date.now()}-${safeName}`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, file, { contentType: mimeType || "application/octet-stream" });
  const url = await getDownloadURL(storageRef);

  return {
    type: detectAttachmentType(mimeType),
    url,
    name: fileName,
    mimeType,
    size: file.size,
  };
}
