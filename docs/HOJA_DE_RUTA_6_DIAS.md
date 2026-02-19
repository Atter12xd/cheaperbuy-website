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

**Objetivo:** Una sola entrada “Productos” en el menú; una sola página de listado con tres subsecciones (Aluminio, Madera, Metal); redirecciones para no romper enlaces viejos.

### Tareas concretas

| # | Tarea | Archivos | Qué hacer |
|---|--------|----------|-----------|
| 1.1 | Un solo ítem “Productos” en el nav | `src/utils/navigation.ts`, `src/utils/fr/navigation.ts` | Quitar los ítems "Aluminum", "Wood", "Metal". Dejar uno: "Products" → `/products` y "Productos" → `/fr/products`. Mantener orden: Home, **Productos**, Services, Blog, Contact. |
| 1.2 | Página Productos con 3 subsecciones | `src/pages/products/index.astro`, `src/pages/fr/products/index.astro` | Una sola página por idioma. Estructura: (1) Título “Products” / “Productos”. (2) Tres bloques con id y subtítulo: `#aluminio` Aluminio, `#madera` Madera, `#metal` Metal. (3) Por ahora cada bloque puede listar productos de la collection filtrados por categoría (si existe) o placeholder “Próximamente” hasta Día 2–3. Corregir el filtro de collection: en `/products` usar contenido `en/`, en `/fr/products` usar contenido `fr/`. |
| 1.3 | Redirecciones desde las páginas viejas | `src/pages/aluminio.astro`, `madera.astro`, `metal.astro` y `fr/aluminio.astro`, `fr/madera.astro`, `fr/metal.astro` | Convertir cada una en una redirección: en Astro, `return Astro.redirect('/products#aluminio')` o `/fr/products#aluminio` según corresponda, para que enlaces antiguos sigan funcionando. |
| 1.4 | Unificar marca en Productos | `src/pages/products/index.astro`, `src/pages/fr/products/index.astro` | En `title` y `structuredData` usar `SITE` de `@data/constants`: nombre ARCHIPIER BUILDER SUPPLY, url archipierbuildersupply.com. Eliminar referencias a ScrewFast y screwfast.uk. |

### Criterio de éxito
- El menú muestra: Inicio, Productos, Servicios, Blog, Contacto.
- Al entrar a “Productos” se ve una sola página con tres bloques claros (Aluminio, Madera, Metal).
- `/aluminio`, `/madera`, `/metal` (y `/fr/...`) redirigen a `/products#...` o `/fr/products#...`.
- No aparece ScrewFast ni Cheaper Buy en Productos; solo ARCHIPIER BUILDER SUPPLY.

---

## Día 2 – Modelo de datos de productos (fotos, precio, información, medidas)

**Objetivo:** Un esquema de producto único con precio, medidas y categoría; al menos un producto de ejemplo completo en ES y EN.

### Tareas concretas

| # | Tarea | Archivos | Qué hacer |
|---|--------|----------|-----------|
| 2.1 | Ampliar schema de productos | `src/content/config.ts` | Añadir al schema: `category: z.enum(['aluminum','wood','metal'])`, `price_pen: z.number()`, `price_usd: z.number().optional()`, `measures: z.object({ width: z.string().optional(), height: z.string().optional(), depth: z.string().optional(), weight: z.string().optional() }).optional()` o similar. Mantener imgCard, imgMain, blueprints y el resto. |
| 2.2 | Estructura de contenido por categoría | `src/content/products/en/`, `src/content/products/fr/` | Decidir: o carpetas `en/aluminum/`, `en/wood/`, `en/metal/` (y lo mismo en `fr/`) o un solo `en/` y `fr/` con `category` en el frontmatter. Añadir `category`, `price_pen`, `price_usd` y `measures` a todos los productos existentes (aunque sea con valores de ejemplo). |
| 2.3 | Un producto ejemplo completo | Un `.md` en `en/` y su par en `fr/` | Un producto (ej. una madera o una puerta) con: título, descripción, imgCard, imgMain, category, price_pen, price_usd, measures, specs. Que sirva de plantilla para el resto. |
| 2.4 | Imágenes | `src/images/` o `public/images/` | Asignar a cada producto al menos una imagen (existente o placeholder). Revisar rutas y mayúsculas/minúsculas para producción. |

