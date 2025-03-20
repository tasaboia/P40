"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@p40/components/ui/index";
import { useOnboarding } from "@p40/common/context/onboarding-context";
import Completion from "./components/redirection";
import Welcome from "./components/welcome";
import Location from "./components/location";
import AreasOfServicePage from "./components/areas";

export default function OnboardingFlow() {
  const router = useRouter();
  const { onboardingData, isOnboardingComplete } = useOnboarding();
  const [isPeding, startTransition] = useTransition();

  const [step, setStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (isOnboardingComplete) {
      startTransition(() => router.push("/login"));
    }
  }, [isOnboardingComplete, router]);

  const nextStep = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      setIsCompleting(true);
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const isNextDisabled = () => {
    if (step === 1 && !onboardingData.location.id) return true;
    if (step === 2 && onboardingData.areas.length === 0) return true;
    return false;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 flex flex-col items-center justify-between p-4">
        {!isCompleting && (
          <div className="w-full max-w-md flex justify-between mb-4 mt-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1 rounded-full flex-1 mx-0.5 transition-colors duration-300 ${
                  i <= step ? "bg-primary/70" : "bg-muted/50"
                }`}
              />
            ))}
          </div>
        )}

        <div className="w-full max-w-md flex-1 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {isCompleting ? (
              <motion.div
                key="completion"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <Completion />
              </motion.div>
            ) : (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {step === 0 && <Welcome />}
                {step === 1 && <Location />}
                {step === 2 && <AreasOfServicePage />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {!isCompleting && (
          <div className="w-full max-w-md flex justify-between mt-8 mb-4">
            {step > 0 ? (
              <Button
                variant="outline"
                onClick={prevStep}
                className="flex items-center"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            ) : (
              <div />
            )}

            <Button
              onClick={nextStep}
              disabled={isNextDisabled()}
              className="flex items-center"
            >
              {step === 2 ? "Concluir" : "Próximo"}
              {step < 2 && <ChevronRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
