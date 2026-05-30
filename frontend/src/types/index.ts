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
  voice_gender?: "male" | "female" | "transgender";
}

export interface Bot {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  persona_config: PersonaConfig;
  status: ProjectStatus;
  avatar_url?: string | null;
  voice_gender?: "male" | "female" | "transgender";
  created_at: string;
  updated_at: string;
  is_free?: boolean;
  is_unlocked?: boolean;
  pricing_tier?: string;
  unlock_price?: number;
  credits_per_pack?: number;
  voice_enabled?: boolean;
  subscription_enabled?: boolean;
  session_count?: number;
  free_explorations_used?: number;
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
