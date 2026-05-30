import React from "react";

interface JsonLdProps {
  data: any;
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function PersonaOrganization() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "AskMentor",
    "url": "https://personabot.vercel.app",
    "logo": "https://personabot.vercel.app/logo.png",
    "image": "https://personabot.vercel.app/og-image.png",
    "sameAs": [
      "https://twitter.com/askmentor",
      "https://github.com/askmentor"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-800-555-0199",
      "contactType": "Customer Support",
      "email": "support@askmentor.ai"
    }
  };

  const searchAction = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://personabot.vercel.app",
    "name": "AskMentor",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://personabot.vercel.app/explore?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "AskMentor",
        "item": "https://personabot.vercel.app"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Explore Experts",
        "item": "https://personabot.vercel.app/explore"
      }
    ]
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AskMentor | Your AI Mentor",
    "url": "https://personabot.vercel.app",
    "image": {
      "@type": "ImageObject",
      "url": "https://personabot.vercel.app/og-image.png",
      "width": "1200",
      "height": "630"
    }
  };

  return (
    <>
      <JsonLd data={data} />
      <JsonLd data={searchAction} />
      <JsonLd data={breadcrumbs} />
      <JsonLd data={website} />
    </>
  );
}

export function WebsiteStructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://personabot.vercel.app",
    "name": "AskMentor",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://personabot.vercel.app/explore?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };
  
  const softwareData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "AskMentor",
    "operatingSystem": "All",
    "applicationCategory": "EducationalApplication",
    "description": "An AI-powered mentorship platform connecting users with digital personas of experts.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  const webPageData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "url": "https://personabot.vercel.app",
    "name": "AskMentor | Your AI Mentor",
    "primaryImageOfPage": {
      "@type": "ImageObject",
      "url": "https://personabot.vercel.app/og-image.png",
      "width": "1200",
      "height": "630"
    }
  }

  return (
    <>
      <JsonLd data={data} />
      <JsonLd data={softwareData} />
      <JsonLd data={webPageData} />
    </>
  );
}
