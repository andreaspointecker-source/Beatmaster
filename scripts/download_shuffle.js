const fs = require('fs');
const https = require('https');

// Bekannte zuverlässige Quelle (Freesound über freesound.org API Demos oder Wikimedia/Internet Archive)
// Wikipedia Commons: Shuffling Cards (Ogg format falls expo es nimmt, besser wav/mp3)
// Nehmen wir was von archive.org:
const url = "https://archive.org/download/card-shuffle/card_shuffle.mp3";

const file = fs.createWriteStream("assets/sounds/shuffle.mp3");

const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        https.get(res.headers.location, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res2) => {
            res2.pipe(file);
            file.on('finish', () => console.log('Downloaded redirect, size:', fs.statSync("assets/sounds/shuffle.mp3").size));
        });
    } else {
        res.pipe(file);
        file.on('finish', () => console.log('Downloaded, size:', fs.statSync("assets/sounds/shuffle.mp3").size));
    }
}).on('error', (e) => console.error(e));
