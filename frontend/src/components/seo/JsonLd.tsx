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
    "name": "PersonaBot",
    "url": "https://personabot.ai",
    "logo": "https://personabot.ai/logo.png",
    "image": "https://personabot.ai/og-image.png",
    "sameAs": [
      "https://twitter.com/personabot",
      "https://github.com/Divine-P-77777/persona_ai_capstone"
    ],
    "description": "Connect with AI-powered personas of alumni, professors, and professionals.",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "email": "support@personabot.ai"
    }
  };
  return <JsonLd data={data} />;
}

export function WebsiteStructuredData() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://personabot.ai",
    "name": "PersonaBot",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://personabot.ai/explore?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };
  
  const softwareData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "PersonaBot",
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
    "url": "https://personabot.ai",
    "name": "PersonaBot | Your AI Mentor",
    "primaryImageOfPage": {
      "@type": "ImageObject",
      "url": "https://personabot.ai/og-image.png",
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
