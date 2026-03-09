"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type ColumnFiltersState,
} from "@tanstack/react-table";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Profile, UserStatus } from "@/lib/types";

const STATUS_LABEL: Record<UserStatus, string> = {
  pending: "In attesa",
  approved: "Approvato",
  rejected: "Rifiutato",
};

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "Tutti" },
  { value: "approved", label: "Approvati" },
  { value: "pending", label: "In attesa" },
  { value: "rejected", label: "Rifiutati" },
];

interface ClientTableProps {
  clients: Profile[];
}

export function ClientTable({ clients }: ClientTableProps) {
  const router = useRouter();
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns = useMemo<ColumnDef<Profile>[]>(
    () => [
      {
        accessorFn: (r) => `${r.first_name} ${r.last_name}`,
        id: "name",
        header: "Nome",
        cell: ({ getValue }) => (
          <span className="font-medium text-foreground">
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{(getValue() as string) ?? "—"}</span>
        ),
      },
      {
        accessorKey: "phone",
        header: "Telefono",
        cell: ({ getValue }) => (
          <span className="text-muted-foreground">{(getValue() as string) ?? "—"}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Stato",
        cell: ({ getValue }) => {
          const s = getValue() as UserStatus;
          return (
            <Badge variant={s as any}>
              {STATUS_LABEL[s]}
            </Badge>
          );
        },
        filterFn: (row, _id, value) =>
          value === "" || row.original.status === value,
      },
      {
        accessorKey: "created_at",
        header: "Registrato",
        cell: ({ getValue }) => (
          <span className="text-muted-foreground text-sm">
            {format(new Date(getValue() as string), "d MMM yyyy", {
              locale: it,
            })}
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: clients,
    columns,
    state: { globalFilter, columnFilters },
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  });

  const activeStatus =
    (columnFilters.find((f) => f.id === "status")?.value as string) ?? "";

  function setStatusFilter(value: string) {
    setColumnFilters((prev) => {
      const withoutStatus = prev.filter((f) => f.id !== "status");
      return value === "" ? withoutStatus : [...withoutStatus, { id: "status", value }];
    });
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Cerca per nome, email, telefono…"
            icon={<Search size={15} />}
          />
        </div>
        <div className="flex gap-2 items-center">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                activeStatus === opt.value
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-border">
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  Nessun cliente trovato
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() =>
                    router.push(`/clienti/${row.original.id}`)
                  }
                  className="border-b border-border/50 hover:bg-card cursor-pointer transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {table.getFilteredRowModel().rows.length} clienti
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="text-foreground">
              {table.getState().pagination.pageIndex + 1} /{" "}
              {table.getPageCount()}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
