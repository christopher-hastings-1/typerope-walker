import { motion } from "framer-motion";
import { clearLang, useLang } from "@/lib/i18n";

export function LangBadge() {
  const lang = useLang();
  if (!lang) return null;
  const flag = lang === "lt" ? "🇱🇹" : "🇬🇧";
  const label = lang === "lt" ? "LT" : "EN";
  return (
    <motion.button
      onClick={() => clearLang()}
      whileHover={{ scale: 1.05, rotate: -2 }}
      whileTap={{ scale: 0.95 }}
      title="Switch language / Keisti kalbą"
      className="absolute top-6 left-6 z-30 flex items-center gap-1.5 rounded-md bg-[#F8F0DC] px-2 py-1 font-handwritten text-lg text-[#2A1E16] shadow-[2px_2px_0_rgba(58,42,31,0.25)]"
      style={{ border: "1.5px solid #2A1E16" }}
    >
      <span style={{ fontSize: "1rem" }}>{flag}</span>
      <span className="tracking-wider">{label}</span>
    </motion.button>
  );
}
