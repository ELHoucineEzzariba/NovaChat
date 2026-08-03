"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Smile } from "lucide-react";

const EMOJI_SHORTCUTS = ["😀", "😂", "😍", "👍", "🎉", "🔥", "🙏", "👀"];

interface EmojiPickerButtonProps {
  onSelect: (emoji: string) => void;
}

/** Smiley-Button mit kleinem Emoji-Raster als Popover, für schnelle Einfügungen ins Textfeld. */
export function EmojiPickerButton({ onSelect }: EmojiPickerButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Emoji einfügen"
        className="rounded p-1 text-text-tertiary transition-colors hover:bg-hover hover:text-text-primary"
      >
        <Smile size={15} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.12 }}
            className="absolute bottom-full left-0 z-10 mb-1 flex gap-1 rounded-md border border-border bg-surface-elevated p-1 shadow-md"
          >
            {EMOJI_SHORTCUTS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onSelect(emoji);
                  setOpen(false);
                }}
                className="rounded p-1 text-base transition-colors hover:bg-hover"
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
