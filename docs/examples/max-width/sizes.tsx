import { MaxWidth } from '~/components/ui/max-width';

const SIZES = [
  { size: 'sm', label: 'sm · 640px · forms, one record' },
  { size: 'md', label: 'md · 768px · settings, details' },
  { size: 'lg', label: 'lg · 896px · lists, overviews (default)' },
  { size: 'xl', label: 'xl · 1480px · wide tables, editors' },
] as const;

/** Caps the page column and centers it. Pick by content: forms read best narrow, tables need room. */
export function MaxWidthSizes() {
  return (
    <div className='flex w-full flex-col gap-4'>
      {SIZES.map(({ size, label }) => (
        <MaxWidth key={size} size={size}>
          <div className='flex h-10 items-center justify-center rounded-control-lg bg-card text-caption text-muted-foreground shadow-raised'>
            {label}
          </div>
        </MaxWidth>
      ))}
    </div>
  );
}
