import { config, supabase } from '@/lib/supabase';
export async function api<T = any>(
  action: string,
  body: Record<string, unknown> = {},
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const response = await fetch(config.url + '/functions/v1/bareeq-api', {
    method: 'POST',
    signal: AbortSignal.timeout(20000),
    headers: {
      'Content-Type': 'application/json',
      apikey: config.key,
      ...(session ? { Authorization: 'Bearer ' + session.access_token } : {}),
    },
    body: JSON.stringify({ action, ...body }),
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error ?? 'Unable to reach Bareeq. Please retry.');
  return result;
}
