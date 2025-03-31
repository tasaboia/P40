

export const DashboardTabs = [
  {
    indexTitle: "Agenda",
    role: ["USER", "LEADER", "ADMIN"],
    route: {
      url: "schedule",
      params: "",
    },
  },
  {
    indexTitle: "Geral",
    role: ["ADMIN"],
    route: {
      url: "dashboard",
      params: "",
    },
  },
  {
    indexTitle: "Configuração",
    role: ["ADMIN"],
    route: {
      url: "event-config",
      params: "",
    },
  },
  {
    indexTitle: "Pautas Diárias",
    role: ["USER", "LEADER", "ADMIN"],
    route: {
      url: "daily-topic",
      params: "eventId",
    },
  },
  {
    indexTitle: "Testemunhos",
    role: ["USER", "LEADER", "ADMIN"],
    route: {
      url: "testimonies",
    },
  },
  {
    indexTitle: "Check-ins",
    role: ["ADMIN"],
    route: {
      url: "checkin-overview",
    },
  },
  
];
