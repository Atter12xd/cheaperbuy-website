import ogImageSrc from "@images/social.png";

export const SITE = {
  title: "Cheaper Buy",
  tagline: "Maderas de Alta Calidad para Construcción y Diseño",
  description: "Cheaper Buy ofrece maderas premium para pisos, parquet, marcos de puertas y más Encuentra la mejor calidad con envíos rápidos y precios accesibles.",
  description_short: "Compra maderas de alta calidad en Cheaper Buy.",
  url: "https://cheaper.online",
  author: "Cheaper Buy",
};

export const SEO = {
  title: SITE.title,
  description: SITE.description,
  structuredData: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    inLanguage: "en-US",
    "@id": SITE.url,
    url: SITE.url,
    name: SITE.title,
    description: SITE.description,
    isPartOf: {
      "@type": "WebSite",
      url: SITE.url,
      name: SITE.title,
      description: SITE.description,
    },
  },
};

export const OG = {
  locale: "es_PE",
  type: "website",
  url: SITE.url,
  title: `${SITE.title} | Compra Maderas Premium`,
  description: "En Cheaper Buy encontrarás pisos de madera, parquet y más. Calidad premium, resistencia y precios accesibles.",
  image: ogImageSrc,
};
