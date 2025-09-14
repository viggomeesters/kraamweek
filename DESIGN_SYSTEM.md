# Design System Documentation - Kraamweek App

## Overzicht

Dit document beschrijft het design system van de Kraamweek App, inclusief kleurenschema, typografie, spacing, en herbruikbare UI componenten.

## Design Tokens

### Kleuren

#### Primaire Kleuren
- **Primary 50**: `#eef2ff` - Zeer lichte achtergronden
- **Primary 100**: `#e0e7ff` - Lichte achtergronden, badges
- **Primary 500**: `#6366f1` - Standaard primary kleur
- **Primary 600**: `#4f46e5` - Primaire acties, hoofdknoppen
- **Primary 700**: `#4338ca` - Hover states voor primary elementen
- **Primary 800**: `#3730a3` - Actieve states
- **Primary 900**: `#312e81` - Donkere accenten

#### Grijstinten
- **Gray 50**: `#f9fafb` - Pagina achtergronden
- **Gray 100**: `#f3f4f6` - Sectie achtergronden
- **Gray 200**: `#e5e7eb` - Randen, dividers
- **Gray 300**: `#d1d5db` - Input randen
- **Gray 400**: `#9ca3af` - Placeholder tekst
- **Gray 500**: `#6b7280` - Secundaire tekst
- **Gray 600**: `#4b5563` - Normale tekst
- **Gray 700**: `#374151` - Labels, belangrijke tekst
- **Gray 800**: `#1f2937` - Hoofdtekst
- **Gray 900**: `#111827` - Zeer donkere tekst

#### Status Kleuren
- **Success**: `#22c55e` (groen) - Succesmeldingen, positieve acties
- **Error**: `#ef4444` (rood) - Foutmeldingen, delete acties
- **Warning**: `#f59e0b` (oranje) - Waarschuwingen
- **Info**: `#3b82f6` (blauw) - Informatie

### Typografie

#### Font Familie
- **Sans**: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
- **Mono**: ui-monospace, SFMono-Regular, Monaco, Consolas, "Liberation Mono", "Courier New", monospace

#### Font Groottes
- **xs**: 12px (0.75rem) - Helper tekst, kleine labels
- **sm**: 14px (0.875rem) - Body tekst, formulier velden
- **base**: 16px (1rem) - Standaard body tekst
- **lg**: 18px (1.125rem) - Subtitels
- **xl**: 20px (1.25rem) - Kleine headings
- **2xl**: 24px (1.5rem) - Medium headings
- **3xl**: 30px (1.875rem) - Grote headings
- **4xl**: 36px (2.25rem) - Zeer grote headings

#### Font Gewichten
- **Normal**: 400 - Normale tekst
- **Medium**: 500 - Licht benadrukte tekst
- **Semibold**: 600 - Knoppen, labels
- **Bold**: 700 - Headings, belangrijke tekst

### Spacing

Gebaseerd op 4px basis eenheid:
- **1**: 4px - Zeer kleine spacing
- **2**: 8px - Kleine spacing
- **3**: 12px - Medium spacing
- **4**: 16px - Standaard spacing
- **5**: 20px - Grotere spacing
- **6**: 24px - Grote spacing
- **8**: 32px - Extra grote spacing
- **10**: 40px - Sectie spacing
- **12**: 48px - Layout spacing
- **16**: 64px - Zeer grote spacing
- **20**: 80px - Container spacing
- **24**: 96px - Page spacing

### Border Radius

- **none**: 0 - Geen rounding
- **sm**: 2px - Subtiele rounding
- **base**: 4px - Standaard rounding
- **md**: 6px - Medium rounding
- **lg**: 8px - Grote rounding
- **xl**: 12px - Extra grote rounding
- **2xl**: 16px - Zeer grote rounding
- **full**: 9999px - Volledig rond (cirkels, pills)

## UI Componenten

### Button

Herbruikbaar knop component met verschillende varianten en groottes.

#### Varianten
- **Primary**: Hoofdacties (blauw)
- **Secondary**: Secundaire acties (grijs)
- **Outline**: Outline buttons
- **Ghost**: Tekst-alleen buttons
- **Danger**: Destructieve acties (rood)
- **Success**: Positieve acties (groen)

#### Groottes
- **sm**: Kleine knoppen
- **md**: Standaard knoppen
- **lg**: Grote knoppen

#### Props
- `variant`: Button variant
- `size`: Button grootte
- `loading`: Laad state
- `fullWidth`: Volledige breedte
- `disabled`: Uitgeschakeld

#### Gebruik
```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md">
  Opslaan
</Button>

<Button variant="danger" loading>
  Verwijderen
</Button>
```

### Input

Herbruikbaar invoerveld component met labels, foutmeldingen en verschillende states.

