import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off", // 🔥 Permite variáveis não usadas
      "no-console": "off", // 🔥 Permite console.log()
      "react/jsx-key": "warn", // Apenas avisa sobre keys faltando
      "no-debugger": "off", // Permite debugger
      "react/no-unescaped-entities": "off", // Remove erros de caracteres especiais
    },
  },
];

export default eslintConfig;
