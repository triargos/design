import { type VariantProps, cva } from 'class-variance-authority';
import { type ReactNode, useRef, useState } from 'react';

import { inputSurfaceVariants } from '~/components/ui/input';

import { cn } from '~/lib/utils';

// A field surface you drop files on. Disabled and invalid come from the hidden input (`within` scope). The `sm` row
// trades the fill for a dashed outline: filled, it would read as a text field.
const fileDropZoneVariants = cva(
  [
    inputSurfaceVariants({ scope: 'within' }),
    'flex cursor-pointer items-center has-disabled:cursor-not-allowed',
    'data-dragging:border-ring data-dragging:bg-background data-dragging:ring-3 data-dragging:ring-ring/24',
  ],
  {
    variants: {
      size: {
        // Multi-line: the area radius. The `sm` row stays a single-line control.
        default:
          'flex-col justify-center gap-part px-(--file-drop-zone-pad-x) py-(--file-drop-zone-pad-y) text-center [--field-radius:var(--radius-area)]',
        sm: 'min-h-control-lg justify-center gap-related border-dashed border-border bg-transparent px-(--file-drop-zone-sm-pad-x) py-(--file-drop-zone-sm-pad-y) text-body font-medium text-primary shadow-none hover:bg-field has-disabled:border-transparent has-disabled:hover:bg-disabled has-aria-invalid:border-destructive-border',
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
  className?: string | undefined;
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

  const emit = (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []);
    if (files.length > 0) onFiles(files);
  };

  // No `role='button'`: the hidden file input is the control (focus, keyboard, name); a click anywhere opens it.
  return (
    <div
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
        // Moving onto a child also fires `dragleave` on the zone; only leaving the zone ends the drag.
        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
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
          // Lets the same file be picked again.
          e.target.value = '';
        }}
        className='sr-only'
        aria-label={ariaLabel}
      />
      {children}
    </div>
  );
}

export { FileDropZone };
