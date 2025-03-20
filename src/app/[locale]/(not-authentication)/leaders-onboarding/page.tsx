"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import * as UI from "@p40/components/ui/index";
import Areas from "./components/areas";
import Welcome from "./components/welcome";
import Location from "./components/location";
import { useRouter } from "next/navigation";

export default function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const route = useRouter();

  const nextStep = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      // Submit data and complete onboarding
      console.log("Onboarding complete", {
        location: selectedLocation,
        areas: selectedAreas,
      });

      route.push("login");
      // Here you would typically save to local storage or API
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const isNextDisabled = () => {
    if (step === 1 && !selectedLocation) return true;
    if (step === 2 && selectedAreas.length === 0) return true;
    return false;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 flex flex-col items-center justify-between p-4">
        <div className="w-full max-w-md flex justify-between mb-8 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full flex-1 mx-1 transition-colors duration-300 ${
                i <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="w-full max-w-md flex-1 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {step === 0 && <Welcome />}
              {step === 1 && (
                <Location
                  selectedLocation={selectedLocation}
                  setSelectedLocation={setSelectedLocation}
                />
              )}
              {step === 2 && (
                <Areas
                  selectedAreas={selectedAreas}
                  setSelectedAreas={setSelectedAreas}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="w-full max-w-md flex justify-between mt-8 mb-4">
          {step > 0 ? (
            <UI.Button
              variant="outline"
              onClick={prevStep}
              className="flex items-center"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Voltar
            </UI.Button>
          ) : (
            <div />
          )}

          <UI.Button
            onClick={nextStep}
            disabled={isNextDisabled()}
            className="flex items-center"
          >
            {step === 2 ? "Concluir" : "Próximo"}
            {step < 2 && <ChevronRight className="ml-2 h-4 w-4" />}
          </UI.Button>
        </div>
      </main>
    </div>
  );
}
