"use client";

import { Button } from "@p40/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@p40/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import { useTranslations } from "next-intl";

type TableUser = {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  churchId: string;
};

const NameHeader = () => {
  const t = useTranslations("admin.dashboard.table.columns");
  return <div>{t("name")}</div>;
};

const EmailHeader = () => {
  const t = useTranslations("admin.dashboard.table.columns");
  return <div>{t("whatsapp")}</div>;
};

const ActionsCell = ({ row }: { row: { original: TableUser } }) => {
  const t = useTranslations("admin.dashboard.table.actions");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">{t("label")}</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Pencil className="mr-2 h-4 w-4" />
          {t("manage_schedules")}
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive">
          <Trash className="mr-2 h-4 w-4" />
          {t("allow_leave")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<TableUser>[] = [
  {
    accessorKey: "name",
    header: NameHeader,
  },
  {
    accessorKey: "email",
    header: EmailHeader,
  },
  {
    id: "actions",
    cell: ActionsCell,
  },
];
