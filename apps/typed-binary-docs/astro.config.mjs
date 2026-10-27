import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import ecTwoSlash from 'expressive-code-twoslash';
import typegpu from 'unplugin-typegpu/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://iwoplaza.github.io/typed-binary',
  base: 'typed-binary',
  integrations: [
    starlight({
      title: 'Typed Binary',
      customCss: [
        '@fontsource-variable/ibm-plex-sans',
        '@fontsource-variable/jetbrains-mono',
        './src/styles/theme.css',
      ],
      components: {
        Hero: './src/components/Hero.astro',
        Footer: './src/components/Footer.astro',
      },
      expressiveCode: {
        // Interactive type information in code blocks marked with `twoslash`
        plugins: [ecTwoSlash({ tsConfigPath: './tsconfig.json' })],
        styleOverrides: {
          borderRadius: '0px',
          borderColor: 'var(--sl-color-hairline)',
          codeFontFamily: 'var(--__sl-font-mono)',
          uiFontFamily: 'var(--__sl-font-mono)',
          frames: {
            frameBoxShadowCssValue: 'none',
          },
        },
      },
      logo: {
        light: '/public/logo-light.svg',
        dark: '/public/logo-dark.svg',
        replacesTitle: true,
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/iwoplaza/typed-binary',
        },
      ],
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
              label: 'Data-dependent Schemas',
              slug: 'guides/data-dependent-schemas',
            },
            {
              label: 'Custom Schema Types',
              slug: 'guides/custom-schema-types',
            },
          ],
        },
      ],
    }),
  ],
  vite: {
    plugins: [typegpu()],
  },
});
