import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { isMuted, setMuted, subscribeMute } from "@/lib/sound";

function useMuted() {
  return useSyncExternalStore(
    subscribeMute,
    () => isMuted(),
    () => false,
  );
}

export function SoundToggle() {
  const muted = useMuted();
  return (
    <motion.button
      onClick={() => setMuted(!muted)}
      aria-label={muted ? "Unmute" : "Mute"}
      whileHover={{ scale: 1.05, rotate: -2 }}
      whileTap={{ scale: 0.95 }}
      className="absolute top-6 right-6 z-30 rounded-md bg-[#F8F0DC] px-2 py-1 font-handwritten text-lg shadow-[2px_2px_0_rgba(58,42,31,0.25)]"
      style={{ border: "1.5px solid #2A1E16" }}
    >
      {muted ? "🔇" : "🔊"}
    </motion.button>
  );
}
