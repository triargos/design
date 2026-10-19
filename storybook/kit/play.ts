import type { StoryObj } from '@storybook/react-vite';
import { screen } from 'storybook/test';

type Play = NonNullable<StoryObj['play']>;

type Role = 'button' | 'menuitem' | 'menuitemcheckbox' | 'combobox' | 'tab';

/**
 * `play` for an overlay example: hovers or clicks the button named `trigger`, then waits until `shows` is in the
 * document (portaled popups included), so `pnpm shot` captures it open.
 */
export const open =
  (action: 'click' | 'hover', trigger: string | RegExp, shows: string | RegExp, role: Role = 'button'): Play =>
  async ({ canvas, userEvent }) => {
    const button = canvas.getByRole(role, { name: trigger });
    await (action === 'click' ? userEvent.click(button) : userEvent.hover(button));
    await screen.findAllByText(shows);
  };

/**
 * `play` for an overlay opened from an overlay: each step clicks the element named `click` anywhere in the document,
 * then waits for `shows`.
 */
export const clickThrough =
  (
    ...steps: ReadonlyArray<{ readonly click: string | RegExp; readonly role?: Role; readonly shows: string | RegExp }>
  ): Play =>
  async ({ userEvent }) => {
    for (const step of steps) {
      await userEvent.click(await screen.findByRole(step.role ?? 'button', { name: step.click }));
      await screen.findAllByText(step.shows);
    }
  };

/** `play` for a context menu: right-clicks the element with text `target`, then waits for `shows`. */
export const rightClick =
  (target: string | RegExp, shows: string | RegExp): Play =>
  async ({ canvas, userEvent }) => {
    const element = canvas.getByText(target);
    const box = element.getBoundingClientRect();
    // Where a real right click lands: the menu opens at the pointer.
    const coords = { clientX: box.left + box.width / 2, clientY: box.top + box.height / 2 };
    await userEvent.pointer({ keys: '[MouseRight]', target: element, coords });
    await screen.findAllByText(shows);
  };
