import { Hooks } from "./hooks.ts";

/**
 * Defines a function that creates new instances with optional hooks.
 *
 * @param hooks are partial hooks that should be installed.
 * @returns a new instance of T.
 */
export type Factory<T> = (hooks?: Partial<Hooks<T>>) => T;

/**
 * Defines a function that maps an instance to a property value.
 *
 * This allows one to inject dependencies into the service.
 *
 * @param self is the instance.
 * @returns is a value for property K.
 */
export type Builder<T, K extends keyof T> = (self: T) => T[K];

/**
 * Defines a record of builders for the properties of T.
 */
export type Builders<T> = {
  [K in keyof T]: Builder<T, K>;
};

/**
 * Create a factory for creating instances of a service graph.
 *
 * @param builders is a record of service builders.
 * @returns a factory based on the builders.
 */
export function inject<T extends Record<PropertyKey, unknown>>(
  builders: Builders<T>,
): Factory<T> {
  // NOTE: This function is curried so that typings work well.
  // Without currying, the partial hooks could not be easily inferred.
  // Factories have to be supplied fully, which gives us type T for free.
  return (hooks = {}) => {
    // NOTE: Since `undefined` or `null` are potential value of T[k],
    // this unknown `empty` object is used as a marker.
    const empty: unknown = {};
    type Target = {
      [k in keyof T]: T[k] | typeof empty;
    };

    // NOTE: Set the keys on the Proxy target.
    // Now only `get` needs to be implemented by the Proxy,
    // while `has` and `ownKeys` will be delegated to `target`.
    const target = {} as Target;
    for (const key in builders) {
      target[key] = empty;
    }

    // NOTE: Casting `Target` to `T` is invalid, but since it's getters
    // are provided by the proxy, it does not matter.
    const proxy = new Proxy(target as T, {
      get: (_, key: keyof T): undefined | T[keyof T] => {
        // Handle non-existent properties.
        const build = builders[key];
        if (build === undefined) return undefined;

        // NOTE: Only invoke the builder once by checking for `empty`.
        if (target[key] === empty) {
          // Get the hook if it exists.
          type Hook = (value: T[keyof T], self: T) => T[keyof T];
          const hook: Hook = hooks[key] || ((x) => x);

          // NOTE: Here, `proxy` is injected into the builder.
          // Cyclic dependencies are not explicitly checked.
          target[key] = hook(build(proxy), proxy);
        }

        // NOTE: Here it can be assumed that `target[key]` is defined.
        return target[key] as T[keyof T];
      },
    });
    return proxy;
  };
}
