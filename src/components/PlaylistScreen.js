import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    LayoutAnimation,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';
import { db } from '../config/firebase';
import { theme } from '../styles/theme';

// LayoutAnimation auf Android aktivieren
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Playlisten die per Werbung freischaltbar sind
const UNLOCKABLE_PLAYLISTS = [
    { id: '80s', name: '80s Hits', description: 'Die besten Songs der 80er', icon: '📼', previewSongs: ['Take On Me', 'Wake Me Up', 'Don\'t You'] },
    { id: '90s', name: '90s Throwback', description: 'Grunge, Pop & Eurodance', icon: '💿', previewSongs: ['Smells Like Teen Spirit', 'Wannabe', 'Macarena'] },
    { id: 'hiphop', name: 'Hip-Hop Classics', description: 'Golden Age bis heute', icon: '🎤', previewSongs: ['Lose Yourself', 'In Da Club', 'HUMBLE.'] },
    { id: 'deutsch', name: 'Deutsche Hits', description: 'Schlager bis Deutschrap', icon: '🇩🇪', previewSongs: ['99 Luftballons', 'Atemlos', 'Palmen aus Plastik'] },
    { id: 'rock', name: 'Rock Anthems', description: 'Classic Rock bis Alternative', icon: '🎸', previewSongs: ['Bohemian Rhapsody', 'Eye of the Tiger', 'Sweet Child O\' Mine'] },
];

// ─── Storage-Format: { [playlistId]: { unlockedAt, durationMs, streak } } ───
const STORAGE_KEY = 'beatmaster_unlocked_playlists_v2';
const UNLOCK_DURATION_MS = 24 * 60 * 60 * 1000; // 24 Stunden
const GRACE_PERIOD_MS = 12 * 60 * 60 * 1000; // 12 Stunden
const BONUS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 Tage

/** Gibt null zurück wenn abgelaufen, sonst verbleibende Ms */
function getRemainingMs(unlockData) {
    if (!unlockData) return null;
    let unlockedAt = typeof unlockData === 'number' ? unlockData : unlockData.unlockedAt;
    let durationMs = typeof unlockData === 'number' ? UNLOCK_DURATION_MS : (unlockData.durationMs || UNLOCK_DURATION_MS);

    if (!unlockedAt) return null;
    const elapsed = Date.now() - unlockedAt;
    const remaining = durationMs - elapsed;
    return remaining > 0 ? remaining : null;
}

function formatCountdown(ms) {
    if (ms <= 0) return '00:00:00';
    const totalSec = Math.floor(ms / 1000);
    const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
}

// ─────────────────────────────────────────────────────────────
// Mock-Funktion: Simuliert eine Rewarded Ad.
// ─────────────────────────────────────────────────────────────
async function showRewardedAd(onRewarded) {
    return new Promise((resolve) => {
        Alert.alert(
            '🎬 Werbung anschauen',
            'Schau dir eine kurze Werbung an und schalte die Playlist für 24 Stunden frei!',
            [
                { text: 'Abbrechen', style: 'cancel', onPress: () => resolve(false) },
                {
                    text: '▶ Jetzt anschauen',
                    onPress: () => {
                        Alert.alert('📺 Werbung läuft...', 'Bitte warte kurz...', [], { cancelable: false });
                        setTimeout(() => {
                            onRewarded();
                            resolve(true);
                        }, 3000);
                    }
                }
            ]
        );
    });
}

// ─────────────────────────────────────────────────────────────
// Countdown-Hook: aktualisiert sich jede Sekunde
// ─────────────────────────────────────────────────────────────
function useCountdown(unlockedAt, onExpire) {
    const [remainingMs, setRemainingMs] = useState(() => getRemainingMs(unlockedAt));
    const timerRef = useRef(null);

    useEffect(() => {
        const tick = () => {
            const rem = getRemainingMs(unlockedAt);
            setRemainingMs(rem);
            if (rem === null) {
                clearInterval(timerRef.current);
                onExpire?.();
            }
        };
        timerRef.current = setInterval(tick, 1000);
        return () => clearInterval(timerRef.current);
    }, [unlockedAt]);

    return remainingMs;
}

