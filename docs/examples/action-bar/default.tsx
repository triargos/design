import { IconDownload, IconTrash, IconX } from '@tabler/icons-react';
import { useRef, useState } from 'react';

import { ActionBar } from '~/components/ui/action-bar';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Checkbox } from '~/components/ui/checkbox';
import { Item, ItemContent, ItemDescription, ItemList, ItemMedia, ItemTitle } from '~/components/ui/item';
import { Separator } from '~/components/ui/separator';

const FILES = [
  { id: 'brief', name: 'Project brief.pdf', meta: '2.4 MB · Jordan Lee' },
  { id: 'pricing', name: 'Pricing table.xlsx', meta: '86 KB · Sam Rivera' },
  { id: 'logo', name: 'Logo final.svg', meta: '12 KB · Priya Patel' },
] as const;

/**
 * Select rows, and the bar rises under the list: the count and a ghost ✕ to clear, a hairline, then the actions.
 * Keep it mounted so it animates out; it keeps the last count on the way out instead of reading "0 selected".
 */
export function ActionBarDefault() {
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set(['brief']));
  const lastCount = useRef(selected.size);
  if (selected.size > 0) lastCount.current = selected.size;
  const toggle = (id: string, checked: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  return (
    <div className='flex w-full max-w-xl flex-col gap-group'>
      <Card>
        <CardHeader>
          <CardTitle>Files</CardTitle>
        </CardHeader>
        <CardContent>
          <ItemList>
            {FILES.map((file) => (
              <Item key={file.id} selected={selected.has(file.id)}>
                <ItemMedia>
                  <Checkbox
                    aria-label={`Select ${file.name}`}
                    checked={selected.has(file.id)}
                    onCheckedChange={(checked) => toggle(file.id, checked)}
                  />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{file.name}</ItemTitle>
                  <ItemDescription>{file.meta}</ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </ItemList>
        </CardContent>
      </Card>
      <ActionBar open={selected.size > 0} aria-label='Selection'>
        <span className='ps-2.5 whitespace-nowrap text-muted-foreground tabular-nums'>
          {lastCount.current} selected
        </span>
        <Button emphasis='ghost' size='icon' aria-label='Clear selection' onClick={() => setSelected(new Set())}>
          <IconX />
        </Button>
        <Separator orientation='vertical' className='my-1.5' />
        <Button>
          <IconDownload data-icon='inline-start' />
          Download
        </Button>
        <Button intent='destructive' emphasis='subtle'>
          <IconTrash data-icon='inline-start' />
          Delete…
        </Button>
      </ActionBar>
    </div>
  );
}
