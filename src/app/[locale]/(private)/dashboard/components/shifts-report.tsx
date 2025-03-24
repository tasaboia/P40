import React, { useMemo, useState } from "react";
import { useDashboard } from "@p40/common/context/dashboard-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@p40/components/ui";
import { AlertCircle, Calendar, Search, UserCheck, X } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { RenderShiftStatus } from "./render-shift-status";
import { Helpers } from "@p40/common/utils/helpers";

interface ShiftsReportProps {
  showSingleLeaderShifts: boolean;
  setShowSingleLeaderShifts: (value: boolean) => void;
}

export default function ShiftsReport({
  setShowSingleLeaderShifts,
  showSingleLeaderShifts,
}: ShiftsReportProps) {
  const {
    filteredShifts,
    singleLeaderShifts,
    searchTerm,
    statusFilter,
    dateFilter,
    setStatusFilter,
    setDateFilter,
    setSearchTerm,
  } = useDashboard();

  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 10;

  const data = useMemo(() => {
    const baseData = showSingleLeaderShifts
      ? singleLeaderShifts
      : filteredShifts;

    if (searchTerm.trim() === "") {
      return baseData;
    }

    return baseData.filter((shift) =>
      shift.leaders.some((leader) =>
        leader.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [filteredShifts, singleLeaderShifts, searchTerm]);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: "Dias da Semana",
        accessorKey: "weekday",
        cell: ({ row }) => Helpers.getWeekdayName(row.original.weekday),
      },
      {
        header: "Horário",
        accessorKey: "startTime",
        cell: ({ row }) =>
          `${row.original.startTime} - ${row.original.endTime}`,
      },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => <RenderShiftStatus status={row.original.status} />,
      },
      {
        header: "Líderes",
        accessorKey: "leaders",
        cell: ({ row }) => {
          const leaders = row.original.leaders;
          if (leaders.length === 0) {
            return (
              <span className="text-sm text-muted-foreground capitalize">
                Sem líderes designados
              </span>
            );
          }
          return (
            <div className="space-y-1">
              {leaders.map((leader: any) => (
                <div
                  key={leader.id}
                  className="flex items-center space-x-1 capitalize"
                >
                  <Badge variant="outline" className="text-xs py-0 px-1">
                    <UserCheck className="h-3 w-3 mr-1 " />
                    {leader.name.toLowerCase()}
                  </Badge>
                </div>
              ))}
            </div>
          );
        },
      },
    ],
    [showSingleLeaderShifts]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(newState.pageIndex);
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Turnos</CardTitle>
        <CardDescription>
          Visualize e gerencie todos os turnos do evento
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por líder..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              onClick={() => setShowSingleLeaderShifts(!showSingleLeaderShifts)}
            >
              {showSingleLeaderShifts ? "Mostrar Todos" : "Só Um Líder"}
            </Button>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="h-9 flex-1">
                <Calendar className="h-4 w-4 mr-2 md:mr-1" />
                <SelectValue placeholder="Data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="0">Domingo</SelectItem>
                <SelectItem value="1">Segunda</SelectItem>
                <SelectItem value="2">Terça</SelectItem>
                <SelectItem value="3">Quarta</SelectItem>
                <SelectItem value="4">Quinta</SelectItem>
                <SelectItem value="5">Sexta</SelectItem>
                <SelectItem value="6">Sábado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-9 flex-1 min-w-[120px]">
                <AlertCircle className="h-4 w-4 mr-2 md:mr-1" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="empty">Vazios</SelectItem>
                <SelectItem value="partial">Parciais</SelectItem>
                <SelectItem value="full">Completos</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 ml-auto"
              onClick={() => {
                setSearchTerm("");
                setDateFilter("all");
                setStatusFilter("all");
                setShowSingleLeaderShifts(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-muted">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-left px-4 py-2 text-sm font-medium text-muted-foreground"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-2 text-sm">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {table.getRowModel().rows.length} de {data.length} turnos
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Próximo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
