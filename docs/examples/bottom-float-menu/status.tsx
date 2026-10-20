import { BottomFloatMenu, BottomFloatMenuItem } from '~/components/ui/bottom-float-menu';

/** A status instead of controls: the confirmation after saving unsaved changes. */
export function BottomFloatMenuStatus() {
  return (
    <BottomFloatMenu show label='Unsaved changes'>
      <BottomFloatMenuItem>
        <span role='status' className='flex h-(--float-control) items-center px-4 font-medium'>
          Saved
        </span>
      </BottomFloatMenuItem>
    </BottomFloatMenu>
  );
}
