const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'beatmaster-1111',
    });
}
const db = admin.firestore();

const playlists = [
    { id: '80s', name: '80s Hits', description: 'Die besten Songs der 80er', icon: '📼', locked: true },
    { id: '90s', name: '90s Throwback', description: 'Grunge, Pop & Eurodance', icon: '💿', locked: true },
    { id: 'hiphop', name: 'Hip-Hop Classics', description: 'Golden Age bis heute', icon: '🎤', locked: true },
    { id: 'deutsch', name: 'Deutsche Hits', description: 'Schlager bis Deutschrap', icon: '🇩🇪', locked: true },
    { id: 'rock', name: 'Rock Anthems', description: 'Classic Rock bis Alternative', icon: '🎸', locked: true },
];

async function run() {
    for (const p of playlists) {
        await db.collection('playlists').doc(p.id).set({
            name: p.name,
            description: p.description,
            icon: p.icon,
            locked: p.locked,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
        console.log('Created playlist doc:', p.id);
    }
    console.log('Done.');
    process.exit(0);
}
run().catch(console.error);
