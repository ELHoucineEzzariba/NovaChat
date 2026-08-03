"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { LoginForm } from "@/components/auth/LoginForm";

const SPLASH_DURATION_MS = 4000;

export default function LoginPage() {
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowForm(true), SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex flex-col items-center">
        <motion.div
          layout
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className={showForm ? "h-14 w-14" : "h-28 w-28"}
        >
          <Image
            src="/images/brand/logo-mark.png"
            alt="NovaChat"
            width={128}
            height={128}
            priority
            className="h-full w-full rounded-2xl object-contain"
          />
        </motion.div>

        <AnimatePresence>
          {!showForm && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="mt-4 text-sm font-semibold tracking-wide text-text-tertiary"
            >
              NovaChat
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mt-6 w-full rounded-2xl border border-border bg-surface p-6 shadow-xl shadow-black/20"
          >
            <h1 className="mb-6 text-center text-2xl font-semibold text-text-primary">
              Bei NovaChat anmelden
            </h1>
            <LoginForm />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
