/**
 * BEATMASTER – Letzte 3 Ersatz-Songs (gesichert mit Preview-Check)
 *   node scripts/replace_last3.js
 */

const admin = require('firebase-admin');
const https = require('https');

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'beatmaster-1111',
});
const db = admin.firestore();

// Gesicherte Alternativen – iTunes.de Preview vorhanden
const SONGS = [
    // Ersatz für 1970s (Fiesta Mexicana / Hoch auf dem gelben Wagen)
    { title: 'Genghis Khan', artist: 'Dschinghis Khan', year: 1979, decade: '1970s' },
    { title: 'Wir sind die Kinder', artist: 'Dschinghis Khan', year: 1980, decade: '1970s' },
    // Ersatz für 1980s (Azzurro)
    { title: 'Du', artist: 'Peter Maffay', year: 1970, decade: '1980s' },
];

function searchItunes(artist, title) {
    return new Promise((resolve, reject) => {
        const term = encodeURIComponent(`${artist} ${title}`);
        const url = `https://itunes.apple.com/search?term=${term}&country=de&media=music&limit=10`;
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
    console.log('Letzte 3 Ersatz-Songs\n');
    let added = 0;

    for (const song of SONGS) {
        console.log(`🔍 "${song.title}" – ${song.artist}`);
        try {
            const result = await searchItunes(song.artist, song.title);
            const match = result.results?.find(r => r.previewUrl);
            if (!match) { console.log('  ⚠️  Kein Preview – übersprungen\n'); continue; }

            await db.collection('songs').add({
                title: song.title, artist: song.artist,
                year: song.year, decade: song.decade,
                genre: 'Schlager', playlistId: 'schlager',
                itunesTrackId: match.trackId, audioUrl: match.previewUrl,
                appleMusicUrl: match.trackViewUrl || '', affiliateUrl: null,
                addedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log(`  ✅ trackId: ${match.trackId} | "${match.trackName}"\n`);
            added++;
            await sleep(600);
        } catch (e) {
            console.error(`  ❌ ${e.message}\n`);
        }
    }

    console.log(`Fertig: ${added}/${SONGS.length} hinzugefügt`);
    process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
