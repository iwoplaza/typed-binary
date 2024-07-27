import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';
import starlightTypeDoc, { typeDocSidebarGroup } from 'starlight-typedoc';

// https://astro.build/config
export default defineConfig({
  site: 'https://iwoplaza.github.io/typed-binary',
  integrations: [
    starlight({
      title: 'Typed Binary',
      logo: {
        light: '/public/logo-light-alt.svg',
        dark: '/public/logo-dark.svg',
        replacesTitle: true,
      },
      social: {
        github: 'https://github.com/iwoplaza/typed-binary',
      },
      sidebar: [
        {
          label: 'Guides',
          items: [
            // Each item here is one entry in the navigation menu.
            { label: 'Why Typed Binary?', slug: 'guides/why-typed-binary' },
            { label: 'Getting Started', slug: 'guides/getting-started' },
          ],
        },
        {
          label: 'Learn the Basics',
          items: [
            // Each item here is one entry in the navigation menu.
            { label: 'Getting Started', slug: 'guides/getting-started' },
          ],
        },
        typeDocSidebarGroup,
      ],
      plugins: [
        // Generate the documentation.
        starlightTypeDoc({
          entryPoints: ['../../packages/typed-binary/src'],
          tsconfig: '../../packages/typed-binary/tsconfig.json',
        }),
      ],
    }),
  ],
});
