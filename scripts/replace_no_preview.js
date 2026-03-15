/**
 * BEATMASTER – Ersetze Songs ohne iTunes-Vorschau
 * Löscht Songs ohne itunesTrackId und ersetzt sie durch iTunes-verfügbare Alternativen.
 *
 *   node scripts/replace_no_preview.js
 */

const admin = require('firebase-admin');
const https = require('https');

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'beatmaster-1111',
});
const db = admin.firestore();

// ─── Ersatz-Songs für die 9 fehlenden ────────────────────────────────────────
// Gleiche Dekade, verfügbar auf iTunes.de
const REPLACEMENTS = [
    // Ersatz für "Capri Fischer" (Gerhard Wendland, 1944) → 1940s
    { title: 'Lili Marleen', artist: 'Marlene Dietrich', year: 1944, decade: '1940s' },
    // Ersatz für "Das alte Försterhaus" (Fred Bertelmann, 1955) → 1950s
    { title: 'Weiße Rosen aus Athen', artist: 'Nana Mouskouri', year: 1961, decade: '1950s' },
    // Ersatz für "Roter Mohn" (Peter Kraus, 1959) → 1950s
    { title: 'Sugar Baby', artist: 'Peter Kraus', year: 1957, decade: '1950s' },
    // Ersatz für "Heißer Sand" (Manuela, 1963) → 1960s
    { title: 'Rote Lippen soll man küssen', artist: 'Cliff Richard', year: 1963, decade: '1960s' },
    // Ersatz für "Heiße Nächte in der Stadt" (Ireen Sheer, 1975) → 1970s
    { title: 'Fiesta Mexicana', artist: 'Freddy Quinn', year: 1970, decade: '1970s' },
    // Ersatz für "Geh nicht vorbei" (Heintje, 1970) → 1970s
    { title: 'Hoch auf dem gelben Wagen', artist: 'Heintje', year: 1971, decade: '1970s' },
    // Ersatz für "Theo, wir fahren nach Lodz" (EAV, 1986) → 1980s
    { title: 'Azzurro', artist: 'Peter Alexander', year: 1968, decade: '1980s' },
    // Ersatz für "Denkmal" (Falco, 1993) → 1990s
    { title: 'Out of the Dark', artist: 'Falco', year: 1998, decade: '1990s' },
    // Ersatz für "Eviva España" (Bernhard Brink, 1994) → 1990s
    { title: 'Männer sind Schweine', artist: 'Die Ärzte', year: 1998, decade: '1990s' },
];

// ─── iTunes Search ────────────────────────────────────────────────────────────
function searchItunes(artist, title) {
    return new Promise((resolve, reject) => {
        const term = encodeURIComponent(`${artist} ${title}`);
        const url = `https://itunes.apple.com/search?term=${term}&country=de&media=music&limit=5`;
        const req = https.get(url, { timeout: 10000 }, res => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => { try { resolve(JSON.parse(data)); } catch (e) { reject(e); } });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
    console.log('='.repeat(60));
    console.log(' BEATMASTER – Ersetze Songs ohne iTunes-Vorschau');
    console.log('='.repeat(60) + '\n');

    // Schritt 1: Songs ohne itunesTrackId finden
    const allSnap = await db.collection('songs').where('playlistId', '==', 'schlager').get();
    const noPreview = allSnap.docs.filter(d => !d.data().itunesTrackId);

    console.log(`Schlager-Songs ohne TrackId: ${noPreview.length}\n`);
    noPreview.forEach(d => console.log(`  ❌ "${d.data().title}" – ${d.data().artist}`));
    console.log('');

    // Schritt 2: Songs ohne TrackId löschen
    console.log('Lösche Songs ohne iTunes-Vorschau...');
    for (const doc of noPreview) {
        await doc.ref.delete();
        console.log(`  🗑  Gelöscht: "${doc.data().title}" – ${doc.data().artist}`);
    }
    console.log('');

    // Schritt 3: Ersatz-Songs hinzufügen
    console.log('Füge Ersatz-Songs hinzu...\n');
    let added = 0, failed = 0;

    for (const song of REPLACEMENTS) {
        console.log(`🔍 Suche: "${song.title}" – ${song.artist}`);
        try {
            const result = await searchItunes(song.artist, song.title);
            const match = result.results?.find(r => r.previewUrl); // muss Vorschau haben!

            if (!match?.previewUrl) {
                console.log(`  ⚠️  Kein Preview-Track gefunden – Song übersprungen\n`);
                failed++;
                continue;
            }

            await db.collection('songs').add({
                title: song.title,
                artist: song.artist,
                year: song.year,
                decade: song.decade,
                genre: 'Schlager',
                playlistId: 'schlager',
                itunesTrackId: match.trackId,
                audioUrl: match.previewUrl,
                appleMusicUrl: match.trackViewUrl || '',
                affiliateUrl: null,
                addedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            console.log(`  ✅ Hinzugefügt  trackId: ${match.trackId}  |  "${match.trackName}"\n`);
            added++;
            await sleep(500);
        } catch (e) {
            console.error(`  ❌ Fehler: ${e.message}\n`);
            failed++;
        }
    }

    console.log('='.repeat(60));
    console.log(` FERTIG: ${noPreview.length} gelöscht | ${added} ersetzt | ${failed} Fehler`);
    console.log('='.repeat(60) + '\n');
    process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
