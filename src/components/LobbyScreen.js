import AsyncStorage from '@react-native-async-storage/async-storage';
import { arrayUnion, collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { db } from '../config/firebase';
import { theme } from '../styles/theme';

export default function LobbyScreen({ navigation }) {
    const insets = useSafeAreaInsets();
    const [mode, setMode] = useState(null); // 'host' oder 'join'
    const [loading, setLoading] = useState(false);

    // Join/Host States
    const [pin, setPin] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [roomName, setRoomName] = useState('');
    const [isPublic, setIsPublic] = useState(true);

    // Host Settings States
    const [timerBefore, setTimerBefore] = useState(5);
    const [timerAfter, setTimerAfter] = useState(15);
    const [gradingMode, setGradingMode] = useState('host'); // 'host' oder 'vote'

    // Browse & Favs States
    const [publicRooms, setPublicRooms] = useState([]);
    const [favoriteRooms, setFavoriteRooms] = useState([]);

    useEffect(() => {
        if (mode === 'browse' || mode === 'favorites') {
            // Lade Favoriten aus AsyncStorage
            loadFavorites();
        }
    }, [mode]);

    const loadFavorites = async () => {
        try {
            const favPinsJSON = await AsyncStorage.getItem('beatmaster_favorite_rooms');
            if (favPinsJSON) {
                const favPins = JSON.parse(favPinsJSON); // array of PINs
                // Hole Infos zu diesen Räumen aus Firestore
                if (favPins.length > 0) {
                    const roomPromises = favPins.map(pin => getDoc(doc(db, 'games', pin)));
                    const roomSnaps = await Promise.all(roomPromises);
                    const loadedFavs = roomSnaps.filter(s => s.exists()).map(doc => ({ id: doc.id, ...doc.data() }));
                    setFavoriteRooms(loadedFavs);
                } else {
                    setFavoriteRooms([]);
                }
            }
        } catch (e) { console.error("Could not load favorites:", e); }
    };

    const saveRoomToFavorites = async (pinStr) => {
        try {
            const favPinsJSON = await AsyncStorage.getItem('beatmaster_favorite_rooms');
            let favPins = favPinsJSON ? JSON.parse(favPinsJSON) : [];
            if (!favPins.includes(pinStr)) {
                favPins.push(pinStr);
                await AsyncStorage.setItem('beatmaster_favorite_rooms', JSON.stringify(favPins));
            }
        } catch (e) { console.error("Konnte Favoriten nicht speichern", e); }
    };

    const generatePIN = () => {
        return Math.floor(1000 + Math.random() * 9000).toString();
    };

    const handleHostGame = async () => {
        if (!roomName.trim()) return Alert.alert("Fehler", "Bitte gib dem Raum einen Namen.");
        if (!playerName.trim()) return Alert.alert("Fehler", "Bitte gib deinen Namen ein.");

        let finalPin = pin.trim();
        if (!isPublic && finalPin.length < 4) return Alert.alert("Fehler", "Private Räume brauchen eine mindestens 4-stellige PIN.");
        if (isPublic && !finalPin) finalPin = generatePIN(); // PIN vergeben, auch wenn public

        setLoading(true);
        try {
            const hostId = 'host_' + Date.now();

            // Wenn der Raum persistent ist, speichern wir ihn unter einem einzigartigen ID, z.B. anhand der PIN oder einem Hash
            // Einfachheitshalber nutzen wir die PIN als Document ID (setzt voraus, dass jede PIN in Firebase unique ist vorerst).
            const roomId = finalPin;

            await setDoc(doc(db, 'games', roomId), {
                roomName: roomName.trim(),
                hostId: hostId,
                isPublic: isPublic,
                pin: finalPin,
                status: 'lobby',
                currentPhase: 'LOBBY',
                playlistId: 'starter',
                settings: {
                    gradingMode: gradingMode,
                    timerBefore: timerBefore,
                    timerAfter: timerAfter
                },
                players: [{
                    id: hostId,
                    name: playerName.trim(),
                    score: 0,
                    currentAnswer: '',
                    isReady: true,
                    isHost: true
                }]
            });

            await saveRoomToFavorites(roomId);
            navigation.navigate('OnlineWaitingRoom', { roomPin: roomId, isHost: true, playerId: hostId });
        } catch (error) {
            console.error(error);
            Alert.alert("Fehler", "Raum konnte nicht erstellt werden.");
        } finally {
            setLoading(false);
        }
    };

    const fetchPublicRooms = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'games'), where('isPublic', '==', true));
            const snap = await getDocs(q);
            const rooms = snap.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(room => room.status === 'lobby');
            setPublicRooms(rooms);
            setMode('browse');
        } catch (error) {
            console.error(error);
            Alert.alert("Fehler", "Öffentliche Räume konnten nicht geladen werden.");
        } finally {
            setLoading(false);
        }
    };

    const handleJoinGame = async () => {
        if (!roomName.trim()) return Alert.alert("Fehler", "Bitte gib den Namen des Raumes ein.");
        if (!pin.trim()) return Alert.alert("Fehler", "Bitte gib die Raum-PIN ein.");
        if (!playerName.trim()) return Alert.alert("Fehler", "Bitte gib deinen Namen ein.");

        setLoading(true);
        try {
            const roomRef = doc(db, 'games', pin.trim());
            const roomSnap = await getDoc(roomRef);

            if (!roomSnap.exists()) {
                Alert.alert("Fehler", "Dieser Raum existiert nicht.");
                setLoading(false);
                return;
            }

            const roomData = roomSnap.data();

            if ((roomData.roomName || '').trim().toLowerCase() !== roomName.trim().toLowerCase()) {
                Alert.alert("Fehler", "Raum-Name stimmt nicht mit der PIN überein.");
                setLoading(false);
                return;
            }
            if (roomData.status !== 'lobby') {
                Alert.alert("Fehler", "Das Spiel läuft bereits.");
                setLoading(false);
                return;
            }

            const playerId = 'player_' + Date.now();
            const isFirstToJoin = roomData.players.length === 0;
            const userIsHost = isFirstToJoin; // Wenn der Raum leer ist, wird der Beigetretene der neue Host

            const newPlayer = {
                id: playerId,
                name: playerName.trim(),
                score: 0,
                currentAnswer: '',
                isReady: false,
                isHost: userIsHost
            };

            if (isFirstToJoin) {
                await updateDoc(roomRef, {
                    hostId: playerId,
                    players: [newPlayer]
                });
            } else {
                await updateDoc(roomRef, {
                    players: arrayUnion(newPlayer)
                });
            }

            await saveRoomToFavorites(pin.trim());
            navigation.navigate('OnlineWaitingRoom', { roomPin: pin.trim(), isHost: userIsHost, playerId: playerId });
        } catch (error) {
            console.error(error);
            Alert.alert("Fehler", "Konnte dem Raum nicht beitreten.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.colors.accentPrimary} />
                <Text style={styles.loadingText}>Verbinde...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <TouchableOpacity style={styles.backBtn} onPress={() => mode ? setMode(null) : navigation.goBack()}>
                <Text style={styles.backText}>‹ ZURÜCK</Text>
            </TouchableOpacity>

            <View style={styles.content}>
                <Text style={styles.title}>BEATMASTER LIVE</Text>

                {!mode && (
                    <View style={styles.menu}>
                        <TouchableOpacity style={[styles.primaryBtn, { marginBottom: 20 }]} onPress={() => setMode('host')}>
                            <Text style={styles.primaryBtnText}>🎮 RAUM ERSTELLEN</Text>
                            <Text style={styles.primaryBtnHint}>Erstelle deinen eigenen festen Raum</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.secondaryBtn, { marginBottom: 20 }]} onPress={() => setMode('favorites')}>
                            <Text style={styles.secondaryBtnText}>⭐ MEINE RÄUME (FAVORITEN)</Text>
                            <Text style={styles.secondaryBtnHint}>Fix bestehende Räume ansehen</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.secondaryBtn, { marginBottom: 20 }]} onPress={fetchPublicRooms}>
                            <Text style={styles.secondaryBtnText}>🔍 ÖFFENTLICHE RÄUME</Text>
                            <Text style={styles.secondaryBtnHint}>Finde Spiele auf der ganzen Welt</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryBtn} onPress={() => setMode('join')}>
                            <Text style={styles.secondaryBtnText}>🔒 PRIVATEM RAUM BEITRETEN</Text>
                            <Text style={styles.secondaryBtnHint}>Mit Geheim-Code beitreten</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {mode === 'favorites' && (
                    <View style={styles.joinContainer}>
                        <Text style={[styles.title, { fontSize: 22, marginBottom: 20 }]}>⭐ FAVORITEN</Text>
                        {favoriteRooms.length === 0 ? (
                            <Text style={styles.secondaryBtnHint}>Du hast noch keine festen Räume erstellt oder besucht.</Text>
                        ) : (
                            favoriteRooms.map(room => (
                                <TouchableOpacity key={room.id} style={styles.roomItem} onPress={() => { setPin(room.pin || room.id); setRoomName(room.roomName || ''); setMode('join'); }}>
                                    <Text style={styles.roomName}>{room.roomName || 'Unbenannter Raum'}</Text>
                                    <Text style={styles.roomMeta}>Host: {room.players.find(p => p.isHost)?.name || 'Niemand'} • PIN: {room.pin}</Text>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                )}

                {mode === 'host' && (
                    <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 40 }}>
                        <View style={styles.joinContainer}>
                            <Text style={styles.sectionLabel}>RAUM INFO</Text>
                            <Text style={styles.label}>WIE SOLL DER RAUM HEISSEN?</Text>
                            <TextInput style={styles.inputSmall} placeholder="z.B. Party Keller" placeholderTextColor="#666" maxLength={20} value={roomName} onChangeText={setRoomName} />

                            <Text style={[styles.label, { marginTop: 15 }]}>DEIN NAME (Als Host & Mitspieler)</Text>
                            <TextInput style={styles.inputSmall} placeholder="Dein Name" placeholderTextColor="#666" maxLength={12} value={playerName} onChangeText={setPlayerName} />

                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 15, justifyContent: 'space-between' }}>
                                <Text style={styles.label}>ÖFFENTLICHER RAUM?</Text>
                                <TouchableOpacity style={[styles.toggleBtn, isPublic ? styles.toggleOn : styles.toggleOff]} onPress={() => setIsPublic(!isPublic)}>
                                    <Text style={styles.toggleText}>{isPublic ? 'JA' : 'NEIN'}</Text>
                                </TouchableOpacity>
                            </View>

                            {!isPublic && (
                                <>
                                    <Text style={[styles.label, { marginTop: 15 }]}>GEHEIM-PIN (Min. 4 Zeichen)</Text>
                                    <TextInput style={styles.inputSmall} placeholder="1234" placeholderTextColor="#666" value={pin} onChangeText={setPin} />
                                </>
                            )}
                        </View>

                        <View style={[styles.joinContainer, { marginTop: 20 }]}>
                            <Text style={styles.sectionLabel}>SPIELREGELN</Text>

                            <Text style={styles.label}>TIMER VOR DEM SONG</Text>
                            <View style={styles.timerRow}>
                                <TouchableOpacity style={styles.roundButton} onPress={() => setTimerBefore(Math.max(1, timerBefore - 1))}>
                                    <Text style={styles.roundButtonText}>-</Text>
                                </TouchableOpacity>
                                <Text style={styles.valueText}>{timerBefore}s</Text>
                                <TouchableOpacity style={styles.roundButton} onPress={() => setTimerBefore(timerBefore + 1)}>
                                    <Text style={styles.roundButtonText}>+</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={[styles.label, { marginTop: 20 }]}>TIMER NACH DEM SONG</Text>
                            <View style={styles.timerRow}>
                                <TouchableOpacity style={styles.roundButton} onPress={() => setTimerAfter(Math.max(1, timerAfter - 1))}>
                                    <Text style={styles.roundButtonText}>-</Text>
                                </TouchableOpacity>
                                <Text style={styles.valueText}>{timerAfter}s</Text>
                                <TouchableOpacity style={styles.roundButton} onPress={() => setTimerAfter(timerAfter + 1)}>
                                    <Text style={styles.roundButtonText}>+</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={[styles.label, { marginTop: 20 }]}>PUNKTEVERGABE DURCH</Text>
                            <View style={styles.modeRow}>
                                <TouchableOpacity
                                    style={[styles.modeBtn, gradingMode === 'host' && styles.modeBtnActive]}
                                    onPress={() => setGradingMode('host')}
                                >
                                    <Text style={[styles.modeBtnText, gradingMode === 'host' && styles.modeBtnTextActive]}>👑 Host</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modeBtn, gradingMode === 'vote' && styles.modeBtnActive]}
                                    onPress={() => setGradingMode('vote')}
                                >
                                    <Text style={[styles.modeBtnText, gradingMode === 'vote' && styles.modeBtnTextActive]}>👥 Alle</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.hintText}>
                                {gradingMode === 'host' ? 'Nur der Host kann bei Schreibfehlern Punkte verteilen.' : 'Alle Spieler stimmen über Tippfehler ab (Majority Vote).'}
                            </Text>

                            <TouchableOpacity style={[styles.primaryBtn, { marginTop: 30 }]} onPress={handleHostGame}>
                                <Text style={styles.primaryBtnText}>✓ RAUM ERÖFFNEN</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                )}

                {mode === 'browse' && (
                    <View style={styles.joinContainer}>
                        <Text style={[styles.title, { fontSize: 22, marginBottom: 20 }]}>ÖFFENTLICHE RÄUME</Text>
                        {publicRooms.length === 0 ? (
                            <Text style={styles.secondaryBtnHint}>Keine öffentlichen Lobbys gefunden.</Text>
                        ) : (
                            publicRooms.map(room => (
                                <TouchableOpacity key={room.id} style={styles.roomItem} onPress={() => { setPin(room.pin || room.id); setRoomName(room.roomName || ''); setMode('join'); }}>
                                    <Text style={styles.roomName}>{room.roomName || 'Unbenannter Raum'}</Text>
                                    <Text style={styles.roomMeta}>Host: {room.players.find(p => p.isHost)?.name || 'Niemand'} • {room.players.length} Spieler</Text>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                )}

                {mode === 'join' && (
                    <View style={styles.joinContainer}>
                        <Text style={styles.label}>RAUM NAME</Text>
                        <TextInput style={styles.inputSmall} placeholder="z.B. Party Keller" placeholderTextColor="#666" value={roomName} onChangeText={setRoomName} />

                        <Text style={[styles.label, { marginTop: 20 }]}>RAUM-CODE / PIN</Text>
                        <TextInput style={styles.inputSmall} placeholder="z.B. 1234" placeholderTextColor="#666" value={pin} onChangeText={setPin} />

                        <Text style={[styles.label, { marginTop: 20 }]}>DEIN NAME</Text>
                        <TextInput style={styles.inputSmall} placeholder="Wie heißt du?" placeholderTextColor="#666" maxLength={12} value={playerName} onChangeText={setPlayerName} />

                        <TouchableOpacity style={[styles.primaryBtn, { marginTop: 40 }]} onPress={handleJoinGame}>
                            <Text style={styles.primaryBtnText}>✓ BEITRETEN</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.backgroundStart },
    backBtn: { position: 'absolute', top: 16, left: 16, zIndex: 10, backgroundColor: theme.colors.surface, paddingVertical: 10, paddingHorizontal: 18, borderRadius: theme.layout.borderRadius.pill, borderWidth: 1, borderColor: theme.colors.border },
    backText: { color: theme.colors.textPrimary, fontWeight: 'bold', fontSize: 14 },
    content: { flex: 1, padding: theme.layout.paddingHorizontal, justifyContent: 'center' },
    title: { color: theme.colors.textPrimary, fontSize: 32, fontWeight: '900', letterSpacing: 3, textAlign: 'center', marginBottom: 60, textShadowColor: theme.colors.accentPrimary, textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 },

    menu: { width: '100%', alignItems: 'center' },
    primaryBtn: { width: '100%', backgroundColor: theme.colors.accentPrimary, paddingVertical: 20, borderRadius: theme.layout.borderRadius.pill, alignItems: 'center', elevation: 8, shadowColor: theme.colors.accentPrimary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12 },
    primaryBtnText: { color: theme.colors.textOnPrimary, fontSize: 18, fontWeight: '900', letterSpacing: 2 },
    primaryBtnHint: { color: 'rgba(0,0,0,0.5)', fontSize: 12, marginTop: 4 },

    secondaryBtn: { width: '100%', backgroundColor: theme.colors.surface, paddingVertical: 20, borderRadius: theme.layout.borderRadius.pill, alignItems: 'center', borderWidth: 2, borderColor: theme.colors.accentPrimary },
    secondaryBtnText: { color: theme.colors.accentPrimary, fontSize: 18, fontWeight: '900', letterSpacing: 2 },
    secondaryBtnHint: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 4 },

    joinContainer: { width: '100%', backgroundColor: theme.colors.surface, padding: 24, borderRadius: theme.layout.borderRadius.card, borderWidth: 1, borderColor: theme.colors.border },
    label: { color: theme.colors.accentPrimary, fontSize: 14, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 },
    input: { backgroundColor: theme.colors.backgroundStart, color: theme.colors.textPrimary, fontSize: 24, fontWeight: 'bold', paddingVertical: 12, paddingHorizontal: 16, borderRadius: theme.layout.borderRadius.input, borderWidth: 1, borderColor: theme.colors.border, textAlign: 'center' },
    inputSmall: { backgroundColor: theme.colors.backgroundStart, color: theme.colors.textPrimary, fontSize: 18, fontWeight: 'bold', paddingVertical: 10, paddingHorizontal: 16, borderRadius: theme.layout.borderRadius.input, borderWidth: 1, borderColor: theme.colors.border },
    toggleBtn: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: theme.layout.borderRadius.pill, borderWidth: 1 },
    toggleOn: { backgroundColor: theme.colors.accentPrimary, borderColor: theme.colors.accentPrimary },
    toggleOff: { backgroundColor: theme.colors.surfaceDark, borderColor: theme.colors.textSecondary },
    toggleText: { color: theme.colors.textOnPrimary, fontWeight: 'bold' },
    roomItem: { backgroundColor: theme.colors.backgroundStart, padding: 15, borderRadius: theme.layout.borderRadius.card, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 10 },
    roomName: { color: theme.colors.textPrimary, fontWeight: 'bold', fontSize: 18 },
    roomMeta: { color: theme.colors.textSecondary, fontSize: 12, marginTop: 4 },
    loadingText: { color: theme.colors.accentPrimary, marginTop: 20, fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },

    // New styles for settings
    scrollContainer: { flex: 1, width: '100%', marginTop: 20 },
    sectionLabel: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: '900', letterSpacing: 2, marginBottom: 15, textAlign: 'center', borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingBottom: 5 },
    timerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    roundButton: { backgroundColor: theme.colors.surfaceDark, width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
    roundButtonText: { color: theme.colors.textPrimary, fontSize: 24, fontWeight: 'bold' },
    valueText: { color: theme.colors.textPrimary, fontSize: 22, fontWeight: 'bold', marginHorizontal: 20 },
    modeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    modeBtn: { flex: 1, backgroundColor: theme.colors.surfaceDark, paddingVertical: 12, borderRadius: theme.layout.borderRadius.pill, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center', marginHorizontal: 5 },
    modeBtnActive: { backgroundColor: theme.colors.accentPrimary, borderColor: theme.colors.accentPrimary },
    modeBtnText: { color: theme.colors.textSecondary, fontWeight: 'bold', fontSize: 14 },
    modeBtnTextActive: { color: theme.colors.textOnPrimary },
    hintText: { color: theme.colors.textSecondary, fontSize: 12, fontStyle: 'italic', textAlign: 'center', marginTop: 10 }
});
