# Implementação do React Query na aplicação

## Problemas identificados e soluções

1. **Componentes de servidor usando UI interativo**: O `WeekTab` era um componente do servidor usando o componente `Tabs` que é um componente do cliente, causando erros.

2. **Múltiplas chamadas de API ao trocar abas**: A cada troca de aba, a aplicação fazia novas chamadas à API, o que afetava a performance.

## Soluções implementadas

### 1. Instalação do React Query

```bash
npm install @tanstack/react-query --force
```

### 2. Criação do provider do React Query

Criamos o arquivo `src/providers/query-provider.tsx`:

```tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
```

### 3. Criação do hook para buscar dados do dashboard

Criamos o arquivo `src/hooks/use-dashboard-data.tsx`:

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllData, AllResponse } from "@p40/services/dashboard/dashboard-all";

export function useDashboardData(userId: string) {
  return useQuery<AllResponse>({
    queryKey: ["dashboard", userId],
    queryFn: () => getAllData(userId),
    staleTime: 1000 * 60 * 5, // 5 minutos
    refetchOnWindowFocus: false,
  });
}
```

### 4. Atualização do componente WeekTab

Transformamos o `WeekTab` em um componente cliente:

```tsx
"use client";

import { useState } from "react";
import { Weekday } from "@p40/common/contracts/week/schedule";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@p40/components/ui/tabs";
import DayList from "./day-list";
import { today } from "@p40/common/utils/schedule";
import { useTranslations } from "next-intl";
import { useDashboardData } from "@p40/hooks/use-dashboard-data";
import { Loader2 } from "lucide-react";
import { ErrorHandler } from "@p40/components/custom/error-handler";

export default function WeekTab({ userId }: { userId: string }) {
  const t = useTranslations("common");
  const [activeTab, setActiveTab] = useState<string>(today);

  const { data, isLoading, error } = useDashboardData(userId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">{t("status.loading")}</p>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <ErrorHandler
        title={t("errors.title")}
        message={error?.message || data?.error || t("errors.default")}
      />
    );
  }

  const { event, prayerTurns, turns, user } = data.data || {};

  if (!event) {
    return (
      <ErrorHandler
        title={t("errors.no_event_title")}
        message={t("errors.no_event_message")}
      />
    );
  }

  return (
    <Tabs
      defaultValue={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="sticky top-0 z-10 w-full bg-background/95 backdrop-blur-sm shadow-sm mb-2">
        {Object.keys(Weekday).map((key) => {
          const dayAbbr = key as keyof typeof Weekday;
          return (
            <TabsTrigger
              key={dayAbbr}
              value={dayAbbr}
              className="flex-1 py-3 data-[state=active]:bg-primary/10 transition-all duration-200"
            >
              {t(`weekdays.${dayAbbr}`)}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {Object.keys(Weekday).map((key) => {
        const dayAbbr = key as keyof typeof Weekday;
        return (
          <TabsContent key={dayAbbr} value={dayAbbr}>
            <DayList
              weekAbbr={Weekday[dayAbbr]}
              weekday={Object.values(Weekday).indexOf(Weekday[dayAbbr])}
              event={event}
              prayerTurns={prayerTurns || []}
              turns={turns || []}
              user={user}
            />
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
```

### 5. Atualização do componente DayList

Garantimos que o `DayList` é um componente cliente:

```tsx
"use client";

import React, { Suspense } from "react";
import { createTurns } from "@p40/common/utils/schedule";
import { TurnItem } from "../turn/turn-item";
import { WeekSkeleton } from "./skeleton-week";
import { EventResponse } from "@p40/common/contracts/event/event";
import { User } from "@p40/common/contracts/user/user";

interface DayListProps {
  weekday: number;
  weekAbbr: string;
  event: EventResponse;
  prayerTurns: any[];
  turns: any[];
  user: User;
}

export default function DayList({
  weekday,
  weekAbbr,
  event,
  turns,
  user,
}: DayListProps) {
  const filteredTurns = turns.filter((turn) => turn.weekday === weekday);

  return (
    <Suspense fallback={<WeekSkeleton />}>
      <TurnItem
        userId={user.id}
        event={event}
        shift={createTurns(event?.shiftDuration)}
        weekday={weekAbbr}
        turnItens={filteredTurns}
      />
    </Suspense>
  );
}
```

### 6. Atualização do componente ErrorHandler

Atualizamos o `ErrorHandler` para suportar diferentes formas de exibição de erros:

```tsx
"use client";

import { useEffect } from "react";
import { toast } from "@p40/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@p40/components/ui/alert";

interface ErrorHandlerProps {
  error?: {
    title: string;
    description: string;
  } | null;
  title?: string;
  message?: string;
  showToast?: boolean;
}

export function ErrorHandler({
  error,
  title,
  message,
  showToast = false,
}: ErrorHandlerProps) {
  useEffect(() => {
    if (error && showToast) {
      toast({
        variant: "destructive",
        title: error.title,
        description: error.description,
      });
    }
  }, [error, showToast]);

  // Se tiver título e mensagem diretos, exibe um alerta visual
  if (title && message) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>
    );
  }

  // Se receber apenas o objeto error, mas não quiser exibir toast, mostra um alerta visual
  if (error && !showToast) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{error.title}</AlertTitle>
        <AlertDescription>{error.description}</AlertDescription>
      </Alert>
    );
  }

  // Caso contrário (exibiu toast ou não tem dados), não renderiza nada
  return null;
}
```

### 7. Atualização da página Schedule

Atualizamos a página `SchedulePage` para usar o React Query:

```tsx
import React from "react";
import { auth } from "../../../../../auth";
import { ErrorHandler } from "@p40/components/custom/error-handler";
import WeekTab from "@p40/components/custom/week/week-tab";
import QueryProvider from "@p40/providers/query-provider";

export default async function SchedulePage() {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return (
      <ErrorHandler
        error={{
          title: "Não autorizado",
          description: "Você precisa estar logado para acessar esta página",
        }}
        showToast={true}
      />
    );
  }

  return (
    <QueryProvider>
      <div className="flex flex-col gap-4 bg-muted p-4">
        <WeekTab userId={session.user.id} />
      </div>
    </QueryProvider>
  );
}
```

## Benefícios das alterações

1. **Melhor experiência do usuário**: A troca entre os dias da semana não causa mais requisições desnecessárias à API.

2. **Melhor performance**: Os dados são cacheados por 5 minutos, reduzindo a carga no servidor.

3. **Componentes corretamente separados**: Agora todos os componentes que usam interatividade cliente são corretamente marcados como "use client".

4. **Tratamento de erros melhorado**: Melhores mensagens de erro e carregamento.
