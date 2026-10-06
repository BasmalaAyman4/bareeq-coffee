import { useMenu } from '@/features/catalog/hooks/use-menu';
import { uploadMenuImage } from '@/features/catalog/services/upload-menu-image';
import { api } from '@/services/api';
import { type Product } from '@/types/catalog';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';

export function useMenuEditor() {
  const menu = useMenu(),
    client = useQueryClient();
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [edit, setEdit] = useState<any>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [uploading, setUploading] = useState(false),
    [imageFile, setImageFile] = useState<File | null>(null),
    [search, setSearch] = useState(''),
    [page, setPage] = useState(1);
  const pageSize = 8;
  const products = menu.data?.products ?? [];
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return products;
    return products.filter((product) =>
      [product.name, product.category, product.slug]
        .filter(Boolean)
        .some((value) => String(value).toLocaleLowerCase().includes(query)),
    );
  }, [products, search]);
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  useEffect(() => setPage(1), [search]);
  useEffect(
    () => setPage((value) => Math.min(value, totalPages)),
    [totalPages],
  );
  const blankProduct = () => ({
    id: crypto.randomUUID(),
    slug: '',
    name: '',
    name_ar: '',
    category_id: menu.data?.categories[0]?.id ?? '',
    description: '',
    description_ar: '',
    price_minor: 0,
    available: true,
    active: true,
    image: '',
    illustrative: false,
  });
  const editProduct = (product: Product) => {
    setImageFile(null);
    setEdit(
      Object.fromEntries(
        [
          'id',
          'slug',
          'name',
          'name_ar',
          'category_id',
          'description',
          'description_ar',
          'price_minor',
          'available',
          'active',
          'image',
          'illustrative',
        ].map((key) => [key, product[key as keyof Product]]),
      ),
    );
  };
  async function save(record: any) {
    if (busy || uploading || imageFile) return;
    setBusy(true);
    setError('');
    try {
      await api('menu_save', { entity: 'products', record });
      await client.invalidateQueries({ queryKey: ['menu'] });
      setImageFile(null);
      setEdit(null);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  async function deleteProduct() {
    if (!deleting || busy) return;
    setBusy(true);
    setError('');
    try {
      await api('menu_delete', { id: deleting.id });
      await client.invalidateQueries({ queryKey: ['menu'] });
      setDeleting(null);
    } catch {
      setError('Could not delete this product. Please try again.');
    } finally {
      setBusy(false);
    }
  }
  async function uploadImage(file: File | null) {
    if (!file) return;
    setImageFile(file);
    setUploading(true);
    setError('');
    try {
      const uploaded = await uploadMenuImage(file);
      setEdit((current: any) => ({ ...current, image: uploaded.url }));
      setImageFile(null);
    } catch (e) {
      const message = e instanceof Error ? e.message : '';
      setError(
        message === 'INVALID_FILE_SIZE'
          ? 'Choose an image up to 2 MB.'
          : message === 'INVALID_FILE_TYPE'
            ? 'Choose a JPG, PNG, or WebP image.'
            : message === 'UNAUTHENTICATED'
              ? 'Your session has expired. Sign in again to upload this image.'
              : 'The image could not be uploaded. Check your connection and choose the image again to retry.',
      );
    } finally {
      setUploading(false);
    }
  }

  return {
    menu,
    client,
    deleting,
    setDeleting,
    edit,
    setEdit,
    error,
    setError,
    busy,
    setBusy,
    uploading,
    setUploading,
    imageFile,
    setImageFile,
    search,
    setSearch,
    page,
    setPage,
    pageSize,
    products,
    filteredProducts,
    totalPages,
    currentPage,
    pageProducts,
    blankProduct,
    editProduct,
    save,
    deleteProduct,
    uploadImage,
  };
}
export type Controller = ReturnType<typeof useMenuEditor>;
