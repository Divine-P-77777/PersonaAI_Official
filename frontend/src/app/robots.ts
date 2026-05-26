import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://personabot.vercel.app'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/onboarding/', '/api/', '/_next/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/dashboard/', '/onboarding/', '/api/', '/_next/'],
      },
      {
        userAgent: ['Applebot', 'Bingbot'],
        disallow: ['/dashboard/', '/onboarding/', '/api/', '/_next/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
