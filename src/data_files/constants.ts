import ogImageSrc from "@images/social.png";

export const SITE = {
  title: "ARCHIPIER BUILDER SUPPLY",
  tagline: "Materiales de Construcción Premium - Puertas de Alta Calidad",
  description: "ARCHIPIER BUILDER SUPPLY ofrece puertas premium de aluminio, metal y madera con garantía completa. Materiales de construcción de alta calidad con envío nacional y servicio técnico especializado.",
  description_short: "Materiales de construcción premium y puertas de alta calidad.",
  url: "https://archipierbuildersupply.com",
  author: "ARCHIPIER BUILDER SUPPLY",
};

export const SEO = {
  title: SITE.title,
  description: SITE.description,
  structuredData: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    inLanguage: "es-PE",
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
  title: `${SITE.title} | Puertas y Materiales de Construcción Premium`,
  description: "En ARCHIPER BUILDER SUPPLY encontrarás puertas de aluminio, metal y madera de alta calidad. Garantía extendida, instalación profesional y envío nacional.",
  image: ogImageSrc,
};

// Información de la empresa
export const COMPANY = {
  name: "ARCHIPER BUILDER SUPPLY SAC",
  ruc: "20610836276",
  address: "Mz. D, Lote 4, departamento 702 Residencial Porto Verde",
  contact: "Ruth Mery Vallejos Cortijo",
  phone: "+51 XXX XXX XXX",
  email: "ventas@archipierbuildersupply.com",
  whatsapp: "+51XXXXXXXXX", // Actualizar con número real
  businessHours: "Lunes a Viernes 8:00 AM - 6:00 PM, Sábados 8:00 AM - 2:00 PM",
  bankAccounts: {
    soles: {
      bank: "Banco de Crédito del Perú (BCP)",
      account: "570 7899 0114 047",
      cci: "002 570 1789 9011 404 702"
    },
    dollars: {
      bank: "Banco de Crédito del Perú (BCP)",
      account: "570 7935 1201 182",
      cci: "002 570 1793 5120 118 205"
    }
  }
};

// Especialidades de la empresa
export const SPECIALTIES = [
  "Puertas de Metal para Patio (8 pies)",
  "Puertas de Aluminio Corredizas",
  "Puertas Panorámicas con Vidrio Templado",
  "Puertas de Madera Premium"
];