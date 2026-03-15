/**
 * BEATMASTER – iTunes Track ID Updater
 * Holt für alle Songs in Firestore die stabile iTunes trackId
 * und schreibt sie ins Dokument. Nur einmal nötig.
 *
 *   node scripts/update_track_ids.js
 */

const admin = require('firebase-admin');
const https = require('https');

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'beatmaster-1111',
});
const db = admin.firestore();

function searchItunes(artist, title) {
    return new Promise((resolve, reject) => {
        const term = encodeURIComponent(`${artist} ${title}`);
        const url = `https://itunes.apple.com/search?term=${term}&country=de&media=music&limit=3`;
        const req = https.get(url, { timeout: 10000 }, res => {
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

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
    console.log('='.repeat(55));
    console.log(' BEATMASTER – Track ID Updater');
    console.log('='.repeat(55) + '\n');

    const snapshot = await db.collection('songs').get();
    const songs = snapshot.docs.map(d => ({ docId: d.id, ...d.data() }));

    const toUpdate = songs.filter(s => !s.itunesTrackId);
    const alreadyDone = songs.length - toUpdate.length;

    console.log(`Gesamt: ${songs.length} Songs`);
    console.log(`Bereits mit TrackId: ${alreadyDone}`);
    console.log(`Zu aktualisieren: ${toUpdate.length}\n`);

    let fixed = 0, failed = 0;

    for (const song of toUpdate) {
        const label = `"${song.title}" – ${song.artist}`;
        console.log(`🔍 ${label}`);
        try {
            const result = await searchItunes(song.artist, song.title);
            const match = result.results?.find(r => r.trackId && r.previewUrl);

            if (match) {
                await db.collection('songs').doc(song.docId).update({
                    itunesTrackId: match.trackId,
                    // Frische URL direkt auch als aktuellen Cache speichern
                    audioUrl: match.previewUrl,
                });
                console.log(`  ✅ trackId: ${match.trackId}  |  "${match.trackName}"\n`);
                fixed++;
            } else {
                console.log(`  ⚠️  Kein Treffer mit previewUrl\n`);
                failed++;
            }
            await sleep(500);
        } catch (e) {
            console.error(`  ❌ Fehler: ${e.message}\n`);
            failed++;
        }
    }

    console.log('='.repeat(55));
    console.log(` FERTIG: ${fixed} aktualisiert | ${failed} fehlgeschlagen`);
    console.log('='.repeat(55) + '\n');
    process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
