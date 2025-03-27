//uso de type na aplicação

export const AreasOfService = [
  "Intercessão",
  "⁠Altomonte",
  "⁠MInistração",
  "⁠G5.2",
  "⁠Ohana",
  "⁠⁠Raízes",
  "⁠Jornada",
  "⁠PUL",
  "⁠Missões",
  "⁠Rise",
  "⁠Flow",
  "⁠Vox",
  "⁠Eklektos",
  "⁠Diamantes",
] as const;

export type TAreaName = (typeof AreasOfService)[number];

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
  },{
    indexTitle: "Check-ins",
    role: ["ADMIN"],
    route: {
      url: "checkin-overview",
    },
  },
];
