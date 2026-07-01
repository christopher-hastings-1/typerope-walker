import { motion } from "framer-motion";
import { setLang, useT } from "@/lib/i18n";

export function LanguageSelect() {
  const t = useT();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 z-40 flex items-center justify-center"
      style={{ background: "#F5EDDC" }}
    >
      <motion.div
        initial={{ y: 30, opacity: 0, rotate: -1.5 }}
        animate={{ y: 0, opacity: 1, rotate: -1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="flex flex-col items-center gap-6 rounded-md bg-[#F8F0DC] px-12 py-10 text-center shadow-[0_20px_40px_-15px_rgba(42,30,22,0.35)]"
        style={{ border: "2px solid #2A1E16" }}
      >
        <h1 className="font-handwritten text-6xl text-[#2A1E16]">Typerope Walker</h1>
        <p className="font-handwritten text-lg text-[#8B6F4E]">
          {t("langChoose")}
        </p>
        <div className="flex gap-4 pt-2">
          {(["en", "lt"] as const).map((l) => (
            <motion.button
              key={l}
              whileHover={{ scale: 1.05, rotate: l === "en" ? -1 : 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setLang(l)}
              className="rounded-sm bg-[#D55B3A] px-6 py-3 font-handwritten text-xl text-[#F8F0DC] shadow-[3px_3px_0_#2A1E16]"
            >
              {l === "en" ? t("langEn") : t("langLt")}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
