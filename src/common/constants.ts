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
    indexTitle: "Geral",
    title: "Visão Geral",
    route: "dashboard",
  },

  {
    indexTitle: "Agenda",
    title: "Todas os horários",
    route: "schedule",
  },
];
