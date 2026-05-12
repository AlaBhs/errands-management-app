import { create } from "zustand";
import {
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
  type HubConnection,
} from "@microsoft/signalr";
import type { QueryClient } from "@tanstack/react-query";
import type { RequestMessageDto } from "../types/messaging.types";

// ── Store shape ───────────────────────────────────────────────────────────────

interface MessagingStore {
  connection: HubConnection | null;
  /** Call once at app boot (or lazily on first use). */
  startConnection: (tokenFactory: () => string, queryClient: QueryClient) => Promise<void>;
  joinRequest: (requestId: string) => Promise<void>;
  leaveRequest: (requestId: string) => Promise<void>;
  stopConnection: () => Promise<void>;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useMessagingStore = create<MessagingStore>((set, get) => ({
  connection: null,

  startConnection: async (tokenFactory, queryClient) => {
    const { connection } = get();

    // Guard: only ONE connection, ever.
    if (
      connection?.state === HubConnectionState.Connected ||
      connection?.state === HubConnectionState.Connecting ||
      connection?.state === HubConnectionState.Reconnecting
    ) {
      return;
    }

    const conn = new HubConnectionBuilder()
      .withUrl("/hubs/request-messaging", {
        accessTokenFactory: () => tokenFactory(),
      })
      .withAutomaticReconnect()
      .configureLogging(
        import.meta.env.DEV ? LogLevel.Information : LogLevel.Error,
      )
      .build();
    conn.on("ReceiveRequestMessage", (message: RequestMessageDto) => {
      queryClient.setQueryData<RequestMessageDto[]>(
        ["requestMessages", message.requestId],
        (old = []) => {
          if (old.some((m) => m.id === message.id)) return old;
          return [...old, message].sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );
        },
      );
    });

    conn.onreconnected(() => {
      if (import.meta.env.DEV) {
        console.info("[SignalR:messaging] Reconnected.");
      }
    });

    conn.onclose((err) => {
      if (import.meta.env.DEV) {
        console.warn("[SignalR:messaging] Connection closed.", err);
      }
    });

    try {
      await conn.start();
      set({ connection: conn });
      if (import.meta.env.DEV) {
        console.info("[SignalR:messaging] Connected.");
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("[SignalR:messaging] Failed to connect.", err);
      }
    }
  },

  joinRequest: async (requestId) => {
    const { connection } = get();
    if (connection?.state !== HubConnectionState.Connected) return;
    try {
      await connection.invoke("JoinRequestGroup", requestId);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("[SignalR:messaging] JoinRequestGroup failed.", err);
      }
      throw err; 
    }
  },

  leaveRequest: async (requestId) => {
    const { connection } = get();
    if (connection?.state !== HubConnectionState.Connected) return;
    try {
      await connection.invoke("LeaveRequestGroup", requestId);
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn("[SignalR:messaging] LeaveRequestGroup failed.", err);
      }
    }
  },

  stopConnection: async () => {
    const { connection } = get();
    if (!connection) return;
    try {
      await connection.stop();
    } finally {
      set({ connection: null });
    }
  },
}));