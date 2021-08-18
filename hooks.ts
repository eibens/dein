/**
 * Defines a function that maps the value of a property K and T to a new property value.
 */
export type Hook<T, K extends keyof T> = (value: T[K], self: T) => T[K];

/**
  * Defines a record of hooks for each property of T.
  */
export type Hooks<T> = {
  [K in keyof T]: Hook<T, K>;
};
