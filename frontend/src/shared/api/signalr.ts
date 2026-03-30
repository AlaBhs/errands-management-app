import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  type HubConnection,
} from "@microsoft/signalr";
import type { NotificationDto } from "@/features/notifications/types";

// ── Types ─────────────────────────────────────────────────────────────────────

type NotificationHandler = (notification: NotificationDto) => void;

// ── Module-level singleton ────────────────────────────────────────────────────

let connection: HubConnection | null = null;
const handlers = new Set<NotificationHandler>();

// ── Internal helpers ──────────────────────────────────────────────────────────

function buildConnection(tokenFactory: () => string): HubConnection {
  return new HubConnectionBuilder()
    .withUrl("/hubs/notifications", {
      accessTokenFactory: () => tokenFactory(),
    })
    .withAutomaticReconnect()
    .configureLogging(
      import.meta.env.DEV ? LogLevel.Information : LogLevel.Error,
    )
    .build();
}

function attachHandlers(conn: HubConnection): void {
  conn.on("ReceiveNotification", (notification: NotificationDto) => {
    handlers.forEach((h) => h(notification));
  });

  conn.onreconnected(() => {
    if (import.meta.env.DEV) {
      console.info("[SignalR] Reconnected to notification hub.");
    }
  });

  conn.onclose((err) => {
    if (import.meta.env.DEV) {
      console.warn("[SignalR] Connection closed.", err);
    }
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Connect to the notifications hub.
 * The caller passes a tokenFactory so this module stays decoupled from
 * the auth store — no circular dependency, no require().
 * Safe to call multiple times — skips if already connected or connecting.
 */
async function connect(tokenFactory: () => string): Promise<void> {
  if (
    connection?.state === HubConnectionState.Connected ||
    connection?.state === HubConnectionState.Connecting ||
    connection?.state === HubConnectionState.Reconnecting
  ) {
    return;
  }

  connection = buildConnection(tokenFactory);
  attachHandlers(connection);

  try {
    await connection.start();
    if (import.meta.env.DEV) {
      console.info("[SignalR] Connected to notification hub.");
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error("[SignalR] Failed to connect.", err);
    }
  }
}

/**
 * Disconnect from the hub and discard the connection instance.
 * Called on logout.
 */
async function disconnect(): Promise<void> {
  if (!connection) return;

  try {
    await connection.stop();
  } finally {
    connection = null;
  }
}

/**
 * Reconnect with a fresh token factory — called after a token refresh.
 * Stops the existing connection then starts a new one so the
 * accessTokenFactory picks up the rotated token.
 */
async function reconnect(tokenFactory: () => string): Promise<void> {
  await disconnect();
  await connect(tokenFactory);
}

/**
 * Subscribe to incoming real-time notifications.
 * Returns an unsubscribe function — call it in useEffect cleanup.
 */
function onNotification(handler: NotificationHandler): () => void {
  handlers.add(handler);
  return () => handlers.delete(handler);
}

// ── Exported service object ───────────────────────────────────────────────────

export const signalr = {
  connect,
  disconnect,
  reconnect,
  onNotification,
};