import { fireEvent, userEvent } from "storybook/test";

const FIGMA_FILE = "https://www.figma.com/design/h75NBHF13tilnPpqu0pqrj/Project_B";

/** Links a story to its frame in the Project_B Figma file (Design panel). Node ids use "-" (e.g. "8-2037"). */
export const figma = (nodeId: string) => ({ design: { type: "figma" as const, url: `${FIGMA_FILE}?node-id=${nodeId}` } });

/**
 * Sets the value of the input with this id inside the story canvas.
 * Uses fireEvent.input (native value setter + input event) rather than userEvent.type: in this
 * preview React's change tracking misses userEvent's per-key value writes, so the controlled
 * input would reset on the next render.
 */
export async function fill(root: HTMLElement, id: string, value: string) {
  const el = root.querySelector<HTMLInputElement>(`#${id}`);
  if (!el) throw new Error(`No input #${id}`);
  await userEvent.click(el);
  await fireEvent.input(el, { target: { value } });
}

/** Clicks the form's submit button. */
export async function submit(root: HTMLElement) {
  const btn = root.querySelector<HTMLButtonElement>("form button[type=submit]");
  if (!btn) throw new Error("No submit button");
  await userEvent.click(btn);
}

/** Waits until a selector appears (mock auth responds in 0.3–1.2 s). */
export async function waitFor(root: HTMLElement, selector: string, timeout = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const el = root.querySelector(selector);
    if (el) return el;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error(`Timed out waiting for ${selector}`);
}

/** Waits until the element with this id has focus (errors move focus to the first invalid field). */
export async function waitForFocus(root: HTMLElement, id: string, timeout = 2000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (root.ownerDocument.activeElement?.id === id) return;
    await new Promise((r) => setTimeout(r, 50));
  }
  throw new Error(`Focus never reached #${id} (on #${root.ownerDocument.activeElement?.id ?? "nothing"})`);
}

export const STRONG_PASSWORD = "Strong#Pass1";
