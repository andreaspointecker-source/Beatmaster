import { doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { db } from '../config/firebase';
import { theme } from '../styles/theme';

export default function OnlineWaitingRoom({ route, navigation }) {
    const { roomPin, isHost: initialIsHost, playerId } = route.params;
    const insets = useSafeAreaInsets();
    const [roomData, setRoomData] = useState(null);
    const [loading, setLoading] = useState(true);
    const previousHostIdRef = useRef(null);

    useEffect(() => {
        const roomRef = doc(db, 'games', roomPin);

        // Echtzeit-Listener auf das Raum-Dokument
        const unsubscribe = onSnapshot(roomRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();

                // Host-Wechsel erkennen
                if (previousHostIdRef.current && previousHostIdRef.current !== data.hostId) {
                    const newHostName = data.players.find(p => p.id === data.hostId)?.name || 'Jemand';
                    if (data.hostId === playerId) {
                        Alert.alert("Glückwunsch!", "Du bist jetzt der neue Host.");
                    } else if (data.hostId) {
                        Alert.alert("Neuer Host", `${newHostName} ist jetzt der Chef vom Raum.`);
                    }
                }
                previousHostIdRef.current = data.hostId;

                setRoomData(data);
                setLoading(false);

                // Wenn der Status auf 'playing' wechselt, navigiere zum Live-GameMaster
                if (data.status === 'playing') {
                    navigation.replace('LiveGameMaster', { roomPin, isHost: data.hostId === playerId, playerId });
                }
            } else {
                // Raum wurde gelöscht
                Alert.alert("Raum geschlossen", "Der Host hat den Raum geschlossen.");
                navigation.navigate('Home');
            }
        }, (error) => {
            console.error(error);
            Alert.alert("Fehler", "Verbindung zum Raum verloren.");
            navigation.navigate('Home');
        });

        return () => unsubscribe();
    }, [roomPin, playerId, navigation]);

    const handleLeaveRoom = async () => {
        try {
            const roomRef = doc(db, 'games', roomPin);
            const snap = await getDoc(roomRef);
            if (snap.exists()) {
                const data = snap.data();
                const playerToRemove = data.players.find(p => p.id === playerId);
                if (playerToRemove) {
                    const remainingPlayers = data.players.filter(p => p.id !== playerId);
                    const updateData = { players: remainingPlayers };

                    // Wenn der aktuelle Host geht, rückt der nächste auf
                    if (data.hostId === playerId && remainingPlayers.length > 0) {
                        const newHost = remainingPlayers[0];
                        updateData.hostId = newHost.id;
                        updateData.players = remainingPlayers.map(p =>
                            p.id === newHost.id ? { ...p, isHost: true } : p
                        );
                    }

                    await updateDoc(roomRef, updateData);
                }
            }
            // Wir löschen das Dokument nicht mehr, da Räume "fix bestehen" bleiben sollen!
            navigation.navigate('Home');
        } catch (error) {
            console.error("Fehler beim Verlassen des Raums:", error);
            navigation.navigate('Home');
        }
    };

    const handleStartGame = async () => {
        if (roomData?.hostId !== playerId) return;
        if (roomData.players.length === 0) {
            return Alert.alert("Geht nicht!", "Du brauchst mindestens einen Mitspieler.");
        }

        try {
            const roomRef = doc(db, 'games', roomPin);
            await updateDoc(roomRef, {
                status: 'playing',
                currentPhase: 'SHUFFLE'
            });
            // Der Snapshot-Listener fängt die Änderung ab und navigiert alle Spieler ins Spiel
        } catch (error) {
            console.error("Fehler beim Spielstart:", error);
            Alert.alert("Fehler", "Konnte das Spiel nicht starten.");
        }
    };

    if (loading || !roomData) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={theme.colors.accentPrimary} />
                <Text style={styles.loadingText}>Betrete Warteraum...</Text>
            </View>
        );
    }

    const currentIsHost = roomData?.hostId === playerId;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <TouchableOpacity style={styles.backBtn} onPress={handleLeaveRoom}>
                <Text style={styles.backText}>‹ VERLASSEN</Text>
            </TouchableOpacity>

            <View style={styles.header}>
                <Text style={styles.title}>WARTERAUM</Text>
                {roomData.isPublic ? (
                    <Text style={styles.subText}>Öffentlicher Raum. Andere können einfach beitreten.</Text>
                ) : (
                    <Text style={styles.subText}>Privat! Freunde brauchen diesen Namen & PIN:</Text>
                )}
                <View style={styles.pinBox}>
                    <Text style={styles.pinText}>{roomData.roomName || 'RAUM'}</Text>
                </View>
                {!roomData.isPublic && (
                    <Text style={{ color: theme.colors.accentPrimary, marginTop: 15, fontSize: 20, fontWeight: 'bold' }}>GEHEIM-PIN: {roomData.pin}</Text>
                )}
            </View>

            <View style={styles.playerListContainer}>
                <Text style={styles.sectionLabel}>SPIELER ({roomData.players.length})</Text>
                {roomData.players.length === 0 ? (
                    <View style={styles.emptyState}>
                        <ActivityIndicator size="small" color={theme.colors.textSecondary} />
                        <Text style={styles.emptyStateText}>Warte auf Mitspieler...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={roomData.players}
                        keyExtractor={p => p.id}
                        renderItem={({ item }) => (
                            <View style={styles.playerCard}>
                                <Text style={styles.playerAvatar}>{item.id === roomData.hostId ? '👑' : '👤'}</Text>
                                <Text style={styles.playerName}>{item.name}</Text>
                                {item.id === roomData.hostId && (
                                    <Text style={styles.hostBadge}>HOST</Text>
                                )}
                                {item.id === playerId && (
                                    <Text style={styles.youBadge}>(Du)</Text>
                                )}
                            </View>
                        )}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}
            </View>

            <View style={styles.footer}>
                {currentIsHost ? (
                    <TouchableOpacity
                        style={[styles.startBtn, roomData.players.length === 0 && styles.startBtnDisabled]}
                        onPress={handleStartGame}
                    >
                        <Text style={styles.startBtnText}>▶ SPIEL STARTEN</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.waitingForHost}>
                        <ActivityIndicator size="small" color={theme.colors.accentPrimary} />
                        <Text style={styles.waitingForHostText}>Warten auf Host...</Text>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.backgroundStart },
    backBtn: { position: 'absolute', top: 16, left: 16, zIndex: 10, backgroundColor: theme.colors.surface, paddingVertical: 10, paddingHorizontal: 18, borderRadius: theme.layout.borderRadius.pill, borderWidth: 1, borderColor: '#FF4444' },
    backText: { color: '#FF4444', fontWeight: 'bold', fontSize: 14 },
    header: { alignItems: 'center', marginTop: 40, marginBottom: 30 },
    title: { color: theme.colors.textPrimary, fontSize: 24, fontWeight: '900', letterSpacing: 2 },
    subText: { color: theme.colors.textSecondary, fontSize: 14, marginTop: 10, marginBottom: 20 },
    pinBox: { backgroundColor: theme.colors.surface, paddingVertical: 15, paddingHorizontal: 30, borderRadius: theme.layout.borderRadius.card, borderWidth: 2, borderColor: theme.colors.accentPrimary, elevation: 8, shadowColor: theme.colors.accentPrimary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10, minWidth: '80%' },
    pinText: { color: theme.colors.textPrimary, fontSize: 32, fontWeight: '900', letterSpacing: 2, textAlign: 'center' },
    playerListContainer: { flex: 1, paddingHorizontal: theme.layout.paddingHorizontal },
    sectionLabel: { color: theme.colors.accentPrimary, fontSize: 14, fontWeight: 'bold', letterSpacing: 1, marginBottom: 15 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyStateText: { color: theme.colors.textSecondary, marginTop: 10, fontSize: 16, fontStyle: 'italic' },
    playerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface, padding: 15, borderRadius: theme.layout.borderRadius.card, marginBottom: 10, borderWidth: 1, borderColor: theme.colors.border },
    playerAvatar: { fontSize: 24, marginRight: 15 },
    playerName: { flex: 1, color: theme.colors.textPrimary, fontSize: 18, fontWeight: 'bold' },
    hostBadge: { color: theme.colors.accentPrimary, fontSize: 12, fontWeight: 'bold', backgroundColor: `${theme.colors.accentPrimary}33`, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, marginRight: 10 },
    youBadge: { color: theme.colors.textSecondary, fontSize: 14, fontWeight: 'bold' },
    footer: { padding: theme.layout.paddingHorizontal, paddingBottom: 40 },
    startBtn: { backgroundColor: theme.colors.accentPrimary, paddingVertical: 20, borderRadius: theme.layout.borderRadius.pill, alignItems: 'center', elevation: 8, shadowColor: theme.colors.accentPrimary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 10 },
    startBtnDisabled: { opacity: 0.5, backgroundColor: theme.colors.border },
    startBtnText: { color: theme.colors.textOnPrimary, fontSize: 18, fontWeight: '900', letterSpacing: 2 },
    waitingForHost: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface, paddingVertical: 20, borderRadius: theme.layout.borderRadius.pill, borderWidth: 1, borderColor: theme.colors.accentPrimary },
    waitingForHostText: { color: theme.colors.accentPrimary, fontSize: 16, fontWeight: 'bold', marginLeft: 10, letterSpacing: 1 },
    loadingText: { color: theme.colors.accentPrimary, marginTop: 20, fontSize: 18, fontWeight: 'bold' }
});
