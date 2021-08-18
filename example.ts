import * as fmt from "https://deno.land/std@0.101.0/fmt/colors.ts";
import { chain, Factory, Hooks, inject } from "./mod.ts";

// # Egg Maker

// In this example, we are building a system that prepares an egg dish.
// Not actually, but it will print the result to the console.

// This is the public interface of the Egg Maker system.
// Note, that this type can usually be inferred by `inject`.
// Defining `EggMaker` explicitly improves readability.
type EggMaker = {
  makeEggs: (style: string) => string;
  takeEggs: () => number;
};

// Let's say, there is a global number of eggs.
let eggs = 3;

// We have a function that takes all the eggs.
function takeEggs(): number {
  const taken = eggs;
  // No eggs left.
  eggs = 0;
  return taken;
}

// For making eggs, one needs access to the eggs.
// We define the `makeEggs` builder with the `takeEggs` dependency.
// Note that the `takeEggs` function above has the same signature.
function makeEggs(deps: {
  takeEggs: () => number;
}) {
  // The user provides the style of eggs that should be made.
  // For example, "fried" or "scrambled" eggs.
  return function (style: string): string {
    // The Egg Maker performs the following steps:

    // 1. It takes eggs from the fridge
    const eggs = deps.takeEggs();

    // 2. It checks whether it got any eggs.
    const gotEggs = eggs > 0;

    // 3. If it got no eggs, it gives up.
    if (!gotEggs) throw new Error(`something went wrong`);

    // 4. It makes the eggs in the desired style.
    return `Made ${eggs} ${style} eggs.`;
  };
}

// Using `inject` we create a an Egg Maker factory.
const createEggMaker: Factory<EggMaker> = inject({
  // This builder function receives the `takeEggs` dependency.
  makeEggs,
  // This builder function simply returns the `takeEggs` service..
  takeEggs: () => takeEggs,
});

// # Experiments

// Define a helpful logging function.
let testNumber = 0;
function test() {
  console.log(fmt.bold(fmt.underline(`\nTest ${++testNumber}`)));
}

test();
// Create the first Egg Maker and make some eggs.
const eggMaker1: EggMaker = createEggMaker();
try {
  console.log(eggMaker1.makeEggs("fried"));
} catch (_) {
  console.assert(false);
}

test();
// Try to make some scrambled eggs.
try {
  eggMaker1.makeEggs("scrambled");
  console.assert(false);
} catch (error) {
  // This fails since we got no more eggs.
  console.error(String(error));
}

test();
// The Egg Maker 2 should handle errors internally.
// Instead of rewriting `makeEggs`, we can use a hook.
// Passing hooks to the factory allows us to override services.
// In this case, we wrap the actual `makeEggs` service in a try-catch.
const eggMaker2: EggMaker = createEggMaker({
  makeEggs: (makeEggs) =>
    (style) => {
      try {
        return makeEggs(style);
      } catch (_) {
        // Return a nice error message.
        return fmt.red(`No eggs could be made.`);
      }
    },
});
// Now the Egg Maker handles a lack of eggs more gracefully.
console.log(eggMaker2.makeEggs("scrambled"));

test();
// The Egg Maker 3 allows even deeper inspection.
// All behavior will be logged to the console.

// This function creates a hook that logs service behavior.
// deno-lint-ignore no-explicit-any
function logger<F extends (...x: any[]) => any>(
  name: string,
  fallback: ReturnType<F>,
) {
  const label = fmt.bold(fmt.white(name));
  return (f: F) =>
    (...x: Parameters<F>): ReturnType<F> => {
      // Log message when service starts, when it succeeds, or when it fails.
      try {
        console.info(fmt.cyan(`Started ${label}.`));
        const result = f(...x);
        const value = fmt.brightGreen(fmt.italic(String(result)));
        console.log(fmt.green(`Result of ${label}: ${value}`));
        return result;
      } catch (error) {
        const message = fmt.brightRed(fmt.italic(error.message));
        console.error(fmt.red(`Failed ${label} because ${message}.`));
        return fallback;
      }
    };
}

// Define the logging hooks for the Egg Maker.
const loggers: Hooks<EggMaker> = {
  takeEggs: logger("taking eggs", 0),
  makeEggs: logger("making eggs", "No eggs could be made."),
};

// Now both `makeEggs` and `takeEggs` will be logged.
const eggMaker3 = createEggMaker(loggers);
eggMaker3.makeEggs("scrambled");

test();
// When we are out of eggs, we want to fail immediately.
// We hook into the `takeEggs` service to throw an error.
// Then use `chain` to combine the new hook with the `loggers` from before.
const eggMaker4 = createEggMaker(chain(
  {
    takeEggs: (f) =>
      () => {
        const eggs = f();
        if (eggs === 0) throw new Error("you got no eggs");
        return eggs;
      },
  },
  // NOTE: Loggers must come after the custom error, since they handle it.
  loggers,
));

// Now, the log shows that `takeEggs` fails because there are no eggs.
eggMaker4.makeEggs("scrambled");

test();
// Finally, let's buy some more eggs and make scrambled eggs.
eggs = 11;
eggMaker4.makeEggs("scrambled");
