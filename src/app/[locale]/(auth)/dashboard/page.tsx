import { redirect } from "next/navigation";
import { auth } from "../../../../../auth";
import { ErrorHandler } from "@p40/components/custom/error-handler";
import { loadDashboardData } from "@p40/services/dashboard/load-dashboard-data";
import DashboardContainer from "./components/dashboard-container";
import { DashboardProvider } from "@p40/common/context/dashboard-context";

export default async function DashboardPage() {
  const session = await auth();

  if (session.user.role !== "ADMIN") {
    redirect("schedule");
  }

  if (!session.user.churchId) {
    return (
      <ErrorHandler
        error={{
          title: "Igreja não encontrada",
          description:
            "Você precisa estar vinculado a uma igreja para acessar este dashboard.",
        }}
      />
    );
  }

  try {
    const {
      leadersData,
      shiftsData,
      singleLeaderShiftsData,
      statsData,
      testimoniesData,
    } = await loadDashboardData(session.user.churchId);

    return (
      <DashboardProvider
        statsData={statsData}
        shiftsData={shiftsData}
        singleLeaderShiftsData={singleLeaderShiftsData}
        leadersData={leadersData}
        testimoniesData={testimoniesData}
      >
        <DashboardContainer />
      </DashboardProvider>
    );
  } catch (error: any) {
    return (
      <ErrorHandler
        error={{
          title: "Erro no carregamento do dashboard",
          description: error.message || "Tente novamente mais tarde.",
        }}
      />
    );
  }
}
