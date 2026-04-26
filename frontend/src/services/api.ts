import { UserProfile, Bot, IngestionBatch, DataSource, SourceType } from "../types";
import { supabase } from "@/lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// Payload emitted by the /ingestion/batch/{id}/ws WebSocket endpoint every 1.5s
export interface IngestionSourceStatus {
  id: string;
  title: string;
  type: string;
  status: "pending" | "processing" | "completed" | "failed";
  error_message?: string | null;
}

export interface IngestionUpdate {
  status: "pending" | "processing" | "completed" | "failed";
  total_files: number;
  processed_files: number;
  error_log: Array<{ source_id?: string; title?: string; error?: string; note?: string }>;
  sources: IngestionSourceStatus[];
  error?: string; // WebSocket-level error
}

class ApiService {
  private async request<T>(
    endpoint: string,
    method: HttpMethod = "GET",
    body?: any,
    isFormData: boolean = false
  ): Promise<T> {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    const headers: HeadersInit = {};
    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (body) {
      config.body = isFormData ? body : JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `API Request failed: ${response.statusText}`);
    }

    return response.json();
  }

  getWsUrl(): string {
    return API_URL.replace(/^http/, 'ws');
  }

  // Auth
  async getCurrentUser(): Promise<UserProfile> {
    return this.request<UserProfile>("/auth/me");
  }

  // Users
  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return this.request<UserProfile>("/users/me", "PUT", data);
  }

  async uploadAvatar(file: File): Promise<UserProfile> {
    const formData = new FormData();
    formData.append("file", file);
    return this.request<UserProfile>("/users/me/avatar", "POST", formData, true);
  }

  // Bots
  async getBots(): Promise<Bot[]> {
    return this.request<Bot[]>("/bots/");
  }

  async createBot(data: Partial<Bot>): Promise<Bot> {
    return this.request<Bot>("/bots/", "POST", data);
  }

  async uploadBotAvatar(botId: string, file: File): Promise<Bot> {
    const formData = new FormData();
    formData.append("file", file);
    return this.request<Bot>(`/bots/${botId}/avatar`, "POST", formData, true);
  }

  async updateBot(botId: string, data: Partial<Bot>): Promise<Bot> {
    return this.request<Bot>(`/bots/${botId}`, "PUT", data);
  }

  async getExploreBots(): Promise<Bot[]> {
    return this.request<Bot[]>("/bots/explore");
  }

  async getBot(botId: string): Promise<Bot> {
    return this.request<Bot>(`/bots/${botId}`);
  }

  // Ingestion
  async createIngestionBatch(
    botId: string,
    sources: Array<{ type: SourceType; title: string; content?: string; url?: string }>,
    files?: File[]
  ): Promise<IngestionBatch> {
    const formData = new FormData();
    
    // Add the JSON metadata as a string (if  backend supports it)
    // Actually our backend expects BatchIngestionRequest as JSON Body usually.
    // However, we updated it to handle files. Let's send it as multipart.
    
    formData.append("request", JSON.stringify({ sources }));
    
    if (files) {
      files.forEach((file) => {
        formData.append("files", file);
      });
    }

    return this.request<IngestionBatch>(`/ingestion/${botId}/batch`, "POST", formData, true);
  }

  async getBatchStatus(batchId: string): Promise<IngestionBatch> {
    return this.request<IngestionBatch>(`/ingestion/batch/${batchId}`);
  }

  /**
   * Opens a WebSocket connection to the ingestion progress stream.
   *
   * - Emits IngestionUpdate payloads every ~1.5s as the backend worker processes files.
   * - Passes the Supabase JWT as `?token=` so backend RLS reads are authenticated.
   * - Auto-reconnects once (after 2s) if the connection drops unexpectedly.
   *
   * @returns A cleanup function — call it to close the socket and cancel reconnect.
   */
  connectIngestionWebSocket(
    batchId: string,
    onUpdate: (data: IngestionUpdate) => void,
    onDone: (data: IngestionUpdate) => void,
    onError: (err: string) => void
  ): () => void {
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let isClosed = false;
    let didReconnect = false;

    const connect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      // Convert http(s) → ws(s)
      const wsBase = API_URL.replace(/^http/, "ws");
      const url = `${wsBase}/ingestion/batch/${batchId}/ws${token ? `?token=${encodeURIComponent(token)}` : ""}`;

      ws = new WebSocket(url);

      ws.onopen = () => {
        didReconnect = false; // reset on successful connect
      };

      ws.onmessage = (event) => {
        if (isClosed) return;
        try {
          const data = JSON.parse(event.data) as IngestionUpdate;

          if (data.error) {
            onError(data.error);
            return;
          }

          onUpdate(data);

          if (data.status === "completed" || data.status === "failed") {
            onDone(data);
          }
        } catch {
          console.warn("[WS] Failed to parse ingestion update:", event.data);
        }
      };

      ws.onerror = () => {
        onError("WebSocket connection error — retrying...");
      };

      ws.onclose = () => {
        if (!isClosed && !didReconnect) {
          // Attempt one auto-reconnect after 2 seconds
          didReconnect = true;
          reconnectTimer = setTimeout(connect, 2000);
        }
      };
    };

    connect();

    // Return a cleanup function the component should call on unmount
    return () => {
      isClosed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
    };
  }

  async getBotDataSources(botId: string): Promise<DataSource[]> {
    return this.request<DataSource[]>(`/ingestion/${botId}/sources`);
  }

  async deleteDataSource(sourceId: string): Promise<{status: string, message: string}> {
    return this.request<{status: string, message: string}>(`/ingestion/source/${sourceId}`, "DELETE");
  }

  async deleteDataSourcesBulk(sourceIds: string[]): Promise<{status: string, message: string}> {
    return this.request<{status: string, message: string}>("/ingestion/sources/bulk", "DELETE", sourceIds);
  }

  async getChatHistory(botId: string): Promise<{ bot_id: string; history: Array<{ role: "user" | "assistant"; content: string }> }> {
    return this.request<{ bot_id: string; history: Array<{ role: "user" | "assistant"; content: string }> }>(`/chat/${botId}/history`);
  }

  async clearChatHistory(botId: string): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>(`/chat/${botId}/history`, "DELETE");
  }

  // Chat (SSE Streaming)
  async chatWithBot(
    botId: string,
    message: string,
    onToken: (token: string) => void,
    onDone: () => void,
    onError: (err: string) => void
  ): Promise<void> {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const response = await fetch(`${API_URL}/chat/${botId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      onError(err.detail || "Chat request failed");
      return;
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) { onError("No stream"); return; }

    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Accumulate and decode chunk
        buffer += decoder.decode(value, { stream: true });
        
        // Find all complete SSE messages separated by "\n\n"
        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          const completePart = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2); // Reset for next search
          
          // Process individual lines within the split part
          const lines = completePart.split("\n");
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith("data: ")) {
              const payload = trimmedLine.slice(6).trim();
              
              if (payload === "[DONE]") {
                onDone();
                return;
              }

              try {
                const parsed = JSON.parse(payload);
                if (parsed.token) onToken(parsed.token);
                if (parsed.error) onError(parsed.error);
              } catch (e) {
                console.warn("Retrying partial JSON payload:", payload);
                // If it fails to parse, we put it back in the buffer just in case
                // but usually "\n\n" implies a complete JSON block in our backend.
              }
            }
          }
          
          boundary = buffer.indexOf("\n\n");
        }
      }
    } catch (e: any) {
        onError(`Streaming read error: ${e.message}`);
    } finally {
        onDone();
    }
  }
}

export const api = new ApiService();
export default api;