### Criterio de éxito
- El schema tiene category, price_pen, measures (y opcional price_usd).
- Hay al menos un producto completo en EN y otro en FR con foto, precio e información y medidas.
- La página Productos puede filtrar por `category` para mostrar aluminio / madera / metal por bloques.

---

## Día 3 – Listado y ficha de producto (que todo se entienda)

**Objetivo:** En la página Productos, cada subsección muestra solo los productos de esa categoría (cards con foto, nombre, precio, “Ver más”). Cada producto tiene una ficha de detalle con fotos, precio, información y medidas.

### Tareas concretas

| # | Tarea | Archivos | Qué hacer |
|---|--------|----------|-----------|
| 3.1 | Listado por categoría en Productos | `src/pages/products/index.astro`, `src/pages/fr/products/index.astro` | Por cada bloque (Aluminio, Madera, Metal): `getCollection` filtrado por `category` y por idioma (`id.startsWith('en/')` o `id.startsWith('fr/')`). Mostrar cards: imagen, nombre, precio (PEN/USD), botón “Ver más” / “View details” que lleve a la URL de detalle. |
| 3.2 | Rutas de detalle | `src/pages/products/[id].astro`, `src/pages/fr/products/[id].astro` (o `[...slug].astro`) | Asegurar que la URL sea amigable (slug). Cargar el producto por id/slug y locale. |
| 3.3 | Contenido de la ficha | Mismo layout de detalle para EN y FR | Mostrar: galería (imgMain + blueprints u otras), nombre, precio (PEN y/o USD), descripción, **medidas** en un bloque visible, especificaciones, CTA (WhatsApp/contacto). Reutilizar lo que ya exista (tabs, etc.) y añadir lo que falte. |
| 3.4 | Cards reutilizables | Componente de card de producto | Un solo componente (o dos variantes pequeña/ancha si se desea) que reciba producto y locale y muestre foto, nombre, precio y enlace. Usar en ambos idiomas. |

### Criterio de éxito
- En “Productos” se ven tres bloques; cada uno muestra solo productos de esa categoría.
- Cada producto tiene ficha con: fotos, precio, información y medidas.
- Navegación EN/ES coherente: contenido en inglés en `/products`, en español en `/fr/products`.

---

## Día 4 – Contenido e imágenes de todos los productos

**Objetivo:** Todos los productos (aluminio, madera, metal) con ficha completa en español e inglés e imágenes asignadas.

### Tareas concretas

| # | Tarea | Archivos | Qué hacer |
|---|--------|----------|-----------|
| 4.1 | Lista cerrada de productos | Documento o tabla (puede ser en este MD o en un data file) | Por categoría: nombre, slug, precio PEN/USD, medidas, origen de imagen. Incluir los que hoy están en las landings de aluminio/madera/metal si se quieren migrar a la collection. |
| 4.2 | Markdown EN y FR | `src/content/products/en/`, `fr/` | Para cada producto: crear o actualizar `.md` con title, description, category, price_pen, measures, imgCard, imgMain, etc. Mismo slug/id en EN y FR para poder enlazar. |
| 4.3 | Imágenes | Repo y referencias en frontmatter | Asignar imagen a cada producto; si falta, usar placeholder y anotar “reemplazar por foto real”. Revisar que no haya rutas rotas ni errores de mayúsculas. |
| 4.4 | Revisión | Navegación manual | Recorrer listado y ficha en ambos idiomas; comprobar que no falte precio, medidas ni foto. |

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
