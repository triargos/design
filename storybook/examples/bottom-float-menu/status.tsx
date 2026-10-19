import { BottomFloatMenu, BottomFloatMenuItem } from '~/components/ui/bottom-float-menu';

/** A status instead of controls: the saved confirmation after an unsaved-changes save. */
export function BottomFloatMenuStatus() {
  return (
    <BottomFloatMenu show label='Ungespeicherte Änderungen'>
      <BottomFloatMenuItem>
        <span role='status' className='flex h-(--float-control) items-center px-4 font-medium'>
          Gespeichert
        </span>
      </BottomFloatMenuItem>
    </BottomFloatMenu>
  );
}
