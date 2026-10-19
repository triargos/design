import { UploadIcon } from 'lucide-react';

import { FieldError } from '~/components/ui/field';
import { FileDropZone } from '~/components/ui/file-drop-zone';

export function FileDropZoneStates() {
  return (
    <div className='flex w-full max-w-md flex-col gap-4'>
      <div className='flex flex-col gap-2'>
        <FileDropZone onFiles={() => undefined} aria-invalid aria-label='Dateien auswählen'>
          <span className='flex size-9 items-center justify-center rounded-full bg-card shadow-raised'>
            <UploadIcon className='size-4 text-muted-foreground' />
          </span>
          <div>
            <p className='text-body text-foreground'>Dateien hierher ziehen oder auswählen</p>
            <p className='text-caption text-muted-foreground'>Bis 10 MB, höchstens 6 Dateien</p>
          </div>
        </FileDropZone>
        <FieldError>Bitte füge mindestens eine Datei hinzu.</FieldError>
      </div>
      <FileDropZone onFiles={() => undefined} disabled aria-label='Dateien auswählen'>
        <span className='flex size-9 items-center justify-center rounded-full bg-card shadow-raised'>
          <UploadIcon className='size-4 text-muted-foreground' />
        </span>
        <div>
          <p className='text-body text-foreground'>Dateien hierher ziehen oder auswählen</p>
          <p className='text-caption text-muted-foreground'>Bis 10 MB, höchstens 6 Dateien</p>
        </div>
      </FileDropZone>
    </div>
  );
}
