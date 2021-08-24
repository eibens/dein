# dein

[dein] defines **de**pendency **in**jection in a functional way and with minimal
syntax. It is implemented in TypeScript for Deno.

[![License][license-shield]](LICENSE)
[![Deno module][deno-land-shield]][deno-land]
[![Github
tag][github-shield]][github] [![Build][build-shield]][build]
[![Code
coverage][coverage-shield]][coverage]

# Usage

Get started by studying the "Egg Maker" example defined in
[example.ts](example.ts) and its output:

```sh
deno run https://deno.land/x/dein/example.ts
```

Documentation is still work in progress. Fortunately, the source code is rather
minimal:

- [inject.ts](inject.ts) for creating new systems.
- [hooks.ts](hooks.ts) for defining overrides.
- [chain.ts](chain.ts) for combining overrides.
- [mod.ts](mod.ts) exports all above.

# Contributing

Run [dev.ts](dev.ts) to build the source files locally:

```ts
deno run -A dev.ts
```

[dein]: #

<!-- badges -->

[github]: https://github.com/eibens/dein
[github-shield]: https://img.shields.io/github/v/tag/eibens/dein?label&logo=github
[coverage-shield]: https://img.shields.io/codecov/c/github/eibens/dein?logo=codecov&label
[license-shield]: https://img.shields.io/github/license/eibens/dein?color=informational
[coverage]: https://codecov.io/gh/eibens/dein
[build]: https://github.com/eibens/dein/actions/workflows/ci.yml
[build-shield]: https://img.shields.io/github/workflow/status/eibens/dein/ci?logo=github&label
[deno-land]: https://deno.land/x/dein
[deno-land-shield]: https://img.shields.io/badge/x/dein-informational?logo=deno&label
