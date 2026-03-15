# BEATMASTER – Firebase Datenstruktur Referenz

> Letzte Aktualisierung: März 2025  
> Dieses Dokument beschreibt exakt wie Songs und Playlisten in Firestore gespeichert sein müssen, damit die App korrekt funktioniert.

---

## 📁 Collection: `playlists`

Jede Playlist ist ein Dokument in der Collection `playlists`.  
Die **Dokument-ID** ist gleichzeitig die `playlistId` aller zugehörigen Songs.

### Alle Playlisten im Überblick

| Dokument-ID    | Name             | 🔒 `locked` | Beschreibung |
|----------------|------------------|-------------|----------------------------|
| `starter`      | Starter          | `false`     | Kostenlose Basis-Playlist  |
| `soundtracks`  | Film & Serien    | `true`      | 24h per Werbung freischaltbar |
| `schlager`     | Schlager         | `true`      | 24h per Werbung freischaltbar |

### Beispiel-Dokument: `playlists/soundtracks`

```json
{
  "name":        "Film & Serien",
  "description": "Unvergessliche Hits aus Filmen und Serien",
  "icon":        "🎬",
  "locked":      true,
  "order":       2,
  "createdAt":   "2025-03-10T20:00:00Z"
}
```

### Alle Felder der `playlists` Collection

| Feld          | Typ        | Pflicht | Beschreibung |
|---------------|------------|---------|--------------|
| `name`        | `string`   | ✅ Ja   | Anzeigename der Playlist (z.B. `"Schlager Hits"`) |
| `description` | `string`   | ✅ Ja   | Kurzbeschreibung (z.B. `"Die größten Schlager aller Zeiten"`) |
| `icon`        | `string`   | ✅ Ja   | Emoji-Icon (z.B. `"🎶"`, `"🎸"`, `"💿"`) |
| `locked`      | `boolean`  | ✅ Ja   | `false` = dauerhaft freigeschaltet (Stammplaylist) · `true` = nur per 24h Werbung freischaltbar |
| `createdAt`   | `timestamp`| ⚠️ Empfohlen | Firestore Server-Timestamp |

### Playlist-Typen

| `locked`  | Bedeutung | Wo sichtbar |
|-----------|-----------|-------------|
| `false`   | Immer verfügbar, keine Freischaltung nötig | „Meine Playlisten" |
| `true`    | Nur nach Werbe-Video für **24 Stunden** freischaltbar | „Freischaltbar (24H)" |

---

## 📁 Collection: `songs`

Alle Songs aller Playlisten liegen in **einer gemeinsamen Collection** `songs`.  
Die Zuordnung zur Playlist erfolgt über das Feld `playlistId`.

### Beispiel-Dokument: `songs/{autoId}`

```json
{
  "title":          "Atemlos durch die Nacht",
  "artist":         "Helene Fischer",
  "year":           2013,
  "decade":         "2010s",
  "genre":          "Schlager",
  "playlistId":     "schlager",

  "itunesTrackId":  1544490669,
  "audioUrl":       "https://audio-ssl.itunes.apple.com/...",

  "appleMusicUrl":  "https://music.apple.com/de/album/atemlos-durch-die-nacht/...",
  "coverUrl":       "https://is1-ssl.mzstatic.com/image/thumb/.../512x512bb.jpg",
  "affiliateUrl":   null,

  "addedAt":        "2025-03-09T17:00:00Z"
}
```

### Alle Felder der `songs` Collection

