"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Check } from "lucide-react";
import * as UI from "@p40/components/ui/index";
import { AreasOfService, TAreaName } from "@p40/common/constants";
import { useOnboarding } from "@p40/common/context/onboarding-context";

export default function AreasOfServicePage() {
  const { onboardingData, setAreas } = useOnboarding();
  const [searchQuery, setSearchQuery] = useState("");

  const toggleArea = (areaName: TAreaName) => {
    const newAreas = onboardingData.areas.includes(areaName)
      ? onboardingData.areas.filter((area) => area !== areaName)
      : [...onboardingData.areas, areaName];

    setAreas(newAreas);
  };

  const filteredAreas = AreasOfService.filter((area) =>
    area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      className="flex flex-col space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center space-y-2">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4"
        >
          <Users className="h-6 w-6 text-primary" />
        </motion.div>

        <motion.h2
          className="text-2xl font-bold"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Quais áreas você faz parte?
        </motion.h2>

        <motion.p
          className="text-muted-foreground"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Selecione todas as áreas que você lidera ou participa
        </motion.p>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <UI.Input
          type="text"
          placeholder="Buscar área..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-4"
        />

        <div className="max-h-[300px] overflow-y-auto pr-2">
          {filteredAreas.length > 0 ? (
            filteredAreas.map((area, index) => (
              <motion.div
                key={area}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`flex items-center space-x-2 border rounded-md p-3 mb-2 ${
                  onboardingData.areas.includes(area)
                    ? "border-primary bg-primary/5"
                    : ""
                }`}
              >
                <UI.Checkbox
                  id={`area-${area}`}
                  checked={onboardingData.areas.some(
                    (selectedArea) => selectedArea === area
                  )}
                  onCheckedChange={() => toggleArea(area)}
                />
                <UI.Label
                  htmlFor={`area-label-${area}`}
                  className="flex-1 cursor-pointer"
                >
                  <div className="font-medium">{area}</div>
                </UI.Label>
                {onboardingData.areas.includes(area) && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </motion.div>
            ))
          ) : (
            <p className="text-center py-4 text-muted-foreground">
              Nenhuma área encontrada com esse termo.
            </p>
          )}
        </div>

        {onboardingData.areas.length > 0 && (
          <motion.div
            className="mt-4 text-sm text-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {onboardingData.areas.length}{" "}
            {onboardingData.areas.length === 1
              ? "área selecionada"
              : "áreas selecionadas"}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
