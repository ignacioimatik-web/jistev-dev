---
name: jistev.dev — El Laboratorio Nocturno
description: Portfolio dark premium de Ignacio Estevez (jistev) — IA en producción + arquitectura híbrida.
colors:
  primary: "#f97316"
  accent-glare: "#22d3ee"
  neutral-bg: "#20242d"
  neutral-surface: "#282e3a"
  neutral-subtle: "#303646"
  neutral-line: "#3c4354"
  neutral-foreground: "#e8ecf1"
  neutral-muted: "#9aa5b6"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "3.25rem"
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    letterSpacing: "0.06em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "#ea580c"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "14px 28px"
  button-primary-hover:
    backgroundColor: "#c2410c"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.neutral-foreground}"
    rounded: "{rounded.md}"
    padding: "14px 28px"
  card:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.lg}"
  tag:
    backgroundColor: "{colors.neutral-subtle}"
    textColor: "#9fb0c3"
    rounded: "{rounded.sm}"
    padding: "4px 10px"
---

# Design System: jistev.dev — El Laboratorio Nocturno

## Overview

**Creative North Star: "El Laboratorio Nocturno"**

jistev.dev es un laboratorio de trabajo en la oscuridad: un fondo grafito (`#20242d`) — gris profundo, no negro donde cada resultado se ilumina con intención. La metáfora es la de un técnico probando y afinando bajo luz de referencia constante — dominante, precisa, sin ruido. El naranja eléctrico es la firma del experimento; el cian neón es el plano/luz de estado. No hay gradientes de marca: el laboratorio distingue su instrumento (naranja sólido) de su lectura (cian sólido).

La densidad es media-baja. El contenido respira con `py-24` entre secciones y espacio generoso en cards. El lenguaje es **mono para el sistema** (labels, taglines, tags, precios como `$ ...`) e **Inter para la voz** (títulos y cuerpo). La atmósfera es técnica y templada: capacidad de imaginar, liderar y construir, sin hype folleto.

**Key Characteristics:**
- Dark premium, acentos saturados y escasos (el naranja es el único "hablante"; el cian es lectura, no voz).
- Tipografía dual: Inter (voz) + JetBrains Mono (sistema).
- Cards discretas con borde fino y superficie ligeramente más clara que el fondo.
- Video 4K ondas de fondo en el hero + imágenes de código como fondo de cards de proyectos/servicios.
- Tooltip flotante que sigue al cursor (estilo dev) en Capacidades y Stack.
- Transiciones bajo 300ms, curvas custom (`cubic-bezier(0.23,1,0.32,1)`), `prefers-reduced-motion` global.

## Colors

Sistema oscuro con un solo acento hablante y un secundario de lectura.

### Primary — **Naranja Eléctrico** (`#f97316`)
El único acento que "habla": botón primario ("Solicitar presupuesto"), enlace activo, hover de focus, iconos de estado. Se usa con parcimonia — es la firma del laboratorio, no un color de relleno. Solo en elementos de acción o de máxima jerarquía; nunca como fondo de sección ni en gradientes.

### Secondary — **Cian Neón** (`#22d3ee`)
No es una segunda voz: es **lectura de estado y sistema**. Tags/labels mono (`$ status: onboard`, `// sobre-mi`, `▸ full-stack`), precios (`desde 500€`), números de stats, iconos de detalle. Donde el naranja dice "actúa", el cian dice "lee/repara". Se usa en texto mono de sistema, nunca en botones.

### Neutral
- **Fondo de laboratorio** (`#20242d`): el lienzo base del sitio en general y hero.
- **Superficie card** (`#282e3a`): tarjetas, acordeones, contenedores elevados un paso sobre el fondo.
- **Superficie sutil** (`#303646`): paneles internos, blockquote, inputs sobre card, header del code-panel.
- **Línea** (`#3c4354`): todos los bordes (`border-zinc-800`).
- **Texto primario** (`#e8ecf1`): títulos y texto de máxima legibilidad.
- **Texto mutado** (`#9aa5b6`): cuerpo secundario, descripciones, `text-zinc-400`.

> **La Regla de Voz Única.** El naranja eléctrico se reserva a elementos de acción/jerarquía y aparece en ≤10% de cualquier pantalla. Su rareza es el punto. No se combina con el cian en gradientes.

## Typography

**Display Font:** Inter (con fallback system-ui) — 700, semibold en títulos/hero.
**Body Font:** Inter — 400/1.65.
**Label/Mono Font:** JetBrains Mono (con fallback monospace) — para todo lo de sistema.

**Character:** La dupla funciona como laboratorio y voz: Inter aporta la lectura calmada y profesional; JetBrains Mono firma el sistema (labels de sección, taglines `$`, tags tecnológicos, números). El contraste mono/voz es la identidad tipográfica.

### Hierarchy
- **Display** (700, `clamp(2.6rem,5.5vw,3.6rem)`, 1.06, `-0.02em`): El hero — "Escribo código que convierte ideas en productos." Máximo peso, tracking negativo.
- **Headline** (700, `2.25rem`, 1.15): Títulos de sección (`De la idea al producto.`), con punto final.
- **Title** (600, `1.1rem`): Títulos de card, acordeón, paso del método.
- **Body** (400, `1rem`, 1.65, máx ~68ch): Párrafos y descripciones.
- **Label** (JetBrains Mono, 500, `0.75rem`, `0.06em`, uppercase): Labels de sección (`// sobre-mi`), taglines (`$ status: onboard`), tags tecnológicos.

## Layout

