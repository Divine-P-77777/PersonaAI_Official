export type UserRole = "user" | "alumni";

export type ProjectStatus = "draft" | "training" | "ready" | "failed";

export type IngestionStatus = "pending" | "processing" | "completed" | "failed";

export type SourceType = "pdf" | "image" | "long_text" | "web_link" | "video_link";

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface PersonaConfig {
  greeting?: string;
  tone?: string;
  expertise?: string[];
  experience?: Array<{
    title: string;
    company: string;
    years: number;
  }>;
  education?: Array<{
    degree: string;
    institute: string;
    year: number;
  }>;
  links?: Record<string, string>;
}

export interface Bot {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  persona_config: PersonaConfig;
  status: ProjectStatus;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
  owner?: {
    display_name?: string;
    avatar_url?: string;
  };
}

export interface DataSource {
  id: string;
  bot_id: string;
  batch_id: string | null;
  type: SourceType;
  title: string;
  content: string | null;
  url: string | null;
  status: IngestionStatus;
  created_at: string;
}

export interface IngestionBatch {
  id: string;
  bot_id: string;
  status: IngestionStatus;
  total_files: number;
  processed_files: number;
  error_log: any[];
  created_at: string;
  updated_at: string;
}
