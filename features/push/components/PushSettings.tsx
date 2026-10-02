"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  removePushSubscriptionAction,
  savePushSubscriptionAction,
  sendTestPushAction,
} from "@/features/push/actions/push.actions";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob(base64.replace(/-/g, "+").replace(/_/g, "/") + padding);
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    bytes[i] = raw.charCodeAt(i);
  }
  return bytes;
}

async function currentSubscription(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator)) return null;
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

/**
 * Opt-in de notificaciones push (D2). Sin clave VAPID o sin soporte,
 * muestra nota informativa en vez de romper.
 */
export function PushSettings() {
  const [isPending, startTransition] = useTransition();
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const sub = await currentSubscription();
        setEndpoint(sub?.endpoint ?? null);
      } catch {
        setEndpoint(null);
      }
    })();
  }, []);

  if (!PUBLIC_KEY) {
    return (
      <p className="text-sm text-muted-foreground">
        Notificaciones no configuradas en este entorno.
      </p>
    );
  }

  function handleEnable() {
    setMessage(null);
    setError(null);
    if (!PUBLIC_KEY) {
      setError("Notificaciones no configuradas en este entorno.");
      return;
    }
    const publicKey: string = PUBLIC_KEY;
    startTransition(async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setError("Permiso de notificaciones denegado.");
          return;
        }
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
        const keys = sub.toJSON().keys;
        if (!keys?.p256dh || !keys?.auth) {
          setError("Suscripción inválida del navegador.");
          return;
        }
        const result = await savePushSubscriptionAction({
          endpoint: sub.endpoint,
          keys: { p256dh: keys.p256dh, auth: keys.auth },
        });
        if (!result.success) {
          setError(result.error);
          return;
        }
        setEndpoint(sub.endpoint);
        setMessage("Notificaciones activadas en este dispositivo.");
      } catch {
        setError("No se pudo activar. Inténtalo de nuevo.");
      }
    });
  }

  function handleDisable() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      try {
        const sub = await currentSubscription();
        const existing = sub?.endpoint ?? endpoint;
        if (sub) await sub.unsubscribe();
        if (existing) {
          await removePushSubscriptionAction({ endpoint: existing });
        }
        setEndpoint(null);
        setMessage("Notificaciones desactivadas en este dispositivo.");
      } catch {
        setError("No se pudo desactivar. Inténtalo de nuevo.");
      }
    });
  }

  function handleTest() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      const result = await sendTestPushAction();
      if (!result.success) {
        setError(result.error);
        return;
      }
      const { sent, pruned } = result.summary;
      setMessage(
        sent > 0
          ? `Llegó ${sent === 1 ? "1 notificación" : `${sent} notificaciones`} de prueba.`
          : pruned > 0
            ? "Tus suscripciones vencidas se limpiaron. Vuelve a activarlas."
            : "No llegó a ningún dispositivo. Revisa el permiso.",
      );
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-aprender/10 text-accent-aprender">
          {endpoint ? <Bell className="size-5" /> : <BellOff className="size-5" />}
        </span>
        <div className="flex flex-col gap-1 text-left">
          <p className="font-medium text-foreground">Notificaciones push</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {endpoint
              ? "Activas en este dispositivo. Te avisaremos al terminar tus sesiones."
              : "Actívalas para recibir avisos aunque la app esté en segundo plano."}
          </p>
        </div>
      </div>
      {endpoint ? (
        <div className="flex flex-col gap-2">
          <Button onClick={handleTest} disabled={isPending} className="w-full">
            {isPending ? "Enviando..." : "Probar notificación"}
          </Button>
          <Button variant="ghost" onClick={handleDisable} disabled={isPending} className="w-full">
            Desactivar en este dispositivo
          </Button>
        </div>
      ) : (
        <Button onClick={handleEnable} disabled={isPending} className="w-full">
          {isPending ? "Activando..." : "Activar notificaciones"}
        </Button>
      )}
      {message && (
        <p className="text-center text-sm text-foreground" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="text-center text-sm text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
