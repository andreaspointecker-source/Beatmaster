/**
 * BEATMASTER – Starter Pack Erweiterung (50 Songs)
 * Fügt 50 internationale Top-Hits (1924–2026) zur Starter-Playlist hinzu.
 * Holt iTunes TrackIds + Audio-URLs automatisch via Search API.
 *
 *   node scripts/seed_starter_50.js
 */

const admin = require('firebase-admin');
const https = require('https');

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'beatmaster-1111',
});
const db = admin.firestore();

// ─── 50 internationale Top-Hits ─────────────────────────────────────────────
const SONGS = [
    // 1920s
    { title: "Rhapsody in Blue", artist: "George Gershwin", year: 1924, genre: "Classic", decade: "1920s" },
    { title: "Singin' in the Rain", artist: "Gene Kelly", year: 1929, genre: "Classic", decade: "1920s" },

    // 1930s
    { title: "Over the Rainbow", artist: "Judy Garland", year: 1939, genre: "Classic", decade: "1930s" },
    { title: "Moonlight Serenade", artist: "Glenn Miller", year: 1939, genre: "Jazz", decade: "1930s" },

    // 1940s
    { title: "White Christmas", artist: "Bing Crosby", year: 1942, genre: "Classic", decade: "1940s" },
    { title: "Boogie Woogie Bugle Boy", artist: "Andrews Sisters", year: 1941, genre: "Jazz", decade: "1940s" },

    // 1950s
    { title: "Hound Dog", artist: "Elvis Presley", year: 1956, genre: "Rock", decade: "1950s" },
    { title: "Johnny B. Goode", artist: "Chuck Berry", year: 1958, genre: "Rock", decade: "1950s" },
    { title: "Rock Around the Clock", artist: "Bill Haley", year: 1954, genre: "Rock", decade: "1950s" },
    { title: "Great Balls of Fire", artist: "Jerry Lee Lewis", year: 1957, genre: "Rock", decade: "1950s" },

    // 1960s
    { title: "Hey Jude", artist: "The Beatles", year: 1968, genre: "Rock", decade: "1960s" },
    { title: "Yesterday", artist: "The Beatles", year: 1965, genre: "Rock", decade: "1960s" },
    { title: "Respect", artist: "Aretha Franklin", year: 1967, genre: "R&B & Soul", decade: "1960s" },
    { title: "Like a Rolling Stone", artist: "Bob Dylan", year: 1965, genre: "Rock", decade: "1960s" },
    { title: "Purple Haze", artist: "Jimi Hendrix", year: 1967, genre: "Rock", decade: "1960s" },
    { title: "What a Wonderful World", artist: "Louis Armstrong", year: 1967, genre: "Jazz", decade: "1960s" },
    { title: "Good Vibrations", artist: "The Beach Boys", year: 1966, genre: "Rock", decade: "1960s" },

    // 1970s
    { title: "Hotel California", artist: "Eagles", year: 1977, genre: "Rock", decade: "1970s" },
    { title: "Stairway to Heaven", artist: "Led Zeppelin", year: 1971, genre: "Rock", decade: "1970s" },
    { title: "Dancing Queen", artist: "ABBA", year: 1976, genre: "Pop", decade: "1970s" },
    { title: "Stayin' Alive", artist: "Bee Gees", year: 1977, genre: "Pop", decade: "1970s" },
    { title: "I Will Survive", artist: "Gloria Gaynor", year: 1978, genre: "Pop", decade: "1970s" },
    { title: "Superstition", artist: "Stevie Wonder", year: 1972, genre: "R&B & Soul", decade: "1970s" },

    // 1980s
    { title: "Sweet Child O' Mine", artist: "Guns N' Roses", year: 1988, genre: "Rock", decade: "1980s" },
    { title: "With or Without You", artist: "U2", year: 1987, genre: "Rock", decade: "1980s" },
    { title: "Take on Me", artist: "a-ha", year: 1985, genre: "Pop", decade: "1980s" },
    { title: "Girls Just Want to Have Fun", artist: "Cyndi Lauper", year: 1983, genre: "Pop", decade: "1980s" },
    { title: "Every Breath You Take", artist: "The Police", year: 1983, genre: "Rock", decade: "1980s" },
    { title: "Livin' on a Prayer", artist: "Bon Jovi", year: 1986, genre: "Rock", decade: "1980s" },
    { title: "Africa", artist: "Toto", year: 1982, genre: "Rock", decade: "1980s" },
    { title: "Sweet Dreams (Are Made of This)", artist: "Eurythmics", year: 1983, genre: "Pop", decade: "1980s" },
    { title: "Under Pressure", artist: "Queen", year: 1981, genre: "Rock", decade: "1980s" },

    // 1990s
    { title: "Wonderwall", artist: "Oasis", year: 1995, genre: "Rock", decade: "1990s" },
    { title: "Creep", artist: "Radiohead", year: 1992, genre: "Rock", decade: "1990s" },
    { title: "...Baby One More Time", artist: "Britney Spears", year: 1998, genre: "Pop", decade: "1990s" },
    { title: "Wannabe", artist: "Spice Girls", year: 1996, genre: "Pop", decade: "1990s" },
    { title: "Gangsta's Paradise", artist: "Coolio", year: 1995, genre: "Hip-Hop", decade: "1990s" },
    { title: "My Heart Will Go On", artist: "Celine Dion", year: 1997, genre: "Pop", decade: "1990s" },
    { title: "Losing My Religion", artist: "R.E.M.", year: 1991, genre: "Rock", decade: "1990s" },

    // 2000s
    { title: "Hey Ya!", artist: "OutKast", year: 2003, genre: "Hip-Hop", decade: "2000s" },
    { title: "Crazy in Love", artist: "Beyoncé", year: 2003, genre: "Pop", decade: "2000s" },
    { title: "Mr. Brightside", artist: "The Killers", year: 2003, genre: "Rock", decade: "2000s" },
    { title: "Umbrella", artist: "Rihanna", year: 2007, genre: "Pop", decade: "2000s" },
    { title: "Rehab", artist: "Amy Winehouse", year: 2006, genre: "R&B & Soul", decade: "2000s" },

    // 2010s
    { title: "Rolling in the Deep", artist: "Adele", year: 2010, genre: "Pop", decade: "2010s" },
    { title: "Happy", artist: "Pharrell Williams", year: 2013, genre: "Pop", decade: "2010s" },
    { title: "Uptown Funk", artist: "Mark Ronson", year: 2014, genre: "Pop", decade: "2010s" },
    { title: "Despacito", artist: "Luis Fonsi", year: 2017, genre: "Latin", decade: "2010s" },
    { title: "Shallow", artist: "Lady Gaga", year: 2018, genre: "Pop", decade: "2010s" },

    // 2020s
    { title: "Levitating", artist: "Dua Lipa", year: 2020, genre: "Pop", decade: "2020s" },
    { title: "drivers license", artist: "Olivia Rodrigo", year: 2021, genre: "Pop", decade: "2020s" },
    { title: "Easy On Me", artist: "Adele", year: 2021, genre: "Pop", decade: "2020s" },
    { title: "Anti-Hero", artist: "Taylor Swift", year: 2022, genre: "Pop", decade: "2020s" },
    { title: "Flowers", artist: "Miley Cyrus", year: 2023, genre: "Pop", decade: "2020s" },
    { title: "Espresso", artist: "Sabrina Carpenter", year: 2024, genre: "Pop", decade: "2020s" },
    { title: "Die With A Smile", artist: "Lady Gaga", year: 2024, genre: "Pop", decade: "2020s" },
    { title: "APT.", artist: "ROSÉ", year: 2024, genre: "Pop", decade: "2020s" },
];

