"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Check } from "lucide-react";
import * as UI from "@p40/components/ui/index";
import { useOnboarding } from "@p40/common/context/onboarding-context";
import { useQuery } from "@tanstack/react-query";

interface ServiceArea {
  id: string;
  name: string;
}

interface SelectedArea {
  id: string;
  name: string;
}

const fetchServiceAreas = async (): Promise<ServiceArea[]> => {
  const response = await fetch('/api/service-areas');
  if (!response.ok) {
    throw new Error('Falha ao carregar áreas');
  }
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Falha ao carregar áreas');
  }
  return data.data;
};

export default function AreasOfServicePage() {
  const {  setAreas } = useOnboarding();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAreas, setSelectedAreas] = useState<SelectedArea[]>([]);

  const { 
    data: serviceAreas, 
    isLoading, 
    isError,
    error 
  } = useQuery({
    queryKey: ['serviceAreas'],
    queryFn: fetchServiceAreas,
    staleTime: Infinity,  
    retry: 2, 
  });

  const filteredAreas = useMemo(() => {
    if (!serviceAreas) return [];
    return serviceAreas.filter((area) =>
      area.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [serviceAreas, searchQuery]);

  const toggleArea = useCallback((area: ServiceArea) => {
    setSelectedAreas(prev => {
      const isSelected = prev.some(selected => selected.id === area.id);
      if (isSelected) {
        return prev.filter(selected => selected.id !== area.id);
      } else {
        return [...prev, { id: area.id, name: area.name }];
      }
    });

    const storageKey = 'selectedServiceAreas';
    const currentAreas = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const updatedAreas = currentAreas.some((a: SelectedArea) => a.id === area.id)
      ? currentAreas.filter((a: SelectedArea) => a.id !== area.id)
      : [...currentAreas, { id: area.id, name: area.name }];
    localStorage.setItem(storageKey, JSON.stringify(updatedAreas));

    setAreas(updatedAreas);
  }, [setAreas]);

  useEffect(() => {
    const storageKey = 'selectedServiceAreas';
    const savedAreas = JSON.parse(localStorage.getItem(storageKey) || '[]');
    setSelectedAreas(savedAreas);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive font-medium">
          Erro ao carregar áreas de serviço
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {error instanceof Error ? error.message : 'Tente novamente mais tarde'}
        </p>
        <UI.Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Tentar novamente
        </UI.Button>
      </div>
    );
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
          {!serviceAreas ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin h-6 w-6" />
            </div>
          ) : filteredAreas.length > 0 ? (
            filteredAreas.map((area, index) => (
              <motion.div
                key={area.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`flex items-center space-x-2 border rounded-md p-3 mb-2 ${
                  selectedAreas.some(selected => selected.id === area.id)
                    ? "border-primary bg-primary/5"
                    : ""
                }`}
              >
                <UI.Checkbox
                  id={`area-${area.id}`}
                  checked={selectedAreas.some(
                    selected => selected.id === area.id
                  )}
                  onCheckedChange={() => toggleArea(area)}
                />
                <UI.Label
                  htmlFor={`area-${area.id}`}
                  className="flex-1 cursor-pointer"
                >
                  <div className="font-medium">{area.name}</div>
                </UI.Label>
                {selectedAreas.some(selected => selected.id === area.id) && (
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

        {selectedAreas.length > 0 && (
          <motion.div
            className="mt-4 text-sm text-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {selectedAreas.length}{" "}
            {selectedAreas.length === 1
              ? "área selecionada"
              : "áreas selecionadas"}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
