import { UserProfile, Bot, IngestionBatch, DataSource, SourceType } from "../types";
import { supabase } from "@/lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

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
    
    // Add the JSON metadata as a string (if your backend supports it)
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

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      const lines = text.split("\n").filter(l => l.startsWith("data: "));
      for (const line of lines) {
        const payload = line.slice(6).trim();
        if (payload === "[DONE]") { onDone(); return; }
        try {
          const parsed = JSON.parse(payload);
          if (parsed.token) onToken(parsed.token);
          if (parsed.error) onError(parsed.error);
        } catch { /* ignore partial chunks */ }
      }
    }
    onDone();
  }
}

export const api = new ApiService();
export default api;
