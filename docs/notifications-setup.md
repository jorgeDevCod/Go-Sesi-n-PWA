# Notificaciones push (PWA)

Las notificaciones del sistema solo se activan en la PWA instalada. En el navegador
la app mantiene alertas visuales y sonidos mientras está abierta.

## Variables de entorno

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY="..."
VAPID_PRIVATE_KEY="..."
VAPID_SUBJECT="mailto:tu-correo@dominio.com"
CRON_SECRET="un-secreto-largo-y-aleatorio"
```

Genera las claves VAPID con:

```bash
npx web-push generate-vapid-keys
```

## Cron gratuito

1. Instala la PWA y activa las notificaciones desde Cuenta.
2. Crea un job en https://cron-job.org.
3. URL: `https://TU_DOMINIO/api/cron/notifications`
4. Intervalo: cada minuto.
5. Header:

```text
Authorization: Bearer TU_CRON_SECRET
```

El endpoint:

- actualiza el tiempo restante de las sesiones activas,
- avisa fin de foco, descanso y ciclos,
- finaliza sesiones vencidas huérfanas,
- envía recordatorios de actividades planificadas con hora.

`cron-job.org` es gratuito y permite intervalos de un minuto. No reintenta fallos;
el endpoint es idempotente y la siguiente ejecución recupera el estado.
