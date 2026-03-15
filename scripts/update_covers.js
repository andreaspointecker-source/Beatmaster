const admin = require("firebase-admin");
const https = require("https");
const serviceAccount = require("./serviceAccountKey.json");

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: "beatmaster-1111",
    });
}
const db = admin.firestore();

const ITUNES_LOOKUP = 'https://itunes.apple.com/lookup?id=';

function fetchCover(trackId) {
    return new Promise((resolve, reject) => {
        const req = https.get(`${ITUNES_LOOKUP}${trackId}&country=de`, { timeout: 10000 }, (res) => {
            let data = "";
            res.on("data", c => data += c);
            res.on("end", () => {
                try { 
                    const parsed = JSON.parse(data);
                    const result = parsed?.results?.[0];
                    if (result && result.artworkUrl100) {
                        resolve(result.artworkUrl100.replace('100x100bb.jpg', '512x512bb.jpg'));
                    } else {
                        resolve(null);
                    }
                } catch (e) { 
                    resolve(null);
                }
            });
        });
        req.on("error", () => resolve(null));
        req.on("timeout", () => { req.destroy(); resolve(null); });
    });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
    console.log("Starte Cover-Update-Script...");
    
    const snap = await db.collection("songs").get();
    let updated = 0;
    
    for (const doc of snap.docs) {
        const data = doc.data();
        if (!data.coverUrl && data.itunesTrackId) {
            console.log(`Suche Cover für: ${data.title} (${data.itunesTrackId})`);
            const coverUrl = await fetchCover(data.itunesTrackId);
            
            if (coverUrl) {
                await doc.ref.update({ coverUrl });
                console.log(`  ✅ Cover gefunden!`);
                updated++;
            } else {
                console.log(`  ❌ Kein Cover verfügbar.`);
            }
            await sleep(200);
        }
    }
    
    console.log(`\nFertig! Es wurden ${updated} Songs mit einem Cover aktualisiert.`);
    process.exit(0);
}

run();
