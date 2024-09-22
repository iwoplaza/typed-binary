<div align="center">

![typed binary (light mode)](/docs/media/logo-light.svg)

Describe binary structures with full TypeScript support.

[Website](https://iwoplaza.github.io/typed-binary) — [Documentation](https://iwoplaza.github.io/typed-binary/guides/getting-started)

![Basic Type and Documentation Inference](/docs/media/code-showcase-light.svg)

<!-- https://ray.so/#code=aW1wb3J0IGJpbiBmcm9tICd0eXBlZC1iaW5hcnknOwoKLyogREVGSU5FICovCgpjb25zdCBWZWMzZiA9IGJpbi50dXBsZU9mKFtiaW4uZjMyLCBiaW4uZjMyLCBiaW4uZjMyXSk7CmNvbnN0IFBsYXllciA9IGJpbi5vYmplY3QoewogIG5hbWU6IGJpbi5zdHJpbmcubWF4Qnl0ZXMoMzIpLAogIHBvc2l0aW9uOiBWZWMzZiwKfSk7Cgp0eXBlIFBsYXllciA9IGJpbi5QYXJzZWQ8dHlwZW9mIFBsYXllcj47Ci8vICAgXj8geyBuYW1lOiBzdHJpbmcsIHBvc2l0aW9uOiBbbnVtYmVyLCBudW1iZXIsIG51bWJlcl0gfQoKLyogV1JJVEUgKi8KCmNvbnN0IGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihQbGF5ZXIubWF4U2l6ZSk7CmNvbnN0IHdyaXRlciA9IG5ldyBiaW4uQnVmZmVyV3JpdGVyKGJ1ZmZlcik7CgpQbGF5ZXIud3JpdGUod3JpdGVyLCB7CiAgbmFtZTogIkpvaG4iLAogIC8vIEVSUk9SOiBFeHBlY3RlZCBbbnVtYmVyLCBudW1iZXIsIG51bWJlcl0sIGdvdCBbbnVtYmVyLCBudW1iZXJdCiAgcG9zaXRpb246IFsxLCAyXSwKfSk7CgovKiBSRUFEICovCgpjb25zdCByZWFkZXIgPSBuZXcgYmluLkJ1ZmZlclJlYWRlcihidWZmZXIpOwpjb25zdCBwbGF5ZXIgPSBQbGF5ZXIucmVhZChyZWFkZXIpOwovLyAgICBePyB7IG5hbWU6IHN0cmluZywgcG9zaXRpb246IFtudW1iZXIsIG51bWJlciwgbnVtYmVyXSB9&language=typescript&title=main.ts&theme=raindrop&padding=16&width=710&background=false&darkMode=true -->

</div>

# Why Typed Binary?

Serialize and deserialize typed schemas without the need for redundant interfaces or an external DSL. Schemas themselves define what type they encode and decode, and **the IDE knows it**!

- Since value types are inferred from the schemas themselves, there is a **single source-of-truth**.
- No external DSL necessary to define the schemas, meaning you have instant feedback without the need to compile the interface definitions.
- It's platform independent (use it in Node.js as well as in in Browsers)
- While being made with TypeScript in mind, it also works in plain JavaScript.

# Documentation

The [typed binary documentation](https://iwoplaza.github.io/typed-binary/guides/getting-started) is a great starting point for learning how to use the library.

# Installation

```sh
# using npm
npm install typed-binary

# using pnpm
pnpm add typed-binary

# using yarn
yarn add typed-binary
```

> To properly enable type inference, **TypeScript 4.5** and up is required because of it's newly added [Tail-Recursion Elimination on Conditional Types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#tail-recursion-elimination-on-conditional-types) feature,

# Running examples

There are a handful of examples provided. To run any one of them make sure to clone the [typed-binary](https://github.com/iwoplaza/typed-binary) repository first, then go into the `examples/` directory. To setup the examples environment, run `pnpm install`, which will fetch dependencies, build the parent project and link it to the 'examples' project.

Pick an example that peaks interest, and run `pnpm example:exampleName`.