// ─────────────────────────────────────────────────────────────
// Playlist Card – Stammplaylisten aus Firebase (permanent)
// ─────────────────────────────────────────────────────────────
function PlaylistCard({ playlist }) {
    const [expanded, setExpanded] = useState(false);
    const toggle = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(e => !e);
    };
    return (
        <View style={styles.card}>
            <TouchableOpacity style={styles.cardHeader} onPress={toggle} activeOpacity={0.8}>
                <Text style={styles.cardIcon}>{playlist.icon || '🎵'}</Text>
                <View style={[styles.cardInfo, { paddingRight: 80 }]}>
                    <Text style={styles.cardName}>{playlist.name}</Text>
                    <Text style={styles.cardDesc}>{playlist.description}</Text>
                    <Text style={styles.cardCount}>{playlist.songs.length} Songs</Text>
                </View>
                <View style={styles.unlockedBadge}>
                    <Text style={styles.unlockedBadgeText}>✓ DEIN</Text>
                </View>
                <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            {expanded && (
                <View style={styles.songList}>
                    {playlist.songs.map(song => (
                        <View key={song.id} style={styles.songRow}>
                            <View style={styles.songRowLeft}>
                                <Text style={styles.songTitle}>{song.title}</Text>
                                <Text style={styles.songArtist}>{song.artist}</Text>
                            </View>
                            <Text style={styles.songMeta}>{song.year}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

// ─────────────────────────────────────────────────────────────
// Locked Card – Freischaltbar per Werbe-Video (24h/7d)
// ─────────────────────────────────────────────────────────────
function LockedCard({ playlist, unlockData, onUnlock, onExpire }) {
    const [loading, setLoading] = useState(false);
    const [expanded, setExpanded] = useState(false);

    const remainingMs = useCountdown(unlockData, onExpire);
    const isUnlocked = remainingMs !== null;

    let currentStreak = 0;
    if (unlockData) {
        currentStreak = typeof unlockData === 'number' ? 1 : (unlockData.streak || 1);
        let unlockedAt = typeof unlockData === 'number' ? unlockData : unlockData.unlockedAt;
        let durationMs = typeof unlockData === 'number' ? UNLOCK_DURATION_MS : (unlockData.durationMs || UNLOCK_DURATION_MS);
        if (Date.now() > unlockedAt + durationMs + GRACE_PERIOD_MS) {
            currentStreak = 0; // Grace period abgelaufen
        }
    }

    // Urgency-Farbe: rot unter 1h, orange unter 6h, grün sonst
    const timerColor = remainingMs !== null
        ? remainingMs < 3600000 ? '#FF4444'
            : remainingMs < 21600000 ? '#FF9800'
                : '#4CAF50'
        : '#4CAF50';

    const handleWatchAd = async () => {
        setLoading(true);
        await showRewardedAd(() => onUnlock(playlist.id));
        setLoading(false);
    };

    const toggle = () => {
        if (!isUnlocked) return;
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(e => !e);
    };

    return (
        <View style={[
            styles.card,
            isUnlocked && styles.unlockedCard,
            !isUnlocked && unlockData && currentStreak > 0 && styles.expiredCard,
        ]}>
            <TouchableOpacity style={[styles.cardHeader, { position: 'relative' }]} onPress={toggle} activeOpacity={isUnlocked ? 0.8 : 1}>
                <Text style={[styles.cardIcon, !isUnlocked && { opacity: 0.5 }]}>{playlist.icon}</Text>
                <View style={styles.cardInfo}>
                    <Text style={[styles.cardName, !isUnlocked && styles.lockedText]}>
                        {playlist.name}
                        {playlist.id === 'soundtracks' && (
                            <Text style={styles.extraQuestionLabel}> (+ Extra Frage)</Text>
                        )}
                    </Text>
                    <Text style={styles.cardDesc}>{playlist.description}</Text>

                    {/* Countdown (wenn aktiv freigeschaltet) */}
                    {isUnlocked && (
                        <View style={styles.countdownRow}>
                            <Text style={styles.countdownIcon}>⏱</Text>
                            <Text style={[styles.countdownText, { color: timerColor }]}>
                                {formatCountdown(remainingMs)}
                            </Text>
                            <Text style={styles.countdownLabel}> verbleibend</Text>
                        </View>
                    )}

                    {/* Abgelaufen / Streak Hinweise */}
                    {!isUnlocked && currentStreak > 0 && (
                        <Text style={styles.expiredText}>⛔ Abgelaufen – Streak Gefahr: {currentStreak}/5 🔥</Text>
                    )}

                    {/* Preview-Songs (wenn gesperrt) */}
                    {!isUnlocked && !loading && (
                        <View style={styles.previewList}>
                            {playlist.previewSongs.map((s, i) => (
                                <Text key={i} style={styles.previewSong}>• {s}</Text>
                            ))}
                            <Text style={styles.previewMore}>... und viele mehr</Text>
                        </View>
                    )}
                </View>

                {/* Rechte Seite: Badge oder Ad-Button */}
                {isUnlocked ? (
                    <View style={[styles.unlockedBadge, { borderColor: timerColor, backgroundColor: `${timerColor}22` }]}>
                        <Text style={[styles.unlockedBadgeText, { color: timerColor }]}>✓ FREI</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={[styles.adBtn, loading && { opacity: 0.6 }]}
                        onPress={handleWatchAd}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={theme.colors.textOnPrimary} size="small" />
                        ) : (
                            <Text style={styles.adBtnText}>{unlockData && currentStreak > 0 ? 'ERNEUT' : 'FREISCHALTEN'}</Text>
                        )}
                    </TouchableOpacity>
                )}
            </TouchableOpacity>

            {/* Erweiterbare Song-Liste */}
            {isUnlocked && expanded && (
                <View style={[styles.songList, { borderTopColor: timerColor }]}>
                    {playlist.previewSongs.map((s, i) => (
                        <View key={i} style={styles.songRow}>
                            <Text style={styles.songTitle}>{s}</Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

// ─────────────────────────────────────────────────────────────
// Hauptscreen
// ─────────────────────────────────────────────────────────────
export default function PlaylistScreen({ navigation }) {
    const [ownedPlaylists, setOwnedPlaylists] = useState([]);
    const [firebaseLockedPlaylists, setFirebaseLockedPlaylists] = useState(UNLOCKABLE_PLAYLISTS);
    // Format: { [playlistId]: unlockedAtTimestamp }
    const [unlockedMap, setUnlockedMap] = useState({});
    const [loading, setLoading] = useState(true);

    const loadUnlocked = async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Behalte Playlisten die aktiv sind ODER sich in der Grace Period befinden
                const active = {};
                for (const [id, data] of Object.entries(parsed)) {
                    let unlockedAt = typeof data === 'number' ? data : data.unlockedAt;
                    let durationMs = typeof data === 'number' ? UNLOCK_DURATION_MS : (data.durationMs || UNLOCK_DURATION_MS);

                    if (Date.now() <= unlockedAt + durationMs + GRACE_PERIOD_MS) {
                        active[id] = data;
                    }
                }
                setUnlockedMap(active);
            }
        } catch (e) { }
    };

    const fetchPlaylists = useCallback(async () => {
        try {
            const playlistsSnapshot = await getDocs(collection(db, 'playlists'));
            const owned = [];
            const firebaseLocked = [];

            for (const plDoc of playlistsSnapshot.docs) {
                const plData = plDoc.data();
                const songsQuery = query(collection(db, 'songs'), where('playlistId', '==', plDoc.id));
                const songsSnapshot = await getDocs(songsQuery);
                const songs = songsSnapshot.docs.map(s => ({ id: s.id, ...s.data() }));

                if (plData.locked) {
                    firebaseLocked.push({ id: plDoc.id, ...plData, songs, previewSongs: songs.slice(0, 3).map(s => s.title), fromFirebase: true });
                } else {
                    owned.push({ id: plDoc.id, ...plData, songs });
                }
            }

            setOwnedPlaylists(owned);
            const staticIds = firebaseLocked.map(p => p.id);
            const remainingStatic = UNLOCKABLE_PLAYLISTS.filter(p => !staticIds.includes(p.id));
            setFirebaseLockedPlaylists([...firebaseLocked, ...remainingStatic]);
        } catch (error) {
            console.error('Fehler beim Laden der Playlisten:', error);
            setFirebaseLockedPlaylists(UNLOCKABLE_PLAYLISTS);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUnlocked();
        fetchPlaylists();
    }, []);

    const handleUnlock = useCallback(async (playlistId) => {
        const now = Date.now();

        setUnlockedMap(prev => {
            const prevData = prev[playlistId];
            let newStreak = 1;
            let newDuration = UNLOCK_DURATION_MS;

            if (prevData) {
                let unlockedAt = typeof prevData === 'number' ? prevData : prevData.unlockedAt;
                let durationMs = typeof prevData === 'number' ? UNLOCK_DURATION_MS : (prevData.durationMs || UNLOCK_DURATION_MS);
                let streak = typeof prevData === 'number' ? 1 : (prevData.streak || 1);

                // Noch innerhalb der Grace Period geschafft? (now <= expiration + 12h)
                if (now <= unlockedAt + durationMs + GRACE_PERIOD_MS) {
                    newStreak = streak + 1;
                }
            }

            if (newStreak >= 5) {
                newDuration = BONUS_DURATION_MS;
                newStreak = 0; // Nach dem Bonus fängt der Streak wieder bei 0 an
            }

            const newData = {
                unlockedAt: now,
                durationMs: newDuration,
                streak: newStreak
            };

            const newMap = { ...prev, [playlistId]: newData };
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newMap))
                .catch(e => console.error('[Playlist] Speichern fehlgeschlagen:', e));

            // Verzögerte Benachrichtigung um UI Update nicht zu blockieren
            setTimeout(() => {
                const name = [...firebaseLockedPlaylists, ...UNLOCKABLE_PLAYLISTS]
                    .find(p => p.id === playlistId)?.name || playlistId;

                if (newDuration === BONUS_DURATION_MS) {
                    Alert.alert('🎉 7 TAGE BONUS!', `Wahnsinn! Du hast "${name}" 5x in Folge freigeschaltet. Als Bonus ist die Playlist jetzt für eine ganze Woche frei! 🔥`);
                } else {
                    Alert.alert('🎉 Freigeschaltet!', `"${name}" ist für 24h verfügbar!\n\nDein Rekord-Streak wächst: ${newStreak}/5 🔥\nSchalte sie nach Ablauf innerhalb von 12h erneut frei, um den 7-Tage-Bonus zu erreichen!`);
                }
            }, 300);

            return newMap;
        });
    }, [firebaseLockedPlaylists]);

    const handleExpire = useCallback(async (playlistId) => {
        // Bei Ablauf wird NICHT gelöscht, da wir die Grace-Period/den Streak beibehalten
    }, []);

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Home')}>
                <Text style={styles.backText}>‹  HOME</Text>
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>PLAYLISTEN</Text>

                {/* Stammplaylisten */}
                <Text style={styles.sectionLabel}>🎵 MEINE PLAYLISTEN</Text>
                {loading ? (
                    <ActivityIndicator color={theme.colors.accentPrimary} style={{ marginVertical: 20 }} />
                ) : ownedPlaylists.length === 0 ? (
                    <Text style={styles.emptyText}>Noch keine Playlisten in Firebase hinterlegt.</Text>
                ) : (
                    ownedPlaylists.map(p => <PlaylistCard key={p.id} playlist={p} />)
                )}

                {/* 24h Freischaltbare */}
                <Text style={[styles.sectionLabel, { marginTop: 24 }]}>🔒 FREISCHALTBAR (24H)</Text>
                <Text style={styles.adInfo}>Schau kurze Werbung – Playlist für 24 Stunden freischalten!</Text>

                {firebaseLockedPlaylists.map(p => (
                    <LockedCard
                        key={p.id}
                        playlist={p}
                        unlockData={unlockedMap[p.id] || null}
                        onUnlock={handleUnlock}
                        onExpire={() => handleExpire(p.id)}
                    />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.backgroundStart },
    backBtn: {
        position: 'absolute', top: 16, left: 16, zIndex: 10,
        backgroundColor: theme.colors.surface,
        paddingVertical: 10, paddingHorizontal: 18,
        borderRadius: theme.layout.borderRadius.pill,
        borderWidth: 1, borderColor: theme.colors.border,
    },
    backText: { color: theme.colors.textPrimary, fontWeight: 'bold', fontSize: 14 },
    content: { padding: theme.layout.paddingHorizontal, paddingTop: 70, paddingBottom: 60 },
    title: {
        color: theme.colors.textPrimary, fontSize: theme.typography.sizes.title,
        fontWeight: '900', letterSpacing: 3, textAlign: 'center', marginBottom: 24,
    },
    sectionLabel: {
        color: theme.colors.accentPrimary, fontSize: 12,
        fontWeight: 'bold', letterSpacing: 2, marginBottom: 10,
    },
    emptyText: { color: theme.colors.textSecondary, fontSize: 14, fontStyle: 'italic', marginBottom: 12 },
    adInfo: { color: theme.colors.textSecondary, fontSize: 13, marginBottom: 16, lineHeight: 18 },

    // Cards
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.layout.borderRadius.card,
        borderWidth: 1, borderColor: theme.colors.border,
        marginBottom: 12, overflow: 'hidden',
    },
    unlockedCard: { borderColor: '#4CAF50', borderWidth: 2 },
    expiredCard: { borderColor: '#FF4444', borderWidth: 1, opacity: 0.7 },
    cardHeader: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, minHeight: 120 },
    cardIcon: { fontSize: 28, marginRight: 12, marginTop: 2 },
    cardInfo: { flex: 1, paddingRight: 8 },
    cardName: { color: theme.colors.textPrimary, fontWeight: 'bold', fontSize: 16 },
    extraQuestionLabel: { color: theme.colors.accentPrimary, fontSize: 13, fontWeight: 'bold' },
    cardDesc: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 4, paddingRight: 90 },
    cardCount: { color: theme.colors.accentPrimary, fontSize: 11, marginTop: 4, fontWeight: 'bold' },
    chevron: { color: theme.colors.accentPrimary, fontSize: 14, fontWeight: 'bold', marginLeft: 8 },

    // Countdown
    countdownRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
    countdownIcon: { fontSize: 13, marginRight: 4 },
    countdownText: { fontSize: 15, fontWeight: '900', fontVariant: ['tabular-nums'], letterSpacing: 1 },
    countdownLabel: { color: theme.colors.textSecondary, fontSize: 12 },

    expiredText: { color: '#FF4444', fontSize: 12, fontWeight: 'bold', marginTop: 8 },

    // Song list
    songList: { borderTopWidth: 1, borderTopColor: theme.colors.border },
    songRow: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 10, paddingHorizontal: 16,
        borderBottomWidth: 1, borderBottomColor: 'rgba(42,53,77,0.5)',
    },
    songRowLeft: { flex: 1 },
    songTitle: { color: theme.colors.textPrimary, fontSize: 13, fontWeight: '600' },
    songArtist: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 2 },
    songMeta: { color: theme.colors.textSecondary, fontSize: 12 },

    // Locked / preview
    lockedText: { color: theme.colors.textSecondary },
    previewList: { marginTop: 8, paddingRight: 110 },
    previewSong: { color: theme.colors.textSecondary, fontSize: 12, lineHeight: 20, opacity: 0.8 },
    previewMore: { color: theme.colors.accentPrimary, fontSize: 11, marginTop: 4, fontStyle: 'italic' },

    // Badges
    unlockedBadge: {
        position: 'absolute', right: 16, top: 40,
        backgroundColor: '#4CAF5033', paddingHorizontal: 10, paddingVertical: 5,
        borderRadius: 20, borderWidth: 1, borderColor: '#4CAF50', marginLeft: 8,
    },
    unlockedBadgeText: { color: '#4CAF50', fontSize: 11, fontWeight: '900' },

    // Ad Button
    adBtn: {
        position: 'absolute',
        right: 16,
        top: 65,
        backgroundColor: theme.colors.accentPrimary,
        paddingVertical: 7, paddingHorizontal: 12,
        borderRadius: theme.layout.borderRadius.pill,
        alignItems: 'center', minWidth: 90,
    },
    adBtnText: { color: theme.colors.textOnPrimary, fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
});
