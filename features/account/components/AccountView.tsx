"use client";

import { useState, useTransition } from "react";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PushSettings } from "@/features/push/components/PushSettings";
import { exportAccountAction } from "@/features/account/actions/export-account.action";
import { deleteAccountAction } from "@/features/account/actions/delete-account.action";

export function AccountView({ userName, email }: { userName: string; email: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function handleExport() {
    setError(null);
    startTransition(async () => {
      const result = await exportAccountAction();
      if (!result.success) {
        setError(result.error);
        return;
      }
      const blob = new Blob([JSON.stringify(result.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "go-sesion-datos.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    });
  }

  function handleDelete() {
    setDeleteError(null);
    setIsDeleting(true);
    startTransition(async () => {
      const result = await deleteAccountAction(password);
      setIsDeleting(false);
      if (!result.success) {
        setDeleteError(result.error);
        return;
      }
      setConfirmOpen(false);
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-surface p-6 text-center">
        <p className="text-lg font-semibold text-foreground">{userName}</p>
        <p className="text-sm text-muted-foreground">{email}</p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-aprender/10 text-accent-aprender">
            <Download className="size-5" />
          </span>
          <div className="flex flex-col gap-1 text-left">
            <p className="font-medium text-foreground">Exportar mis datos</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Descarga tus categorías, actividades, sesiones y planes en formato JSON.
            </p>
          </div>
        </div>
        <Button onClick={handleExport} disabled={isPending} className="w-full">
          {isPending ? "Preparando..." : "Descargar JSON"}
        </Button>
        {error && (
          <p className="text-center text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>

      <PushSettings />

      <div className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-surface p-6 dark:border-red-900">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <Trash2 className="size-5" />
          </span>
          <div className="flex flex-col gap-1 text-left">
            <p className="font-medium text-foreground">Eliminar cuenta</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Borra tu cuenta y todo su contenido para siempre. No hay vuelta atrás.
            </p>
          </div>
        </div>
        <Button
          variant="danger"
          onClick={() => {
            setPassword("");
            setDeleteError(null);
            setConfirmOpen(true);
          }}
          className="w-full"
        >
          Eliminar mi cuenta
        </Button>
      </div>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Eliminar cuenta"
        message="Se borrarán tus categorías, actividades, sesiones y planes. Escribe tu contraseña para confirmar."
        confirmLabel="Sí, eliminar todo"
        variant="danger"
        requirePassword
        password={password}
        onPasswordChange={setPassword}
        onConfirm={handleDelete}
        isPending={isDeleting}
        error={deleteError}
      />
    </div>
  );
}
