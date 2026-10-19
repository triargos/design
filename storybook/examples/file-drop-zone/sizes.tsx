import { PaperclipIcon } from 'lucide-react';

import { FileDropZone } from '~/components/ui/file-drop-zone';

/** `compact` trades the fill for a dashed outline, so it does not read as a text field. */
export function FileDropZoneSizes() {
  return (
    <FileDropZone size='compact' onFiles={() => undefined} aria-label='Datei anhängen' className='w-64'>
      <PaperclipIcon className='size-4 shrink-0' />
      Datei anhängen
    </FileDropZone>
  );
}
