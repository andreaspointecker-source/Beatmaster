/**
 * BEATMASTER – Song Field Checker + Auto-Fix
 * Prüft alle Songs auf fehlende genre/year/decade Felder
 * und ergänzt sie automatisch via iTunes Lookup API.
 *
 *   node scripts/check_songs.js          → nur prüfen
 *   node scripts/check_songs.js --fix    → fehlende Felder ergänzen
 */

const admin = require('firebase-admin');
const https = require('https');

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'beatmaster-1111',
});
const db = admin.firestore();
const AUTO_FIX = process.argv.includes('--fix');

function lookupByTrackId(trackId) {
    return new Promise((resolve, reject) => {
        const url = `https://itunes.apple.com/lookup?id=${trackId}&country=de`;
        const req = https.get(url, { timeout: 8000 }, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    });
}

function searchItunes(artist, title) {
    return new Promise((resolve, reject) => {
        const term = encodeURIComponent(`${artist} ${title}`);
        const url = `https://itunes.apple.com/search?term=${term}&country=de&media=music&limit=3`;
        const req = https.get(url, { timeout: 8000 }, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    });
}

function decadeFromYear(year) {
    if (!year || isNaN(year)) return null;
    return `${Math.floor(parseInt(year) / 10) * 10}s`;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Bekannte Genre-Zuordnungen (wenn iTunes keinen liefert)
const GENRE_HINTS = {
    'helene fischer': 'Schlager',
    'nena': 'Rock',
    'udo jürgens': 'Schlager',
    'spider murphy gang': 'Rock',
    'jürgen drews': 'Schlager',
    'the weeknd': 'Pop',
    'nirvana': 'Rock',
    'queen': 'Rock',
    'ed sheeran': 'Pop',
    'michael jackson': 'Pop',
    'eminem': 'Hip-Hop',
    'journey': 'Rock',
    'harry styles': 'Pop',
};

function guessGenre(artist, itunesGenre) {
    if (itunesGenre && itunesGenre !== 'Music' && itunesGenre !== 'Musik') return itunesGenre;
    const key = artist?.toLowerCase().trim();
    return GENRE_HINTS[key] || null;
}

async function run() {
    console.log('='.repeat(60));
    console.log(` BEATMASTER – Song Checker${AUTO_FIX ? ' + Auto-Fix' : ''}`);
    console.log('='.repeat(60) + '\n');

    const snapshot = await db.collection('songs').get();
    const songs = snapshot.docs.map(d => ({ docId: d.id, ...d.data() }));
    console.log(`Gesamt: ${songs.length} Songs\n`);

    let ok = 0, issues = 0, fixed = 0;

    for (const song of songs) {
        const missing = [];
        if (!song.genre) missing.push('genre');
        if (!song.year) missing.push('year');
        if (!song.decade) missing.push('decade');
        if (!song.itunesTrackId) missing.push('itunesTrackId');

        const status = missing.length === 0 ? '✅' : '⚠️ ';
        const label = `"${song.title}" – ${song.artist}`;

        if (missing.length === 0) {
            console.log(`${status} ${label}`);
            console.log(`     genre=${song.genre}  year=${song.year}  decade=${song.decade}  trackId=${song.itunesTrackId}\n`);
            ok++;
            continue;
        }

        console.log(`${status} ${label}`);
        console.log(`     FEHLT: ${missing.join(', ')}`);
        issues++;

        if (!AUTO_FIX) { console.log(''); continue; }

        // ── Auto-Fix ──────────────────────────────────────────
        try {
            let itunesData = null;
            if (song.itunesTrackId) {
                const res = await lookupByTrackId(song.itunesTrackId);
                itunesData = res?.results?.[0];
            }
            if (!itunesData) {
                const res = await searchItunes(song.artist, song.title);
                itunesData = res?.results?.find(r => r.trackId);
            }

            const updates = {};
            if (!song.year && itunesData?.releaseDate) {
                updates.year = new Date(itunesData.releaseDate).getFullYear();
            } else if (!song.year && song.year !== 0) {
                // Jahr bleibt leer – muss manuell gesetzt werden
            }
            if (!song.decade && (updates.year || song.year)) {
                updates.decade = decadeFromYear(updates.year || song.year);
            }
            if (!song.genre) {
                const g = guessGenre(song.artist, itunesData?.primaryGenreName);
                if (g) updates.genre = g;
            }
            if (!song.itunesTrackId && itunesData?.trackId) {
                updates.itunesTrackId = itunesData.trackId;
            }

            if (Object.keys(updates).length > 0) {
                await db.collection('songs').doc(song.docId).update(updates);
                console.log(`     → Gefixt: ${JSON.stringify(updates)}`);
                fixed++;
            } else {
                console.log(`     → Keine Daten gefunden – manuell nötig`);
            }
            await sleep(500);
        } catch (e) {
            console.error(`     → Fehler: ${e.message}`);
        }
        console.log('');
    }

    console.log('='.repeat(60));
    console.log(` ERGEBNIS: ${ok} OK | ${issues} mit Problemen${AUTO_FIX ? ` | ${fixed} gefixt` : ''}`);
    if (!AUTO_FIX && issues > 0) {
        console.log(`\n Tipp: node scripts/check_songs.js --fix   um automatisch zu reparieren`);
    }
    console.log('='.repeat(60) + '\n');
    process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
