# Hoja de ruta – 6 días | Web profesional ARCHIPIER BUILDER SUPPLY

**Objetivo:** Que la web deje de ser un “mamaracho” y quede **entendible, coherente y profesional**: una sola estructura de productos, contenido claro, pagos PayPal y todo bilingüe (español/inglés).

---

## Parte 0 – Diagnóstico: qué está mal ahora

### 0.1 Marca y textos mezclados
- En el código aparecen **tres nombres**: ARCHIPIER BUILDER SUPPLY, Cheaper Buy y ScrewFast.
- **Canónico:** La marca es **ARCHIPIER BUILDER SUPPLY** (definida en `src/data_files/constants.ts` como `SITE.title`).
- **Incoherencias actuales:**
  - Página `/products` (EN): structuredData con "ScrewFast", "screwfast.uk", "Outils Matériels" (francés).
  - Página `/fr/products` (ES): structuredData con "ScrewFast", "screwfast.uk", "Hardware Tools".
  - Textos en index y services dicen "Cheaper Buy".
  - Algunas páginas usan bien "ARCHIPIER BUILDER SUPPLY".
- **Objetivo:** Un solo nombre y dominio en toda la web: **ARCHIPIER BUILDER SUPPLY** y `SITE.url` (archipierbuildersupply.com). Eliminar ScrewFast y unificar “Cheaper Buy” → ARCHIPIER (o el nombre que definas en constants).

### 0.2 Estructura de productos desordenada
- **Tres páginas pesadas:** `/aluminio`, `/madera`, `/metal` (y `/fr/...`) son landings largas con productos **hardcodeados** (puertas, ventanas, etc.), no salen de un contenido único.
- **Página “Productos”:** `/products` y `/fr/products` usan la **content collection** pero:
  - `/products` filtra `id.startsWith("fr/")` → muestra contenido pensado para español en la ruta en inglés.
  - `/fr/products` filtra `id.startsWith("en/")` → muestra contenido en inglés en la ruta en español.
  - Solo hay productos de **madera** en la collection; aluminio y metal no están ahí.
- **Resultado:** El usuario ve “Aluminio”, “Madera”, “Metal” como tres secciones sueltas en el nav y además una “Productos” que solo muestra maderas y con idioma cruzado. Nada encaja.

### 0.3 Idiomas
- **Rutas:** Sin prefijo = **inglés** (ej. `/`, `/products`). Con `/fr/` = **español** (ej. `/fr/`, `/fr/products`).
- **Archivos de textos:** `src/utils/navigation.ts` (inglés), `src/utils/fr/navigation.ts` (español).
- **Componentes:** Se usa `Astro.currentLocale === "fr"` (o `"en"`) para elegir texto. En `products/index` el locale no coincide con el contenido que se pide a la collection (en/fr invertidos).

### 0.4 Productos sin estándar
- En la content collection no hay **precio** ni **medidas** en el schema; solo título, descripción, imágenes, specs.
- Las páginas aluminio/madera/metal tienen precios y textos a mano; no hay una ficha de producto reutilizable que “encaje” para las tres categorías.

### 0.5 PayPal
- Integración ya empezada (APIs y checkout); falta recuperar credenciales y, si se usa BD, definir órdenes desde cero.

---

## Principios: cómo debe quedar “una web profesional”

Para que todo **encaje** y sea **entendible**:

1. **Una sola marca y un solo dominio** en títulos, meta, structuredData y enlaces: ARCHIPIER BUILDER SUPPLY + `SITE.url`.
2. **Una sola forma de ver productos:** una página “Productos” con **tres subsecciones claras** (Aluminio, Madera, Metal), en ese orden. Sin tres “landings” sueltas en el menú principal.
3. **Un solo modelo de producto:** cada ítem tiene **fotos, precio, información y medidas** (y lo que añadamos). Mismo formato para aluminio, madera y metal.
4. **Idiomas claros:** ruta EN → contenido EN; ruta `/fr/` → contenido ES. Sin mezclar locale y collection (en/fr bien asignados).
5. **Navegación predecible:** Menú: Inicio, **Productos** (con subsecciones dentro), Servicios, Blog, Contacto. Sin duplicar “Aluminio / Madera / Metal” como ítems principales del nav.
6. **Checkout y PayPal** con un flujo único y mensajes en ambos idiomas.

---

## Día 1 – Estructura y navegación (que todo “encaje” en el menú)

**Objetivo:** Una sola entrada “Productos” en el menú; una sola página de listado con tres subsecciones (Aluminio, Madera, Metal); redirecciones para no romper enlaces viejos. Enfoque en aluminio y metal con imágenes de `public/images`.

### Tareas concretas

