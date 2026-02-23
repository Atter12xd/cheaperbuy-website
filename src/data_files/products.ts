/**
 * Productos mostrados en la página Productos (solo fotos de public/images).
 * Cada ítem tiene slug, nombres EN/ES, precios, beneficios y detalles para la ficha.
 */

export type ProductCategory = "aluminum" | "wood" | "metal";

export interface Product {
  slug: string;
  nameEn: string;
  nameEs: string;
  image: string;
  category: ProductCategory;
  pricePen: number;
  priceUsd?: number;
  benefitsEn: string[];
  benefitsEs: string[];
  detailsEn: string;
  detailsEs: string;
  measures?: { width?: string; height?: string; depth?: string; weight?: string };
}

export const PRODUCTS: Product[] = [
  // Aluminum
  {
    slug: "aluminio-1",
    nameEn: "Sliding Aluminum Door",
    nameEs: "Puerta de Aluminio Corrediza",
    image: "/images/p13.jpeg",
    category: "aluminum",
    pricePen: 1850,
    priceUsd: 490,
    benefitsEn: ["10-year warranty", "Thermal break", "Low maintenance", "Custom sizes"],
    benefitsEs: ["Garantía 10 años", "Ruptura térmica", "Bajo mantenimiento", "Medidas a pedido"],
    detailsEn: "Premium sliding aluminum door. Resistant to corrosion and weather. Ideal for terraces and large openings.",
    detailsEs: "Puerta corrediza de aluminio premium. Resistente a la corrosión y al clima. Ideal para terrazas y grandes vanos.",
    measures: { width: "hasta 4 m", height: "hasta 2.4 m" },
  },
  {
    slug: "aluminio-2",
    nameEn: "Fixed Aluminum Window",
    nameEs: "Ventana Fija de Aluminio",
    image: "/images/p14.jpeg",
    category: "aluminum",
    pricePen: 650,
    priceUsd: 172,
    benefitsEn: ["Double glazing option", "Powder coated", "Secure fixing", "Weather seal"],
    benefitsEs: ["Opción doble vidrio", "Acabado en polvo", "Fijación segura", "Sellado climático"],
    detailsEn: "Fixed aluminum window with optional double glazing. Clean lines and durable finish for residential and commercial use.",
    detailsEs: "Ventana fija de aluminio con opción de doble vidrio. Líneas limpias y acabado durable para uso residencial y comercial.",
    measures: { width: "a medida", height: "a medida" },
  },
  {
    slug: "aluminio-3",
    nameEn: "Panoramic Aluminum Door",
    nameEs: "Puerta Panorámica de Aluminio",
    image: "/images/p20.jpeg",
    category: "aluminum",
    pricePen: 3200,
    priceUsd: 848,
    benefitsEn: ["Large glass panels", "Slim profile", "Maximum light", "Premium hardware"],
    benefitsEs: ["Paneles de vidrio amplios", "Perfil delgado", "Máxima luz natural", "Herraje premium"],
    detailsEn: "Panoramic aluminum door with tempered glass. Modern design for living rooms and offices with maximum visibility.",
    detailsEs: "Puerta panorámica de aluminio con vidrio templado. Diseño moderno para salas y oficinas con máxima visibilidad.",
    measures: { width: "hasta 6 m", height: "hasta 2.7 m" },
  },
  {
    slug: "aluminio-4",
    nameEn: "Aluminum Casement Window",
    nameEs: "Ventana de Aluminio Abatible",
    image: "/images/fo-ro2.jpeg",
    category: "aluminum",
    pricePen: 780,
    priceUsd: 207,
    benefitsEn: ["Ventilation control", "Easy cleaning", "Durable hinges", "Optional mosquito net"],
    benefitsEs: ["Control de ventilación", "Fácil limpieza", "Bisagras duraderas", "Opción tela mosquitera"],
    detailsEn: "Casement aluminum window. Perfect ventilation and easy maintenance. Available in multiple finishes.",
    detailsEs: "Ventana abatible de aluminio. Ventilación óptima y fácil mantenimiento. Disponible en varios acabados.",
    measures: { width: "0.60 m – 1.20 m", height: "1.00 m – 1.50 m" },
  },
  {
    slug: "aluminio-5",
    nameEn: "Aluminum System Door",
    nameEs: "Puerta de Sistema Aluminio",
    image: "/images/fo-ro1.jpeg",
    category: "aluminum",
    pricePen: 2100,
    priceUsd: 556,
    benefitsEn: ["System profile", "Energy efficient", "Sound insulation", "Long life"],
    benefitsEs: ["Perfil de sistema", "Eficiencia energética", "Aislamiento acústico", "Larga vida útil"],
    detailsEn: "High-performance aluminum system door. Ideal for projects requiring thermal and acoustic insulation.",
    detailsEs: "Puerta de sistema de aluminio de alto rendimiento. Ideal para proyectos que requieren aislamiento térmico y acústico.",
    measures: { width: "hasta 3 m", height: "hasta 2.50 m" },
  },
  // Wood
  {
    slug: "madera-1",
    nameEn: "Premium Wood Door",
    nameEs: "Puerta de Madera Premium",
    image: "/images/p4.jpeg",
    category: "wood",
    pricePen: 1450,
    priceUsd: 384,
    benefitsEn: ["Natural finish", "Solid wood", "Classic design", "Custom dimensions"],
    benefitsEs: ["Acabado natural", "Madera maciza", "Diseño clásico", "Dimensiones a medida"],
    detailsEn: "Premium solid wood door. Natural grain and durable construction for interior or exterior use.",
    detailsEs: "Puerta de madera maciza premium. Veta natural y construcción durable para interior o exterior.",
    measures: { width: "0.90 m – 1.20 m", height: "2.10 m – 2.40 m" },
  },
  {
    slug: "madera-2",
    nameEn: "Wood Panel Door",
    nameEs: "Puerta de Madera con Paneles",
    image: "/images/p19.jpeg",
    category: "wood",
    pricePen: 1680,
    priceUsd: 445,
    benefitsEn: ["Panel design", "Sturdy structure", "Elegant look", "Easy to install"],
    benefitsEs: ["Diseño en paneles", "Estructura robusta", "Aspecto elegante", "Fácil instalación"],
    detailsEn: "Wood door with panel design. Combines aesthetics and resistance for homes and offices.",
    detailsEs: "Puerta de madera con diseño en paneles. Combina estética y resistencia para hogares y oficinas.",
    measures: { width: "0.80 m – 1.00 m", height: "2.00 m – 2.20 m" },
  },
  {
    slug: "madera-3",
    nameEn: "Wood Interior Door",
    nameEs: "Puerta Interior de Madera",
    image: "/images/p3.jpeg",
    category: "wood",
    pricePen: 890,
    priceUsd: 236,
    benefitsEn: ["Lightweight", "Smooth finish", "Interior use", "Quick delivery"],
    benefitsEs: ["Ligera", "Acabado liso", "Uso interior", "Entrega rápida"],
    detailsEn: "Interior wood door. Light and resistant, ideal for bedrooms and hallways.",
    detailsEs: "Puerta interior de madera. Ligera y resistente, ideal para dormitorios y pasillos.",
    measures: { width: "0.70 m – 0.90 m", height: "2.10 m" },
  },
  // Metal
  {
    slug: "metal-1",
    nameEn: "8 ft Metal Patio Door",
    nameEs: "Puerta de Metal para Patio 8 pies",
    image: "/images/p10.jpeg",
    category: "metal",
    pricePen: 2200,
    priceUsd: 583,
    benefitsEn: ["High security", "Powder coated", "Rust resistant", "10-year warranty"],
    benefitsEs: ["Alta seguridad", "Acabado en polvo", "Antióxido", "Garantía 10 años"],
    detailsEn: "Heavy-duty metal patio door, 8 feet. Perfect for gardens, garages and commercial access.",
    detailsEs: "Puerta de metal para patio 8 pies, uso rudo. Ideal para jardines, garajes y acceso comercial.",
    measures: { width: "2.44 m (8 ft)", height: "2.10 m" },
  },
  {
    slug: "metal-2",
    nameEn: "Metal Security Door",
    nameEs: "Puerta de Metal de Seguridad",
    image: "/images/p11.jpeg",
    category: "metal",
    pricePen: 1580,
    priceUsd: 419,
    benefitsEn: ["Reinforced frame", "Anti-pry", "Durable lock", "Custom size"],
    benefitsEs: ["Marco reforzado", "Anti-palanca", "Cerradura durable", "Medida a pedido"],
    detailsEn: "Security metal door. Reinforced structure and high-resistance lock for maximum protection.",
    detailsEs: "Puerta de metal de seguridad. Estructura reforzada y cerradura de alta resistencia para máxima protección.",
    measures: { width: "0.90 m – 1.20 m", height: "2.10 m – 2.40 m" },
  },
  {
    slug: "metal-3",
    nameEn: "Metal Single Leaf Door",
    nameEs: "Puerta de Metal de Una Hoja",
    image: "/images/p12.jpeg",
    category: "metal",
    pricePen: 1350,
    priceUsd: 358,
    benefitsEn: ["Single leaf", "Easy installation", "Weather resistant", "Paint finish"],
    benefitsEs: ["Una hoja", "Fácil instalación", "Resistente al clima", "Acabado pintado"],
    detailsEn: "Single leaf metal door. Ideal for side entrances, storage and utility areas.",
    detailsEs: "Puerta de metal de una hoja. Ideal para entradas laterales, almacenes y áreas de servicio.",
    measures: { width: "0.80 m – 1.00 m", height: "2.00 m – 2.20 m" },
  },
  {
    slug: "metal-4",
    nameEn: "Industrial Metal Door",
    nameEs: "Puerta de Metal Industrial",
    image: "/images/p15.jpeg",
    category: "metal",
    pricePen: 1890,
    priceUsd: 501,
    benefitsEn: ["Industrial grade", "Fire resistant option", "Heavy duty", "Long life"],
    benefitsEs: ["Grado industrial", "Opción resistente al fuego", "Uso rudo", "Larga vida"],
    detailsEn: "Industrial metal door. For warehouses, workshops and high-traffic commercial access.",
    detailsEs: "Puerta de metal industrial. Para bodegas, talleres y acceso comercial de alto tráfico.",
    measures: { width: "1.00 m – 1.50 m", height: "2.10 m – 2.70 m" },
  },
  {
    slug: "metal-5",
    nameEn: "Metal Double Door",
    nameEs: "Puerta de Metal Doble",
    image: "/images/p16.jpeg",
    category: "metal",
    pricePen: 2650,
    priceUsd: 702,
    benefitsEn: ["Double leaf", "Wide passage", "Reinforced hinges", "Optional window"],
    benefitsEs: ["Doble hoja", "Paso amplio", "Bisagras reforzadas", "Ventana opcional"],
    detailsEn: "Double leaf metal door. Wide opening for vehicles or loading. Robust and secure.",
    detailsEs: "Puerta de metal de doble hoja. Apertura amplia para vehículos o carga. Robusta y segura.",
    measures: { width: "3.00 m – 4.00 m", height: "2.40 m" },
  },
];

const slugSet = new Set(PRODUCTS.map((p) => p.slug));

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: ProductCategory): Product[] {
  return PRODUCTS.filter((p) => p.category === category);
}

export function getAllSlugs(): string[] {
  return [...slugSet];
}

export function isValidProductSlug(slug: string): boolean {
  return slugSet.has(slug);
}
