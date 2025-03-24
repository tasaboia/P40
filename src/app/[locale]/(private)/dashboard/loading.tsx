export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-primary"></div>
        <p className="text-sm md:text-base text-muted-foreground">
          Carregando Dashboard...
        </p>
      </div>
    </div>
  );
}
