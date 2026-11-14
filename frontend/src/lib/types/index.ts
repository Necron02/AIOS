// API Types — V0.0 scaffold (not implemented)
// Generated or manually maintained to match backend Pydantic schemas

export interface Resource {
  id: string;
  resource_type_id: string;
  name: string;
  description?: string;
  status?: string;
  source_kind: "manual" | "discovered" | "github" | "imported" | "system";
  source_path?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Project extends Resource {
  directory_path: string;
  git_remote_url?: string;
  category_id?: string;
  last_scanned_at?: string;
  notes?: string;
}

export interface Repository extends Resource {
  github_url: string;
  owner: string;
  repo_name: string;
  default_branch?: string;
  readme_text?: string;
  metadata_json?: string;
  last_fetched_at?: string;
}

export interface Skill extends Resource {
  skill_name: string;
  scope: "global" | "project";
  skill_directory: string;
  skill_md_path: string;
  frontmatter_json?: string;
  content_hash: string;
  origin_repo_id?: string;
  last_scanned_at?: string;
}

export interface MCPServer extends Resource {
  scope: "user" | "project" | "local";
  transport: "stdio" | "sse" | "http";
  config_source: string;
  command?: string;
  args_json?: string;
  url?: string;
  env_var_names_json?: string;
  reported_status?: "configured" | "healthy" | "needs_auth" | "failed" | "not_checked";
  last_checked_at?: string;
}

export interface Application extends Resource {
  working_directory: string;
  executable: string;
  args_json?: string;
  app_kind: "web" | "desktop" | "service";
  url?: string;
  health_check_json?: string;
  enabled: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string;
  sort_order: number;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface ResourceLink {
  id: string;
  source_resource_id: string;
  target_resource_id: string;
  relation_type: string;
  created_at: string;
}

export interface ActivityEvent {
  id: string;
  event_type: string;
  resource_id?: string;
  occurred_at: string;
  actor: "user" | "system" | "cli" | "sync";
  summary: string;
  payload_json?: string;
  schema_version: number;
}

export interface HealthResponse {
  status: "ok";
  version: string;
}