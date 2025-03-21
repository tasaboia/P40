"use client";

import { Building, Calendar, AlertCircle, X } from "lucide-react";
import { Button } from "@p40/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@p40/components/ui/select";
import type { Church, FilterOptions } from "./types";

interface DashboardFiltersProps {
  churches: Church[];
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onResetFilters: () => void;
}

export function DashboardFilters({
  churches,
  filters,
  onFilterChange,
  onResetFilters,
}: DashboardFiltersProps) {
  // Update church filter
  const handleChurchFilterChange = (value: string) => {
    onFilterChange({
      ...filters,
      churchFilter: value,
    });
  };

  // Update date filter
  const handleDateFilterChange = (value: string) => {
    onFilterChange({
      ...filters,
      dateFilter: value,
    });
  };

  // Update status filter
  const handleStatusFilterChange = (value: string) => {
    onFilterChange({
      ...filters,
      statusFilter: value,
    });
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Select
        value={filters.churchFilter}
        onValueChange={handleChurchFilterChange}
      >
        <SelectTrigger className="h-9 flex-1 min-w-[120px]">
          <Building className="h-4 w-4 mr-2 md:mr-1" />
          <SelectValue placeholder="Igreja" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as igrejas</SelectItem>
          {churches.map((church) => (
            <SelectItem key={church.id} value={church.id}>
              {church.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={filters.dateFilter} onValueChange={handleDateFilterChange}>
        <SelectTrigger className="h-9 flex-1 min-w-[120px]">
          <Calendar className="h-4 w-4 mr-2 md:mr-1" />
          <SelectValue placeholder="Data" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as datas</SelectItem>
          <SelectItem value="today">Hoje</SelectItem>
          <SelectItem value="tomorrow">Amanhã</SelectItem>
          <SelectItem value="thisWeek">Esta semana</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.statusFilter}
        onValueChange={handleStatusFilterChange}
      >
        <SelectTrigger className="h-9 flex-1 min-w-[120px]">
          <AlertCircle className="h-4 w-4 mr-2 md:mr-1" />
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          <SelectItem value="empty">Vazios</SelectItem>
          <SelectItem value="partial">Parciais</SelectItem>
          <SelectItem value="full">Completos</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9 ml-auto"
        onClick={onResetFilters}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