Contenedor central `max-w-5xl`, con `px-6` lateral y `py-24` entre secciones (separadas por `border-t border-zinc-800`). El hero ocupa `min-h-screen`. Grids internos: cards de Capacidades/Conceptos/Servicios en `sm:grid-cols-2 lg:grid-cols-3`; Stack y Método en flex wrap/circulares. El code-panel del hero usa `grid-cols-[1.4fr_0.6fr]` en desktop, oculto en móvil. Stats del hero: `grid-cols-2 sm:grid-cols-4`.

Responsive: mobile-first con `sm:`/`md:`/`lg:`. Las cards colapsan a 1 columna en móvil; el nav de enlaces se oculta (`sm:flex`) dejando un solo CTA `$ start`.

## Elevation & Depth

El sistema es **casi plano por tonalidad**, no por sombra. La profundidad se logra apilando superficies de luz creciente: fondo `#20242d` → surface `#282e3a` → panel `#303646`, más bordes `#3c4354` que separan. Las sombras aparecen sólo como respuesta de estado (hover del botón primario y del tooltip), no en reposo.

### Shadow Vocabulary
- **Hover-reactivo** (`0 8px 30px -8px rgba(139,92,246,0.5)`): el botón primario al hacer hover — "el laboratorio ilumina su instrumento".
- **Tooltip flotante** (`0 24px 60px -16px rgba(0,0,0,0.8)`): la ventana que sigue al cursor.

> **La Regla Plano-por-Defecto.** Las superficies están planas en reposo; la sombra o la subida de luz aparecen sólo como respuesta a estado (hover, focus). Nunca elevación decorativa en reposo.

## Shapes

Lenguaje de esquinas **ligeramente redondeadas y contenidas**: `radius` estándar 10px en botones/inputs, 14px en cards y contenedores, 6px en tags y mini-chips. Ni agresivamente redondeado ni cuadrado. Bordes de `#3c4354` (1px) sobre superficies oscuras; el foco se marca con ring de naranja/cian. Los iconos viven en tiles cuadrados 40px con borde fino (`rounded-[10px] border-zinc-700/60`).

## Components

Componentes de respuesta precisa y contenida: botones firmes, cards discretas, inputs limpios. Sólo el acento habla; los bordes callan.

### Buttons
- **Shape:** esquinas 10px, altura 44px para el primario.
- **Primary:** naranja eléctrico (`#f97316`), texto blanco, padding 14/28. Hover: naranja más profundo (`#ea580c`) + lift y sombra reactiva. Active: `scale(0.97)` (respuesta de pulsación física).
- **Ghost:** borde fino `#3c4354`, texto claro. Hover: borde/`text` cian neón (`hover:border-cyan-400 hover:text-cyan-400`). Active: `scale(0.97)`.
- **Focus:** ring naranja visible.

### Tags & Chips (dominios, tecnologías)
- **Style:** superficie sutil `#303646`, texto `#9fb0c3`, borde fino, radio 6px, mono. Son de **lectura**, nunca de acción.

### Cards / Containers
- **Corner Style:** 14px.
- **Background:** superficie `#282e3a`.
- **Shadow Strategy:** plano en reposo (ver Elevation).
- **Border:** 1px `#3c4354`.
- **Fondo opcional:** imágenes de código o foto con overlay oscuro (`opacity 0.25-0.4`) y gradiente `#20242d` al fondo para legibilidad.
- **Internal Padding:** `p-6` (24px).

### Inputs / Fields
- **Style:** borde `#3c4354`, fondo `#20242d`, radio 12px, texto Inter.
- **Focus:** borde + ring cian neón (`focus:border-cyan-400 focus:ring-cyan-400`).
- **Placeholder:** `text-zinc-600` — lectura de sistema, no voz.

### Navigation
- **Style:** fija, `backdrop-blur`, borde inferior `#3c4354`, fondo `#20242d/80`.
- **Typography:** enlaces mono 13px `text-zinc-400`, hover `text-white`.
- **CTA:** botón `$ start` con borde.
- **Mobile:** los enlaces se ocultan; queda sólo el CTA.

### Tooltip Flotante (Signature Component)
Ventana que sigue al cursor en Capacidades y Stack. Fondo `#0c1219`, borde `rgba(34,211,238,0.4)`, radio 12px, ancho 420px, altura máxima ~46vh con scroll. Título mono cian con punto luminoso, cuerpo Inter 12.5px, row de tags. Aparece con `translate(14px,12px)` y `scale(1)` en 0.15s; se voltea para no salirse de pantalla.

## Do's and Don'ts

### Do:
- **Do** usar el naranja eléctrico (`#f97316`) como único acento de acción; su rareza es su poder.
- **Do** reservar el cian neón (`#22d3ee`) para lectura de sistema: labels mono, tags, precios, números.
- **Do** mantener `<300ms` en transiciones de UI con curvas custom (`cubic-bezier(0.23,1,0.32,1)`).
- **Do** animar sólo `transform` y `opacity`; dejar todo lo demás quieto.
- **Do** respetar `prefers-reduced-motion` (fade-only para quien lo pida) y gatear hovers tras `(hover:hover) and (pointer:fine)`.
- **Do** dar `scale(0.97)` a cualquier elemento pulsable.

### Don't:
- **Don't** usar gradientes naranja→cian como marca (`bg-clip-text`+`from-orange-300`): es el sello de UI generada por IA que el sistema rechaza. Usa naranja sólido.
- **Don't** aplicar `transition: all`; especifica propiedades exactas.
- **Don't** animar desde `scale(0)`; entra desde `scale(0.9-0.97)` con opacity.
- **Don't** poner el acento en fondos de sección o en más del ~10% de la pantalla.
- **Don't** animar acciones de teclado (100+/día) — elimínalas.
- **Don't** hardcodear `#282e3a`/`#20242d` si existe el token; usa `bg-card`/`bg-background`.