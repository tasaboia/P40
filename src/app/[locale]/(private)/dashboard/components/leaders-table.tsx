import React, { useMemo, useState, useEffect } from "react";
import { useDashboard } from "@p40/common/context/dashboard-context";
import { updateUserServiceAreas } from "@p40/services/user/update-service-areas";
import { DashboardService } from "@p40/services/dashboard/dashboard.service";
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
  Avatar,
  AvatarImage,
  AvatarFallback,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@p40/components/ui";
import { Building, Filter, Search, Pencil } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { Helpers } from "@p40/common/utils/helpers";
import { toast } from "@p40/hooks/use-toast";

interface ServiceArea {
  id: string;
  name: string;
}

interface ServiceAreaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leader: {
    id: string;
    serviceAreas: {
      id: string;
      serviceArea: ServiceArea;
    }[];
  };
  onSave: (leaderId: string, selectedAreas: string[]) => void;
}

interface ShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shifts: {
    prayerTurn: {
      id: string;
      startTime: string;
      endTime: string;
      weekday: number;
      type: string;
    };
  }[];
}

function ServiceAreaDialog({ open, onOpenChange, leader, onSave }: ServiceAreaDialogProps) {
  const [selectedAreas, setSelectedAreas] = useState<string[]>(
    leader?.serviceAreas?.map((sa) => sa.serviceArea.id) || []
  );
  const [allServiceAreas, setAllServiceAreas] = useState<ServiceArea[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadServiceAreas = async () => {
      setLoading(true);
      try {
        const dashboardService = new DashboardService();
        const areas = await dashboardService.getAllServiceAreas();
        setAllServiceAreas(areas);
      } catch (error) {
        console.error("Erro ao carregar áreas de serviço:", error);
        toast({
          description:"Erro ao carregar áreas de serviço",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      loadServiceAreas();
    }
  }, [open]);

  const handleSave = () => {
    onSave(leader.id, selectedAreas);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Áreas de Serviço</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="text-sm font-semibold">Áreas Disponíveis</div>
          {loading ? (
            <div className="text-sm text-muted-foreground">Carregando áreas...</div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {allServiceAreas.map((area) => (
                <div key={area.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedAreas.includes(area.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedAreas([...selectedAreas, area.id]);
                      } else {
                        setSelectedAreas(selectedAreas.filter(id => id !== area.id));
                      }
                    }}
                  />
                  <span className="text-sm">{area.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ShiftDialog({ open, onOpenChange, shifts }: ShiftDialogProps) {
  console.log('Shifts recebidos:', shifts);

  if (!shifts || shifts.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Turnos do Líder</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-muted-foreground">Nenhum turno cadastrado</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const getWeekdayName = (weekday: number) => {
    const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return weekdays[weekday] || 'Dia inválido';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Turnos do Líder</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            {shifts.map((shift) => (
              <div 
                key={`shift-${shift.prayerTurn.id}`} 
                className="flex items-center justify-between p-3 border rounded-md"
              >
                <div className="space-y-1">
                  <div className="font-medium capitalize">
                    {getWeekdayName(shift.prayerTurn.weekday)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {shift.prayerTurn.startTime} - {shift.prayerTurn.endTime}
                  </div>
                </div>
                <Badge variant="secondary">
                  {shift.prayerTurn.type === 'SHIFT' ? 'Turno' : 'Oração'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function LeadersTable() {
  const { leaders } = useDashboard();
  const [search, setSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedChurches, setSelectedChurches] = useState<string[]>([]);
  const [selectedServiceAreas, setSelectedServiceAreas] = useState<string[]>([]);
  const [onlyWithShifts, setOnlyWithShifts] = useState(false);
  const [editingLeader, setEditingLeader] = useState<any>(null);
  const [shiftsDialogOpen, setShiftsDialogOpen] = useState(false);
  const [selectedShifts, setSelectedShifts] = useState<any[]>([]);
  const pageSize = 10;

  const churchNames = Array.from(
    new Set(leaders.map((l) => l.church?.name).filter(Boolean))
  );

  const serviceAreas = Array.from(
    new Set(
      leaders.flatMap((l) => 
        l.serviceAreas?.map((sa) => sa.serviceArea.name) || []
      )
    )
  );

  const toggleChurchFilter = (churchName: string) => {
    setSelectedChurches((prev) =>
      prev.includes(churchName)
        ? prev.filter((c) => c !== churchName)
        : [...prev, churchName]
    );
  };

  const toggleServiceAreaFilter = (areaName: string) => {
    setSelectedServiceAreas((prev) =>
      prev.includes(areaName)
        ? prev.filter((a) => a !== areaName)
        : [...prev, areaName]
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

      const matchServiceAreas =
        selectedServiceAreas.length === 0 ||
        selectedServiceAreas.some(areaName =>
          leader.serviceAreas?.some(sa => sa.serviceArea.name === areaName)
        );

      const matchShifts = !onlyWithShifts || leader.userShifts.length > 0;

      return matchSearch && matchChurch && matchServiceAreas && matchShifts;
    });
  }, [leaders, search, selectedChurches, selectedServiceAreas, onlyWithShifts]);

  const handleSaveServiceAreas = async (leaderId: string, selectedAreas: string[]) => {
    try {
      await updateUserServiceAreas(leaderId, selectedAreas);
     
      toast({
        title: "Atualizado com sucesso",
        variant: "success",
      });
      // TODO: Atualizar a lista de líderes após a alteração
    } catch (error) {
      toast({
        title: "Erro ao atualizar áreas de serviço",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        header: "Nome",
        accessorKey: "name",
        cell: ({ row }) => (
          <div className="flex gap-2 items-center">
            <Avatar className="h-8 w-8 rounded-full">
              <AvatarImage src={row.original?.imageUrl} />
              <AvatarFallback className="rounded-full">
                {Helpers.getInitials(row.original.name || "")}
              </AvatarFallback>
            </Avatar>
            <div className="font-medium capitalize">
              {row.original.name.toLowerCase()}
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
        header: "Áreas de Serviço",
        accessorKey: "serviceAreas",
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.serviceAreas?.map((sa: any) => (
              <Badge key={sa.id} variant="secondary">
                {sa.serviceArea.name}
              </Badge>
            )) || "-"}
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
        cell: ({ row }) => {
          const shifts = row.original.userShifts || [];
          console.log('Turnos da linha:', shifts); // Para debug
          return (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedShifts(shifts);
                setShiftsDialogOpen(true);
              }}
            >
              <Badge>{shifts.length}</Badge>
            </Button>
          );
        },
      },
      {
        header: "Ações",
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditingLeader(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: filteredLeaders,
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
    <>
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
              Mostrando {table.getRowModel().rows.length} de{" "}
              {filteredLeaders.length} líderes
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
                  <div className="text-sm font-semibold mb-2">Áreas de Serviço</div>
                  {serviceAreas.map((name) => (
                    <div key={name} className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedServiceAreas.includes(name)}
                        onCheckedChange={() => toggleServiceAreaFilter(name)}
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
      {editingLeader && (
        <ServiceAreaDialog
          open={!!editingLeader}
          onOpenChange={(open) => !open && setEditingLeader(null)}
          leader={editingLeader}
          onSave={handleSaveServiceAreas}
        />
      )}
      <ShiftDialog
        open={shiftsDialogOpen}
        onOpenChange={setShiftsDialogOpen}
        shifts={selectedShifts}
      />
    </>
  );
}
