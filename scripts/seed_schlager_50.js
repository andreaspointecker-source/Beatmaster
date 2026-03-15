/**
 * BEATMASTER – Schlager Playlist Erweiterung (50 Songs)
 * Fügt 50 Schlager-Hits aus allen Jahrzehnten 1920–2020s hinzu.
 *
 *   node scripts/seed_schlager_50.js
 */

const admin = require('firebase-admin');
const https = require('https');

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'beatmaster-1111',
});
const db = admin.firestore();

// ─── 50 Schlager-Hits über alle Jahrzehnte ──────────────────────────────────
const SONGS = [
    // 1920s
    { title: 'Veronika, der Lenz ist da', artist: 'Die Comedian Harmonists', year: 1930, decade: '1920s' },
    { title: 'Du bist das Glück für mich', artist: 'Richard Tauber', year: 1926, decade: '1920s' },

    // 1930s
    { title: 'Lili Marleen', artist: 'Lale Andersen', year: 1939, decade: '1930s' },
    { title: 'Schön ist die Welt', artist: 'Richard Tauber', year: 1934, decade: '1930s' },
    { title: 'Ein Freund, ein guter Freund', artist: 'Die Comedian Harmonists', year: 1931, decade: '1930s' },

    // 1940s
    { title: 'Capri Fischer', artist: 'Gerhard Wendland', year: 1944, decade: '1940s' },
    { title: 'In der Nacht ist der Mensch nicht gern alleine', artist: 'Caterina Valente', year: 1949, decade: '1940s' },

    // 1950s
    { title: 'Heimweh', artist: 'Freddy Quinn', year: 1956, decade: '1950s' },
    { title: 'Das alte Försterhaus', artist: 'Fred Bertelmann', year: 1955, decade: '1950s' },
    { title: 'Marina', artist: 'Rocco Granata', year: 1959, decade: '1950s' },
    { title: 'Roter Mohn', artist: 'Peter Kraus', year: 1959, decade: '1950s' },
    { title: 'Ich will keine Schokolade', artist: 'Trude Herr', year: 1957, decade: '1950s' },

    // 1960s
    { title: 'Mendocino', artist: 'Michael Holm', year: 1969, decade: '1960s' },
    { title: 'Marmor, Stein und Eisen bricht', artist: 'Drafi Deutscher', year: 1965, decade: '1960s' },
    { title: 'Heißer Sand', artist: 'Manuela', year: 1963, decade: '1960s' },
    { title: 'Schuld war nur der Bossa Nova', artist: 'Caterina Valente', year: 1962, decade: '1960s' },
    { title: 'Junge, komm bald wieder', artist: 'Freddy Quinn', year: 1963, decade: '1960s' },
    { title: 'Mama', artist: 'Heintje', year: 1967, decade: '1960s' },
    { title: 'Ciao Ciao Bambina', artist: 'Peter Alexander', year: 1959, decade: '1960s' },
    { title: 'Er hat ein knallrotes Gummiboot', artist: 'Wencke Myhre', year: 1969, decade: '1960s' },

    // 1970s
    { title: 'Mit 66 Jahren', artist: 'Udo Jürgens', year: 1977, decade: '1970s' },
    { title: 'Aber bitte mit Sahne', artist: 'Udo Jürgens', year: 1976, decade: '1970s' },
    { title: 'Moskau', artist: 'Dschinghis Khan', year: 1979, decade: '1970s' },
    { title: 'Tränen lügen nicht', artist: 'Michael Holm', year: 1973, decade: '1970s' },
    { title: 'Er gehört zu mir', artist: 'Marianne Rosenberg', year: 1975, decade: '1970s' },
    { title: 'Wunder gibt es immer wieder', artist: 'Katja Ebstein', year: 1970, decade: '1970s' },
    { title: 'Heiße Nächte in der Stadt', artist: 'Ireen Sheer', year: 1975, decade: '1970s' },
    { title: 'Geh nicht vorbei', artist: 'Heintje', year: 1970, decade: '1970s' },

    // 1980s
    { title: 'Rock Me Amadeus', artist: 'Falco', year: 1985, decade: '1980s' },
    { title: 'Herzilein', artist: 'Wildecker Herzbuben', year: 1989, decade: '1980s' },
    { title: 'Da Da Da', artist: 'Trio', year: 1982, decade: '1980s' },
    { title: 'Theo, wir fahren nach Lodz', artist: 'EAV', year: 1986, decade: '1980s' },
    { title: 'Jeanny', artist: 'Falco', year: 1985, decade: '1980s' },
    { title: 'Ein bißchen Frieden', artist: 'Nicole', year: 1982, decade: '1980s' },
    { title: 'Vienna Calling', artist: 'Falco', year: 1986, decade: '1980s' },
    { title: 'Über sieben Brücken mußt du gehn', artist: 'Peter Maffay', year: 1987, decade: '1980s' },

    // 1990s
    { title: 'Anton aus Tirol', artist: 'DJ Ötzi', year: 1999, decade: '1990s' },
    { title: 'Denkmal', artist: 'Falco', year: 1993, decade: '1990s' },
    { title: 'Eviva España', artist: 'Bernhard Brink', year: 1994, decade: '1990s' },
    { title: 'Wahnsinn', artist: 'Wolfgang Petry', year: 1992, decade: '1990s' },
    { title: 'Schwarz auf Weiß', artist: 'Wolfgang Petry', year: 1998, decade: '1990s' },

    // 2000s
    { title: 'Hey Baby (Uhh, Ahh)', artist: 'DJ Ötzi', year: 2000, decade: '2000s' },
    { title: 'Ein Stern (der deinen Namen trägt)', artist: 'DJ Ötzi', year: 2004, decade: '2000s' },
    { title: 'Sehnsucht', artist: 'Helene Fischer', year: 2007, decade: '2000s' },
    { title: 'Von hier bis zur Ewigkeit', artist: 'Howard Carpendale', year: 2005, decade: '2000s' },
    { title: 'Du hast mein Herz gebrochen', artist: 'Andrea Berg', year: 2000, decade: '2000s' },

    // 2010s
    { title: 'Phänomen', artist: 'Helene Fischer', year: 2014, decade: '2010s' },
    { title: 'Herzbeben', artist: 'Helene Fischer', year: 2012, decade: '2010s' },
    { title: 'Cordula Grün', artist: 'Josh', year: 2018, decade: '2010s' },
    { title: 'Bis ich dich vergesse', artist: 'Shari', year: 2019, decade: '2010s' },

    // 2020s
    { title: 'Layla', artist: 'DJ Robin & Schürze', year: 2022, decade: '2020s' },
    { title: 'Ich leg alles nieder', artist: 'Andrea Berg', year: 2021, decade: '2020s' },
];

