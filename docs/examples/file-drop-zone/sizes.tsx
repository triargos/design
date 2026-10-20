import { IconPaperclip } from '@tabler/icons-react';

import { FileDropZone } from '~/components/ui/file-drop-zone';

/** `sm` trades the fill for a dashed outline, so it does not read as a text field. */
export function FileDropZoneSizes() {
  return (
    <FileDropZone size='sm' onFiles={() => undefined} aria-label='Attach a file' className='w-64'>
      <IconPaperclip className='size-4 shrink-0' />
      Attach a file
    </FileDropZone>
  );
}
