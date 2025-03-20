import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@p40/services/user/user-service";
import { eventByChurchId } from "@p40/services/event/event-byId";
import { getPrayerTurns } from "@p40/services/event/prayer-turn/get-prayer-turns";
import { getTurns } from "@p40/services/event/get-turn";
import { dashboardData } from "@p40/services/dashboard/dashboard.service";
import { getChartEventData } from "@p40/services/event/chart-event-data";
import { getUserByChurchId } from "@p40/services/user/user-service";
import { UsersResponse } from "@p40/common/contracts/user/user";
import { AllResponse } from "@p40/services/dashboard/dashboard-all";

// Interfaces para tipar corretamente as respostas
interface StatsResponse {
  success: boolean;
  stats: {
    distinctLeaders: string;
    singleLeaderSlots: string;
    filledTimeSlots: string;
    emptyTimeSlots: string;
  };
}

interface ChartResponse {
  success: boolean;
  data: any[];
}

export async function GET(request: NextRequest) {
  const warnings: string[] = [];

  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "ID do usuário não fornecido" },
        { status: 400 }
      );
    }

    const userData = await getUser(userId);
    if (!userData?.success || !userData.user) {
      return NextResponse.json(
        { success: false, error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const user = userData.user;

    const event = await eventByChurchId(user.churchId);
    if (!event?.id) {
      // Retornar dados mesmo sem evento, para permitir onboarding
      return NextResponse.json({
        success: true,
        data: {
          user,
          event: null,
          prayerTurns: [],
          turns: [],
          stats: {
            distinctLeaders: "0",
            singleLeaderSlots: "0",
            filledTimeSlots: "0",
            emptyTimeSlots: "0",
          },
          chartData: null,
          users: [],
        },
      });
    }

    let prayerTurnsData = { prayerTurn: [] };
    let turnsData = [];
    let stats: StatsResponse = {
      success: true,
      stats: {
        distinctLeaders: "0",
        singleLeaderSlots: "0",
        filledTimeSlots: "0",
        emptyTimeSlots: "0",
      },
    };
    let chartData: ChartResponse = { success: true, data: [] };
    let usersData: UsersResponse = { success: true, users: [] };

    try {
      prayerTurnsData = await getPrayerTurns(event.id);
    } catch (error) {
      warnings.push("Não foi possível carregar os turnos de oração");
    }

    try {
      turnsData = await getTurns({ eventId: event.id, userId });
    } catch (error) {
      warnings.push("Não foi possível carregar os turnos");
    }

    try {
      const statsResponse = await dashboardData(event.id);
      if (!statsResponse?.stats) {
        console.error(
          "API Dashboard All - Estatísticas vazias:",
          statsResponse
        );
        warnings.push("Não foi possível carregar as estatísticas do dashboard");
      } else {
        stats = statsResponse as StatsResponse;
      }
    } catch (error) {
      warnings.push("Não foi possível carregar as estatísticas do dashboard");
    }

    try {
      const chartResponse = await getChartEventData(event.id);
      if (!chartResponse?.data) {
        warnings.push("Não foi possível carregar os dados do gráfico");
      } else {
        chartData = chartResponse as ChartResponse;
      }
    } catch (error) {
      warnings.push("Não foi possível carregar os dados do gráfico");
    }

    try {
      const usersResponse = await getUserByChurchId(event.churchId);
      if (!usersResponse?.users) {
        warnings.push("Não foi possível carregar os usuários");
      } else {
        usersData = usersResponse;
      }
    } catch (error) {
      warnings.push("Não foi possível carregar os usuários");
    }

    // Construir resposta
    const response: AllResponse = {
      success: true,
      data: {
        user,
        event,
        prayerTurns: prayerTurnsData?.prayerTurn || [],
        turns: turnsData || [],
        stats: stats?.stats || {
          distinctLeaders: "0",
          singleLeaderSlots: "0",
          filledTimeSlots: "0",
          emptyTimeSlots: "0",
        },
        chartData: chartData?.data || [],
        users: usersData?.users || [],
      },
      warnings: warnings.length > 0 ? warnings : undefined,
    };

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