#### Props
- `label`: Veld label
- `error`: Foutboodschap
- `helperText`: Helper tekst
- `state`: Visuele state (default, error, success)
- `inputSize`: Input grootte

#### Gebruik
```tsx
import { Input } from '@/components/ui';

<Input
  label="E-mailadres"
  type="email"
  required
  error="Ongeldig e-mailadres"
  placeholder="uw@email.nl"
/>
```

### Select

Herbruikbaar dropdown component.

#### Gebruik
```tsx
import { Select } from '@/components/ui';

<Select label="Rol" required>
  <option value="ouders">Ouder(s)</option>
  <option value="kraamhulp">Kraamhulp</option>
</Select>
```

### Textarea

Herbruikbaar tekstgebied component.

#### Gebruik
```tsx
import { Textarea } from '@/components/ui';

<Textarea
  label="Notities"
  rows={4}
  placeholder="Voeg uw notities toe..."
/>
```

### Card

Container component voor gegroepeerde content.

#### Props
- `padding`: Card padding (sm, md, lg)

#### Gebruik
```tsx
import { Card } from '@/components/ui';

<Card padding="md">
  <h2>Card Title</h2>
  <p>Card content...</p>
</Card>
```

### Alert

Melding component voor verschillende boodschappen.

#### Varianten
- **info**: Informatieve meldingen (blauw)
- **success**: Succesmeldingen (groen)
- **warning**: Waarschuwingen (oranje)
- **error**: Foutmeldingen (rood)

#### Props
- `variant`: Alert type
- `title`: Optionele titel
- `icon`: Custom icoon
- `onClose`: Sluit functie

#### Gebruik
```tsx
import { Alert } from '@/components/ui';

<Alert variant="success" title="Gelukt">
  Profiel succesvol bijgewerkt
</Alert>

<Alert variant="error">
  Er is een fout opgetreden
</Alert>
```

### Badge

Kleine label component voor status of categorieën.

#### Varianten
- **primary**: Primaire badges
- **secondary**: Neutrale badges
- **success**: Succes badges
- **warning**: Waarschuwing badges
- **error**: Fout badges

#### Gebruik
```tsx
import { Badge } from '@/components/ui';

<Badge variant="success">Actief</Badge>
<Badge variant="warning" size="sm">Pending</Badge>
```

### Spinner

Laad indicator component.

#### Props
- `size`: Spinner grootte (sm, md, lg)
- `color`: Spinner kleur (primary, white, gray)

#### Gebruik
```tsx
import { Spinner } from '@/components/ui';

<Spinner size="md" color="primary" />
```

## Implementatie Richtlijnen

### Consistentie
- Gebruik altijd de design system componenten in plaats van custom CSS
- Houd je aan de gedefinieerde kleuren, spacing en typografie
- Gebruik semantische HTML waar mogelijk

### Toegankelijkheid
- Alle componenten hebben focus states
- Kleuren hebben voldoende contrast
- Labels zijn altijd gekoppeld aan form elementen
- Screen reader ondersteuning waar van toepassing

### Responsive Design
- Alle componenten zijn mobile-first ontworpen
- Gebruik flexbox en grid voor layout
- Touch-friendly button groottes (minimaal 44px)

### Performance
- Componenten zijn geoptimaliseerd voor re-rendering
- CSS-in-JS wordt vermeden ten gunste van utility classes
- Tree-shaking friendly exports

## Migratie Bestaande Code

Bij het migreren van bestaande componenten:

1. **Vervang hardcoded CSS classes** met design system componenten
2. **Update kleur referenties** naar design token variabelen
3. **Consolideer duplicate styling** in herbruikbare componenten
4. **Test alle interactive states** (hover, focus, disabled)
5. **Valideer toegankelijkheid** met screen readers

## Voorbeelden

### Voor Migratie
```tsx
<button className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
  Opslaan
</button>
```

### Na Migratie
```tsx
<Button variant="primary" size="lg" fullWidth>
  Opslaan
</Button>
```

### Voor Migratie
```tsx
<div className="bg-red-50 border border-red-200 rounded-md p-4">
  <div className="flex">
    <span className="text-red-400">⚠️</span>
    <p className="text-sm text-red-700 ml-3">Foutboodschap</p>
  </div>
</div>
```

### Na Migratie
```tsx
<Alert variant="error">
  Foutboodschap
</Alert>
```

## Onderhoud

- **Updates**: Design tokens kunnen centraal worden bijgewerkt
- **Nieuwe Componenten**: Volg de bestaande patronen en naamgeving
- **Breaking Changes**: Documenteer wijzigingen en migratiepaden
- **Testing**: Test alle componenten in verschillende browser en devices