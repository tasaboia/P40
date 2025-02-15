export default function Log(logObject: any): void {
  const errorLog = {
    message: logObject?.message || "Erro desconhecido",
    stack: logObject?.stack || "Sem stack trace",
    name: logObject?.name || "Erro sem nome",
    timestamp: new Date().toLocaleString("pt-BR", {
      hour12: false,
    }),
  };

  console.error(JSON.stringify(errorLog, null, 2));
}
