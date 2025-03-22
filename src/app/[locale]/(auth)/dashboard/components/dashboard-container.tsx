"use client";

import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import * as UI from "@p40/components/ui/index";
import { useDashboard } from "@p40/common/context/dashboard-context";
import StatsCards from "./stats-cards";
import { lazy, useState } from "react";
import ShiftsReport from "./shifts-report";
import LeadersTable from "./leaders-table";
import { TestimonyList } from "@p40/components/custom/dashboard/testimony-list";
import { ExportData } from "@p40/components/custom/dashboard/export-data";
import Report from "./report";
const SingleLeaderDialog = await lazy(() => import("./single-leader-dialog"));

export default function DashboardContainer() {
  const { activeTab, setActiveTab, exportToCSV } = useDashboard();
  const [showSingleLeaderShifts, setShowSingleLeaderShifts] = useState(false);

  return (
    <div className="container px-2 md:px-6 py-4 md:py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Dashboard Administrativo
            </h1>
            <p className="text-sm md:text-base text-muted-foreground">
              40 Dias de Oração - Visão geral e estatísticas
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
            <div className="flex gap-2 ml-auto md:ml-0">
              <UI.Button
                variant="outline"
                size="icon"
                className="h-9 w-9"
                onClick={() => window.location.reload()}
              >
                <Icons.RefreshCcw className="h-4 w-4" />
              </UI.Button>

              <UI.DropdownMenu>
                <UI.DropdownMenuTrigger asChild>
                  <UI.Button variant="outline" className="h-9">
                    <Icons.Download className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Exportar</span>
                  </UI.Button>
                </UI.DropdownMenuTrigger>
                <UI.DropdownMenuContent align="end">
                  <UI.DropdownMenuLabel>Exportar dados</UI.DropdownMenuLabel>
                  <UI.DropdownMenuSeparator />
                  <UI.DropdownMenuItem onClick={exportToCSV}>
                    <Icons.FileText className="h-4 w-4 mr-2" />
                    Exportar para CSV
                  </UI.DropdownMenuItem>
                </UI.DropdownMenuContent>
              </UI.DropdownMenu>
            </div>
          </div>
        </div>

        <UI.Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="overflow-x-auto pb-2 ">
            <UI.TabsList className="flex w-max min-w-full whitespace-nowrap gap-2 px-1">
              <UI.TabsTrigger value="overview" className="text-xs md:text-sm">
                <Icons.BarChart3 className="h-4 w-4 mr-1 md:mr-2" />
                <span>Visão Geral</span>
              </UI.TabsTrigger>
              <UI.TabsTrigger value="shifts" className="text-xs md:text-sm">
                <Icons.Clock className="h-4 w-4 mr-1 md:mr-2" />
                <span>Turnos</span>
              </UI.TabsTrigger>
              <UI.TabsTrigger value="leaders" className="text-xs md:text-sm">
                <Icons.Users className="h-4 w-4 mr-1 md:mr-2" />
                <span>Líderes</span>
              </UI.TabsTrigger>
              <UI.TabsTrigger
                value="testimonies"
                className="text-xs md:text-sm"
              >
                <Icons.FileText className="h-4 w-4 mr-1 md:mr-2" />
                <span>Testemunhos</span>
              </UI.TabsTrigger>
              <UI.TabsTrigger value="reports" className="text-xs md:text-sm">
                <Icons.FileText className="h-4 w-4 mr-1 md:mr-2" />
                <span>Relatórios</span>
              </UI.TabsTrigger>
            </UI.TabsList>
          </div>

          <UI.TabsContent value="overview" className="space-y-6">
            <StatsCards setShowSingleLeaderShifts={setShowSingleLeaderShifts} />
          </UI.TabsContent>

          <UI.TabsContent value="shifts" className="space-y-6">
            <ShiftsReport
              showSingleLeaderShifts={showSingleLeaderShifts}
              setShowSingleLeaderShifts={setShowSingleLeaderShifts}
            />
          </UI.TabsContent>

          <UI.TabsContent value="leaders" className="space-y-6">
            <LeadersTable />
          </UI.TabsContent>
          <UI.TabsContent value="testimonies" className="space-y-6">
            <TestimonyList
              onApproveTestimony={() => {}}
              onRejectTestimony={() => {}}
            />
          </UI.TabsContent>
          <UI.TabsContent value="reports" className="space-y-6">
            <Report />
          </UI.TabsContent>
        </UI.Tabs>
      </motion.div>
      <SingleLeaderDialog
        setShowSingleLeaderShifts={setShowSingleLeaderShifts}
        showSingleLeaderShifts={showSingleLeaderShifts}
      />
    </div>
  );
}
