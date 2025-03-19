import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@p40/services/user/user-service";
import { eventByChurchId } from "@p40/services/event/event-byId";
import { getPrayerTurns } from "@p40/services/event/prayer-turn/get-prayer-turns";
import { getTurns } from "@p40/services/event/get-turn";
import { dashboardData } from "@p40/services/dashboard/dashboard.service";
import { getChartEventData } from "@p40/services/event/chart-event-data";
import { getUserByChurchId } from "@p40/services/user/user-service";
import { UsersResponse } from "@p40/common/contracts/user/user";
import { DashboardAllResponse } from "@p40/services/dashboard/dashboard-all";

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
  const warnings: string[] = []; // Lista de avisos para serviços que falharam mas não impediram a operação

  try {
    // Obter o userId da query
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "ID do usuário não fornecido" },
        { status: 400 }
      );
    }

    console.log(`API Dashboard All - Iniciando busca para usuário ${userId}`);

    // 1. Buscar dados do usuário
    const userData = await getUser(userId);
    if (!userData?.success || !userData.user) {
      console.error("API Dashboard All - Usuário não encontrado:", userData);
      return NextResponse.json(
        { success: false, error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const user = userData.user;
    console.log(`API Dashboard All - Usuário encontrado: ${user.name}`);

    // 2. Buscar dados do evento
    const event = await eventByChurchId(user.churchId);
    if (!event?.id) {
      console.log("API Dashboard All - Evento não encontrado");
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

    console.log(`API Dashboard All - Evento encontrado: ${event.id}`);

    // 3. Buscar dados com tratamento de erros individual
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
      console.log("API Dashboard All - Prayer Turns:", prayerTurnsData);
    } catch (error) {
      console.error("Erro ao buscar turnos de oração:", error);
      warnings.push("Não foi possível carregar os turnos de oração");
    }

    try {
      turnsData = await getTurns({ eventId: event.id, userId });
      console.log("API Dashboard All - Turns:", turnsData);
    } catch (error) {
      console.error("Erro ao buscar turnos:", error);
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
        console.log("API Dashboard All - Stats:", stats);
      }
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      warnings.push("Não foi possível carregar as estatísticas do dashboard");
    }

    try {
      const chartResponse = await getChartEventData(event.id);
      console.log("API Dashboard All - Chart Response:", chartResponse);
      if (!chartResponse?.data) {
        console.error(
          "API Dashboard All - Dados do gráfico vazios:",
          chartResponse
        );
        warnings.push("Não foi possível carregar os dados do gráfico");
      } else {
        chartData = chartResponse as ChartResponse;
      }
    } catch (error) {
      console.error("Erro ao buscar dados do gráfico:", error);
      warnings.push("Não foi possível carregar os dados do gráfico");
    }

    try {
      const usersResponse = await getUserByChurchId(event.churchId);
      if (!usersResponse?.users) {
        console.error("API Dashboard All - Usuários vazios:", usersResponse);
        warnings.push("Não foi possível carregar os usuários");
      } else {
        usersData = usersResponse;
        console.log("API Dashboard All - Users:", usersData);
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      warnings.push("Não foi possível carregar os usuários");
    }

    console.log(
      "API Dashboard All - Dados carregados com " +
        (warnings.length > 0 ? warnings.length + " avisos" : "sucesso")
    );

    // 4. Construir resposta
    const response: DashboardAllResponse = {
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

    console.log("API Dashboard All - Resposta Final:", {
      success: response.success,
      hasChartData: response.data.chartData.length > 0,
      chartDataLength: response.data.chartData.length,
      chartDataSample: response.data.chartData.slice(0, 2),
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("API Dashboard All - Erro:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
