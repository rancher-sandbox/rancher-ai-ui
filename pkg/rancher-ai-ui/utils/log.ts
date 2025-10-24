export function warn(msg: string, ...args: any[]) {
  console.warn(`[AI Assistant] ${ msg }`, ...args); // eslint-disable-line no-console
}
