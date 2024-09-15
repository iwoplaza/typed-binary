import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://iwoplaza.github.io/typed-binary',
  base: 'typed-binary',
  integrations: [
    starlight({
      title: 'Typed Binary',
      logo: {
        light: '/public/logo-light.svg',
        dark: '/public/logo-dark.svg',
        replacesTitle: true,
      },
      social: {
        github: 'https://github.com/iwoplaza/typed-binary',
      },
      sidebar: [
        { label: 'Why Typed Binary?', slug: 'guides/why-typed-binary' },
        {
          label: 'Learn the Basics',
          items: [
            { label: 'Getting Started', slug: 'guides/getting-started' },
            {
              label: 'Serialization and Deserialization',
              slug: 'guides/serialization-and-deserialization',
            },
            { label: 'Primitive Values', slug: 'guides/primitive-values' },
            { label: 'Objects', slug: 'guides/objects' },
            { label: 'Arrays and Tuples', slug: 'guides/arrays-and-tuples' },
            { label: 'Optionals', slug: 'guides/optionals' },
            { label: 'Typed Arrays', slug: 'guides/typed-arrays' },
            { label: 'Recursive Types', slug: 'guides/recursive-types' },
            {
              label: 'Custom Schema Types',
              slug: 'guides/custom-schema-types',
            },
          ],
        },
      ],
    }),
  ],
});
