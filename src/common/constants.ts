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
    describe: "",
    title: "Visão Geral",
    route: "dashboard",
  },

  {
    indexTitle: "Agenda",
    title: "Todas os horários",
    describe: "",
    route: "schedule",
  },
  {
    indexTitle: "Configuração",
    title: "40 Dias de Oração",
    describe: "Configure os detalhes do evento",
    route: "event-config",
  },
];
