import type { Menu as MenuPrimitive } from '@foldkit/ui';

export type Side = 'top' | 'right' | 'bottom' | 'left';
export type Align = 'start' | 'center' | 'end';

export type Placement = NonNullable<MenuPrimitive.AnchorConfig['placement']>;

export const toPlacement = (side: Side, align: Align): Placement => {
  if (align === 'center') {
    return side;
  } else {
    return `${side}-${align}`;
  }
};
