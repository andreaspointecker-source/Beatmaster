/**
 * BEATMASTER – Audio Preview Helper
 *
 * Löst stabile iTunes trackIds dynamisch zu aktuellen Preview-URLs auf.
 * Verhindert kaputte/abgelaufene CDN-Links durch Live-Lookup.
 *
 * Ablauf:
 *   1. Song hat itunesTrackId → iTunes Lookup API anfragen
 *   2. Erfolg → frische previewUrl zurückgeben
 *   3. Lookup schlägt fehl / offline → Fallback auf gespeichertes audioUrl
 *   4. Kein audioUrl → null (Audio wird übersprungen)
 */

const ITUNES_LOOKUP = 'https://itunes.apple.com/lookup?id=';
const LOOKUP_TIMEOUT_MS = 4000;

/**
 * Holt eine frische, gültige Preview-URL für einen Song.
 * @param {Object} song - Firestore-Songdokument
 * @returns {Promise<string|null>} - Preview-URL oder null
 */
export async function getPreviewUrl(song) {
    // Kein trackId – direkt Fallback
    if (!song?.itunesTrackId) {
        return song?.audioUrl || null;
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), LOOKUP_TIMEOUT_MS);

        const response = await fetch(
            `${ITUNES_LOOKUP}${song.itunesTrackId}&country=de`,
            { signal: controller.signal }
        );
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();

        const result = data?.results?.[0];
        if (result?.previewUrl) {
            return result.previewUrl;
        }

        // Lookup erfolgreich aber kein previewUrl → Fallback
        console.warn(`[AudioHelper] Kein previewUrl für trackId ${song.itunesTrackId}`);
        return song?.audioUrl || null;

    } catch (e) {
        if (e.name === 'AbortError') {
            console.warn(`[AudioHelper] Lookup Timeout für "${song.title}"`);
        } else {
            console.warn(`[AudioHelper] Lookup fehlgeschlagen für "${song.title}":`, e.message);
        }
        // Fallback: gespeicherte URL verwenden
        return song?.audioUrl || null;
    }
}
