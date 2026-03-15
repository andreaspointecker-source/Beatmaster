import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated, Easing,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { db } from '../config/firebase';
import { theme } from '../styles/theme';
import { getPreviewUrl } from '../utils/audioHelper';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Mapping: question type → antwort aus dem Song-Objekt
const QUESTION_META = {
    artist: { label: 'WER SINGT DEN SONG?', icon: '🎤', getValue: s => s.artist },
    title: { label: 'WIE HEISST DER SONG?', icon: '🎵', getValue: s => s.title },
    year: { label: 'AUS WELCHEM JAHR?', icon: '📅', getValue: s => String(s.year) },
    genre: { label: 'WELCHES GENRE?', icon: '🎸', getValue: s => s.genre },
    film: { label: 'AUS WELCHEM FILM / WELCHER SERIE?', icon: '🎬', getValue: s => s.film || null },
};

function getRandomSong(songsPool, genre, decade) {
    if (!songsPool || songsPool.length === 0) return null;
    let pool = songsPool;
    if (genre && genre !== 'Alle') pool = pool.filter(s => s.genre === genre);
    if (decade && decade !== 'Alle') pool = pool.filter(s => s.decade === decade);

    // Fallback falls nach Filterung nichts übrig bleibt
    if (pool.length === 0) pool = songsPool;

    return pool[Math.floor(Math.random() * pool.length)];
}

function getRandomQuestionType(questionTypes, song) {
    let types = questionTypes && questionTypes.length > 0 ? questionTypes : ['artist'];
    // 'film' nur wenn der Song tatsächlich ein Film-Feld hat
    if (types.includes('film') && !song?.film) {
        types = types.filter(t => t !== 'film');
        if (types.length === 0) types = ['artist'];
    }
    return types[Math.floor(Math.random() * types.length)];
}

