import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.103.0/testing/asserts.ts";
import { inject } from "./inject.ts";
import { chain } from "./chain.ts";

Deno.test("inject works", () => {
  assertEquals(
    inject({
      foo: () => 3,
      bar: ({ foo }) => foo * 2,
    })(),
    { foo: 3, bar: 6 },
  );
});

Deno.test("inject calls factory only once", () => {
  let i = 0;
  const it = inject({
    foo: () => {
      i++;
    },
  })();
  it.foo;
  it.foo;
  it.foo;
  assertEquals(i, 1);
});

Deno.test("inject defines keys on returned proxy", () => {
  assertEquals(
    Object.keys(
      inject({
        foo: () => 3,
      })(),
    ),
    ["foo"],
  );
});

Deno.test("inject result can be spread", () => {
  assertEquals(
    {
      ...inject({
        foo: () => 3,
      })(),
    },
    { foo: 3 },
  );
});

Deno.test("inject calls hook when function is invoked", () => {
  let flag = false;
  // Must access `foo` to trigger the hook.
  const { foo: _ } = inject({
    foo: () => 3,
  })({
    foo: (n) => {
      flag = true;
      return n;
    },
  });
  assert(flag);
});

Deno.test("inject passes factory result to hook", () => {
  inject({
    foo: () => 3,
  })({
    foo: (n) => {
      assertEquals(n, 3);
      return n;
    },
  });
});

Deno.test("inject allows hook to override a value", () => {
  const { foo } = inject({
    foo: () => 3,
  })({
    foo: () => 42,
  });
  assertEquals(foo, 42);
});

Deno.test("inject allows hook to override a dependency", () => {
  const { answer } = inject({
    foo: () => 3,
    answer: ({ foo }) => 2 * foo,
  })({
    foo: () => 21,
  });
  assertEquals(answer, 42);
});

Deno.test("inject applies hooks separately", () => {
  const hook = inject({
    foo: () => 3,
  });
  const mul = hook({
    foo: (n) => n * 2,
  });
  const add = hook({
    foo: (n) => n + 2,
  });
  assertEquals(mul.foo, 6);
  assertEquals(add.foo, 5);
});

Deno.test("inject applies chained hooks correctly", () => {
  const hook = inject({
    foo: () => 3,
  });
  const { foo } = hook(chain({
    foo: (n) => 2 * n,
  }, {
    foo: (n) => 2 + n,
  }));
  assertEquals(foo, 8);
});
