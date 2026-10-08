import { supabase } from '@/lib/supabase';
import type { Branch, Product } from '@/types/catalog';
import { useQuery } from '@tanstack/react-query';
import { catalogArabic } from '@/i18n/catalog-copy';
import { descriptionArabic } from '@/i18n/catalog-descriptions';
export function useMenu() {
  return useQuery({
    queryKey: ['menu'],
    queryFn: async () => {
      const [p, c, v, m, pm, b, availability] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .is('deleted_at', null)
          .order('name'),
        supabase.from('categories').select('*'),
        supabase.from('variants').select('*'),
        supabase.from('modifiers').select('*'),
        supabase.from('product_modifiers').select('*'),
        supabase.from('branches').select('*').eq('active', true),
        supabase.from('branch_availability').select('*'),
      ]);
      for (const r of [p, c, v, m, pm, b, availability])
        if (r.error) throw r.error;
      const products: Product[] = (p.data ?? []).map((x) => ({
        ...x,
        name_ar: x.name_ar?.trim() || catalogArabic[x.name] || '',
        description_ar:
          x.description_ar?.trim() ||
          descriptionArabic[x.description?.replace(/\s+/g, ' ').trim()] ||
          '',
        price: x.price_minor === null ? null : x.price_minor / 100,
        category: c.data!.find((a) => a.id === x.category_id)?.name ?? '',
        category_ar:
          c.data!.find((a) => a.id === x.category_id)?.name_ar ||
          catalogArabic[
            c.data!.find((a) => a.id === x.category_id)?.name ?? ''
          ] ||
          '',
        sourceCategory: '',
        variants: v.data!.filter((a) => a.product_id === x.id),
        modifiers: m.data!.filter((a) =>
          pm.data!.some(
            (link) => link.product_id === x.id && link.modifier_id === a.id,
          ),
        ),
      }));
      return {
        products,
        branches: b.data as Branch[],
        categories: c.data as {
          id: string;
          name: string;
          name_ar?: string | null;
        }[],
        availability: availability.data!,
      };
    },
  });
}
export function useProducts() {
  return (useMenu().data?.products ?? []).filter((p) => p.active);
}
