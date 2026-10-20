import { IconUpload } from '@tabler/icons-react';
import { useState } from 'react';

import { FileDropZone } from '~/components/ui/file-drop-zone';

/** Drop files on it or click to pick them. */
export function FileDropZoneDefault() {
  const [files, setFiles] = useState<ReadonlyArray<string>>([]);
  return (
    <div className='flex w-full max-w-md flex-col gap-2'>
      <FileDropZone onFiles={(next) => setFiles(next.map((file) => file.name))} aria-label='Choose files'>
        <span className='flex size-9 items-center justify-center rounded-full bg-card shadow-raised'>
          <IconUpload className='size-4 text-muted-foreground' />
        </span>
        <div>
          <p className='text-body text-foreground'>Drop files here or choose them</p>
          <p className='text-caption text-muted-foreground'>PDF or images, up to 10 MB each</p>
        </div>
      </FileDropZone>
      {files.length > 0 && <p className='text-caption text-muted-foreground'>{files.join(', ')}</p>}
    </div>
  );
}
