/**
 * BEATMASTER – Firestore Seed Script
 * Legt die Schlager-Playlist + 5 Songs in Firebase an.
 *
 * Ausfuehren mit:
 *   node scripts/seed_schlager.js
 *
 * Voraussetzung: firebase-admin muss installiert sein.
 * npm install --save-dev firebase-admin
 *
 * Schritt 1: Falls noch nicht vorhanden, lade einen Service Account Key
 *   herunter unter: https://console.firebase.google.com/project/beatmaster-1111/settings/serviceaccounts/adminsdk
 *   und speichere ihn als: scripts/serviceAccountKey.json
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'beatmaster-1111',
});

const db = admin.firestore();

async function seed() {
    console.log('Starte Seeding der Schlager-Playlist...\n');

    // ─── 1. Playlist-Dokument anlegen ────────────────────────────────
    const playlistId = 'schlager';
    await db.collection('playlists').doc(playlistId).set({
        name: 'Schlager Hits',
        description: 'Die grössten Schlager aller Zeiten',
        icon: '🎶',
        locked: true, // Freischaltbar per Werbung
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('✓ Playlist "Schlager Hits" angelegt (ID: schlager)');

    // ─── 2. Songs anlegen ────────────────────────────────────────────
    // Apple Music Previews: Öffentlich zugängliche 30-Sekunden-Vorschauen
    // Diese Links können zuerst leer gelassen und später über das Admin-Panel ergänzt werden.
    const songs = [
        {
            title: 'Atemlos durch die Nacht',
            artist: 'Helene Fischer',
            year: 2013,
            genre: 'Schlager',
            decade: '2010s',
            playlistId: 'schlager',
            audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/3f/8a/2f/3f8a2f3b-72f1-6d3e-8e41-5bc0c3e31a92/mzaf_9162025041302543374.plus.aac.p.m4a',
            appleMusicUrl: 'https://music.apple.com/de/album/atemlos-durch-die-nacht/678564889?i=678564890',
        },
        {
            title: '99 Luftballons',
            artist: 'Nena',
            year: 1983,
            genre: 'Schlager',
            decade: '1980s',
            playlistId: 'schlager',
            audioUrl: 'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/c8/a8/22/c8a82268-b9bc-1eaa-e7a0-a8ee57a78e72/mzaf_13498388779734264849.plus.aac.p.m4a',
            appleMusicUrl: 'https://music.apple.com/de/album/99-luftballons/327481780?i=327481784',
        },
        {
            title: 'Griechischer Wein',
            artist: 'Udo Jürgens',
            year: 1974,
            genre: 'Schlager',
            decade: '1970s',
            playlistId: 'schlager',
            audioUrl: '',
            appleMusicUrl: 'https://music.apple.com/de/album/griechischer-wein/716417793?i=716417812',
        },
        {
            title: 'Skandal im Sperrbezirk',
            artist: 'Spider Murphy Gang',
            year: 1981,
            genre: 'Schlager',
            decade: '1980s',
            playlistId: 'schlager',
            audioUrl: '',
            appleMusicUrl: 'https://music.apple.com/de/album/skandal-im-sperrbezirk/1443862552?i=1443862565',
        },
        {
            title: 'Ein Bett im Kornfeld',
            artist: 'Jürgen Drews',
            year: 1976,
            genre: 'Schlager',
            decade: '1970s',
            playlistId: 'schlager',
            audioUrl: '',
            appleMusicUrl: 'https://music.apple.com/de/album/ein-bett-im-kornfeld/722041278?i=722041279',
        },
    ];

    for (const song of songs) {
        const songRef = await db.collection('songs').add({
            ...song,
            addedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log(`✓ Song angelegt: "${song.title}" – ${song.artist} (${song.year})  ID: ${songRef.id}`);
    }

    console.log('\n🎉 Seeding abgeschlossen!');
    console.log('Die Schlager-Playlist ist jetzt in Firebase unter:\n  playlists/schlager  und  songs/* (playlistId: "schlager")\n');
    process.exit(0);
}

seed().catch(err => {
    console.error('Fehler beim Seeding:', err);
    process.exit(1);
});