| # | Tarea | Archivos | Qué hacer |
|---|--------|----------|-----------|
| 1.1 | Un solo ítem “Productos” en el nav | `src/utils/navigation.ts`, `src/utils/fr/navigation.ts` | Quitar los ítems "Aluminum", "Wood", "Metal". Dejar uno: "Products" → `/products` y "Productos" → `/fr/products`. Mantener orden: Home, **Productos**, Services, Blog, Contact. |
| 1.2 | Página Productos con 3 subsecciones | `src/pages/products/index.astro`, `src/pages/fr/products/index.astro` | Una sola página por idioma. Estructura: (1) Título “Products” / “Productos”. (2) Tres bloques con id y subtítulo: `#aluminio` Aluminio, `#madera` Madera, `#metal` Metal. (3) **Imágenes desde `public/images`**: en Aluminio y Metal mostrar fotos del sitio (p13, p14, p20, fo-ro2, fondo-jo, etc.); Madera con placeholder o productos de collection sin Almendro/Ana Caspi. Corregir el filtro de collection: en `/products` usar contenido `en/`, en `/fr/products` usar contenido `fr/`. |
| 1.3 | Redirecciones desde las páginas viejas | `src/pages/aluminio.astro`, `madera.astro`, `metal.astro` y `fr/...` | Convertir cada una en una redirección: `return Astro.redirect('/products#aluminio')` o `/fr/products#aluminio` según corresponda. |
| 1.4 | Unificar marca en Productos | `src/pages/products/index.astro`, `src/pages/fr/products/index.astro` | En `title` y `structuredData` usar `SITE` de `@data/constants`. Eliminar referencias a ScrewFast y screwfast.uk. |
| 1.5 | Imágenes e interacción en Productos | `src/pages/products/index.astro`, `src/pages/fr/products/index.astro` | Usar **solo imágenes de `public/images`** (no Unsplash ni rutas @/images de productos viejos). **Anular** la interacción de “Historias de Clientes” / testimonios (quitar CTA y bloque de testimonios). **No listar** productos Almendro ni Ana Caspi (excluirlos del listado). Enfocarse en Aluminio y Metal con las nuevas fotos. |

### Criterio de éxito
- El menú muestra: Inicio, Productos, Servicios, Blog, Contacto.
- Al entrar a “Productos” se ve una sola página con tres bloques (Aluminio, Madera, Metal); Aluminio y Metal destacan con fotos de `public/images`.
- No se muestran testimonios ni CTA “Historias de Clientes”; no aparecen productos Almendro ni Ana Caspi en el listado.
- `/aluminio`, `/madera`, `/metal` (y `/fr/...`) redirigen a `/products#...` o `/fr/products#...`.
- No aparece ScrewFast ni Cheaper Buy; solo ARCHIPIER BUILDER SUPPLY.

---

## Día 2 – Ficha de producto: precios, beneficios, detalles (diseño profesional)

**Objetivo:** Al hacer clic en una foto o en “Entrar” / “Adquirir producto”, el usuario ve una ficha con **precios**, **beneficios**, **detalles** y diseño profesional. Productos con nombres y datos rellenados; solo imágenes de `public/images`.

### Tareas concretas

| # | Tarea | Archivos | Qué hacer |
|---|--------|----------|-----------|
| 2.1 | Datos de productos (ligero) | `src/data_files/products.ts` | Un data file con los productos mostrados: slug, nombre (EN/ES), imagen (`/images/...`), categoría (aluminio/madera/metal), price_pen, price_usd opcional, benefits[], details, measures opcional. Un ítem por foto del listado (public/images). |
| 2.2 | Listado con enlace a ficha | `src/pages/products/index.astro`, `src/pages/fr/products/index.astro` | Cada foto del listado enlaza a la ficha: `/products/[slug]` o `/fr/products/[slug]`. Opcional: mostrar nombre y “Ver detalle” / “Adquirir producto” en la card. |
| 2.3 | Ficha de detalle profesional | `src/pages/products/[id].astro`, `src/pages/fr/products/[id].astro` | Página de detalle por slug: foto principal, nombre, **precio** (PEN y/o USD), **beneficios** (lista clara), **detalles** (descripción), medidas si aplica. Diseño limpio y profesional. CTA “Adquirir producto” / “Solicitar por WhatsApp” con enlace a WhatsApp. |
| 2.4 | Imágenes | Solo `public/images` | Todas las fotos de productos salen de `public/images`; sin content collection pesada en esta ruta. |

### Criterio de éxito
- Al hacer clic en una foto (o en “Entrar” / “Adquirir producto”) se abre la ficha del producto.
- La ficha muestra: precios, beneficios, detalles y diseño profesional.
- Nombres y datos rellenados para cada producto; CTA claro para adquirir o contactar.

---

