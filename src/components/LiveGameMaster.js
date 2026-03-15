import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { collection, doc, getDocs, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Animated, Easing,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { db } from '../config/firebase';
import { theme } from '../styles/theme';

const QUESTION_META = {
    artist: { label: 'WER SINGT DEN SONG?', icon: '🎤', getValue: s => s.artist },
    title: { label: 'WIE HEISST DER SONG?', icon: '🎵', getValue: s => s.title },
    year: { label: 'AUS WELCHEM JAHR?', icon: '📅', getValue: s => String(s.year) },
    genre: { label: 'WELCHES GENRE?', icon: '🎸', getValue: s => s.genre },
};

function getRandomSong(songsPool) {
    if (!songsPool || songsPool.length === 0) return null;
    return songsPool[Math.floor(Math.random() * songsPool.length)];
}

export default function LiveGameMaster({ route, navigation }) {
    const { roomPin, isHost, playerId } = route.params;
    const insets = useSafeAreaInsets();

    const [roomData, setRoomData] = useState(null);
    const [playlistSongs, setPlaylistSongs] = useState([]);

    // Lokale Statuswerte, die synchron zu den Phasen-Wechseln laufen
    const [countdown, setCountdown] = useState(0);
    const [audioStatus, setAudioStatus] = useState('idle');
    const [myAnswer, setMyAnswer] = useState('');
    const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);

    const player = useAudioPlayer();
    const isActiveRef = useRef(true);
    const spinAnim = useRef(new Animated.Value(0)).current;
    const glowAnim = useRef(new Animated.Value(0.4)).current;
    const shuffleAnim = useRef(new Animated.Value(0)).current;
    const progressAnim = useRef(new Animated.Value(1)).current;
    const progressTimerRef = useRef(null);

    // Einmalig zum Start konfigurieren
    useEffect(() => {
        setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false });

        // Host lädt Songs
        if (isHost) {
            const fetchSongs = async () => {
                try {
                    const q = query(collection(db, 'songs'), where('playlistId', '==', 'starter')); // TODO: Dynamisch machen
                    const snapshot = await getDocs(q);
                    const loadedSongs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setPlaylistSongs(loadedSongs);
                } catch (error) {
                    console.error("Fehler beim Laden der Songs:", error);
                }
            };
            fetchSongs();
        }

        // Cleanup 
        return () => { stopAndUnloadAudio(); };
    }, []);

    // Firestore Sync
    useEffect(() => {
        const roomRef = doc(db, 'games', roomPin);
        const unsubscribe = onSnapshot(roomRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setRoomData(data);

                // Automatischer Reset des Eingabefeldes, wenn neue Runde (SHUFFLE) startet
                if (data.currentPhase === 'SHUFFLE' && hasSubmittedAnswer) {
                    setMyAnswer('');
                    setHasSubmittedAnswer(false);
                }

                // Wenn der Host das Spiel beendet, gehen alle in die Lobby zurück
                if (data.status === 'waiting' && data.currentPhase === 'LOBBY') {
                    navigation.replace('OnlineWaitingRoom', { roomPin, isHost, playerId });
                }
            } else {
                Alert.alert("Spiel beendet", "Der Raum wurde geschlossen.");
                navigation.navigate('Home');
            }
        });
        return () => unsubscribe();
    }, [roomPin, hasSubmittedAnswer, navigation]);

    // Cleanup bei Blur
    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () => {
            isActiveRef.current = false;
            stopAndUnloadAudio();
        });
        const unsubFocus = navigation.addListener('focus', () => {
            isActiveRef.current = true;
        });
        return () => { unsubscribe(); unsubFocus(); };
    }, [navigation]);

    const stopAndUnloadAudio = () => {
        if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
        if (player) {
            try {
                player.pause();
            } catch (e) {
                console.log("Audio pause error (already released?):", e);
            }
        }
    };

    // --- PHASE MANAGEMENT (Nur Host steuert Firebase) ---
    // SHUFFLE Phase
    useEffect(() => {
        if (!roomData) return;
        if (roomData.currentPhase !== 'SHUFFLE') return;

        // Visuals für alle
        stopAndUnloadAudio();
        setAudioStatus('idle');

        Animated.sequence([
            Animated.timing(shuffleAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
            Animated.timing(shuffleAnim, { toValue: -1, duration: 250, useNativeDriver: true }),
            Animated.timing(shuffleAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
            Animated.timing(shuffleAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
        ]).start();

        // Host Logik (zieht Song und geht zu TIMER_VOR)
        if (isHost && playlistSongs.length > 0) {
            const nextPhase = async () => {
                const song = getRandomSong(playlistSongs);
                // Wähle zufälligen Fragetyp (hier fix auf 'artist' für MVP)
                const qType = 'artist';

                // Alle Antworten der Spieler zurücksetzen + Point-Flag clear
                const resetPlayers = roomData.players.map(p => ({
                    ...p,
                    currentAnswer: '',
                    pointAwarded: false
                }));

                await updateDoc(doc(db, 'games', roomPin), {
                    currentSong: song,
                    currentQuestionType: qType,
                    players: resetPlayers,
                    currentPhase: 'TIMER_VOR'
                });
            };
            const t = setTimeout(nextPhase, 4000);
            return () => clearTimeout(t);
        }
    }, [roomData?.currentPhase, playlistSongs, isHost]);

    // TIMER VOR / NACH Phase
    useEffect(() => {
        if (!roomData) return;
        if (roomData.currentPhase === 'TIMER_VOR') setCountdown(roomData.settings.timerBefore || 5);
        if (roomData.currentPhase === 'TIMER_NACH') setCountdown(roomData.settings.timerAfter || 5);
    }, [roomData?.currentPhase]);

    useEffect(() => {
        if (!roomData) return;
        const phase = roomData.currentPhase;
        if ((phase !== 'TIMER_VOR' && phase !== 'TIMER_NACH') || countdown <= 0) return;

        const t = setTimeout(() => {
            setCountdown(c => c - 1);
        }, 1000);
        return () => clearTimeout(t);
    }, [countdown, roomData?.currentPhase]);

    // Phasenübergänge durch den Timer (nur Host)
    useEffect(() => {
        if (!isHost || !roomData) return;
        const phase = roomData.currentPhase;

        if (phase === 'TIMER_VOR' && countdown === 0) {
            const t = setTimeout(() => {
                updateDoc(doc(db, 'games', roomPin), { currentPhase: 'MUSIC' });
            }, 500);
            return () => clearTimeout(t);
        }
        if (phase === 'TIMER_NACH' && countdown === 0) {
            const t = setTimeout(() => {
                updateDoc(doc(db, 'games', roomPin), { currentPhase: 'RESOLUTION' });
            }, 500);
            return () => clearTimeout(t);
        }
    }, [countdown, roomData?.currentPhase, isHost]);

    // MUSIC Phase
    useEffect(() => {
        if (!roomData || roomData.currentPhase !== 'MUSIC' || !roomData.currentSong) return;

        spinAnim.setValue(0);
        const spinAnimation = Animated.loop(
            Animated.timing(spinAnim, { toValue: 1, duration: 3000, easing: Easing.linear, useNativeDriver: true })
        );
        spinAnimation.start();

        glowAnim.setValue(0.4);
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
                Animated.timing(glowAnim, { toValue: 0.4, duration: 900, useNativeDriver: true }),
            ])
        ).start();

        const runMusicPhase = () => {
            if (!roomData.currentSong.audioUrl || !isActiveRef.current) {
                if (isActiveRef.current) startProgressAndTimer(30000, spinAnimation);
                return;
            }
            setAudioStatus('loading');
            try {
                // Audio über das neue expo-audio Interface einhängen
                player.replace(roomData.currentSong.audioUrl);
                if (!isActiveRef.current) {
                    try { player.pause(); } catch (e) { }
                    return;
                }
                player.play();
                setAudioStatus('playing');

                const duration = 30000;
                startProgressAndTimer(duration, spinAnimation);
            } catch (e) {
                if (isActiveRef.current) {
                    setAudioStatus('error');
                    startProgressAndTimer(30000, spinAnimation);
                }
            }
        };

        runMusicPhase();
        return () => { spinAnimation.stop(); };
    }, [roomData?.currentPhase]);

    const startProgressAndTimer = (durationMs, spinAnimation) => {
        progressAnim.setValue(1);
        Animated.timing(progressAnim, {
            toValue: 0, duration: durationMs, easing: Easing.linear, useNativeDriver: false,
        }).start();

        // Host switcht die Phase am Ende
        progressTimerRef.current = setTimeout(() => {
            spinAnimation.stop();
            stopAndUnloadAudio();
            if (isHost && roomData.currentPhase === 'MUSIC') {
                updateDoc(doc(db, 'games', roomPin), { currentPhase: 'TIMER_NACH' });
            }
        }, durationMs);
    };

    const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

    // Spieler reicht Antwort ein
    const submitAnswer = async () => {
        if (!myAnswer.trim()) return;
        try {
            const players = [...roomData.players];
            const idx = players.findIndex(p => p.id === playerId);
            if (idx > -1) {
                players[idx].currentAnswer = myAnswer.trim();
                await updateDoc(doc(db, 'games', roomPin), { players });
                setHasSubmittedAnswer(true);
            }
        } catch (e) {
            console.error(e);
        }
    };

    // Punkte vergeben (Host oder Community)
    const togglePoint = async (targetPlayerId) => {
        const mode = roomData.settings?.gradingMode || 'host';
        if (mode === 'host' && !isHost) return;
        if (mode === 'vote' && targetPlayerId === playerId) return; // In Vote-Mode darf niemand für sich selbst punkten

        try {
            const players = [...roomData.players];
            const idx = players.findIndex(p => p.id === targetPlayerId);
            // Vergib Punkt nur, wenn noch kein Punkt in dieser Runde vergeben wurde
            if (idx > -1 && !players[idx].pointAwarded) {
                players[idx].score += 1;
                players[idx].pointAwarded = true;
                await updateDoc(doc(db, 'games', roomPin), { players });
            }
        } catch (e) {
            console.error(e);
        }
    };

    const nextRound = async () => {
        if (!isHost) return;
        progressAnim.setValue(1);
        await updateDoc(doc(db, 'games', roomPin), { currentPhase: 'SHUFFLE' });
    };

    const endGame = async () => {
        if (!isHost) return;
        Alert.alert(
            "Spiel beenden?",
            "Möchtest du das Spiel abbrechen und mit allen in den Warteraum zurückkehren?",
            [
                { text: "Abbrechen", style: "cancel" },
                {
                    text: "Beenden",
                    style: "destructive",
                    onPress: async () => {
                        stopAndUnloadAudio();
                        try {
                            await updateDoc(doc(db, 'games', roomPin), { status: 'waiting', currentPhase: 'LOBBY' });
                        } catch (e) {
                            console.error("Fehler beim Beenden:", e);
                        }
                    }
                }
            ]
        );
    };

    if (!roomData) return <View style={styles.container}><ActivityIndicator color={theme.colors.accentPrimary} /></View>;

    const phase = roomData.currentPhase;
    const currentSong = roomData.currentSong;
    const qMeta = QUESTION_META[roomData.currentQuestionType] || QUESTION_META.artist;
    const correctAnswer = currentSong ? qMeta.getValue(currentSong) : '';

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={[styles.container, { paddingTop: insets.top }]}>

            {/* Host: Spiel beenden Button */}
            {isHost && (
                <TouchableOpacity
                    style={[styles.endGameBtn, { top: insets.top + 10 }]}
                    onPress={endGame}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                    <Text style={styles.endGameBtnText}>✕ BEENDEN</Text>
                </TouchableOpacity>
            )}

            {phase === 'SHUFFLE' && (
                <View style={styles.centered}>
                    <Text style={styles.phaseLabel}>RUHE BITTE</Text>
                    <Animated.View style={[styles.shuffleCard, { transform: [{ rotate: shuffleAnim.interpolate({ inputRange: [-1, 1], outputRange: ['-15deg', '15deg'] }) }] }]}>
                        <Text style={styles.shuffleCardText}>🎵</Text>
                    </Animated.View>
                    <Text style={styles.subText}>{isHost ? "Suche nach dem perfekten Song..." : "Der Host wählt den nächsten Song..."}</Text>
                </View>
            )}

            {phase === 'TIMER_VOR' && (
                <View style={styles.centered}>
                    <Text style={styles.phaseLabel}>BEREIT?</Text>
                    <View style={styles.countdownCircle}>
                        <Text style={styles.countdownText}>{countdown}</Text>
                    </View>
                </View>
            )}

            {/* Answer Input Area during Music or Timer Nach */}
            {(phase === 'MUSIC' || phase === 'TIMER_NACH') && currentSong && (
                <View style={styles.centered}>
                    <View style={styles.questionBadge}>
                        <Text style={styles.questionBadgeText}>{qMeta.icon}  {qMeta.label}</Text>
                    </View>

                    {phase === 'MUSIC' ? (
                        <View style={styles.progressTrack}>
                            <Animated.View style={[styles.progressFill, { width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
                        </View>
                    ) : (
                        <Text style={[styles.phaseLabel, { color: '#FF4444' }]}>NUR NOCH {countdown} SEKUNDEN</Text>
                    )}

                    {phase === 'MUSIC' && (
                        <Animated.View style={[styles.vinylOuter, { opacity: glowAnim.interpolate({ inputRange: [0.4, 1], outputRange: [0.85, 1] }) }]}>
                            <Animated.View style={[styles.glowRing, { opacity: glowAnim }]} />
                            <Animated.View style={[styles.vinyl, { transform: [{ rotate: spin }] }]}>
                                <View style={styles.vinylGrooves}>
                                    {[80, 100, 120, 140, 160].map(r => <View key={r} style={[styles.groove, { width: r, height: r, borderRadius: r / 2 }]} />)}
                                    <View style={styles.vinylLabel}><Text style={styles.vinylLabelText}>▶</Text></View>
                                </View>
                            </Animated.View>
                        </Animated.View>
                    )}

                    <View style={styles.inputContainer}>
                        {hasSubmittedAnswer ? (
                            <Text style={styles.submittedText}>✓ Antwort eingeloggt!</Text>
                        ) : (
                            <>
                                <TextInput
                                    style={styles.answerInput}
                                    placeholder="Deine Antwort hier tippen..."
                                    placeholderTextColor="#888"
                                    value={myAnswer}
                                    onChangeText={setMyAnswer}
                                    onSubmitEditing={submitAnswer}
                                />
                                <TouchableOpacity style={styles.submitBtn} onPress={submitAnswer}>
                                    <Text style={styles.submitBtnText}>SENDEN</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            )}

            {phase === 'RESOLUTION' && currentSong && (
                <ScrollView contentContainerStyle={styles.resolutionContainer}>
                    <Text style={styles.phaseLabel}>AUFLÖSUNG</Text>

                    <View style={styles.answerHighlight}>
                        <Text style={styles.answerQuestion}>{qMeta.icon}  {qMeta.label}</Text>
                        <Text style={styles.answerValue}>{correctAnswer}</Text>
                    </View>

                    <Text style={styles.sectionLabel}>SPIELER-ANTWORTEN</Text>
                    {roomData.players.map(player => (
                        <View key={player.id} style={styles.playerScoreRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.playerScoreName}>
                                    {player.name} {player.id === playerId ? '(Du)' : ''}
                                </Text>
                                <Text style={styles.playerAnswerValue}>
                                    {player.currentAnswer || 'Keine Antwort 🙈'}
                                </Text>
                            </View>

                            <Text style={styles.playerScoreValue}>{player.score} Pkt.</Text>

                            {/* Punktevergabe Logik */}
                            {!player.pointAwarded && (
                                <>
                                    {/* 
                                        Im 'vote' Modus: Alle dürfen punkten, nur nicht bei sich selbst (player.id !== playerId).
                                        Im 'host' Modus: Nur der Host darf punkten, aber bei JEDEM (auch sich selbst). (isHost)
                                    */}
                                    {(roomData.settings?.gradingMode === 'vote' ? (player.id !== playerId) : isHost) ? (
                                        <TouchableOpacity style={[styles.pointBtn, roomData.settings?.gradingMode === 'vote' && styles.voteBtn]} onPress={() => togglePoint(player.id)}>
                                            <Text style={styles.pointBtnText}>
                                                {roomData.settings?.gradingMode === 'vote' ? '👍 GILT!' : '+ PUNKT'}
                                            </Text>
                                        </TouchableOpacity>
                                    ) : null}
                                </>
                            )}
                            {player.pointAwarded && (
                                <Text style={styles.pointAwardedText}>✓ GEWERTET</Text>
                            )}
                        </View>
                    ))}

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
                        </View>
                    </View>

                    {isHost ? (
                        <TouchableOpacity style={styles.nextRoundBtn} onPress={nextRound}>
                            <Text style={styles.nextRoundText}>NÄCHSTE RUNDE</Text>
                        </TouchableOpacity>
                    ) : (
                        <Text style={styles.waitingText}>Warte auf Host...</Text>
                    )}
                </ScrollView>
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.backgroundStart },
    endGameBtn: {
        position: 'absolute',
        right: 16,
        backgroundColor: theme.colors.surface,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: theme.layout.borderRadius.pill,
        borderWidth: 2,
        borderColor: '#FF4444',
        zIndex: 10,
    },
    endGameBtnText: { color: '#FF4444', fontSize: 14, fontWeight: 'bold' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.layout.paddingHorizontal },
    phaseLabel: { color: theme.colors.accentPrimary, fontSize: theme.typography.sizes.small, fontWeight: theme.typography.weights.bold, letterSpacing: 2, marginBottom: theme.spacing.xl, textAlign: 'center' },
    subText: { color: theme.colors.textSecondary, fontSize: theme.typography.sizes.body, marginTop: theme.spacing.xl, fontStyle: 'italic', textAlign: 'center' },
    shuffleCard: { width: 150, height: 200, backgroundColor: theme.colors.surface, borderRadius: theme.layout.borderRadius.card, borderColor: theme.colors.accentPrimary, borderWidth: 2, justifyContent: 'center', alignItems: 'center', elevation: 8 },
    shuffleCardText: { fontSize: 60 },
    countdownCircle: { width: 180, height: 180, borderRadius: 90, borderWidth: 6, borderColor: theme.colors.accentPrimary, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.surface, elevation: 8 },
    countdownText: { color: theme.colors.textPrimary, fontSize: 72, fontWeight: theme.typography.weights.heavy },
    questionBadge: { backgroundColor: theme.colors.surface, borderRadius: theme.layout.borderRadius.pill, paddingVertical: theme.spacing.s, paddingHorizontal: theme.spacing.l, borderWidth: 2, borderColor: theme.colors.accentPrimary, marginBottom: theme.spacing.xl },
    questionBadgeText: { color: theme.colors.accentPrimary, fontWeight: theme.typography.weights.bold, fontSize: 14, letterSpacing: 1 },
    progressTrack: { width: '80%', height: 8, backgroundColor: theme.colors.surfaceDark, borderRadius: 4, marginBottom: theme.spacing.xl, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: theme.colors.accentPrimary, borderRadius: 4 },
    vinylOuter: { width: 220, height: 220, borderRadius: 110, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.surfaceDark, elevation: 12, borderWidth: 3, borderColor: theme.colors.accentPrimary, marginBottom: 30 },
    glowRing: { position: 'absolute', width: 240, height: 240, borderRadius: 120, backgroundColor: theme.colors.accentPrimary, shadowColor: theme.colors.accentPrimary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 30, elevation: 20 },
    vinyl: { width: 200, height: 200, borderRadius: 100, backgroundColor: '#0d0d0d', justifyContent: 'center', alignItems: 'center' },
    vinylGrooves: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center', position: 'relative' },
    groove: { position: 'absolute', borderWidth: 1, borderColor: 'rgba(255,140,0,0.2)' },
    vinylLabel: { width: 60, height: 60, borderRadius: 30, backgroundColor: theme.colors.accentPrimary, justifyContent: 'center', alignItems: 'center' },
    vinylLabelText: { color: theme.colors.textOnPrimary, fontSize: 20, fontWeight: theme.typography.weights.bold },

    // Live Multiplayer Inputs
    inputContainer: { width: '100%', marginTop: 20 },
    answerInput: { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary, fontSize: 20, fontWeight: 'bold', paddingVertical: 15, paddingHorizontal: 20, borderRadius: theme.layout.borderRadius.card, borderWidth: 2, borderColor: theme.colors.accentPrimary, textAlign: 'center', marginBottom: 15 },
    submitBtn: { backgroundColor: theme.colors.accentPrimary, paddingVertical: 15, borderRadius: theme.layout.borderRadius.pill, alignItems: 'center' },
    submitBtnText: { color: theme.colors.textOnPrimary, fontSize: 16, fontWeight: '900', letterSpacing: 2 },
    submittedText: { color: '#00E676', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 20 },

    // Resolution
    resolutionContainer: { padding: theme.layout.paddingHorizontal, paddingBottom: 60, paddingTop: 20 },
    answerHighlight: { backgroundColor: theme.colors.accentPrimary, borderRadius: theme.layout.borderRadius.card, padding: theme.spacing.l, marginBottom: theme.spacing.xl, alignItems: 'center', elevation: 8 },
    answerQuestion: { color: theme.colors.textOnPrimary, fontSize: theme.typography.sizes.small, fontWeight: theme.typography.weights.bold, letterSpacing: 1, marginBottom: theme.spacing.s, opacity: 0.85 },
    answerValue: { color: theme.colors.textOnPrimary, fontSize: 28, fontWeight: theme.typography.weights.heavy, textAlign: 'center' },
    sectionLabel: { color: theme.colors.accentPrimary, fontSize: theme.typography.sizes.small, fontWeight: theme.typography.weights.bold, letterSpacing: 1, marginBottom: theme.spacing.m },
    playerScoreRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, padding: theme.spacing.m, borderRadius: theme.layout.borderRadius.card, borderColor: theme.colors.border, borderWidth: 1, marginBottom: theme.spacing.m },
    playerScoreName: { color: theme.colors.textPrimary, fontSize: theme.typography.sizes.body, fontWeight: 'bold' },
    playerAnswerValue: { color: theme.colors.accentPrimary, fontSize: 18, marginTop: 4, fontStyle: 'italic' },
    playerScoreValue: { color: theme.colors.textPrimary, fontWeight: theme.typography.weights.bold, fontSize: 20, marginRight: theme.spacing.m },
    pointBtn: { backgroundColor: theme.colors.accentPrimary, paddingVertical: 8, paddingHorizontal: 16, borderRadius: theme.layout.borderRadius.pill },
    voteBtn: { backgroundColor: '#4CAF50', borderColor: '#388E3C', borderWidth: 1 },
    pointBtnText: { color: theme.colors.textOnPrimary, fontSize: 12, fontWeight: 'bold' },
    pointAwardedText: { color: '#4CAF50', fontSize: 14, fontWeight: 'bold', fontStyle: 'italic', marginRight: 10 },
    card: { backgroundColor: theme.colors.surface, padding: theme.spacing.l, borderRadius: theme.layout.borderRadius.card, borderColor: theme.colors.border, borderWidth: 1, marginBottom: theme.spacing.l, alignItems: 'center', marginTop: 20 },
    songTitle: { color: theme.colors.textPrimary, fontSize: theme.typography.sizes.h1, fontWeight: theme.typography.weights.bold, textAlign: 'center', marginBottom: theme.spacing.s },
    songArtist: { color: theme.colors.accentPrimary, fontSize: theme.typography.sizes.body, fontWeight: theme.typography.weights.medium, marginBottom: theme.spacing.s },
    songMeta: { color: theme.colors.textSecondary, fontSize: theme.typography.sizes.small, marginBottom: theme.spacing.m },
    coverCard: { width: '100%', aspectRatio: 1, borderRadius: theme.layout.borderRadius.card, borderColor: theme.colors.border, borderWidth: 1, marginBottom: theme.spacing.l, overflow: 'hidden', backgroundColor: theme.colors.surface, marginTop: 20 },
    coverOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(12, 16, 26, 0.65)', justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl },
    songTitleLarge: { color: theme.colors.textPrimary, fontSize: 34, fontWeight: theme.typography.weights.heavy, textAlign: 'center', marginBottom: theme.spacing.m, textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6 },
    songArtistLarge: { color: theme.colors.accentPrimary, fontSize: 24, fontWeight: theme.typography.weights.bold, marginBottom: theme.spacing.xl, textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6, textAlign: 'center' },
    songMetaLarge: { color: theme.colors.textSecondary, fontSize: 16, fontWeight: 'bold', marginBottom: theme.spacing.m, textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
    nextRoundBtn: { backgroundColor: theme.colors.accentPrimary, paddingVertical: 20, borderRadius: theme.layout.borderRadius.pill, alignItems: 'center', marginTop: theme.spacing.m },
    nextRoundText: { color: theme.colors.textOnPrimary, fontWeight: 'bold', fontSize: 18, letterSpacing: 1 },
    waitingText: { color: theme.colors.textSecondary, fontSize: 16, textAlign: 'center', marginTop: 30, fontStyle: 'italic' }
});
