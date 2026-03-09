"use client";

import { useClients } from "@/hooks/use-clients";
import { ApprovalQueue } from "@/components/clients/approval-queue";
import { ClientTable } from "@/components/clients/client-table";

export default function ClientiPage() {
  const { clients, loading, updateStatus } = useClients();

  const pending = clients.filter((c) => c.status === "pending");
  const nonPending = clients.filter((c) => c.status !== "pending");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Caricamento…
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Clienti</h1>

      <ApprovalQueue
        pending={pending}
        onApprove={(id) => updateStatus(id, "approved")}
        onReject={(id) => updateStatus(id, "rejected")}
      />

      <ClientTable clients={nonPending} />
    </div>
  );
}