## Día 3 – Listado y ficha de producto (que todo se entienda)

**Objetivo:** En la página Productos, cada subsección muestra solo los productos de esa categoría (cards con foto, nombre, precio, “Ver más”). Cada producto tiene una ficha de detalle con fotos, precio, información y medidas.

### Tareas concretas

| # | Tarea | Archivos | Qué hacer |
|---|--------|----------|-----------|
| 3.1 | Listado por categoría en Productos | `src/pages/products/index.astro`, `src/pages/fr/products/index.astro` | Por cada bloque (Aluminio, Madera, Metal): productos del data file `getProductsByCategory()`. Mostrar cards con imagen, nombre, precio (PEN/USD), botón “Ver más” / “View details” → URL de detalle. |
| 3.2 | Rutas de detalle | `src/pages/products/[id].astro`, `src/pages/fr/products/[id].astro` | URL amigable por slug. Cargar producto por slug desde `@data/products`; legacy IDs redirigen a listado. |
| 3.3 | Contenido de la ficha | Mismo layout de detalle para EN y FR | Mostrar: imagen principal, nombre, precio (PEN y/o USD), descripción, **medidas** en bloque visible, beneficios, CTA WhatsApp. |
| 3.4 | Cards reutilizables | `src/components/ui/cards/ProductCard.astro` | Un componente que reciba `product` y `locale` (en/fr) y muestre foto, nombre, precio (PEN/USD) y enlace “View details” / “Ver más”. Usar en ambos idiomas. |

### Criterio de éxito
- En “Productos” se ven tres bloques; cada uno muestra solo productos de esa categoría con card (foto, nombre, precio, “Ver más”).
- Cada producto tiene ficha con: foto, precio, información, medidas y CTA.
- Navegación EN/ES coherente: contenido en inglés en `/products`, en español en `/fr/products`.

---

## Día 4 – Contenido e imágenes de todos los productos

**Objetivo:** Todos los productos (aluminio, madera, metal) con ficha completa en español e inglés e imágenes asignadas.

### Tareas concretas

| # | Tarea | Archivos | Qué hacer |
|---|--------|----------|-----------|
| 4.1 | Lista cerrada de productos | `src/data_files/products.ts` | Lista única por categoría: nombre EN/ES, slug, precio PEN/USD, medidas, imagen (`/images/...` desde `public/images`). Los 13 productos están definidos en el data file. |
| 4.2 | Contenido bilingüe | Mismo data file | Cada producto tiene nameEn, nameEs, detailsEn, detailsEs, benefitsEn, benefitsEs. No se usa content collection markdown; todo en `products.ts`. |
| 4.3 | Imágenes | `public/images/` | Todas las imágenes de productos son rutas `/images/...` (p3, p4, p10–p20, fo-ro1, fo-ro2). Sin placeholder; revisar mayúsculas en deploy (Linux). |
| 4.4 | Revisión | Data file + fichas | Todos los productos tienen: precio (PEN y opcional USD), medidas (donde aplica), beneficios, detalles, imagen. Ficha EN en `/products/[slug]`, ES en `/fr/products/[slug]`. |

### Criterio de éxito
- Todas las fichas tienen contenido completo (fotos, precio, información, medidas) en ES y EN.
- No quedan productos “vacíos” o con datos a medias.

---

## Día 5 – Pagos con PayPal y flujo de compra

**Objetivo:** Checkout con PayPal funcionando de punta a punta; mensajes y confirmación en ambos idiomas.

### Tareas concretas

