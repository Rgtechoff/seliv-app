import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Tant qu'un ACCESS_CODE est défini, on bloque tous les crawlers
  if (process.env.ACCESS_CODE) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  // En production sans access gate : configuration SEO normale
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') ?? ''}/sitemap.xml`,
  };
}
