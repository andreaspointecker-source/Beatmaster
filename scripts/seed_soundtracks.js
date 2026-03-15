/**
 * BEATMASTER – Film & Serien Soundtracks Playlist + 30 Songs
 * Legt die neue Playlist an und befüllt sie.
 *
 *   node scripts/seed_soundtracks.js
 */

const admin = require('firebase-admin');
const https = require('https');

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'beatmaster-1111',
});
const db = admin.firestore();

const PLAYLIST_ID = 'soundtracks';

// ─── 30 Film & Serien Soundtrack-Hits ───────────────────────────────────────
const SONGS = [
    // 1960s
    { title: 'Moon River', artist: 'Andy Williams', year: 1962, decade: '1960s', genre: 'Classic', film: 'Breakfast at Tiffany\'s' },
    { title: 'Goldfinger', artist: 'Shirley Bassey', year: 1964, decade: '1960s', genre: 'Classic', film: 'James Bond: Goldfinger' },
    { title: 'The Sound of Silence', artist: 'Simon & Garfunkel', year: 1966, decade: '1960s', genre: 'Rock', film: 'The Graduate' },

    // 1970s
    { title: 'Live and Let Die', artist: 'Wings', year: 1973, decade: '1970s', genre: 'Rock', film: 'James Bond: Live and Let Die' },
    { title: 'You\'re the One That I Want', artist: 'John Travolta & Olivia Newton-John', year: 1978, decade: '1970s', genre: 'Pop', film: 'Grease' },
    { title: 'Summer Nights', artist: 'John Travolta & Olivia Newton-John', year: 1978, decade: '1970s', genre: 'Pop', film: 'Grease' },
    { title: 'Nobody Does It Better', artist: 'Carly Simon', year: 1977, decade: '1970s', genre: 'Pop', film: 'James Bond: The Spy Who Loved Me' },

    // 1980s
    { title: 'Eye of the Tiger', artist: 'Survivor', year: 1982, decade: '1980s', genre: 'Rock', film: 'Rocky III' },
    { title: 'Footloose', artist: 'Kenny Loggins', year: 1984, decade: '1980s', genre: 'Pop', film: 'Footloose' },
    { title: 'Ghostbusters', artist: 'Ray Parker Jr.', year: 1984, decade: '1980s', genre: 'Pop', film: 'Ghostbusters' },
    { title: 'Against All Odds', artist: 'Phil Collins', year: 1984, decade: '1980s', genre: 'Pop', film: 'Against All Odds' },
    { title: 'Take My Breath Away', artist: 'Berlin', year: 1986, decade: '1980s', genre: 'Pop', film: 'Top Gun' },
    { title: 'Danger Zone', artist: 'Kenny Loggins', year: 1986, decade: '1980s', genre: 'Pop', film: 'Top Gun' },
    { title: 'Don\'t You (Forget About Me)', artist: 'Simple Minds', year: 1985, decade: '1980s', genre: 'Rock', film: 'The Breakfast Club' },
    { title: 'In the Air Tonight', artist: 'Phil Collins', year: 1981, decade: '1980s', genre: 'Pop', film: 'Miami Vice' },
    { title: 'Running Up That Hill', artist: 'Kate Bush', year: 1985, decade: '1980s', genre: 'Pop', film: 'Stranger Things' },
    { title: 'Purple Rain', artist: 'Prince', year: 1984, decade: '1980s', genre: 'Pop', film: 'Purple Rain' },

    // 1990s
    { title: 'Unchained Melody', artist: 'Righteous Brothers', year: 1990, decade: '1990s', genre: 'Classic', film: 'Ghost' },
    { title: 'A Whole New World', artist: 'Peabo Bryson', year: 1992, decade: '1990s', genre: 'Pop', film: 'Aladdin' },
    { title: 'I Will Always Love You', artist: 'Whitney Houston', year: 1992, decade: '1990s', genre: 'R&B & Soul', film: 'The Bodyguard' },
    { title: 'Circle of Life', artist: 'Elton John', year: 1994, decade: '1990s', genre: 'Pop', film: 'The Lion King' },
    { title: 'Can You Feel the Love Tonight', artist: 'Elton John', year: 1994, decade: '1990s', genre: 'Pop', film: 'The Lion King' },
    { title: 'Colors of the Wind', artist: 'Vanessa Williams', year: 1995, decade: '1990s', genre: 'Pop', film: 'Pocahontas' },
    { title: 'I\'ll Be There for You', artist: 'The Rembrandts', year: 1995, decade: '1990s', genre: 'Pop', film: 'Friends' },
    { title: 'My Heart Will Go On', artist: 'Celine Dion', year: 1997, decade: '1990s', genre: 'Pop', film: 'Titanic' },
    { title: 'I Don\'t Want to Miss a Thing', artist: 'Aerosmith', year: 1998, decade: '1990s', genre: 'Rock', film: 'Armageddon' },
    { title: 'Iris', artist: 'Goo Goo Dolls', year: 1998, decade: '1990s', genre: 'Rock', film: 'City of Angels' },

    // 2000s
    { title: 'Lady Marmalade', artist: 'Christina Aguilera', year: 2001, decade: '2000s', genre: 'Pop', film: 'Moulin Rouge!' },
    { title: 'Stand by Me', artist: 'Ben E. King', year: 2000, decade: '2000s', genre: 'R&B & Soul', film: 'Stand by Me' },

    // 2010s
    { title: 'Skyfall', artist: 'Adele', year: 2012, decade: '2010s', genre: 'Pop', film: 'James Bond: Skyfall' },
    { title: 'Let It Go', artist: 'Idina Menzel', year: 2013, decade: '2010s', genre: 'Pop', film: 'Frozen' },
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
    console.log(' BEATMASTER – Film & Serien Soundtracks');
    console.log('='.repeat(60) + '\n');

    // Schritt 1: Playlist anlegen / überschreiben
    await db.collection('playlists').doc(PLAYLIST_ID).set({
        name: 'Film & Serien',
        icon: '🎬',
        description: 'Unvergessliche Hits aus Filmen und Serien',
        locked: true,    // nur durch Werbe-Clip freischaltbar
        order: 2,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✅ Playlist "Film & Serien" angelegt (locked: true)\n');

    // Schritt 2: Songs hinzufügen
    let added = 0, failed = 0;

    for (const song of SONGS) {
        console.log(`🔍 "${song.title}" – ${song.artist} (${song.film})`);
        try {
            const result = await searchItunes(song.artist, song.title);
            const match = result.results?.find(r => r.previewUrl);

            if (!match?.previewUrl) {
                console.log(`  ⚠️  Kein Preview – übersprungen\n`);
                failed++;
                continue;
            }

            await db.collection('songs').add({
                title: song.title,
                artist: song.artist,
                year: song.year,
                decade: song.decade,
                genre: song.genre,
                playlistId: PLAYLIST_ID,
                film: song.film,        // Extra-Feld: Filmtitel
                itunesTrackId: match.trackId,
                audioUrl: match.previewUrl,
                appleMusicUrl: match.trackViewUrl || '',
                affiliateUrl: null,
                addedAt: admin.firestore.FieldValue.serverTimestamp(),
            });

            console.log(`  ✅ trackId: ${match.trackId}  |  "${match.trackName}"\n`);
            added++;
            await sleep(450);
        } catch (e) {
            console.error(`  ❌ Fehler: ${e.message}\n`);
            failed++;
        }
    }

    console.log('='.repeat(60));
    console.log(` FERTIG: ${added} hinzugefügt | ${failed} ohne Preview / Fehler`);
    console.log('='.repeat(60) + '\n');
    process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
