# SKILL — Accesibilidad (WCAG 2.1 AA)
## Transversal | Mínimo nivel AA en toda la interfaz

---

## PRINCIPIOS WCAG

1. **Perceptible** — Información visible para todos los sentidos
2. **Operable** — Navegable con teclado y sin ratón
3. **Comprensible** — Contenido predecible y con errores claros
4. **Robusto** — Compatible con lectores de pantalla

## SEMÁNTICA HTML

```tsx
// ✅ HTML semántico siempre
<main>
  <header>
    <nav aria-label="Navegación principal">...</nav>
  </header>
  <section aria-labelledby="eventos-titulo">
    <h1 id="eventos-titulo">Gestión de Eventos</h1>
    <article>...</article>
  </section>
  <aside aria-label="Filtros">...</aside>
</main>

// ❌ Divs para todo
<div class="main">
  <div class="header">
    <div class="nav">...</div>
  </div>
</div>
```

## IMÁGENES Y MEDIOS

```tsx
// ✅ Alt descriptivo
<Image src={foto} alt="Fotografía de la Boda García celebrada en Salón El Pinar" />

// ✅ Alt vacío para decorativas
<Image src={patron} alt="" role="presentation" />

// ✅ Iconos con texto alternativo
<Button>
  <Trash2 aria-hidden="true" className="h-4 w-4 mr-2" />
  Eliminar evento
</Button>

// ✅ Solo icono: aria-label obligatorio
<Button aria-label="Eliminar evento Boda García">
  <Trash2 className="h-4 w-4" />
</Button>
```

## CONTRASTE DE COLOR

```
Texto normal:  ratio mínimo 4.5:1
Texto grande:  ratio mínimo 3:1
UI elements:   ratio mínimo 3:1

Verificar con:
- Chrome DevTools → Accessibility
- https://webaim.org/resources/contrastchecker/
```

```tsx
// ✅ Colores de shadcn pasan contraste por defecto
// ⚠️ Verificar colores de estado personalizados
// Ej: texto amarillo sobre fondo blanco puede FALLAR
```

## NAVEGACIÓN POR TECLADO

```tsx
// ✅ Focus visible siempre
// Nunca: outline: none sin alternativa
// shadcn usa focus-visible:ring-2 automáticamente

// ✅ Orden de tabIndex lógico (izquierda → derecha, arriba → abajo)
// Evitar tabIndex > 0 (rompe el orden natural)

// ✅ Atajos de teclado documentados
// Ej: Escape cierra modales, Enter confirma

// ✅ Skip to content
<a href="#main-content" className="sr-only focus:not-sr-only">
  Saltar al contenido principal
</a>
```

## FORMULARIOS ACCESIBLES

```tsx
// ✅ Labels explícitos (nunca solo placeholder)
<div>
  <Label htmlFor="email">Correo electrónico</Label>
  <Input
    id="email"
    type="email"
    aria-required="true"
    aria-describedby="email-error"
    aria-invalid={!!errors.email}
  />
  {errors.email && (
    <p id="email-error" role="alert" className="text-destructive text-sm">
      {errors.email.message}
    </p>
  )}
</div>

// ✅ Grupos de campos relacionados
<fieldset>
  <legend>Dirección del evento</legend>
  <Input id="calle" ... />
  <Input id="ciudad" ... />
</fieldset>
```

## COMPONENTES INTERACTIVOS

```tsx
// ✅ Roles ARIA cuando el elemento no es semántico
<div
  role="button"
  tabIndex={0}
  aria-pressed={isActive}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  onClick={handleClick}
>

// ✅ Estados ARIA para componentes dinámicos
<div
  role="region"
  aria-live="polite"      // Anunciar cambios dinámicos
  aria-label="Notificaciones"
>
  {notifications.map(n => <NotificationItem key={n.id} {...n} />)}
</div>

// ✅ Modales accesibles (Dialog de shadcn lo maneja)
// - Focus trap dentro del modal
// - Escape para cerrar
// - Focus vuelve al trigger al cerrar
```

## TABLAS DE DATOS

```tsx
// ✅ Tablas con headers descriptivos
<table>
  <caption className="sr-only">Lista de eventos del mes de marzo</caption>
  <thead>
    <tr>
      <th scope="col">Nombre</th>
      <th scope="col">Fecha</th>
      <th scope="col">Estado</th>
      <th scope="col">
        <span className="sr-only">Acciones</span>
      </th>
    </tr>
  </thead>
</table>
```

## LOADING STATES ACCESIBLES

```tsx
// ✅ Anunciar carga al lector de pantalla
<div aria-busy={isLoading} aria-label="Cargando eventos...">
  {isLoading ? <TableSkeleton /> : <DataTable data={eventos} />}
</div>

// ✅ Spinner con texto para lectores
<div role="status">
  <Loader2 className="animate-spin" aria-hidden="true" />
  <span className="sr-only">Cargando...</span>
</div>
```

## HERRAMIENTAS DE VERIFICACIÓN

```bash
# Instalar axe-core para tests automáticos
npm install --save-dev @axe-core/playwright

# En tests E2E
import AxeBuilder from '@axe-core/playwright'
test('no debe tener violaciones de accesibilidad', async ({ page }) => {
  await page.goto('/dashboard')
  const results = await new AxeBuilder({ page }).analyze()
  expect(results.violations).toEqual([])
})
```

## CHECKLIST ACCESIBILIDAD

- [ ] HTML semántico (main, nav, header, section, article)
- [ ] Imágenes con alt descriptivo o alt="" si decorativas
- [ ] Contraste 4.5:1 en texto normal verificado
- [ ] Navegación completa por teclado funcional
- [ ] Focus visible en todos los elementos interactivos
- [ ] Labels en todos los campos de formulario
- [ ] Errores de formulario anunciados con role="alert"
- [ ] Modales con focus trap y Escape para cerrar
- [ ] aria-live para contenido dinámico
- [ ] Skip to content link implementado
- [ ] Tablas con headers y caption
