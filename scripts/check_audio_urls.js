/**
 * BEATMASTER – Audio URL Checker & Fixer
 * Prüft alle Songs in Firestore ob der audioUrl erreichbar ist.
 * Fehlende / kaputte URLs werden automatisch via iTunes API ersetzt.
 *
 * Ausfuehren mit:
 *   node scripts/check_audio_urls.js
 *
 * Mit Auto-Fix:
 *   node scripts/check_audio_urls.js --fix
 */

const admin = require('firebase-admin');
const https = require('https');
const http = require('http');

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'beatmaster-1111',
});
const db = admin.firestore();

const AUTO_FIX = process.argv.includes('--fix');

// ─── HTTP HEAD-Check (prüft ob URL erreichbar ist) ────────────────────────
function checkUrl(url) {
    return new Promise((resolve) => {
        if (!url || url.trim() === '') {
            return resolve({ ok: false, status: 0, reason: 'Leer' });
        }
        const lib = url.startsWith('https') ? https : http;
        try {
            const req = lib.request(url, { method: 'HEAD', timeout: 8000 }, (res) => {
                resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, status: res.statusCode });
            });
            req.on('error', (e) => resolve({ ok: false, status: 0, reason: e.message }));
            req.on('timeout', () => { req.destroy(); resolve({ ok: false, status: 0, reason: 'Timeout' }); });
            req.end();
        } catch (e) {
            resolve({ ok: false, status: 0, reason: e.message });
        }
    });
}

// ─── iTunes Suche ─────────────────────────────────────────────────────────
function searchItunes(term) {
    return new Promise((resolve, reject) => {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&country=de&media=music&limit=3`;
        const req = https.get(url, { timeout: 10000 }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(e); }
            });
        });
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('iTunes Timeout')); });
    });
}

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

// ─── Haupt-Logik ──────────────────────────────────────────────────────────
async function run() {
    console.log('='.repeat(60));
    console.log(' BEATMASTER – Audio URL Checker');
    if (AUTO_FIX) console.log(' Modus: AUTO-FIX aktiv');
    console.log('='.repeat(60) + '\n');

    const snapshot = await db.collection('songs').get();
    const songs = snapshot.docs.map(d => ({ docId: d.id, ...d.data() }));

    console.log(`${songs.length} Songs gefunden. Starte Prüfung...\n`);

    const broken = [];
    const missing = [];
    const ok = [];

    for (const song of songs) {
        const label = `"${song.title}" – ${song.artist} (${song.year || '?'})`;

        if (!song.audioUrl || song.audioUrl.trim() === '') {
            console.log(`❌ LEER     ${label}`);
            missing.push(song);
            continue;
        }

        const result = await checkUrl(song.audioUrl);
        if (result.ok) {
            console.log(`✅ OK       ${label}`);
            ok.push(song);
        } else {
            console.log(`⚠️  DEFEKT  ${label}  [${result.status || result.reason}]`);
            broken.push(song);
        }

        await sleep(300); // API nicht überlasten
    }

    // ─── Zusammenfassung ─────────────────────────────
    console.log('\n' + '='.repeat(60));
    console.log(` ERGEBNIS: ${ok.length} OK  |  ${missing.length} fehlend  |  ${broken.length} defekt`);
    console.log('='.repeat(60));

    const toFix = [...missing, ...broken];

    if (toFix.length === 0) {
        console.log('\n🎉 Alle URLs sind in Ordnung!\n');
        process.exit(0);
    }

    if (!AUTO_FIX) {
        console.log(`\n💡 Starte mit --fix um ${toFix.length} URLs automatisch zu reparieren:\n`);
        console.log('   node scripts/check_audio_urls.js --fix\n');
        process.exit(0);
    }

    // ─── Auto-Fix ────────────────────────────────────
    console.log(`\n🔧 Starte Auto-Fix für ${toFix.length} Songs...\n`);

    let fixed = 0;
    let failed = 0;

    for (const song of toFix) {
        const label = `"${song.title}" – ${song.artist}`;
        const searchTerm = `${song.artist} ${song.title}`;
        console.log(`🔍 Suche: ${searchTerm}`);

        try {
            const result = await searchItunes(searchTerm);

            if (result.results && result.results.length > 0) {
                const match = result.results.find(r => r.previewUrl) || result.results[0];

                if (match && match.previewUrl) {
                    await db.collection('songs').doc(song.docId).update({
                        audioUrl: match.previewUrl,
                        appleMusicUrl: match.trackViewUrl || song.appleMusicUrl || '',
                    });
                    console.log(`  ✅ Repariert: ${match.previewUrl.substring(0, 70)}...\n`);
                    fixed++;
                } else {
                    console.log(`  ❌ Kein Preview-URL in Ergebnissen\n`);
                    failed++;
                }
            } else {
                console.log(`  ❌ Keine iTunes-Ergebnisse\n`);
                failed++;
            }

            await sleep(600);
        } catch (e) {
            console.error(`  ❌ Fehler: ${e.message}\n`);
            failed++;
        }
    }

    console.log('='.repeat(60));
    console.log(` AUTO-FIX ABGESCHLOSSEN: ${fixed} repariert | ${failed} fehlgeschlagen`);
    console.log('='.repeat(60) + '\n');
    process.exit(0);
}

run().catch(err => {
    console.error('Kritischer Fehler:', err);
    process.exit(1);
});
