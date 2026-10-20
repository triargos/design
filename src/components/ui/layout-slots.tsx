import { createContext, useContext } from 'react';

/** `undefined` outside a provider; `null` inside until the slot mounts. */
export const FloatMenuSlotContext = createContext<HTMLElement | null | undefined>(undefined);

/** The element `BottomFloatMenu` portals into, pinned to the bottom of the page column by the app frame. */
export const useFloatMenuSlot = () => useContext(FloatMenuSlotContext);

/** The element that scrolls the page content, for virtualizers; `null` outside a provider or before mount. */
export const ScrollElementContext = createContext<HTMLElement | null>(null);

export const useScrollElement = () => useContext(ScrollElementContext);
