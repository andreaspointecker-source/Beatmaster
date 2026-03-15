import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { db } from '../config/firebase';
import { useGameConfig } from '../context/GameConfig';
import { theme } from '../styles/theme';

const GENRES = ['Alle', 'Pop', 'Rock', 'Hip-Hop', 'R&B', 'R&B & Soul', 'Schlager', 'Electronic', 'Jazz', 'Classic', 'Latin', 'Metal', 'Reggae', 'Country', 'Blues'];
const DECADES = ['Alle', '1920s', '1930s', '1940s', '1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];

const STORAGE_KEY_UNLOCKED = 'beatmaster_unlocked_playlists_v2';
const UNLOCK_DURATION_MS = 24 * 60 * 60 * 1000;

function isStillUnlocked(unlockData) {
    if (!unlockData) return false;
    let ts = typeof unlockData === 'number' ? unlockData : unlockData.unlockedAt;
    let dur = typeof unlockData === 'number' ? UNLOCK_DURATION_MS : (unlockData.durationMs || UNLOCK_DURATION_MS);
    return (Date.now() - ts) < dur;
}

// ─── Chip-Komponente für Filter-Auswahl ───────────────────────────────────────
function FilterChip({ label, selected, onPress, icon, disabled, count }) {
    return (
        <TouchableOpacity
            style={[
                styles.chip,
                selected && styles.chipSelected,
                disabled && styles.chipDisabled,
            ]}
            onPress={disabled ? undefined : onPress}
            activeOpacity={disabled ? 1 : 0.75}
        >
            {icon && <Text style={[styles.chipIcon, disabled && { opacity: 0.3 }]}>{icon}</Text>}
            <Text style={[
                styles.chipText,
                selected && styles.chipTextSelected,
                disabled && styles.chipTextDisabled,
            ]}>{label}</Text>
            {count !== undefined && !disabled && (
                <Text style={[styles.chipCount, selected && styles.chipCountSelected]}>
                    {' '}{count}
                </Text>
            )}
        </TouchableOpacity>
    );
}

// ─── Filter-Sektion mit Label ─────────────────────────────────────────────────
function FilterSection({ label, children }) {
    return (
        <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>{label}</Text>
            <View style={styles.chipRow}>{children}</View>
        </View>
    );
}

// ─── Haupt-Screen ─────────────────────────────────────────────────────────────
export default function GameSettingsScreen({ route, navigation }) {
    const { players, questionTypes } = route.params || { players: [], questionTypes: ['artist'] };
    const { config, updateConfig } = useGameConfig();
    const savedSettings = config?.settings || {};

    const [rounds, setRounds] = useState(savedSettings.rounds ?? 10);
    const [timerBefore, setTimerBefore] = useState(savedSettings.timerBefore ?? 5);
    const [timerAfter, setTimerAfter] = useState(savedSettings.timerAfter ?? 5);
    // Multi-Select: leeres Array = 'Alle' (kein Filter)
    const [selectedGenres, setSelectedGenres] = useState(savedSettings.genres ?? []);
    const [selectedDecades, setSelectedDecades] = useState(savedSettings.decades ?? []);
    const [selectedPlaylists, setSelectedPlaylists] = useState(savedSettings.playlistIds ?? []);

    const toggleGenre = (g) => {
        if (g === 'Alle') { setSelectedGenres([]); return; }
        setSelectedGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
    };
    const toggleDecade = (d) => {
        if (d === 'Alle') { setSelectedDecades([]); return; }
        setSelectedDecades(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
    };
    const togglePlaylist = (id) => {
        if (id === 'Alle') { setSelectedPlaylists([]); return; }
        setSelectedPlaylists(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    // Playlisten aus Firebase + freigeschaltete aus AsyncStorage
    const [availablePlaylists, setAvailablePlaylists] = useState([{ id: 'Alle', name: 'Alle', icon: '\ud83c\udfb5' }]);
    const [loadingPlaylists, setLoadingPlaylists] = useState(true);
    // Cache aller Songs der gewählten Playlist für Live-Filter-Count
    const [allSongsForPlaylist, setAllSongsForPlaylist] = useState([]);
    const [loadingSongs, setLoadingSongs] = useState(false);

    // Wenn Playlist oder verfügbare Playlisten sich ändern: Songs laden
    // WICHTIG: hängt von availablePlaylists ab damit gesperrte Playlisten nicht einbezogen werden
    useEffect(() => {
        if (loadingPlaylists) return;

        const fetchSongsForPlaylist = async () => {
            setLoadingSongs(true);
            try {
                let allSongs = [];
                // Ermittle welche IDs geladen werden sollen
                const allAccessibleIds = availablePlaylists
                    .filter(p => p.id !== 'Alle')
                    .map(p => p.id);

                // Bei Auswahl: nur selektierte (die auch zugänglich sind); sonst alle zugänglichen
                const idsToLoad = selectedPlaylists.length > 0
                    ? selectedPlaylists.filter(id => allAccessibleIds.includes(id))
                    : allAccessibleIds;

                if (idsToLoad.length === 0) {
                    setAllSongsForPlaylist([]);
                    setLoadingSongs(false);
                    return;
                }
                for (let i = 0; i < idsToLoad.length; i += 30) {
                    const chunk = idsToLoad.slice(i, i + 30);
                    const q = query(collection(db, 'songs'), where('playlistId', 'in', chunk));
                    const snap = await getDocs(q);
                    allSongs.push(...snap.docs.map(d => ({ id: d.id, ...d.data() })));
                }

                // WICHTIG: Wenn der Film-Fragetyp gewählt ist, DÜRFEN nur Filme/Serien-Songs gespielt werden
                if (questionTypes?.includes('film')) {
                    allSongs = allSongs.filter(s => !!s.film);
                }

                setAllSongsForPlaylist(allSongs);
            } catch (e) {
                console.warn('Song-Cache Fehler:', e);
            } finally {
                setLoadingSongs(false);
            }
        };
        fetchSongsForPlaylist();
    }, [selectedPlaylists, availablePlaylists, loadingPlaylists, questionTypes]);

    // Live-Berechnung: Songs nach aktuellem Genre+Dekade-Filter (Multi-Select)
    const filteredSongs = useMemo(() => {
        let songs = allSongsForPlaylist;
        if (selectedGenres.length > 0) {
            songs = songs.filter(s => selectedGenres.some(g => s.genre?.toLowerCase() === g.toLowerCase()));
        }
        if (selectedDecades.length > 0) {
            songs = songs.filter(s => {
                const y = parseInt(s.year);
                return selectedDecades.some(d => {
                    const start = parseInt(d);
                    return !isNaN(start) && y >= start && y < start + 10;
                });
            });
        }
        return songs;
    }, [allSongsForPlaylist, selectedGenres, selectedDecades]);

    // Zählt Songs für ein spezifisches Genre (nur dieses Genre, gefiltert nach aktiver Dekade)
    const countForGenre = (genre) => {
        let songs = allSongsForPlaylist;
        if (genre !== 'Alle') {
            songs = songs.filter(s => s.genre?.toLowerCase() === genre.toLowerCase());
        }
        // Dekaden-Filter anwenden (die anderen Dekaden bleiben aktiv)
        if (selectedDecades.length > 0) {
            songs = songs.filter(s => {
                const y = parseInt(s.year);
                return selectedDecades.some(d => {
                    const start = parseInt(d);
                    return !isNaN(start) && y >= start && y < start + 10;
                });
            });
        }
        return songs.length;
    };

    // Zählt Songs für eine spezifische Dekade (nur diese Dekade, gefiltert nach aktivem Genre)
    const countForDecade = (decade) => {
        let songs = allSongsForPlaylist;
        // Genre-Filter anwenden (die anderen Genres bleiben aktiv)
        if (selectedGenres.length > 0) {
            songs = songs.filter(s => selectedGenres.some(g => s.genre?.toLowerCase() === g.toLowerCase()));
        }
        if (decade !== 'Alle') {
            const start = parseInt(decade);
            if (!isNaN(start)) {
                songs = songs.filter(s => {
                    const y = parseInt(s.year);
                    return y >= start && y < start + 10;
                });
            }
        }
        return songs.length;
    };

    const availableCount = filteredSongs.length;
    const tooFewSongs = availableCount < rounds && availableCount > 0;

    useEffect(() => {
        const loadPlaylists = async () => {
            try {
                // Freigeschaltete Playlist-IDs aus LocalStorage
                const stored = await AsyncStorage.getItem(STORAGE_KEY_UNLOCKED);
                const unlockedMap = stored ? JSON.parse(stored) : {};
                // Nur noch gültige (innerhalb 24h) berücksichtigen
                const validIds = Object.entries(unlockedMap)
                    .filter(([, ts]) => isStillUnlocked(ts))
                    .map(([id]) => id);

                // Alle Playlisten aus Firebase laden
                const snapshot = await getDocs(collection(db, 'playlists'));
                const all = [{ id: 'Alle', name: 'Alle', icon: '🎵' }];

                for (const plDoc of snapshot.docs) {
                    const data = plDoc.data();
                    // Nur anzeigen wenn nicht gesperrt ODER noch innerhalb 24h freigeschaltet
                    if (!data.locked || validIds.includes(plDoc.id)) {
                        all.push({ id: plDoc.id, name: data.name, icon: data.icon || '🎵' });
                    }
                }

                setAvailablePlaylists(all);
            } catch (e) {
                console.error('Playlist laden fehlgeschlagen:', e);
            } finally {
                setLoadingPlaylists(false);
            }
        };
        loadPlaylists();
    }, []);

    const buildConfig = () => ({
        players,
        questionTypes,
        settings: {
            rounds,
            timerBefore,
            timerAfter,
            genres: selectedGenres,
            decades: selectedDecades,
            playlistIds: selectedPlaylists,  // Array, leer = alle zugänglichen
        }
    });

    const startGame = () => {
        const cfg = buildConfig();
        updateConfig(cfg);
        navigation.navigate('GameMaster', cfg);
    };

    const saveOnly = () => {
        updateConfig(buildConfig());
        navigation.navigate('Home');
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>SPIELEINSTELLUNGEN</Text>
            <Text style={styles.subtitle}>Letzte Anpassungen</Text>

            {/* ─── Runden ─────────────────────────────────────────────── */}
            <View style={styles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={styles.label}>🎯 ANZAHL RUNDEN</Text>
                    {/* Song-Verfügbarkeit Badge */}
                    {loadingSongs ? (
                        <ActivityIndicator size="small" color={theme.colors.accentPrimary} />
                    ) : (
                        <View style={[
                            styles.songCountBadge,
                            availableCount === 0 && styles.songCountBadgeError,
                            tooFewSongs && styles.songCountBadgeWarn,
                        ]}>
                            <Text style={[
                                styles.songCountText,
                                availableCount === 0 && styles.songCountTextError,
                                tooFewSongs && styles.songCountTextWarn,
                            ]}>
                                🎵 {availableCount} {availableCount === 1 ? 'Song' : 'Songs'} verfügbar
                            </Text>
                        </View>
                    )}
                </View>
                <Text style={styles.timerHint}>Wie viele Songs werden gespielt?</Text>
                <View style={styles.timerRow}>
                    <TouchableOpacity style={styles.roundButton} onPress={() => setRounds(Math.max(1, rounds - 1))}>
                        <Text style={styles.roundButtonText}>−</Text>
                    </TouchableOpacity>
                    <View style={styles.timerDisplay}>
                        <Text style={[styles.timerValue, tooFewSongs && { color: '#FF9800' }]}>{rounds}</Text>
                        <Text style={styles.timerUnit}>{rounds === 1 ? 'Runde' : 'Runden'}</Text>
                    </View>
                    <TouchableOpacity style={styles.roundButton} onPress={() => setRounds(Math.min(availableCount > 0 ? availableCount : 50, rounds + 1))}>
                        <Text style={styles.roundButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
                {/* Warnung bei zu wenig Songs */}
                {tooFewSongs && (
                    <Text style={styles.warnText}>
                        ⚠️ Nur {availableCount} Songs mit diesen Filtern – reduziere die Runden!
                    </Text>
                )}
                {availableCount === 0 && !loadingSongs && (
                    <Text style={styles.errorText}>
                        ❌ Keine Songs mit diesen Filtern – Filter anpassen!
                    </Text>
                )}
                <View style={styles.chipRow}>
                    {[5, 10, 15, 20, 30].map(v => (
                        <TouchableOpacity
                            key={v}
                            style={[styles.quickChip, rounds === v && styles.quickChipSelected, availableCount > 0 && v > availableCount && styles.quickChipDisabled]}
                            onPress={() => availableCount === 0 || v <= availableCount ? setRounds(v) : setRounds(availableCount)}
                        >
                            <Text style={[styles.quickChipText, rounds === v && styles.quickChipTextSelected]}>{v}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* ─── Timer Vor ─────────────────────────────────────────── */}
            <View style={styles.card}>
                <Text style={styles.label}>⏱ TIMER VOR DER MUSIK</Text>
                <Text style={styles.timerHint}>Ratezeit bevor der Song startet</Text>
                <View style={styles.timerRow}>
                    <TouchableOpacity style={styles.roundButton} onPress={() => setTimerBefore(Math.max(1, timerBefore - 1))}>
                        <Text style={styles.roundButtonText}>−</Text>
                    </TouchableOpacity>
                    <View style={styles.timerDisplay}>
                        <Text style={styles.timerValue}>{timerBefore}</Text>
                        <Text style={styles.timerUnit}>Sek</Text>
                    </View>
                    <TouchableOpacity style={styles.roundButton} onPress={() => setTimerBefore(Math.min(60, timerBefore + 1))}>
                        <Text style={styles.roundButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
                {/* Schnell-Auswahl */}
                <View style={styles.chipRow}>
                    {[3, 5, 10, 15, 30].map(v => (
                        <TouchableOpacity
                            key={v}
                            style={[styles.quickChip, timerBefore === v && styles.quickChipSelected]}
                            onPress={() => setTimerBefore(v)}
                        >
                            <Text style={[styles.quickChipText, timerBefore === v && styles.quickChipTextSelected]}>{v}s</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* ─── Timer Nach ────────────────────────────────────────── */}
            <View style={styles.card}>
                <Text style={styles.label}>⏱ TIMER NACH DER MUSIK</Text>
                <Text style={styles.timerHint}>Zeit zum Eintippen der letzten Antwort</Text>
                <View style={styles.timerRow}>
                    <TouchableOpacity style={styles.roundButton} onPress={() => setTimerAfter(Math.max(1, timerAfter - 1))}>
                        <Text style={styles.roundButtonText}>−</Text>
                    </TouchableOpacity>
                    <View style={styles.timerDisplay}>
                        <Text style={styles.timerValue}>{timerAfter}</Text>
                        <Text style={styles.timerUnit}>Sek</Text>
                    </View>
                    <TouchableOpacity style={styles.roundButton} onPress={() => setTimerAfter(Math.min(60, timerAfter + 1))}>
                        <Text style={styles.roundButtonText}>+</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.chipRow}>
                    {[3, 5, 10, 15, 30].map(v => (
                        <TouchableOpacity
                            key={v}
                            style={[styles.quickChip, timerAfter === v && styles.quickChipSelected]}
                            onPress={() => setTimerAfter(v)}
                        >
                            <Text style={[styles.quickChipText, timerAfter === v && styles.quickChipTextSelected]}>{v}s</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* ─── Playlist Filter (Multi-Select) ─────────────────────── */}
            <View style={styles.card}>
                <Text style={styles.label}>🎵 PLAYLIST
                    {selectedPlaylists.length > 0 &&
                        <Text style={styles.multiSelectHint}> — {selectedPlaylists.length} gewählt</Text>}
                </Text>
                {loadingPlaylists ? (
                    <ActivityIndicator color={theme.colors.accentPrimary} style={{ marginVertical: 12 }} />
                ) : (
                    <FilterSection label="">
                        {availablePlaylists.map(pl => {
                            const isAlle = pl.id === 'Alle';
                            const isSelected = isAlle ? selectedPlaylists.length === 0 : selectedPlaylists.includes(pl.id);
                            return (
                                <FilterChip
                                    key={pl.id}
                                    label={pl.name}
                                    icon={!isAlle ? pl.icon : null}
                                    selected={isSelected}
                                    onPress={() => togglePlaylist(pl.id)}
                                />
                            );
                        })}
                    </FilterSection>
                )}
                {selectedPlaylists.length > 0 && (
                    <Text style={styles.activeFilterNote}>
                        ✓ {selectedPlaylists.map(id => availablePlaylists.find(p => p.id === id)?.name).filter(Boolean).join(', ')}
                    </Text>
                )}
            </View>

            {/* ─── Genre Filter (Multi-Select) ─────────────────────── */}
            <View style={styles.card}>
                <Text style={styles.label}>🎸 GENRE
                    {selectedGenres.length > 0 &&
                        <Text style={styles.multiSelectHint}> — {selectedGenres.length} gewählt</Text>}
                </Text>
                <FilterSection label="">
                    {GENRES.map(g => {
                        const isAlle = g === 'Alle';
                        const isSelected = isAlle ? selectedGenres.length === 0 : selectedGenres.includes(g);
                        const cnt = isAlle ? undefined : countForGenre(g);
                        const isDisabled = !isAlle && !isSelected && cnt === 0;
                        return (
                            <FilterChip
                                key={g}
                                label={g}
                                selected={isSelected}
                                disabled={isDisabled}
                                count={cnt}
                                onPress={() => toggleGenre(g)}
                            />
                        );
                    })}
                </FilterSection>
                {selectedGenres.length > 0 && (
                    <Text style={styles.activeFilterNote}>✓ {selectedGenres.join(', ')}</Text>
                )}
            </View>

            {/* ─── Dekaden Filter (Multi-Select) ────────────────────── */}
            <View style={styles.card}>
                <Text style={styles.label}>📅 DEKADE
                    {selectedDecades.length > 0 &&
                        <Text style={styles.multiSelectHint}> — {selectedDecades.length} gewählt</Text>}
                </Text>
                <FilterSection label="">
                    {DECADES.map(d => {
                        const isAlle = d === 'Alle';
                        const isSelected = isAlle ? selectedDecades.length === 0 : selectedDecades.includes(d);
                        const cnt = isAlle ? undefined : countForDecade(d);
                        const isDisabled = !isAlle && !isSelected && cnt === 0;
                        return (
                            <FilterChip
                                key={d}
                                label={d}
                                selected={isSelected}
                                disabled={isDisabled}
                                count={cnt}
                                onPress={() => toggleDecade(d)}
                            />
                        );
                    })}
                </FilterSection>
                {selectedDecades.length > 0 && (
                    <Text style={styles.activeFilterNote}>✓ {selectedDecades.join(', ')}</Text>
                )}
            </View>

            {/* ─── Aktive Filter Zusammenfassung ──────────────────────── */}
            {(selectedGenres.length > 0 || selectedDecades.length > 0 || selectedPlaylists.length > 0) && (
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>🔍 AKTIVE FILTER</Text>
                    {selectedPlaylists.length > 0 && <Text style={styles.summaryItem}>🎵 Playlist: {selectedPlaylists.map(id => availablePlaylists.find(p => p.id === id)?.name).filter(Boolean).join(', ')}</Text>}
                    {selectedGenres.length > 0 && <Text style={styles.summaryItem}>🎸 Genre: {selectedGenres.join(', ')}</Text>}
                    {selectedDecades.length > 0 && <Text style={styles.summaryItem}>📅 Dekade: {selectedDecades.join(', ')}</Text>}
                    <TouchableOpacity onPress={() => { setSelectedGenres([]); setSelectedDecades([]); setSelectedPlaylists([]); }}>
                        <Text style={styles.resetFilter}>↺ Alle Filter zurücksetzen</Text>
                    </TouchableOpacity>
                </View>
            )}

            <TouchableOpacity
                style={[styles.button, (availableCount === 0 || tooFewSongs) && styles.buttonDisabled]}
                onPress={availableCount > 0 && !tooFewSongs ? startGame : undefined}
                disabled={availableCount === 0 || tooFewSongs}
            >
                <Text style={styles.buttonText}>
                    {availableCount === 0 ? '❌ Keine Songs – Filter anpassen' :
                        tooFewSongs ? `⚠️ Zu wenig Songs (${availableCount} < ${rounds} Runden)` :
                            '▶  SPIEL STARTEN'}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={saveOnly}>
                <Text style={styles.buttonTextSecondary}>💾 Speichern & Zurück zu Home</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.backgroundStart },
    contentContainer: { padding: theme.layout.paddingHorizontal, paddingTop: 60, paddingBottom: 50 },
    title: {
        color: theme.colors.textPrimary,
        fontSize: theme.typography.sizes.title,
        fontWeight: theme.typography.weights.heavy,
        textAlign: 'center',
        marginBottom: theme.spacing.s,
    },
    subtitle: {
        color: theme.colors.accentPrimary,
        fontSize: theme.typography.sizes.h1,
        fontWeight: theme.typography.weights.bold,
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
    },
    card: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.l,
        borderRadius: theme.layout.borderRadius.card,
        borderColor: theme.colors.border,
        borderWidth: 1,
        marginBottom: theme.spacing.l,
    },
    label: {
        color: theme.colors.accentPrimary,
        fontSize: theme.typography.sizes.small,
        fontWeight: theme.typography.weights.bold,
        marginBottom: 4,
        letterSpacing: 1,
    },
    timerHint: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        marginBottom: theme.spacing.m,
        fontStyle: 'italic',
    },
    timerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing.m,
    },
    roundButton: {
        backgroundColor: theme.colors.surfaceDark,
        width: 54,
        height: 54,
        borderRadius: 27,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: theme.colors.border,
        borderWidth: 1,
    },
    roundButtonText: {
        color: theme.colors.textPrimary,
        fontSize: 26,
        fontWeight: theme.typography.weights.bold,
        lineHeight: 30,
    },
    timerDisplay: { alignItems: 'center' },
    timerValue: {
        color: theme.colors.textPrimary,
        fontSize: 48,
        fontWeight: theme.typography.weights.heavy,
        lineHeight: 54,
    },
    timerUnit: {
        color: theme.colors.textSecondary,
        fontSize: 13,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    // Schnell-Chips für Timer
    quickChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: theme.colors.surfaceDark,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginRight: 6,
        marginBottom: 6,
    },
    quickChipSelected: {
        backgroundColor: `${theme.colors.accentPrimary}22`,
        borderColor: theme.colors.accentPrimary,
    },
    quickChipText: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: 'bold' },
    quickChipTextSelected: { color: theme.colors.accentPrimary },
    // Filter-Chips
    filterSection: { marginBottom: 4 },
    filterLabel: { color: theme.colors.textSecondary, fontSize: 12, marginBottom: 8, fontWeight: 'bold', letterSpacing: 0.5 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap' },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: theme.layout.borderRadius.pill,
        backgroundColor: theme.colors.surfaceDark,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginRight: 8,
        marginBottom: 8,
    },
    chipSelected: {
        backgroundColor: `${theme.colors.accentPrimary}22`,
        borderColor: theme.colors.accentPrimary,
    },
    chipDisabled: { opacity: 0.3, borderStyle: 'dashed' },
    chipIcon: { fontSize: 14, marginRight: 5 },
    chipText: { color: theme.colors.textSecondary, fontSize: 14, fontWeight: '600' },
    chipTextSelected: { color: theme.colors.accentPrimary, fontWeight: 'bold' },
    chipTextDisabled: { color: theme.colors.textSecondary },
    chipCount: { color: theme.colors.textSecondary, fontSize: 11, fontWeight: '600' },
    chipCountSelected: { color: theme.colors.accentPrimary },
    // Song-Count Badge
    songCountBadge: {
        backgroundColor: `${theme.colors.accentPrimary}22`,
        paddingHorizontal: 10, paddingVertical: 4,
        borderRadius: 20, borderWidth: 1,
        borderColor: `${theme.colors.accentPrimary}55`,
    },
    songCountBadgeWarn: { backgroundColor: '#FF980022', borderColor: '#FF980066' },
    songCountBadgeError: { backgroundColor: '#FF444422', borderColor: '#FF444466' },
    songCountText: { color: theme.colors.accentPrimary, fontSize: 12, fontWeight: '900' },
    songCountTextWarn: { color: '#FF9800' },
    songCountTextError: { color: '#FF4444' },
    warnText: { color: '#FF9800', fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
    errorText: { color: '#FF4444', fontSize: 12, fontWeight: 'bold', marginBottom: 8 },
    quickChipDisabled: { opacity: 0.3 },
    buttonDisabled: { backgroundColor: theme.colors.surfaceDark, elevation: 0, shadowOpacity: 0 },
    activeFilterNote: {
        color: '#4CAF50',
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 8,
        fontWeight: '600',
    },
    summaryCard: {
        backgroundColor: `${theme.colors.accentPrimary}15`,
        borderRadius: theme.layout.borderRadius.card,
        padding: theme.spacing.m,
        borderWidth: 1,
        borderColor: `${theme.colors.accentPrimary}55`,
        marginBottom: theme.spacing.l,
    },
    summaryTitle: {
        color: theme.colors.accentPrimary,
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
        marginBottom: 8,
    },
    summaryItem: {
        color: theme.colors.textPrimary,
        fontSize: 14,
        marginBottom: 4,
        fontWeight: '600',
    },
    resetFilter: {
        color: '#FF6B6B',
        fontSize: 13,
        fontWeight: 'bold',
        marginTop: 8,
    },
    multiSelectHint: {
        color: theme.colors.accentPrimary,
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    button: {
        backgroundColor: theme.colors.accentPrimary,
        paddingVertical: theme.spacing.m,
        paddingHorizontal: theme.spacing.l,
        borderRadius: theme.layout.borderRadius.pill,
        alignItems: 'center',
        marginBottom: theme.spacing.m,
        marginTop: theme.spacing.l,
        elevation: 4,
        shadowColor: theme.colors.accentPrimary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    buttonText: {
        color: theme.colors.textOnPrimary,
        fontWeight: theme.typography.weights.bold,
        fontSize: theme.typography.sizes.body,
        letterSpacing: 1,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderColor: theme.colors.border,
        borderWidth: 1,
        marginTop: theme.spacing.s,
        elevation: 0,
        shadowOpacity: 0,
    },
    buttonTextSecondary: {
        color: theme.colors.textPrimary,
        fontSize: theme.typography.sizes.body,
    },
});
