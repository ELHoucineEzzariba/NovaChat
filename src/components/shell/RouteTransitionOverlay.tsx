"use client";

import { createPortal } from "react-dom";
import Image from "next/image";
import { motion } from "framer-motion";

interface RouteTransitionOverlayProps {
  label: string;
}

export function RouteTransitionOverlay({ label }: RouteTransitionOverlayProps) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-bg"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <Image
          src="/images/brand/logo-mark.png"
          alt="NovaChat"
          width={64}
          height={64}
          className="h-16 w-16 rounded-2xl object-contain"
        />
      </motion.div>
      <p className="text-sm font-medium text-text-secondary">{label}</p>
    </motion.div>,
    document.body
  );
}