| Feld             | Typ        | Pflicht | Beschreibung |
|------------------|------------|---------|--------------|
| `title`          | `string`   | ✅ Ja   | Songtitel (z.B. `"Bohemian Rhapsody"`) |
| `artist`         | `string`   | ✅ Ja   | Künstler / Band (z.B. `"Queen"`) |
| `year`           | `number`   | ✅ Ja   | Erscheinungsjahr als Zahl (z.B. `1975`) – **kein String!** |
| `decade`         | `string`   | ✅ Ja   | Jahrzehnt-String (z.B. `"1970s"`, `"2020s"`) – wird aus `year` berechnet |
| `genre`          | `string`   | ✅ Ja   | Musikgenre (siehe Tabelle unten) |
| `playlistId`     | `string`   | ✅ Ja   | Muss exakt der Dokument-ID der Playlist entsprechen (z.B. `"schlager"`) |
| `itunesTrackId`  | `number`   | ✅ **Pflicht** | Stabile numerische iTunes Track-ID – **ohne gültige ID darf ein Song nicht hinzugefügt werden** |
| `audioUrl`       | `string`   | ✅ **Pflicht** | iTunes CDN-Vorschau-Link (30 Sek.) – **Song ist ohne Audio-Vorschau nicht spielbar und muss ersetzt werden** |
| `appleMusicUrl`  | `string`   | ⚠️ Empfohlen | Direktlink zur Apple Music Song-Seite |
| `coverUrl`       | `string`   | ⚠️ Empfohlen | URL zum Album-/Song-Cover (vorzugsweise 512x512px) |
| `affiliateUrl`   | `string\|null` | ⏳ Ausstehend | **Apple Affiliate Link** – wird hinzugefügt sobald das Partnerprogramm genehmigt ist (derzeit `null`) |
| `film`           | `string`   | ➕ Optional | Nur für Soundtrack-Playlisten: Titel des Films / der Serie (z.B. `"Titanic"`, `"Friends"`) |
| `addedAt`        | `timestamp`| ⚠️ Empfohlen | Firestore Server-Timestamp |

> [!CAUTION]
> **Songs ohne `itunesTrackId` oder ohne erreichbare Audio-Vorschau dürfen nicht in der Datenbank bleiben.**  
> Das Spiel ist ohne Audio-Clip nicht funktionsfähig. Songs die keinen iTunes-Preview-Track haben **müssen durch einen gleichwertigen Song ersetzt werden.**

---

## 🎸 Gültige Genre-Werte

Nur diese Werte werden in der App als Filter angeboten. Groß-/Kleinschreibung wird ignoriert.

| Genre        | Beispiel-Künstler |
|--------------|-------------------|
| `Pop`        | Ed Sheeran, Harry Styles |
| `Rock`       | Queen, Nirvana, Journey |
| `Hip-Hop`    | Eminem, Kendrick Lamar |
| `R&B`        | Beyoncé, Usher |
| `R&B & Soul` | Aretha Franklin, Stevie Wonder |
| `Schlager`   | Helene Fischer, Udo Jürgens |
| `Electronic` | Daft Punk, Kraftwerk |
| `Jazz`       | Miles Davis, Norah Jones |
| `Classic`    | Beethoven, Mozart |
| `Latin`      | Bad Bunny, Shakira, J Balvin |
| `Metal`      | Metallica, Rammstein, AC/DC |
| `Reggae`     | Bob Marley, Sean Paul |
| `Country`    | Johnny Cash, Taylor Swift |
| `Blues`      | B.B. King, Eric Clapton |

---

## 📅 Gültige Dekaden-Werte

Wird aus dem `year` Feld berechnet. Format: `"YYYYs"` (4-stellige Jahreszahl + `s`)

| Wert     | Bedeutung      |
|----------|----------------|
| `1920s`  | 1920 – 1929    |
| `1930s`  | 1930 – 1939    |
| `1940s`  | 1940 – 1949    |
| `1950s`  | 1950 – 1959    |
| `1960s`  | 1960 – 1969    |
| `1970s`  | 1970 – 1979    |
| `1980s`  | 1980 – 1989    |
| `1990s`  | 1990 – 1999    |
| `2000s`  | 2000 – 2009    |
| `2010s`  | 2010 – 2019    |
| `2020s`  | 2020 – 2029    |

> **Formel:** `decade = "${Math.floor(year / 10) * 10}s"`  
> Beispiel: `year = 1983` → `decade = "1980s"`

---

## 🔊 Audio-Vorschau Logik

