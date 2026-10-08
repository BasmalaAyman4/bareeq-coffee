import { useCopy } from '@/i18n/i18n-provider';
import { cn } from '@/lib/utils';
import { useEffect, useMemo } from 'react';

export type ImageUploadProps = {
  accept?: string;
  disabled?: boolean;
  file?: File | null;
  maxBytes?: number;
  onChange: (file: File | null) => void;
  onInvalid?: (message: string) => void;
  previewUrl?: string;
  title?: string;
  hint?: string;
};
export function ImageUpload({
  accept = 'image/jpeg,image/png,image/webp',
  disabled,
  file,
  maxBytes = 2 * 1024 * 1024,
  onChange,
  onInvalid,
  previewUrl = '',
  title = 'Choose an image or drop it here',
  hint = 'JPG, PNG or WebP',
}: ImageUploadProps) {
  const tr = useCopy();

  const selectedPreview = useMemo(
    () => (file ? URL.createObjectURL(file) : ''),
    [file],
  );
  const preview = selectedPreview || previewUrl;
  useEffect(
    () => () => {
      if (selectedPreview) URL.revokeObjectURL(selectedPreview);
    },
    [selectedPreview],
  );
  const acceptFile = (candidate?: File) => {
    if (disabled || !candidate) return;
    if (candidate.size > maxBytes) {
      onInvalid?.(
        `Choose an image up to ${Math.round(maxBytes / 1024 / 1024)} MB.`,
      );
      return;
    }
    if (!accept.split(',').includes(candidate.type)) {
      onInvalid?.('Choose a JPG, PNG, or WebP image.');
      return;
    }
    onChange(candidate);
  };
  return (
    <label
      className={cn(
        'group relative flex min-h-44 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-bareeq-espresso/30 bg-white/55 p-5 text-center transition hover:border-bareeq-burgundy hover:bg-bareeq-blush/20',
        disabled && 'pointer-events-none cursor-not-allowed opacity-50',
      )}
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        acceptFile(event.dataTransfer.files[0]);
      }}
    >
      <input
        className="sr-only"
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={(event) => {
          acceptFile(event.target.files?.[0]);
          event.target.value = '';
        }}
      />
      {preview ? (
        <img
          className="absolute inset-0 size-full object-cover"
          src={preview}
          alt={tr('Selected upload preview')}
        />
      ) : (
        <span className="flex flex-col items-center gap-1.5 text-bareeq-espresso">
          <strong className="text-base">{tr(title)}</strong>
          <small className="text-xs font-normal text-bareeq-espresso/60">
            {tr(hint)} {tr('· maximum')} {Math.round(maxBytes / 1024 / 1024)}{' '}
            {tr('MB')}
          </small>
          <em className="mt-2 rounded-full border border-bareeq-burgundy/35 px-3 py-1 text-xs not-italic font-bold text-bareeq-burgundy">
            {tr('Browse files')}
          </em>
        </span>
      )}
    </label>
  );
}
