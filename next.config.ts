import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  images: { formats: ['image/avif', 'image/webp'] },
  // The root layout lives under [locale], so there can be no app/page.tsx to
  // render "/" — the redirect is the only way to give the bare origin a home.
  async redirects() {
    return [{ source: '/', destination: '/ar', permanent: false }];
  },
};

export default config;