export default function GameMaster({ route, navigation }) {
    const { players, settings, questionTypes } = route.params || {
        players: [],
        settings: { timerBefore: 5, timerAfter: 5, genre: 'Alle', decade: 'Alle', rounds: 10 },
        questionTypes: ['artist'],
    };
    const insets = useSafeAreaInsets();
    const totalRounds = settings?.rounds || 10;

    const [phase, setPhase] = useState('SHUFFLE');
    const [currentRound, setCurrentRound] = useState(1);
    const [countdown, setCountdown] = useState(0);
    const [currentSong, setCurrentSong] = useState(null);
    const [currentQuestionType, setCurrentQuestionType] = useState('artist');
    const [showQuestionCard, setShowQuestionCard] = useState(false);
    const [scores, setScores] = useState(players.map(p => ({ ...p, score: 0 })));
    const [audioStatus, setAudioStatus] = useState('idle');

    // Neu: Playlist aus Firestore (zunächst hardcoded auf 'starter')
    const [playlistSongs, setPlaylistSongs] = useState([]);
    const [isLoadingSongs, setIsLoadingSongs] = useState(true);

    const player = useAudioPlayer();
    const shufflePlayer = useAudioPlayer(require('../../assets/sounds/shuffling-cards.mp3'));
    const timerPlayer = useAudioPlayer(require('../../assets/sounds/ticking-clock-on-10s-intervals.mp3'));
    const isActiveRef = useRef(true);
    const spinAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0.4)).current;
    const shuffleAnim = useRef(new Animated.Value(0)).current;
    const revealAnim = useRef(new Animated.Value(0)).current;
    const flipAnim = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(1)).current;
    const progressTimerRef = useRef(null);
    const pollTimerRef = useRef(null);

    useEffect(() => {
        setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false });

        const STORAGE_KEY_UNLOCKED = 'beatmaster_unlocked_playlists_v2';
        const UNLOCK_DURATION_MS = 24 * 60 * 60 * 1000;

        const fetchSongs = async () => {
            try {
                let allSongs = [];

                // Playlist-IDs ermitteln: neue Array-Form oder alte Einzelform (Rückwärtskompatibilität)
                const selectedPlaylistIds = settings?.playlistIds?.length > 0
                    ? settings.playlistIds
                    : (settings?.playlistId ? [settings.playlistId] : []);

                if (selectedPlaylistIds.length === 0) {
                    // Keine spezifische Auswahl → alle zugänglichen Playlisten
                    const stored = await AsyncStorage.getItem(STORAGE_KEY_UNLOCKED);
                    const unlockedMap = stored ? JSON.parse(stored) : {};
                    const validUnlockedIds = Object.entries(unlockedMap)
                        .filter(([, data]) => {
                            let ts = typeof data === 'number' ? data : data.unlockedAt;
                            let dur = typeof data === 'number' ? UNLOCK_DURATION_MS : (data.durationMs || UNLOCK_DURATION_MS);
                            return (Date.now() - ts) < dur;
                        })
                        .map(([id]) => id);

                    const playlistSnap = await getDocs(collection(db, 'playlists'));
                    const accessibleIds = playlistSnap.docs
                        .filter(d => !d.data().locked || validUnlockedIds.includes(d.id))
                        .map(d => d.id);

                    if (accessibleIds.length === 0) { setPlaylistSongs([]); return; }

                    for (let i = 0; i < accessibleIds.length; i += 30) {
                        const chunk = accessibleIds.slice(i, i + 30);
                        const q = query(collection(db, 'songs'), where('playlistId', 'in', chunk));
                        const snap = await getDocs(q);
                        allSongs.push(...snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                    }
                } else {
                    // Spezifische Playlist(s) laden
                    for (let i = 0; i < selectedPlaylistIds.length; i += 30) {
                        const chunk = selectedPlaylistIds.slice(i, i + 30);
                        const q = query(collection(db, 'songs'), where('playlistId', 'in', chunk));
                        const snap = await getDocs(q);
                        allSongs.push(...snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
                    }
                }

                // Genre-Filter (Multi-Select Array)
                const genres = settings?.genres;
                if (Array.isArray(genres) && genres.length > 0) {
                    allSongs = allSongs.filter(s =>
                        genres.some(g => s.genre?.toLowerCase() === g.toLowerCase())
                    );
                }

                // Dekaden-Filter (Multi-Select Array)
                const decades = settings?.decades;
                if (Array.isArray(decades) && decades.length > 0) {
                    allSongs = allSongs.filter(s => {
                        const year = parseInt(s.year);
                        return decades.some(d => {
                            const start = parseInt(d);
                            return !isNaN(start) && year >= start && year < start + 10;
                        });
                    });
                }

                // WICHTIG: Wenn der Film-Fragetyp gewählt ist, DÜRFEN nur Filme/Serien-Songs gespielt werden
                if (questionTypes?.includes('film')) {
                    allSongs = allSongs.filter(s => !!s.film);
                }

                setPlaylistSongs(allSongs);
            } catch (error) {
                console.error('Fehler beim Laden der Songs:', error);
                Alert.alert('Fehler', 'Songs konnten nicht geladen werden.');
            } finally {
                setIsLoadingSongs(false);
            }
        };
        fetchSongs();

        return () => { stopAndUnloadAudio(); };
    }, []);

    // Stop audio immediately when screen loses focus (e.g. navigate away)
    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            isActiveRef.current = false;  // cancel any in-flight audio load
            stopAndUnloadAudio();
        });
        // Re-activate when screen comes back into focus
        const unsubFocus = navigation.addListener('focus', () => {
            isActiveRef.current = true;
        });
        return () => { unsubscribe(); unsubFocus(); };
    }, [navigation]);

    const stopAndUnloadAudio = () => {
        if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        if (player) {
            try {
                player.pause();
            } catch (e) {
                console.log("Audio pause error (already released?):", e);
            }
        }
        if (timerPlayer) {
            try {
                timerPlayer.pause();
            } catch (e) { }
        }
    };

    // SHUFFLE
    useEffect(() => {
        if (phase !== 'SHUFFLE') return;
        if (isLoadingSongs || playlistSongs.length === 0) return; // Warten bis Songs da sind

        stopAndUnloadAudio();
        const song = getRandomSong(playlistSongs, settings?.genre, settings?.decade);
        const qType = getRandomQuestionType(questionTypes, song);
        setCurrentSong(song);
        setCurrentQuestionType(qType);
        setAudioStatus('idle');

        // Shuffling Sound spielen
        try {
            shufflePlayer.play();
        } catch (e) { console.log('Shuffle sound error', e); }

        Animated.loop(
            Animated.sequence([
                Animated.timing(shuffleAnim, { toValue: 1, duration: 300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
                Animated.timing(shuffleAnim, { toValue: 0, duration: 300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
            ]),
            { iterations: 4 }
        ).start();

        const popTimer = setTimeout(() => {
            setShowQuestionCard(true);
            try { shufflePlayer.pause(); } catch (e) { } // End sound exactly when card shows up
            Animated.parallel([
                Animated.spring(revealAnim, {
                    toValue: 1,
                    friction: 5,
                    tension: 40,
                    useNativeDriver: true
                }),
                Animated.timing(flipAnim, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true
                })
            ]).start();
        }, 2400); // 4 * 600ms = 2400ms

        const endTimer = setTimeout(() => {
            shuffleAnim.setValue(0);
            revealAnim.setValue(0);
            flipAnim.setValue(0);
            setShowQuestionCard(false);
            setPhase('TIMER_VOR');
        }, 4800); // Wait another 2.4s for the user to read the question

        return () => {
            clearTimeout(popTimer);
            clearTimeout(endTimer);
        };
    }, [phase, isLoadingSongs, playlistSongs]);

    // TIMER
    useEffect(() => {
        if (phase === 'TIMER_VOR') {
            setCountdown(settings?.timerBefore ?? 5);
            try {
                timerPlayer.loop = true;
                timerPlayer.seekTo(0);
                timerPlayer.play();
            } catch (e) { console.log('Timer sound error', e); }
        } else if (phase === 'TIMER_NACH') {
            setCountdown(settings?.timerAfter ?? 5);
            try {
                timerPlayer.loop = true;
                timerPlayer.seekTo(0);
                timerPlayer.play();
            } catch (e) { console.log('Timer sound error', e); }
        } else {
            try { timerPlayer.pause(); } catch (e) { }
        }
    }, [phase]);

    useEffect(() => {
        if ((phase !== 'TIMER_VOR' && phase !== 'TIMER_NACH') || countdown <= 0) return;
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown, phase]);

    useEffect(() => {
        if (phase === 'TIMER_VOR' && countdown === 0 && currentSong) {
            const t = setTimeout(() => setPhase('MUSIC'), 500);
            return () => clearTimeout(t);
        }
        if (phase === 'TIMER_NACH' && countdown === 0) {
            const t = setTimeout(() => setPhase('RESOLUTION'), 500);
            return () => clearTimeout(t);
        }
    }, [countdown, phase, currentSong]);

    // MUSIC
    useEffect(() => {
        if (phase !== 'MUSIC' || !currentSong) return;

        spinAnim.setValue(0);
        const spinAnimation = Animated.loop(
            Animated.timing(spinAnim, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: true })
        );
        spinAnimation.start();

        // Glow-Pulsanimation
        glowAnim.setValue(0.4);
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
                Animated.timing(glowAnim, { toValue: 0.4, duration: 900, useNativeDriver: true }),
            ])
        ).start();

        const runMusicPhase = async () => {
            setAudioStatus('loading');

            // Frische Preview-URL via iTunes Lookup API holen
            const previewUrl = await getPreviewUrl(currentSong);

            if (!previewUrl || !isActiveRef.current) {
                if (isActiveRef.current) {
                    setAudioStatus('error');
                    startProgressAndTimer(20000, spinAnimation);
                }
                return;
            }

            try {
                // Audio laden und abspielen
                player.replace(previewUrl);

                if (!isActiveRef.current) {
                    try { player.pause(); } catch (e) { }
                    return;
                }
                player.play();
                setAudioStatus('playing');

                // Apple Previews sind i.d.R. 30 Sekunden
                const duration = 30000;
                startProgressAndTimer(duration, spinAnimation);

            } catch (e) {
                console.error('Audio Fehler:', e);
                if (isActiveRef.current) {
                    setAudioStatus('error');
                    startProgressAndTimer(20000, spinAnimation);
                }
            }
        };

        runMusicPhase();
        return () => { spinAnimation.stop(); };
    }, [phase, currentSong]);

    const startProgressAndTimer = (durationMs, spinAnimation) => {
        progressAnim.setValue(1);
        Animated.timing(progressAnim, {
            toValue: 0, duration: durationMs, easing: Easing.linear, useNativeDriver: false,
        }).start();

        let finished = false;
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);

        pollTimerRef.current = setInterval(() => {
            if (!finished && player.duration > 0 && player.currentTime >= player.duration - 0.2) {
                finished = true;
                clearInterval(pollTimerRef.current);
                if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
                spinAnimation.stop();

                setTimeout(() => {
                    stopAndUnloadAudio();
                    setPhase('TIMER_NACH');
                }, 800);
            }
        }, 200);

        progressTimerRef.current = setTimeout(() => {
            if (!finished) {
                finished = true;
                if (pollTimerRef.current) clearInterval(pollTimerRef.current);
                spinAnimation.stop();
                stopAndUnloadAudio();
                setPhase('TIMER_NACH');
            }
        }, durationMs + 2000);
    };

    const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

    const givePoint = (playerId) => {
        setScores(prev => prev.map(p => p.id === playerId ? { ...p, score: p.score + 1 } : p));
    };

    const nextRound = () => {
        progressAnim.setValue(1);
        const next = currentRound + 1;
        if (next > totalRounds) {
            // Spiel beendet
            setPhase('GAMEOVER');
        } else {
            setCurrentRound(next);
            setPhase('SHUFFLE');
        }
    };

    const qMeta = QUESTION_META[currentQuestionType] || QUESTION_META.artist;
    const correctAnswer = currentSong ? qMeta.getValue(currentSong) : '';

    const confirmLeave = () => {
        Alert.alert(
            'Spiel verlassen?',
            'Das laufende Spiel wird beendet. Willst du wirklich zurück zum Home-Screen?',
            [
                { text: 'Abbrechen', style: 'cancel' },
                {
                    text: 'Verlassen', style: 'destructive',
                    onPress: () => { stopAndUnloadAudio(); navigation.navigate('Home'); }
                },
            ]
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>

            {/* Home-Button oben links */}
            <TouchableOpacity
                style={styles.homeBtn}
                onPress={confirmLeave}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
                <Text style={styles.homeBtnText}>⌂  HOME</Text>
            </TouchableOpacity>

            {/* Runden-Anzeige oben rechts */}
            {phase !== 'GAMEOVER' && (
                <View style={styles.roundIndicator}>
                    <Text style={styles.roundIndicatorText}>{currentRound} / {totalRounds}</Text>
                </View>
            )}

            {/* GAME OVER */}
            {phase === 'GAMEOVER' && (
                <View style={styles.centered}>
                    <Text style={styles.phaseLabel}>SPIEL BEENDET!</Text>
                    <Text style={styles.gameOverEmoji}>🏆</Text>
                    <Text style={styles.gameOverSub}>{totalRounds} Runden gespielt</Text>

                    {/* Sieger-Podium */}
                    {[...scores]
                        .sort((a, b) => b.score - a.score)
                        .map((p, i) => (
                            <View key={p.id} style={[styles.podiumRow, i === 0 && styles.podiumRowFirst]}>
                                <Text style={styles.podiumRank}>{['🥇', '🥈', '🥉'][i] || `${i + 1}.`}</Text>
                                <Text style={styles.podiumName}>{p.name}</Text>
                                <Text style={styles.podiumScore}>{p.score} Pkt.</Text>
                            </View>
                        ))
                    }

                    <TouchableOpacity
                        style={[styles.actionBtn, { marginTop: 32 }]}
                        onPress={() => { stopAndUnloadAudio(); navigation.navigate('Home'); }}
                    >
                        <Text style={styles.actionBtnText}>🏠 ZURÜCK ZUM HOME</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.actionBtnSecondary, { marginTop: 12 }]}
                        onPress={() => { setScores(players.map(p => ({ ...p, score: 0 }))); setCurrentRound(1); setPhase('SHUFFLE'); }}
                    >
                        <Text style={styles.actionBtnSecondaryText}>↺ NOCHMAL SPIELEN</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* SHUFFLE */}
            {phase === 'SHUFFLE' && (
                <View style={styles.centered}>
                    <Text style={styles.phaseLabel}>
                        {showQuestionCard ? 'DEINE FRAGE' : 'KARTEN WERDEN GEMISCHT'}
                    </Text>

                    <View style={{ width: 220, height: 280, alignItems: 'center', justifyContent: 'center' }}>
                        {!showQuestionCard ? (
                            <>
                                {/* Karte 1 (Hinten) */}
                                <Animated.View style={[styles.shuffleCard, {
                                    position: 'absolute',
                                    transform: [
                                        { translateX: shuffleAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -70] }) },
                                        { translateY: shuffleAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 10] }) },
                                        { rotate: '-12deg' },
                                        { scale: 0.85 }
                                    ]
                                }]}>
                                    <Image source={require('../../icon/platte.png')} style={{ width: 100, height: 100, resizeMode: 'contain', opacity: 0.8 }} />
                                </Animated.View>

                                {/* Karte 2 (Mitte) */}
                                <Animated.View style={[styles.shuffleCard, {
                                    position: 'absolute',
                                    transform: [
                                        { translateX: shuffleAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 70] }) },
                                        { translateY: shuffleAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -10] }) },
                                        { rotate: '8deg' },
                                        { scale: 0.90 }
                                    ]
                                }]}>
                                    <Image source={require('../../icon/platte.png')} style={{ width: 100, height: 100, resizeMode: 'contain', opacity: 0.8 }} />
                                </Animated.View>

                                {/* Karte 3 (Vorne) */}
                                <Animated.View style={[styles.shuffleCard, {
                                    position: 'absolute',
                                    transform: [
                                        { translateX: shuffleAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }) },
                                        { translateY: shuffleAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 15] }) },
                                        { rotate: shuffleAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '15deg'] }) },
                                        { scale: 0.95 }
                                    ]
                                }]}>
                                    <Image source={require('../../icon/platte.png')} style={{ width: 100, height: 100, resizeMode: 'contain', opacity: 0.8 }} />
                                </Animated.View>
                            </>
                        ) : (
                            <Animated.View style={[{
                                position: 'absolute',
                                width: 180, height: 240, // Base card width/height
                                transform: [
                                    { scale: revealAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1.3] }) }
                                ]
                            }]}>
                                {/* Back side (Image) */}
                                <Animated.View style={[styles.shuffleCard, {
                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                    backfaceVisibility: 'hidden',
                                    transform: [
                                        { rotateY: flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }
                                    ]
                                }]}>
                                    <Image source={require('../../icon/platte.png')} style={{ width: 100, height: 100, resizeMode: 'contain', opacity: 0.8 }} />
                                </Animated.View>

                                {/* Front side (Question text) */}
                                <Animated.View style={[styles.shuffleCard, {
                                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                    backfaceVisibility: 'hidden',
                                    transform: [
                                        { rotateY: flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] }) }
                                    ]
                                }]}>
                                    <Text style={styles.shuffleCardIcon}>{qMeta.icon}</Text>
                                    <Text style={styles.shuffleCardLabel}>{qMeta.label}</Text>
                                </Animated.View>
                            </Animated.View>
                        )}
                    </View>

                    <Text style={[styles.subText, { marginTop: 40 }]}>
                        {showQuestionCard ? 'Mach dich bereit!' : 'Gleich geht\'s los...'}
                    </Text>
                </View>
            )}

            {/* TIMER VOR */}
            {phase === 'TIMER_VOR' && (
                <View style={styles.centered}>
                    <Text style={styles.phaseLabel}>BEREIT?</Text>
                    <View style={styles.countdownCircle}>
                        <Text style={styles.countdownText}>{countdown}</Text>
                    </View>
                    <Text style={styles.subText}>Musik startet gleich...</Text>
                </View>
            )}

            {/* MUSIC */}
            {phase === 'MUSIC' && currentSong && (
                <View style={styles.centered}>
                    {/* Top Fragetyp anzeigen */}
                    <View style={[styles.questionBadge, { marginBottom: 30, marginTop: 10 }]}>
                        <Text style={styles.questionBadgeText}>{qMeta.label}</Text>
                    </View>

                    <View style={{ width: 320, height: 320, justifyContent: 'center', alignItems: 'center' }}>
                        <Svg width="320" height="320" viewBox="0 0 320 320" style={{ position: 'absolute' }}>
                            {/* Background track (from 5 o'clock to 1 o'clock = 240 degrees = 590 dash) */}
                            <Circle
                                cx="160" cy="160" r="140"
                                stroke={theme.colors.surfaceDark}
                                strokeWidth="8"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray="590 880"
                                transform="rotate(60 160 160)"
                            />
                            {/* Animated progress tracking */}
                            <AnimatedCircle
                                cx="160" cy="160" r="140"
                                stroke={theme.colors.accentPrimary}
                                strokeWidth="8"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray="590 880"
                                strokeDashoffset={progressAnim.interpolate({ inputRange: [0, 1], outputRange: [590, 0] })}
                                transform="rotate(60 160 160)"
                            />
                        </Svg>

                        {/* Spinning vinyl */}
                        <Animated.View style={{ transform: [{ rotate: spin }] }}>
                            <Image source={require('../../icon/platte.png')} style={{ width: 240, height: 240, resizeMode: 'contain' }} />
                        </Animated.View>

                        {/* Arm needle positioned strictly over the vinyl */}
                        <Image source={require('../../icon/arm.png')} style={{ position: 'absolute', right: -10, top: 40, width: 125, height: 165, resizeMode: 'contain', zIndex: 10, transform: [{ rotate: '-3deg' }] }} />
                    </View>

                    {/* Bottom, rotate by 180 degrees */}
                    <View style={[styles.questionBadge, { transform: [{ rotate: '180deg' }], marginTop: 30, marginBottom: 10 }]}>
                        <Text style={styles.questionBadgeText}>{qMeta.label}</Text>
                    </View>

                    <Text style={[styles.subText, { marginTop: 0 }]}>
                        {audioStatus === 'loading' ? 'Lade Audio...' :
                            audioStatus === 'error' ? '⚠ Kein Ton – Runde läuft.' : ''}
                    </Text>
                </View>
            )}

            {/* TIMER NACH */}
            {phase === 'TIMER_NACH' && (
                <View style={styles.centered}>
                    <Text style={styles.phaseLabel}>LETZTE CHANCE!</Text>
                    <View style={[styles.countdownCircle, { borderColor: '#FF4444' }]}>
                        <Text style={styles.countdownText}>{countdown}</Text>
                    </View>
                    <Text style={styles.subText}>Rundeende naht...</Text>
                </View>
            )}

            {/* RESOLUTION */}
            {phase === 'RESOLUTION' && currentSong && (
                <ScrollView contentContainerStyle={styles.resolutionContainer}>
                    <Text style={styles.phaseLabel}>AUFLÖSUNG</Text>

                    {/* Gesuchte Antwort — prominent hervorgehoben */}
                    <View style={styles.answerHighlight}>
                        <Text style={styles.answerQuestion}>{qMeta.icon}  {qMeta.label}</Text>
                        <Text style={styles.answerValue}>{correctAnswer}</Text>
                    </View>

                    {/* Song-Details */}
                    <View style={styles.coverCard}>
                        {currentSong.coverUrl && (
                            <Image 
                                source={{ uri: currentSong.coverUrl }} 
                                style={[StyleSheet.absoluteFillObject, { opacity: 1 }]} 
                                blurRadius={1}
                                resizeMode="cover"
                            />
                        )}
                        <View style={styles.coverOverlay}>
                            <Text style={styles.songTitleLarge} numberOfLines={2} adjustsFontSizeToFit>{currentSong.title}</Text>
                            <Text style={styles.songArtistLarge} numberOfLines={1} adjustsFontSizeToFit>{currentSong.artist}</Text>
                            <Text style={styles.songMetaLarge}>{currentSong.year} · {currentSong.genre} · {currentSong.decade}</Text>
                            
                            {/* Film/Serie anzeigen wenn vorhanden */}
                            {currentSong.film && (
                                <View style={styles.filmBadge}>
                                    <Text style={styles.filmBadgeText}>🎬  {currentSong.film}</Text>
                                </View>
                            )}
                            {currentSong.appleMusicUrl && (
                                <TouchableOpacity style={styles.appleMusicBtn} onPress={() => Linking.openURL(currentSong.appleMusicUrl)}>
                                    <Text style={styles.appleMusicText}>🎵 Auf Apple Music anhören</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <Text style={styles.sectionLabel}>PUNKTE VERGEBEN</Text>
                    {scores.map(player => (
                        <View key={player.id} style={styles.playerScoreRow}>
                            <Text style={styles.playerScoreName}>{player.name}</Text>
                            <Text style={styles.playerScoreValue}>{player.score} Pkt.</Text>
                            <TouchableOpacity style={styles.pointBtn} onPress={() => givePoint(player.id)}>
                                <Text style={styles.pointBtnText}>✓ RICHTIG</Text>
                            </TouchableOpacity>
                        </View>
                    ))}

                    <TouchableOpacity style={styles.nextRoundBtn} onPress={nextRound}>
                        <Text style={styles.nextRoundText}>NÄCHSTE RUNDE</Text>
                    </TouchableOpacity>
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.backgroundStart },
    homeBtn: {
        position: 'absolute',
        top: 12,
        left: 12,
        backgroundColor: theme.colors.surface,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: theme.layout.borderRadius.pill,
        borderWidth: 2,
        borderColor: theme.colors.accentPrimary,
        zIndex: 10,
        elevation: 6,
    },
    homeBtnText: { color: theme.colors.accentPrimary, fontSize: 16, fontWeight: 'bold', letterSpacing: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.layout.paddingHorizontal },
    phaseLabel: {
        color: theme.colors.accentPrimary,
        fontSize: theme.typography.sizes.small,
        fontWeight: theme.typography.weights.bold,
        letterSpacing: 2,
        marginBottom: theme.spacing.xl,
        textAlign: 'center',
    },
    subText: { color: theme.colors.textSecondary, fontSize: theme.typography.sizes.body, marginTop: theme.spacing.xl, fontStyle: 'italic', textAlign: 'center' },
    // Shuffle
    shuffleCard: {
        width: 180, height: 240,
        backgroundColor: theme.colors.surface,
        borderRadius: theme.layout.borderRadius.card,
        borderColor: theme.colors.accentPrimary, borderWidth: 2,
        justifyContent: 'center', alignItems: 'center', elevation: 8,
        padding: 16
    },
    shuffleCardIcon: { fontSize: 40, marginBottom: 16, textAlign: 'center' },
    shuffleCardLabel: { fontSize: 16, fontWeight: 'bold', color: theme.colors.textPrimary, textAlign: 'center' },
    // Countdown
    countdownCircle: {
        width: 180, height: 180, borderRadius: 90,
        borderWidth: 6, borderColor: theme.colors.accentPrimary,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: theme.colors.surface, elevation: 8,
    },
    countdownText: { color: theme.colors.textPrimary, fontSize: 72, fontWeight: theme.typography.weights.heavy },
    // Question badge
    questionBadge: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.layout.borderRadius.pill,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderWidth: 2,
        borderColor: theme.colors.accentPrimary,
        marginBottom: theme.spacing.xl,
    },
    questionBadgeText: { color: theme.colors.accentPrimary, fontWeight: '900', fontSize: 20, letterSpacing: 1.5, textAlign: 'center' },
    // Progress
    progressTrack: { width: '80%', height: 8, backgroundColor: theme.colors.surfaceDark, borderRadius: 4, marginBottom: theme.spacing.xl, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: theme.colors.accentPrimary, borderRadius: 4 },
    // Vinyl
    vinylOuter: {
        width: 220, height: 220, borderRadius: 110,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: theme.colors.surfaceDark, elevation: 12,
        borderWidth: 3, borderColor: theme.colors.accentPrimary,
    },
    glowRing: {
        position: 'absolute',
        width: 240, height: 240, borderRadius: 120,
        backgroundColor: theme.colors.accentPrimary,
        shadowColor: theme.colors.accentPrimary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 30,
        elevation: 20,
    },
    vinyl: { width: 200, height: 200, borderRadius: 100, backgroundColor: '#0d0d0d', justifyContent: 'center', alignItems: 'center' },
    vinylGrooves: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center', position: 'relative' },
    groove: { position: 'absolute', borderWidth: 1, borderColor: 'rgba(255,140,0,0.2)' },
    vinylLabel: { width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.accentPrimary, justifyContent: 'center', alignItems: 'center' },
    vinylLabelText: { color: theme.colors.textOnPrimary, fontSize: 20, fontWeight: theme.typography.weights.bold },
    // Resolution
    resolutionContainer: { padding: theme.layout.paddingHorizontal, paddingBottom: 60, paddingTop: 20 },
    // ANSWER HIGHLIGHT
    answerHighlight: {
        backgroundColor: theme.colors.accentPrimary,
        borderRadius: theme.layout.borderRadius.card,
        padding: theme.spacing.l,
        marginBottom: theme.spacing.l,
        alignItems: 'center',
        elevation: 8,
    },
    answerQuestion: {
        color: theme.colors.textOnPrimary,
        fontSize: theme.typography.sizes.small,
        fontWeight: theme.typography.weights.bold,
        letterSpacing: 1,
        marginBottom: theme.spacing.s,
        opacity: 0.85,
    },
    answerValue: {
        color: theme.colors.textOnPrimary,
        fontSize: 28,
        fontWeight: theme.typography.weights.heavy,
        textAlign: 'center',
    },
    card: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.l,
        borderRadius: theme.layout.borderRadius.card,
        borderColor: theme.colors.border, borderWidth: 1,
        marginBottom: theme.spacing.l, alignItems: 'center',
    },
    songTitle: { color: theme.colors.textPrimary, fontSize: theme.typography.sizes.h1, fontWeight: theme.typography.weights.bold, textAlign: 'center', marginBottom: theme.spacing.s },
    songArtist: { color: theme.colors.accentPrimary, fontSize: theme.typography.sizes.body, fontWeight: theme.typography.weights.medium, marginBottom: theme.spacing.s },
    songMeta: { color: theme.colors.textSecondary, fontSize: theme.typography.sizes.small, marginBottom: theme.spacing.m },
    coverCard: { width: '100%', aspectRatio: 1, borderRadius: theme.layout.borderRadius.card, borderColor: theme.colors.border, borderWidth: 1, marginBottom: theme.spacing.l, overflow: 'hidden', backgroundColor: theme.colors.surface },
    coverOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(12, 16, 26, 0.65)', justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
    songTitleLarge: { color: theme.colors.textPrimary, fontSize: 34, fontWeight: theme.typography.weights.heavy, textAlign: 'center', marginBottom: theme.spacing.m, textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },
    songArtistLarge: { color: theme.colors.accentPrimary, fontSize: 24, fontWeight: theme.typography.weights.bold, marginBottom: theme.spacing.xl, textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6, textAlign: 'center' },
    songMetaLarge: { color: theme.colors.textSecondary, fontSize: 16, fontWeight: 'bold', marginBottom: theme.spacing.m, textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
    filmBadge: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: `${theme.colors.accentPrimary}18`,
        borderWidth: 1, borderColor: `${theme.colors.accentPrimary}55`,
        borderRadius: theme.layout.borderRadius.pill,
        paddingVertical: 6, paddingHorizontal: 14,
        marginBottom: theme.spacing.m,
    },
    filmBadgeText: { color: theme.colors.accentPrimary, fontWeight: 'bold', fontSize: 13 },
    appleMusicBtn: { backgroundColor: theme.colors.surfaceDark, paddingVertical: theme.spacing.s, paddingHorizontal: theme.spacing.m, borderRadius: theme.layout.borderRadius.pill, borderWidth: 1, borderColor: theme.colors.accentPrimary, marginTop: theme.spacing.s },
    appleMusicText: { color: theme.colors.accentPrimary, fontWeight: theme.typography.weights.bold, fontSize: theme.typography.sizes.small },
    sectionLabel: { color: theme.colors.accentPrimary, fontSize: theme.typography.sizes.small, fontWeight: theme.typography.weights.bold, letterSpacing: 1, marginBottom: theme.spacing.m },
    playerScoreRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, padding: theme.spacing.m, borderRadius: theme.layout.borderRadius.card, borderColor: theme.colors.border, borderWidth: 1, marginBottom: theme.spacing.s },
    playerScoreName: { flex: 1, color: theme.colors.textPrimary, fontSize: theme.typography.sizes.body },
    playerScoreValue: { color: theme.colors.accentPrimary, fontWeight: theme.typography.weights.bold, fontSize: theme.typography.sizes.body, marginRight: theme.spacing.m },
    pointBtn: { backgroundColor: theme.colors.accentPrimary, paddingVertical: theme.spacing.s, paddingHorizontal: theme.spacing.m, borderRadius: theme.layout.borderRadius.pill },
    pointBtnText: { color: theme.colors.textOnPrimary, fontSize: theme.typography.sizes.small, fontWeight: theme.typography.weights.bold },
    nextRoundBtn: { backgroundColor: theme.colors.accentPrimary, paddingVertical: theme.spacing.m, borderRadius: theme.layout.borderRadius.pill, alignItems: 'center', marginTop: theme.spacing.xl },
    nextRoundText: { color: theme.colors.textOnPrimary, fontWeight: theme.typography.weights.bold, fontSize: theme.typography.sizes.body },
    // Runden-Anzeige
    roundIndicator: {
        position: 'absolute', top: 12, right: 12, zIndex: 10,
        backgroundColor: theme.colors.surface,
        paddingVertical: 8, paddingHorizontal: 14,
        borderRadius: theme.layout.borderRadius.pill,
        borderWidth: 1, borderColor: theme.colors.border,
    },
    roundIndicatorText: { color: theme.colors.accentPrimary, fontSize: 14, fontWeight: '900', letterSpacing: 1 },
    // Game Over
    gameOverEmoji: { fontSize: 80, marginBottom: 8 },
    gameOverSub: { color: theme.colors.textSecondary, fontSize: 15, marginBottom: 24, fontStyle: 'italic' },
    podiumRow: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: 14, borderRadius: theme.layout.borderRadius.card,
        borderWidth: 1, borderColor: theme.colors.border,
        marginBottom: 8, width: '100%',
    },
    podiumRowFirst: {
        borderColor: theme.colors.accentPrimary,
        backgroundColor: `${theme.colors.accentPrimary}18`,
    },
    podiumRank: { fontSize: 26, marginRight: 14 },
    podiumName: { flex: 1, color: theme.colors.textPrimary, fontSize: 16, fontWeight: 'bold' },
    podiumScore: { color: theme.colors.accentPrimary, fontSize: 16, fontWeight: '900' },
    actionBtn: {
        backgroundColor: theme.colors.accentPrimary,
        paddingVertical: 16, paddingHorizontal: 32,
        borderRadius: theme.layout.borderRadius.pill,
        alignItems: 'center', width: '100%',
        elevation: 6,
    },
    actionBtnText: { color: theme.colors.textOnPrimary, fontWeight: '900', fontSize: 16, letterSpacing: 1 },
    actionBtnSecondary: {
        backgroundColor: 'transparent',
        borderWidth: 1, borderColor: theme.colors.border,
        elevation: 0,
    },
    actionBtnSecondaryText: { color: theme.colors.textSecondary, fontWeight: 'bold', fontSize: 15 },
});
