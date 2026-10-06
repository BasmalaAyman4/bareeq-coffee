import { config, supabase } from '@/lib/supabase';
export async function uploadMenuImage(file: File): Promise<{ url: string }> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error('UNAUTHENTICATED');
  const response = await fetch(config.url + '/functions/v1/bareeq-api', {
    method: 'POST',
    signal: AbortSignal.timeout(45000),
    headers: {
      apikey: config.key,
      Authorization: 'Bearer ' + session.access_token,
      'Content-Type': file.type,
      'x-bareeq-upload': 'menu-image',
    },
    body: file,
  });
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.error ?? 'Unable to upload the product image.');
  return result;
}
