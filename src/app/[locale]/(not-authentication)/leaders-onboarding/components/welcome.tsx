"use client";

import { motion } from "framer-motion";
import { CalendarClock } from "lucide-react";

export default function Welcome() {
  return (
    <motion.div
      className="flex flex-col items-center text-center  "
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <motion.h1
        className="text-3xl  font-bold tracking-tight"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Bem-vindo
      </motion.h1>

      <motion.h2
        className="text-2xl  font-semibold text-primary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        40 Dias de Oração
      </motion.h2>

      <motion.p
        className="text-muted-foreground max-w-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        Acompanhe os horários dos líderes durante este evento especial.
      </motion.p>
    </motion.div>
  );
}
