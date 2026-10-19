/**
 * Output rules: stdout holds only what to read (paths, findings, JSON, the summary); stderr holds progress and
 * diagnostics. Failures are one message, never a stack (`SHOT_DEBUG=1` shows stacks).
 */

export class ShotError extends Error {}

const debug = process.env['SHOT_DEBUG'] === '1';

export const fail = (message: string): never => {
  throw new ShotError(message);
};

export const progress = (message: string) => {
  process.stderr.write(`${message}\n`);
};

export const print = (line: string) => {
  process.stdout.write(`${line}\n`);
};

/** One line for any error; Playwright's call logs and stacks only with SHOT_DEBUG. */
export const errorMessage = (error: unknown): string => {
  if (error instanceof ShotError) return error.message;
  if (debug && error instanceof Error) return error.stack ?? error.message;
  const message = error instanceof Error ? error.message : String(error);
  return message.split('\n')[0]!.replace(/^\w+\.\w+: /, '');
};
