export default function AuthErrorPage({ error }: { error?: string }) {
  if (error) {
    console.log("Error:", error);
  }

  return (
    <div className="flex flex-col items-center justify-center p-5 bg-background pb-10">
      <h1 className="text-2xl font-bold">Ocorreu um erro</h1>
      <p className="mt-2 text-lg text-red-500">
        {error === "Configuration"
          ? "Erro de configuração do provedor de autenticação."
          : "Houve um erro durante o processo de autenticação."}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Por favor, tente novamente ou entre em contato com o suporte.
      </p>
    </div>
  );
}