// ─── iTunes Search ───────────────────────────────────────────────────────────
function searchItunes(artist, title) {
    return new Promise((resolve, reject) => {
        const term = encodeURIComponent(`${artist} ${title}`);
        const url = `https://itunes.apple.com/search?term=${term}&country=de&media=music&limit=5`;
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
    console.log('='.repeat(60));
    console.log(' BEATMASTER – Schlager Erweiterung (50 Songs)');
    console.log('='.repeat(60) + '\n');

    // Bestehende Schlager-Songs laden (Duplikate vermeiden)
    const existingSnap = await db.collection('songs').where('playlistId', '==', 'schlager').get();
    const existing = new Set(
        existingSnap.docs.map(d => `${d.data().title?.toLowerCase()}|${d.data().artist?.toLowerCase()}`)
    );
    console.log(`${existing.size} Songs bereits in Schlager vorhanden\n`);

    let added = 0, skipped = 0, failed = 0;

    for (const song of SONGS) {
        const key = `${song.title.toLowerCase()}|${song.artist.toLowerCase()}`;
        if (existing.has(key)) {
            console.log(`⏭  Übersprungen: "${song.title}" – ${song.artist}`);
            skipped++;
            continue;
        }

        console.log(`🔍 Suche: "${song.title}" – ${song.artist} (${song.year})`);
        try {
            const result = await searchItunes(song.artist, song.title);
            const match = result.results?.find(r => r.trackId);

            await db.collection('songs').add({
                title: song.title,
                artist: song.artist,
                year: song.year,
                decade: song.decade,
                genre: 'Schlager',
                playlistId: 'schlager',
                itunesTrackId: match?.trackId || null,
                audioUrl: match?.previewUrl || '',
                appleMusicUrl: match?.trackViewUrl || '',
                affiliateUrl: null,
                addedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            console.log(match
                ? `  ✅ trackId: ${match.trackId}  |  "${match.trackName}"\n`
                : `  ⚠️  Hinzugefügt ohne iTunes-Match\n`
            );
            added++;
            await sleep(500);
        } catch (e) {
            console.error(`  ❌ Fehler: ${e.message}\n`);
            failed++;
        }
    }

    console.log('='.repeat(60));
    console.log(` FERTIG: ${added} hinzugefügt | ${skipped} doppelt | ${failed} Fehler`);
    console.log('='.repeat(60) + '\n');
    process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
