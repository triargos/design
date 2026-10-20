import { Prose } from '~/components/ui/prose';

/** `text-muted-foreground` for secondary copy, such as a changelog entry; headings stay `foreground`. */
export function ProseSecondary() {
  return (
    <Prose className='max-w-md text-muted-foreground'>
      <h2>Version 2.4</h2>
      <p>Task lists load faster in large projects, and comments keep their formatting when you paste them.</p>
      <ul>
        <li>Fixed: members invited by link appear at once.</li>
        <li>Fixed: invoice totals round to the cent.</li>
      </ul>
    </Prose>
  );
}
