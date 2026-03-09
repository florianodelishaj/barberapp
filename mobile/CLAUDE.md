# BarberX Mobile — Design Context

## Design Context

### Users
Range ampio (18–50+): dai clienti giovani abituati ad app come Uber/Glovo, agli adulti di quartiere che vogliono prenotare velocemente senza telefonate. Il contesto d'uso è mobile-first, spesso in movimento o in attesa. L'obiettivo principale è prenotare uno slot in meno di 30 secondi.

### Brand Personality
**Moderno · Pulito · Professionale** — il design è stato creato custom su Figma dall'autore del progetto, non ispirato a prodotti di terzi. L'identità è originale e deve restare coerente con le scelte già prese.

### Aesthetic Direction
- **Tema:** dark mode esclusivo — background `#1C1C1C`, surface `#242424`
- **Accent:** rosso corallo `#FA3D3B` — usato con parsimonia (solo CTA primari, stati attivi, badge importanti)
- **Tipografia:** Sora (Google Fonts) — peso 300/400 per body, 600/700 per heading, 800 solo per valori hero (prezzi, numeri grandi)
- **Forma:** pill buttons (radius 100px), card con radius 16px, input con radius 28px — nessuna forma spigolosa
- **Gradient:** left-side accent gradient sulle card per aggiungere profondità senza rumore visivo
- **Anti-pattern:** no colori vivaci multipli, no ombre forti, no UI "app bancaria" fredda, no aesthetic playful/cartoon

### Design Principles
1. **Velocità percepita** — ogni schermata deve avere un'azione primaria chiara e immediata; zero ambiguità
2. **Gerarchia visiva forte** — testo hero con Sora ExtraBold, poi scaling netto verso i dettagli secondari
3. **Dark-first, mai dual-mode** — nessun compromesso per light mode; i token sono ottimizzati per il dark
4. **Accent sparingly** — il rosso `#FA3D3B` ha impatto perché usato poco; non usarlo per elementi secondari
5. **Coerenza con Figma** — il design source of truth è Figma; ogni nuova UI deve rispettare i token esistenti in `lib/tokens.ts` e `tailwind.config.js`

### Token Reference
| Token | Valore | Uso |
|-------|--------|-----|
| background | `#1C1C1C` | Sfondi schermata |
| surface | `#242424` | Card, input, elementi elevati |
| accent | `#FA3D3B` | CTA primari, stati attivi, badge |
| text-primary | `#F0F0F0` | Testo principale |
| text-secondary | `#C6C6C6` | Label, descrizioni |
| text-muted | `#444444` | Testo disabilitato, placeholder |
| success | `#4CD98A` | Conferme, stati positivi |
| Button height | `54px` | Altezza standard pulsanti |
| Input height | `54px` | Altezza standard input |
| Card radius | `16px` | Radius card/superficie |
| Input radius | `28px` | Radius input field |
| Pill radius | `100px` | Radius bottoni |
| Screen padding | `24px` | Padding orizzontale pagina |
