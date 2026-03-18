"use client";

import { motion } from "framer-motion";

export function FintechBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -top-40 left-[-20%] h-[520px] w-[520px] rounded-full bg-indigo-500/25 blur-3xl"
        animate={{ x: [0, 40, -30, 0], y: [0, 20, -10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-10 right-[-15%] h-[520px] w-[520px] rounded-full bg-pink-500/18 blur-3xl"
        animate={{ x: [0, -30, 25, 0], y: [0, 18, -16, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-35%] left-[20%] h-[680px] w-[680px] rounded-full bg-emerald-400/10 blur-3xl"
        animate={{ x: [0, 30, -20, 0], y: [0, -25, 15, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 opacity-[0.22] [background-image:linear-gradient(to_right,rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-transparent" />
    </div>
  );
}

