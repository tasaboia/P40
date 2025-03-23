import React from "react";
import * as UI from "@p40/components/ui/index";
import { Helpers } from "@p40/common/utils/helpers";
import { Weekday } from "@p40/common/contracts/week/schedule";
import {
  AlertCircle,
  Building,
  Clock,
  Download,
  UserCheck,
} from "lucide-react";
import { useDashboard } from "@p40/common/context/dashboard-context";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";

interface SingleLeaderDialogProps {
  showSingleLeaderShifts: boolean;
  setShowSingleLeaderShifts: (value: boolean) => void;
}

export default function SingleLeaderDialog({
  setShowSingleLeaderShifts,
  showSingleLeaderShifts,
}: SingleLeaderDialogProps) {
  const { singleLeaderShifts, exportSingleLeaderShiftsToCSV } = useDashboard();

  const [pageIndex, setPageIndex] = React.useState(0);
  const pageSize = 10;

  const columns = React.useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: "Dia da Semana",
        accessorKey: "weekday",
        cell: ({ row }) => (
          <div className="font-medium">
            {Helpers.getWeekdayName(row.original.weekday)}
          </div>
        ),
      },
      {
        header: "Horário",
        accessorFn: (row) => `${row.startTime} - ${row.endTime}`,
        cell: ({ row }) =>
          `${row.original.startTime} - ${row.original.endTime}`,
      },
      {
        header: "Líder Atual",
        accessorKey: "leader",
        cell: ({ row }) => {
          const leader = row.original.leaders?.[0];
          return (
            <div className="flex gap-2 items-center font-medium capitalize">
              <UI.Avatar className="h-8 w-8 rounded-full">
                <UI.AvatarImage src={leader?.imageUrl} />
                <UI.AvatarFallback className="rounded-full">
                  {Helpers.getInitials(leader?.name || "")}
                </UI.AvatarFallback>
              </UI.Avatar>
              {leader?.name?.toLowerCase() || "Sem líder"}
            </div>
          );
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: singleLeaderShifts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
  });

  return (
    <UI.Dialog
      open={showSingleLeaderShifts}
      onOpenChange={setShowSingleLeaderShifts}
    >
      <UI.DialogContent className="w-full max-w-screen-md max-h-[90vh] overflow-y-auto p-4 md:p-6">
        <UI.DialogHeader>
          <UI.DialogTitle>Horários com Apenas Um Líder</UI.DialogTitle>
          <UI.DialogDescription>
            Estes horários precisam de mais um líder para estarem completos
          </UI.DialogDescription>
        </UI.DialogHeader>

        <div className="py-4">
          <div className="rounded-md border overflow-hidden">
            {/* Versão desktop */}
            <div className="hidden md:block">
              <UI.Table>
                <UI.TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <UI.TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <UI.TableHead key={header.id} className="text-left">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </UI.TableHead>
                      ))}
                    </UI.TableRow>
                  ))}
                </UI.TableHeader>
                <UI.TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <UI.TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <UI.TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </UI.TableCell>
                      ))}
                    </UI.TableRow>
                  ))}
                </UI.TableBody>
              </UI.Table>
            </div>

            {/* Versão mobile */}
            <div className="md:hidden">
              {table.getRowModel().rows.map((shiftRow) => {
                const shift = shiftRow.original;
                return (
                  <div key={shift.id} className="p-3 border-b last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium text-sm">
                          {Helpers.getWeekdayName(shift.weekday)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Weekday[shift.weekday]}
                        </div>
                      </div>
                      <UI.Badge
                        variant="outline"
                        className="bg-warning/10 text-warning border-warning/20"
                      >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Parcial
                      </UI.Badge>
                    </div>

                    <div className="flex items-center text-sm mb-2">
                      <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span>
                        {shift.startTime} - {shift.endTime}
                      </span>
                    </div>

                    <div className="flex items-center text-sm mb-2">
                      <UserCheck className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span>{shift.leaders?.[0]?.name || "Sem líder"}</span>
                    </div>

                    <div className="flex items-center text-xs text-muted-foreground mb-3">
                      <Building className="h-3 w-3 mr-1" />
                      <span>
                        {shift.church?.name || "Igreja não informada"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mt-4">
            <div className="text-xs md:text-sm text-muted-foreground">
              Mostrando{" "}
              {Math.min((pageIndex + 1) * pageSize, singleLeaderShifts.length)}{" "}
              de {singleLeaderShifts.length} turnos com apenas um líder
            </div>
            <div className="flex items-center space-x-2">
              <UI.Button
                variant="outline"
                size="sm"
                onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
                disabled={pageIndex === 0}
              >
                Anterior
              </UI.Button>
              <UI.Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPageIndex((prev) =>
                    Math.min(prev + 1, table.getPageCount() - 1)
                  )
                }
                disabled={pageIndex >= table.getPageCount() - 1}
              >
                Próximo
              </UI.Button>
            </div>
          </div>
        </div>

        <UI.DialogFooter className="flex-col sm:flex-row gap-2">
          <UI.Button
            variant="outline"
            onClick={() => setShowSingleLeaderShifts(false)}
            className="w-full sm:w-auto"
          >
            Fechar
          </UI.Button>
          <UI.Button
            onClick={exportSingleLeaderShiftsToCSV}
            className="w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar Lista (CSV)
          </UI.Button>
        </UI.DialogFooter>
      </UI.DialogContent>
    </UI.Dialog>
  );
}
