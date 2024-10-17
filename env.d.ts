declare module "bun" {
  interface Env {
    SUPABASE_KEY: string;
    SUPABASE_STORAGE_KEY: string;
    PORT: string;
    BUCKET_ID: string;
    SUPABASE_URL: string;
  }
}
