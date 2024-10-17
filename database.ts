import { createClient } from "@supabase/supabase-js";

const supabase = createClient(Bun.env.SUPABASE_URL, Bun.env.SUPABASE_KEY);

export { supabase };
