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
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  Checkbox,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@p40/components/ui";
import { Building, Filter, Search } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";

export default function LeadersTable() {
  const { leaders } = useDashboard();
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedChurches, setSelectedChurches] = useState<string[]>([]);
  const [onlyWithShifts, setOnlyWithShifts] = useState(false);
  const pageSize = 10;

  const churchNames = Array.from(
    new Set(leaders.map((l) => l.church?.name).filter(Boolean))
  );

  const toggleChurchFilter = (churchName: string) => {
    setSelectedChurches((prev) =>
      prev.includes(churchName)
        ? prev.filter((c) => c !== churchName)
        : [...prev, churchName]
    );
  };

  const filteredLeaders = useMemo(() => {
    return leaders.filter((leader) => {
      const lower = search.toLowerCase();
      const matchSearch =
        leader.name.toLowerCase().includes(lower) ||
        leader.email.toLowerCase().includes(lower) ||
        leader.church?.name?.toLowerCase().includes(lower);

      const matchChurch =
        selectedChurches.length === 0 ||
        selectedChurches.includes(leader.church?.name);

      const matchShifts = !onlyWithShifts || leader.userShifts.length > 0;

      return matchSearch && matchChurch && matchShifts;
    });
  }, [leaders, search, selectedChurches, onlyWithShifts]);

  const paginatedLeaders = useMemo(() => {
    return filteredLeaders.slice(
      pageIndex * pageSize,
      pageIndex * pageSize + pageSize
    );
  }, [filteredLeaders, pageIndex]);

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: "Nome",
        accessorKey: "name",
        cell: ({ row }) => (
          <div>
            <div className="font-medium capitalize">
              {row.original.name.toLowerCase()}
            </div>
            <div className="text-xs text-muted-foreground">
              {/* Registrado em {format(row.original.registeredAt, "dd/MM/yyyy")} */}
            </div>
          </div>
        ),
      },
      {
        header: "Igreja",
        accessorKey: "church",
        cell: ({ row }) => (
          <div className="flex items-center">
            <Building className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{row.original.church?.name || "-"}</span>
          </div>
        ),
      },
      {
        header: "Contato",
        accessorKey: "email",
        cell: ({ row }) => (
          <div>
            <div className="text-sm">{row.original.email}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.whatsapp || "Sem WhatsApp"}
            </div>
          </div>
        ),
      },
      {
        header: "Turnos",
        accessorKey: "userShifts",
        cell: ({ row }) => <Badge>{row.original.userShifts.length}</Badge>,
      },
    ],
    []
  );

  const table = useReactTable({
    data: paginatedLeaders,
    columns,
    state: {
      pagination: { pageIndex, pageSize },
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
        <CardTitle>Líderes Inscritos</CardTitle>
        <CardDescription>
          Gerenciamento de líderes e suas atribuições
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome, email ou igreja..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Button variant="outline" onClick={() => setFiltersOpen(true)}>
            <Filter className="h-4 w-4 mr-2" />
            Mais filtros
          </Button>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-left">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {paginatedLeaders.length} de {filteredLeaders.length}{" "}
            líderes
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((prev) => Math.max(prev - 1, 0))}
              disabled={pageIndex === 0}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPageIndex((prev) =>
                  Math.min(
                    prev + 1,
                    Math.ceil(filteredLeaders.length / pageSize) - 1
                  )
                )
              }
              disabled={
                pageIndex >= Math.ceil(filteredLeaders.length / pageSize) - 1
              }
            >
              Próximo
            </Button>
          </div>
        </div>

        {/* Filters as drawer on mobile */}
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetContent side="left" className="w-full max-w-sm">
            <SheetHeader>
              <SheetTitle>Filtrar Líderes</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-4">
              <div>
                <div className="text-sm font-semibold mb-2">Igrejas</div>
                {churchNames.map((name) => (
                  <div key={name} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedChurches.includes(name)}
                      onCheckedChange={() => toggleChurchFilter(name)}
                    />
                    <span className="text-sm">{name}</span>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-sm font-semibold mb-2">Outros</div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={onlyWithShifts}
                    onCheckedChange={(v) => setOnlyWithShifts(!!v)}
                  />
                  <span className="text-sm">Somente com turnos</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setFiltersOpen(false)}
              >
                Fechar filtros
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  );
}
