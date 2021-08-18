import { Hooks } from "./hooks.ts";

/**
 * Defines an array of partial hooks.
 */
export type ChainArgs<T> = Partial<Hooks<T>>[];

/**
 * Combines an array of hooks by feeding the result of a hook
 * as input to the next hook.
 *
 * @param args is a array of partial hooks.
 * @returns the combined partial hook.
 */
export function chain<T>(...args: ChainArgs<T>): Partial<Hooks<T>> {
  const result: Partial<Hooks<T>> = {};
  for (const hooks of args) {
    for (const key in hooks) {
      const hook = hooks[key];
      const prev = result[key];
      if (prev === undefined) {
        result[key] = hook;
      } else if (hook !== undefined) {
        result[key] = (value, self) => hook(prev(value, self), self);
      }
    }
  }
  return result;
}
