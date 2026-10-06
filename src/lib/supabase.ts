import { createClient } from '@supabase/supabase-js';

declare const __PUBLIC_CONFIG__: { url: string; key: string; vapid: string };
export const config = __PUBLIC_CONFIG__;
export const supabase = createClient(config.url, config.key);
