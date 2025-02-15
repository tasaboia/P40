import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // Lista de todos os idiomas suportados
  locales: ["en", "pt"],

  // Idioma padrão
  defaultLocale: "pt",

  // Prefixo de idioma nas rotas
  localePrefix: "always", // ou 'as-needed' para prefixar apenas quando necessário
});