Die App holt Audiodaten **dynamisch zur Spielzeit** – gespeicherte URLs dienen nur als Fallback:

```
1. Song hat itunesTrackId
       ↓
2. GET https://itunes.apple.com/lookup?id={itunesTrackId}&country=de
       ↓
3. Erfolg → previewUrl aus Antwort verwenden (immer frisch)
       ↓
4. Fehler / Timeout (> 4s) → Fallback auf gespeichertes audioUrl
       ↓
```markdown
5. audioUrl auch leer → Song überspringen & nächsten Song laden
```
```

> ⚠️ **Wichtig:** `audioUrl` direkt in Firestore zu speichern ist nur als Notfall-Cache gedacht.  
> iTunes CDN-URLs laufen ab und sollten **nicht** als primäre Quelle genutzt werden.

---

## 🔗 Apple Affiliate Link (ausstehend)

> **Status:** Bewerbung beim Apple Performance Partners Programm läuft (über Partnerize).  
> Genehmigung dauert ca. 1–5 Werktage.

Sobald genehmigt, wird das Feld `affiliateUrl` bei jedem Song befüllt:

```json
{
  "affiliateUrl": "https://music.apple.com/de/album/...?at=AFFILIATE_TOKEN"
}
```

Das Format: normaler `appleMusicUrl` + `?at={dein_affiliate_token}` als Query-Parameter.

**Wo wird es in der App genutzt:**
- Im Auflösungs-Screen (`TIMER_NACH`-Phase) als "In Apple Music öffnen"-Button
- Jeder Klick = mögliche Provision wenn der User einen Song kauft/streamt

---

## 🛠️ Utility Scripts

| Script | Befehl | Wofür |
|--------|--------|-------|
| `seed_starter_50.js` | `node scripts/seed_starter_50.js` | Starter-Songs (50 internationale Hits) hinzufügen |
| `seed_schlager_50.js` | `node scripts/seed_schlager_50.js` | Schlager-Playlist erweitern (50 Songs) |
| `seed_soundtracks.js` | `node scripts/seed_soundtracks.js` | Film & Serien Playlist anlegen + 30 Songs |
| `replace_no_preview.js` | `node scripts/replace_no_preview.js` | Songs ohne Preview durch Alternativen ersetzen |
| `update_track_ids.js` | `node scripts/update_track_ids.js` | Alle fehlenden iTunes TrackIDs ergänzen |
| `check_songs.js` | `node scripts/check_songs.js` | Alle Songs prüfen (fehlende Felder anzeigen) |
| `check_songs.js --fix` | `node scripts/check_songs.js --fix` | Fehlende Felder automatisch ergänzen |

---

## ✅ Checkliste: Neuen Song hinzufügen

- [ ] `title` – Songtitel korrekt
- [ ] `artist` – Künstlername korrekt
- [ ] `year` – als **Zahl** (nicht String)
- [ ] `decade` – korrekt aus `year` berechnet (z.B. `"1980s"`)
- [ ] `genre` – einer der gültigen Genre-Werte
- [ ] `playlistId` – exakte Dokument-ID der Playlist
- [ ] `itunesTrackId` – über iTunes Search API ermitteln
- [ ] `audioUrl` – aktueller Vorschau-Link (optional, wird dynamisch geholt)
- [ ] `appleMusicUrl` – direkter Apple Music Link
- [ ] `affiliateUrl` – ⏳ wird ergänzt nach Affiliate-Genehmigung

---

## ✅ Checkliste: Neue Playlist anlegen

- [ ] Dokument-ID wählen (z.B. `"jazz"`, `"80s"`) – **kein Leerzeichen, keine Sonderzeichen**
- [ ] `name` – Anzeigename
- [ ] `description` – Kurzbeschreibung
- [ ] `icon` – passendes Emoji
- [ ] `locked: false` (dauerhaft) oder `locked: true` (24h per Werbung)
- [ ] Songs mit korrekter `playlistId` anlegen
- [ ] Script `check_songs.js` ausführen um Felder zu validieren
