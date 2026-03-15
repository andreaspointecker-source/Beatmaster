/**
 * BEATMASTER – Update Schlager Audio URLs
 * Holt fehlende Audio-Preview-URLs über die iTunes Search API
 * und aktualisiert die Firestore-Dokumente.
 *
 * Ausfuehren mit:
 *   node scripts/update_schlager_audio.js
 */

const admin = require('firebase-admin');
const https = require('https');

// Serviceaccount wiederverwenden
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'beatmaster-1111',
});

const db = admin.firestore();

// ─── iTunes Suche ──────────────────────────────────────────────────────────
function searchItunes(term) {
    return new Promise((resolve, reject) => {
        const encoded = encodeURIComponent(term);
        const url = `https://itunes.apple.com/search?term=${encoded}&country=de&media=music&limit=3`;
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

// ─── Songs die fehlende Audio-URLs haben ──────────────────────────────────
// Wir suchen nach allen Schlager-Songs mit leerer audioUrl
async function updateMissingAudioUrls() {
    console.log('Suche Schlager-Songs ohne Audio-URL...\n');

    const snapshot = await db.collection('songs')
        .where('playlistId', '==', 'schlager')
        .get();

    const toUpdate = snapshot.docs.filter(doc => !doc.data().audioUrl);

    if (toUpdate.length === 0) {
        console.log('✅ Alle Songs haben bereits eine Audio-URL!');
        process.exit(0);
    }

    console.log(`${toUpdate.length} Songs ohne Audio-URL gefunden:\n`);

    for (const songDoc of toUpdate) {
        const song = songDoc.data();
        const searchTerm = `${song.artist} ${song.title}`;
        console.log(`🔍 Suche: "${searchTerm}"...`);

        try {
            const result = await searchItunes(searchTerm);

            if (result.results && result.results.length > 0) {
                // Nimm das erste Ergebnis mit einem Preview-URL
                const match = result.results.find(r => r.previewUrl) || result.results[0];

                if (match && match.previewUrl) {
                    await db.collection('songs').doc(songDoc.id).update({
                        audioUrl: match.previewUrl,
                        appleMusicUrl: match.trackViewUrl || song.appleMusicUrl || '',
                    });
                    console.log(`  ✓ Audio-URL gefunden & gespeichert: ${match.previewUrl.substring(0, 60)}...`);
                    console.log(`    → Track: "${match.trackName}" von ${match.artistName} (${match.releaseDate?.substring(0, 4)})\n`);
                } else {
                    console.log(`  ⚠ Kein Preview-URL in den Ergebnissen gefunden\n`);
                }
            } else {
                console.log(`  ⚠ Keine Ergebnisse für "${searchTerm}"\n`);
            }

            // Kurze Pause um die iTunes API nicht zu überlasten
            await new Promise(r => setTimeout(r, 500));

        } catch (e) {
            console.error(`  ✗ Fehler bei "${searchTerm}":`, e.message);
        }
    }

    console.log('\n🎉 Update abgeschlossen!');
    process.exit(0);
}

updateMissingAudioUrls().catch(err => {
    console.error('Fehler:', err);
    process.exit(1);
});