| # | Tarea | Archivos | Qué hacer |
|---|--------|----------|-----------|
| 5.1 | Variables de entorno | `.env` y Vercel | Recuperar credenciales PayPal. Añadir: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PUBLIC_PAYPAL_CLIENT_ID`. Para producción: `PAYPAL_MODE=production`. |
| 5.2 | Base de datos (si se usa) | Supabase o alternativa | Si se guardan órdenes: tablas mínimas (orders, order_items) con payment_method y payment_status. Si no hay BD, definir flujo (ej. solo redirección a confirmación + notificación por email/WhatsApp). |
| 5.3 | APIs PayPal | `src/pages/api/create-paypal-order.ts`, `capture-paypal-order.ts` | Verificar que crean orden y capturan correctamente; probar en sandbox. |
| 5.4 | Checkout y confirmación | `src/components/checkout/CheckoutForm.tsx`, página de confirmación | Mantener opción PayPal; al aprobar, crear orden (si hay BD), vaciar carrito, redirigir a confirmación. Textos del checkout y de la página de confirmación en ES y EN según ruta. |
| 5.5 | Marca en checkout | CheckoutForm, order-confirmation | Revisar que no queden “Cheaper Buy” o “ScrewFast”; usar ARCHIPIER BUILDER SUPPLY o constante de sitio. |

### Criterio de éxito
- Flujo: carrito → checkout → pago PayPal → confirmación.
- Mensajes y confirmación en español e inglés.
- Sin referencias a otras marcas en el flujo de pago.

---

## Día 6 – Revisión global y web profesional lista

**Objetivo:** Todo el sitio consistente: una marca, una estructura de productos, bilingüe y sin piezas sueltas.

### Tareas concretas

| # | Tarea | Archivos / Ámbito | Qué hacer |
|---|--------|-------------------|-----------|
| 6.1 | Unificar marca en todo el sitio | Buscar "ScrewFast", "Cheaper Buy", "screwfast.uk" | Reemplazar por ARCHIPIER BUILDER SUPPLY y `SITE.url` (o constantes). Revisar: index, services, products, checkout, confirmación, structuredData, meta. |
| 6.2 | Textos bilingües | Nav, footer, títulos, botones, mensajes | Revisar que cada ruta muestre el idioma correcto (EN en `/`, ES en `/fr/`). Revisar navigation.ts y fr/navigation.ts y componentes que usen currentLocale. |
| 6.3 | Enlaces y redirecciones | Todas las páginas | Confirmar que “Productos” y los anchors #aluminio, #madera, #metal funcionan. Que no queden enlaces rotos a las antiguas páginas sueltas (solo redirecciones). |
| 6.4 | Imágenes y assets | Rutas de imágenes, mayúsculas/minúsculas | Verificar que todas las imágenes de productos y secciones carguen en build (importante en Linux/Vercel). Revisar enlaces externos (WhatsApp, redes). |
| 6.5 | Build y despliegue | `npm run build` | Build sin errores; desplegar; probar una compra PayPal en el entorno real. |
| 6.6 | Checklist final | — | Ver tabla debajo. |

### Checklist final (todo debe estar ✓)

| Revisión | Comprobación |
|----------|--------------|
| Marca | En toda la web solo aparece ARCHIPIER BUILDER SUPPLY (y dominio correcto). No ScrewFast ni Cheaper Buy en público. |
| Navegación | Menú: Inicio, Productos, Servicios, Blog, Contacto. Al hacer clic en Productos se ve una página con 3 subsecciones (Aluminio, Madera, Metal). |
| Productos | Cada subsección muestra solo productos de esa categoría. Cada producto tiene ficha con fotos, precio, información y medidas. |
| Idiomas | Contenido EN en rutas sin `/fr/`; contenido ES en rutas con `/fr/`. Productos EN en `/products`, ES en `/fr/products`. |
| Checkout | PayPal disponible; flujo completo hasta confirmación; textos en ambos idiomas. |
| Técnico | Build correcto; sin errores en consola; redirecciones de aluminio/madera/metal funcionando. |

---

## Resumen por día

| Día | Enfoque | Entregable clave |
|-----|--------|-------------------|
| **1** | Estructura y navegación | Un ítem “Productos”, una página con 3 subsecciones, redirecciones, marca unificada en Productos. |
| **2** | Modelo de datos | Schema con categoría, precio, medidas; al menos un producto completo EN+FR. |
| **3** | Listado y ficha | Productos por categoría en la página; ficha de detalle con fotos, precio, info, medidas. |
| **4** | Contenido completo | Todos los productos con ficha e imágenes en ES y EN. |
| **5** | PayPal | Credenciales, APIs, checkout y confirmación en ambos idiomas. |
| **6** | Cierre profesional | Marca única, bilingüe consistente, enlaces e imágenes OK, build y checklist final. |

---

## Referencia técnica rápida

| Tema | Dónde |
|------|--------|
| Marca y dominio | `src/data_files/constants.ts` → SITE, COMPANY |
| Navegación EN | `src/utils/navigation.ts` |
| Navegación ES | `src/utils/fr/navigation.ts` |
| Schema productos | `src/content/config.ts` → products |
| Contenido productos | `src/content/products/en/`, `src/content/products/fr/` |
| Página Productos EN | `src/pages/products/index.astro` |
| Página Productos ES | `src/pages/fr/products/index.astro` |
| Detalle producto | `src/pages/products/[id].astro`, `src/pages/fr/products/[id].astro` |
| APIs PayPal | `src/pages/api/create-paypal-order.ts`, `capture-paypal-order.ts` |
| Checkout | `src/components/checkout/CheckoutForm.tsx` |
| Layout global | `src/layouts/MainLayout.astro` |
| Imágenes | `src/images/` (con @images), `public/images/` (rutas estáticas) |

---

Cuando quieras, se puede bajar al código día a día (empezando por Día 1) para aplicar cada cambio y que la web quede ordenada y profesional.
