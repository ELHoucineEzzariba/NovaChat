"use client";

import { useRef, useState } from "react";

/**
 * Kapselt die MediaRecorder-Mechanik für Sprachnachrichten: Mikrofonzugriff,
 * Aufnahme-Timer und Zusammenbau des aufgenommenen Blobs. Upload/Versand des
 * fertigen Blobs übernimmt der Aufrufer über `onRecorded`.
 */
export function useVoiceRecorder(onRecorded: (blob: Blob) => void, onError: (message: string) => void) {
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
  };

  const start = async () => {
    if (recording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recordedChunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) recordedChunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        stopStream();
        const blob = new Blob(recordedChunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (blob.size > 0) onRecorded(blob);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
      setRecordSeconds(0);
      recordTimerRef.current = setInterval(() => setRecordSeconds((seconds) => seconds + 1), 1000);
    } catch {
      onError("Mikrofonzugriff wurde verweigert.");
    }
  };

  const stop = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const cancel = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    stopStream();
    setRecording(false);
    recordedChunksRef.current = [];
  };

  return { recording, recordSeconds, start, stop, cancel };
}
