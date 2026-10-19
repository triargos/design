import { UploadIcon } from 'lucide-react';
import { useState } from 'react';

import { FileDropZone } from '~/components/ui/file-drop-zone';

/** Drop files on it or click to pick them. */
export function FileDropZoneDefault() {
  const [files, setFiles] = useState<ReadonlyArray<string>>([]);
  return (
    <div className='flex w-full max-w-md flex-col gap-2'>
      <FileDropZone onFiles={(next) => setFiles(next.map((file) => file.name))} aria-label='Dateien auswählen'>
        <span className='flex size-9 items-center justify-center rounded-full bg-card shadow-raised'>
          <UploadIcon className='size-4 text-muted-foreground' />
        </span>
        <div>
          <p className='text-body text-foreground'>Dateien hierher ziehen oder auswählen</p>
          <p className='text-caption text-muted-foreground'>Bis 10 MB, höchstens 6 Dateien</p>
        </div>
      </FileDropZone>
      {files.length > 0 && <p className='text-caption text-muted-foreground'>{files.join(', ')}</p>}
    </div>
  );
}
