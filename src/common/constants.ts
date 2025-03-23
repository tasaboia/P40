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
    route: "schedule",
    role: ["USER", "LEADER", "ADMIN"],
  },
  {
    indexTitle: "Geral",
    route: "dashboard",
    role: ["ADMIN"],
  },
  {
    indexTitle: "Configuração",
    route: "event-config",
    role: ["ADMIN"],
  },
];
