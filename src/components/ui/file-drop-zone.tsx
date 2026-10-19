import { type VariantProps, cva } from 'class-variance-authority';
import { type ReactNode, useCallback, useRef, useState } from 'react';

import { inputSurfaceVariants } from '~/components/ui/input';

import { cn } from '~/lib/utils';

// A field surface you drop files on. Disabled and invalid come from the hidden input (`within` scope).
// The compact row trades the fill for a dashed outline: filled, it would read as a text field.
const fileDropZoneVariants = cva(
  [
    inputSurfaceVariants({ scope: 'within' }),
    'flex cursor-pointer items-center has-disabled:cursor-not-allowed',
    'data-dragging:border-ring data-dragging:bg-background data-dragging:ring-3 data-dragging:ring-ring/24',
  ],
  {
    variants: {
      size: {
        default: 'flex-col justify-center gap-3 px-6 py-7 text-center',
        compact:
          'min-h-10 justify-center gap-2 border border-dashed border-border bg-transparent px-3.5 py-2 text-body font-medium text-primary shadow-none hover:bg-field has-disabled:border-transparent has-disabled:hover:bg-disabled has-aria-invalid:border-destructive-border',
      },
    },
    defaultVariants: { size: 'default' },
  },
);

interface FileDropZoneProps extends VariantProps<typeof fileDropZoneVariants> {
  onFiles: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  children: ReactNode;
  'aria-label'?: string;
  'aria-invalid'?: boolean;
}

function FileDropZone({
  onFiles,
  accept,
  multiple = true,
  disabled = false,
  size,
  className,
  children,
  'aria-label': ariaLabel,
  'aria-invalid': ariaInvalid,
}: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const emit = useCallback(
    (fileList: FileList | null) => {
      const files = Array.from(fileList ?? []);
      if (files.length > 0) onFiles(files);
    },
    [onFiles],
  );

  return (
    <div
      role='button'
      data-slot='file-drop-zone'
      onClick={() => !disabled && inputRef.current?.click()}
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (!disabled) emit(e.dataTransfer.files);
      }}
      data-dragging={isDragging || undefined}
      className={cn(fileDropZoneVariants({ size }), className)}>
      <input
        ref={inputRef}
        type='file'
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        aria-invalid={ariaInvalid || undefined}
        onChange={(e) => {
          emit(e.target.files);
          e.target.value = ''; // allow re-selecting the same file
        }}
        className='sr-only'
        aria-label={ariaLabel}
      />
      {children}
    </div>
  );
}

export { FileDropZone, fileDropZoneVariants };
