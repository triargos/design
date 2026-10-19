import { MaxWidth } from '~/components/ui/max-width';

const SIZES = [
  { size: 'sm', label: 'sm · 640px · Formulare, ein Datensatz' },
  { size: 'base', label: 'base · 768px · Einstellungen, Details' },
  { size: 'md', label: 'md · 896px · Listen, Übersichten (Standard)' },
  { size: 'lg', label: 'lg · 1480px · breite Tabellen, Formular-Editor' },
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
