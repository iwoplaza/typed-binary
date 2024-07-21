import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

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
            { label: 'Example Guide', slug: 'guides/example' },
          ],
        },
        {
          label: 'Reference',
          autogenerate: { directory: 'reference' },
        },
      ],
    }),
  ],
});