// ─── iTunes Search API ───────────────────────────────────────────────────────
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

// ─── Haupt-Funktion ──────────────────────────────────────────────────────────
async function run() {
    console.log('='.repeat(60));
    console.log(' BEATMASTER – Starter Pack Erweiterung (50 Songs)');
    console.log('='.repeat(60) + '\n');

    // Bestehende Songs laden um Duplikate zu vermeiden
    const existingSnap = await db.collection('songs')
        .where('playlistId', '==', 'starter').get();
    const existing = new Set(
        existingSnap.docs.map(d => `${d.data().title?.toLowerCase()}|${d.data().artist?.toLowerCase()}`)
    );
    console.log(`${existing.size} Songs bereits in Starter vorhanden\n`);

    let added = 0, skipped = 0, failed = 0;

    for (const song of SONGS) {
        const key = `${song.title.toLowerCase()}|${song.artist.toLowerCase()}`;
        if (existing.has(key)) {
            console.log(`⏭  Übersprungen (doppelt): "${song.title}" – ${song.artist}`);
            skipped++;
            continue;
        }

        console.log(`🔍 Suche: "${song.title}" – ${song.artist} (${song.year})`);
        try {
            const result = await searchItunes(song.artist, song.title);
            const match = result.results?.find(r => r.trackId);

            const songData = {
                title: song.title,
                artist: song.artist,
                year: song.year,
                decade: song.decade,
                genre: song.genre,
                playlistId: 'starter',
                itunesTrackId: match?.trackId || null,
                audioUrl: match?.previewUrl || '',
                appleMusicUrl: match?.trackViewUrl || '',
                coverUrl: match?.artworkUrl100 ? match.artworkUrl100.replace('100x100bb.jpg', '512x512bb.jpg') : null,
                affiliateUrl: null,
                addedAt: admin.firestore.FieldValue.serverTimestamp(),
            };

            await db.collection('songs').add(songData);

            if (match) {
                console.log(`  ✅ Hinzugefügt  trackId: ${match.trackId}  |  "${match.trackName}"\n`);
            } else {
                console.log(`  ⚠️  Hinzugefügt ohne iTunes-Match\n`);
            }
            added++;
            await sleep(400);

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
