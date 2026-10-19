import { createContext, useContext } from 'react';

/** `undefined` outside a provider (`MainLayout`, stories); `null` inside until the slot mounts. */
export const FloatMenuSlotContext = createContext<HTMLElement | null | undefined>(undefined);

/** The element `BottomFloatMenu` portals into, pinned to the bottom of the content column. */
export const useFloatMenuSlot = () => useContext(FloatMenuSlotContext);

/** The element that scrolls the page content, for virtualizers; `null` outside a provider or before mount. */
export const ScrollElementContext = createContext<HTMLElement | null>(null);

export const useScrollElement = () => useContext(ScrollElementContext);
