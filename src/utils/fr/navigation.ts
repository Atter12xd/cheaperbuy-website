// Enlaces de la barra de navegación
const navBarLinks = [
  { name: "Inicio", url: "/fr/" },
  { name: "Productos", url: "/fr/products" },
  { name: "Servicios", url: "/fr/services" },
  { name: "Blog", url: "/fr/blog" },
  { name: "Contáctanos", url: "/fr/contact" },
];

// Enlaces del footer
const footerLinks = [
  {
    section: "Nuestra Empresa",
    links: [
      { name: "Sobre Nosotros", url: "/services" },
      { name: "Blog", url: "/blog" },
    ],
  },
  {
    section: "Atención al Cliente",
    links: [
      { name: "Soporte", url: "/contact" },
    ],
  },
];

// Redes sociales
const socialLinks = {
  facebook: "https://www.facebook.com/cheaperbuy", // Reemplaza con el link real
  whatsapp: "https://wa.me/tu-numero", // Link directo a WhatsApp
  linkedin: "https://www.linkedin.com/company/cheaperbuy", // Agregado si tienes LinkedIn
};

export default {
  navBarLinks,
  footerLinks,
  socialLinks,
};
