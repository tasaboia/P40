"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin,  RefreshCw } from "lucide-react";
import * as UI from "@p40/components/ui/index";
import { ErrorHandler } from "@p40/components/custom/error-handler";
import { Church } from "@p40/common/contracts/church/zions";
import { useOnboarding } from "@p40/common/context/onboarding-context";
import { useChurchCache } from "@p40/hooks/use-church-cache";

export default function Location() {
  const { setLocation, onboardingData } = useOnboarding();
  const { zions, isLoading, error, isRefreshing, refreshZions } = useChurchCache();

  const handleLocationSelect = (id: string, name: string) => {
    setLocation(id, name);
  };

  const [churchesByRegion, setChurchesByRegion] = useState<Map<string, Church[]>>(new Map());
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (zions) {
      const regionsMap = new Map<string, Church[]>();

      zions.forEach((zion) => {
        zion.churches.forEach((church) => {
          if (!regionsMap.has(zion.region.name)) {
            regionsMap.set(zion.region.name, []);
          }
          regionsMap.get(zion.region.name)?.push(church);
        });
      });

      setChurchesByRegion(regionsMap);
    }
  }, [zions]);

  const filteredChurches = Array.from(churchesByRegion.values())
    .flat()
    .filter(
      (church) =>
        church.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        church.country.toLowerCase().includes(searchQuery.toLowerCase())
    );

  if (error) {
    return ErrorHandler({
      error: {
        description: "Não foi possível carregar a lista de igrejas. Por favor, tente novamente.",
        title: "Erro ao carregar igrejas",
      },
    });
  }

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
          <MapPin className="h-6 w-6 text-primary" />
        </motion.div>

        <motion.h2
          className="text-2xl font-bold"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Qual localidade você está participando?
        </motion.h2>

        <motion.p
          className="text-muted-foreground"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Selecione a Igreja Zion que você frequenta
        </motion.p>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex gap-2 mb-4">
          <UI.Input
            type="text"
            placeholder="Buscar igreja ou localidade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <UI.Button
            variant="outline"
            size="icon"
            onClick={refreshZions}
            disabled={isRefreshing}
            className="shrink-0"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </UI.Button>
        </div>

        {(isLoading || isRefreshing) ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto pr-2">
            <UI.RadioGroup
              value={onboardingData.location.id || ""}
              onValueChange={(id: string) => {
                const selectedChurch = filteredChurches.find(
                  (church) => church.id === id
                );
                if (selectedChurch) {
                  handleLocationSelect(selectedChurch.id, selectedChurch.name);
                }
              }}
            >
              {filteredChurches.length > 0 ? (
                filteredChurches.map((church, index) => (
                  <motion.div
                    key={church.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center space-x-2 border rounded-md p-3 mb-2"
                  >
                    <UI.RadioGroupItem
                      value={church.id}
                      id={`church-${church.id}`}
                    />
                    <UI.Label
                      htmlFor={`church-${church.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">{church.name}</div>
                    </UI.Label>
                  </motion.div>
                ))
              ) : (
                <p className="text-center py-4 text-muted-foreground">
                  Nenhuma igreja encontrada com esse termo.
                </p>
              )}
            </UI.RadioGroup>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
