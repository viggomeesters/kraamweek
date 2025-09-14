# PWA Installation Guide - Kraamweek App

De Kraamweek App is nu beschikbaar als Progressive Web App (PWA) en kan geïnstalleerd worden op verschillende apparaten voor een app-achtige ervaring.

## Wat is een PWA?

Een Progressive Web App (PWA) is een web-applicatie die zich gedraagt als een native app. Het biedt:

- **Offline functionaliteit**: Basis functionaliteit werkt zonder internetverbinding
- **App-achtige ervaring**: Volledige schermweergave zonder browser interface
- **Push notificaties**: Mogelijkheid voor meldingen (toekomstige functie)
- **Automatische updates**: Altijd de nieuwste versie
- **Cross-platform**: Werkt op iOS, Android, Windows en macOS

## Installatie-instructies

### Android (Chrome/Edge/Samsung Internet)

1. Open de Kraamweek App in je browser
2. Tik op het menu (drie puntjes) in de browser
3. Selecteer "App installeren" of "Toevoegen aan startscherm"
4. Bevestig de installatie
5. De app verschijnt op je startscherm

**Alternatief via automatische prompt:**
- De app toont automatisch een installatie-prompt na 30 seconden
- Tik op "Installeer" om de app toe te voegen

### iOS (Safari)

1. Open de Kraamweek App in Safari
2. Tik op het deel-icoon (vierkant met pijl omhoog) onderaan het scherm
3. Scroll naar beneden en tik op "Voeg toe aan beginscherm"
4. Pas de naam aan indien gewenst
5. Tik op "Voeg toe"
6. De app verschijnt op je beginscherm

### Windows 10/11 (Edge/Chrome)

1. Open de Kraamweek App in je browser
2. Klik op het installatie-icoon in de adresbalk (kleine computer met pijl)
3. Of ga naar het menu (drie puntjes) → "Apps" → "Deze site installeren als app"
4. Bevestig de installatie
5. De app wordt toegevoegd aan je Start menu en kan worden vastgezet aan de taakbalk

### macOS (Safari/Chrome)

**Safari:**
1. Open de Kraamweek App in Safari
2. Ga naar "Bestand" → "Voeg toe aan Dock"
3. De app wordt toegevoegd aan je Dock

**Chrome:**
1. Open de Kraamweek App in Chrome
2. Klik op het installatie-icoon in de adresbalk
3. Of ga naar het menu → "Kraamweek App installeren"
4. Bevestig de installatie

## Offline functionaliteit

De Kraamweek App biedt beperkte offline functionaliteit:

### Wat werkt offline:
- **Bekijken van eerder geladen gegevens**: Recente registraties en overzichten
- **Basis navigatie**: Tussen verschillende tabbladen
- **Lokale data**: Alle gegevens die in je browser zijn opgeslagen

### Wat vereist internet:
- **Nieuwe data synchronisatie**: Uploaden naar de server
- **Account aanmaken/inloggen**: Authenticatie
- **App updates**: Automatische updates van de applicatie

### Offline indicatie
- De app toont een rode balk bovenaan wanneer je offline bent
- Een groene balk verschijnt kort wanneer de verbinding wordt hersteld
- Gegevens worden lokaal opgeslagen en gesynchroniseerd zodra je weer online bent

## App Store voorbereiding

Voor toekomstige distributie via app stores zijn de volgende elementen voorbereid:

### App Store assets
- **App iconen**: Beschikbaar in alle vereiste formaten (72x72 tot 512x512)
- **Screenshots**: Zullen worden gegenereerd voor verschillende schermformaten
- **App beschrijving**: Nederlandse beschrijving voor gezondheidsapp

### Store listing elementen
```
Naam: Kraamweek App
Categorie: Gezondheid & Fitness / Medisch
Beschrijving: Een gebruiksvriendelijke app voor het bijhouden van baby- en moedergegevens tijdens de kraamweek
Trefwoorden: kraamweek, baby, gezondheid, tracking, postpartum
Target rating: 4+ (geschikt voor alle leeftijden)
```

## Technische specificaties

### Ondersteunde browsers
- **Chrome**: Versie 67+ (Android/Desktop)
- **Safari**: Versie 11.1+ (iOS/macOS)
- **Edge**: Versie 79+ (Windows)
- **Firefox**: Versie 62+ (Desktop - beperkte PWA ondersteuning)
- **Samsung Internet**: Versie 8.2+ (Android)

### Systeemvereisten
- **iOS**: 11.3 of hoger
- **Android**: 5.0 of hoger
- **Windows**: 10 versie 1903 of hoger
- **macOS**: 10.14 of hoger

### PWA features
- ✅ Web App Manifest
- ✅ Service Worker voor caching
- ✅ Offline fallback pagina
- ✅ Installatie prompt
- ✅ Responsive design
- ✅ Touch-friendly interface
- ✅ Splash screen support
- ✅ Keyboard shortcuts
- ⏳ Push notifications (toekomstige update)
- ⏳ Background sync (toekomstige update)

## Troubleshooting

### App installeert niet
1. Controleer of je browser PWA's ondersteunt
2. Zorg dat je de nieuwste versie van je browser gebruikt
3. Controleer je internetverbinding
4. Probeer de browser cache te legen

### App werkt niet offline
1. Zorg dat je de app minstens één keer online hebt bezocht
2. Controleer of de service worker correct is geregistreerd (zie browser ontwikkelaarstools)
3. Herlaad de app met een internetverbinding

### Installatie prompt verschijnt niet
1. Wacht 30 seconden na het laden van de app
2. Controleer of je de app niet al hebt geïnstalleerd
3. Controleer of je de prompt niet eerder hebt weggedrukt
4. Leeg je browser data en probeer opnieuw

### Updates
De app wordt automatisch bijgewerkt wanneer:
- Je online bent
- Er een nieuwe versie beschikbaar is
- Je de app opnieuw opstart

## Contact en ondersteuning

Voor vragen over de PWA installatie of functionaliteit:
- Gebruik de feedback functie in de app
- Raadpleeg de help sectie binnen de app
- Neem contact op met de ontwikkelaars via de reguliere kanalen

---

*Deze documentatie wordt bijgewerkt naarmate nieuwe PWA features worden toegevoegd.*