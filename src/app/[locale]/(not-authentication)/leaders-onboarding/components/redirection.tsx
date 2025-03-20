"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { useOnboarding } from "@p40/common/context/onboarding-context";

export default function Completion() {
  const { setIsOnboardingComplete } = useOnboarding();

  const [stage, setStage] = useState<"saving" | "success" | "redirect">(
    "saving"
  );

  useEffect(() => {
    const savingTimeout = setTimeout(() => {
      setStage("success");

      const redirectTimeout = setTimeout(() => {
        setStage("redirect");
      }, 2000);

      return () => clearTimeout(redirectTimeout);
    }, 2000);

    return () => clearTimeout(savingTimeout);
  }, []);

  useEffect(() => {
    if (stage === "redirect") {
      setIsOnboardingComplete(true);
    }
  }, [stage, setIsOnboardingComplete]);

  return (
    <motion.div
      className="flex flex-col items-center justify-center text-center space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {stage === "saving" && (
        <>
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{
              scale: [0.8, 1, 0.8],
              rotate: [0, 10, 0, -10, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              repeatType: "loop",
            }}
            className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent" />
            </motion.div>
          </motion.div>

          <h2 className="text-xl font-semibold">Salvando...</h2>
          <p className="text-muted-foreground">Estamos configurando</p>
        </>
      )}

      {stage === "success" && (
        <>
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center"
          >
            <CheckCircle className="h-12 w-12 text-primary" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-semibold"
          >
            Configuração concluída!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground"
          >
            Você está pronto para começar
          </motion.p>
        </>
      )}
    </motion.div>
  );
}
