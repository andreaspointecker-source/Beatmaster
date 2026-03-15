const fs = require('fs');
const path = require('path');

const sampleRate = 44100;
const numChannels = 1;
const bitsPerSample = 16;
const numSamples = sampleRate * 1.5; // 1.5 seconds

const buffer = Buffer.alloc(44 + numSamples * 2);

// WAV Header
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + numSamples * 2, 4);
buffer.write('WAVE', 8);
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(numChannels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * numChannels * 2, 28);
buffer.writeUInt16LE(numChannels * 2, 32);
buffer.writeUInt16LE(bitsPerSample, 34);
buffer.write('data', 36);
buffer.writeUInt32LE(numSamples * 2, 40);

// Generate PCM
let offset = 44;
const numBursts = 5;
const samplesPerBurst = numSamples / numBursts;

for (let i = 0; i < numSamples; i++) {
    const burstIndex = Math.floor(i / samplesPerBurst);
    const posInBurst = i % samplesPerBurst;

    // Envelope: quick attack, slower decay, some space
    const burstLength = samplesPerBurst * 0.8;
    let envelope = 0;

    if (posInBurst < burstLength) {
        if (posInBurst < samplesPerBurst * 0.1) {
            envelope = posInBurst / (samplesPerBurst * 0.1);
        } else {
            envelope = 1.0 - ((posInBurst - samplesPerBurst * 0.1) / (burstLength - samplesPerBurst * 0.1));
        }
    }

    let noise = Math.random() * 2 - 1;
    // simple low pass to sound more like cards, less like harsh static
    if (i > 0) {
        noise = (noise + Math.random() * 2 - 1) * 0.3;
    }

    let sampleVal = noise * envelope * 20000;
    if (sampleVal > 32767) sampleVal = 32767;
    if (sampleVal < -32768) sampleVal = -32768;

    buffer.writeInt16LE(sampleVal, offset);
    offset += 2;
}

fs.writeFileSync(path.join(__dirname, '../assets/sounds/shuffle.wav'), buffer);
// delete the old mp3
try { fs.unlinkSync(path.join(__dirname, '../assets/sounds/shuffle.mp3')); } catch (e) { }
console.log('Generated shuffle.wav successfully');
