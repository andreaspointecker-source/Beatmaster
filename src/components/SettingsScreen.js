import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../styles/theme';

export default function SettingsScreen({ navigation }) {
    const [musicVolume, setMusicVolume] = useState(100);
    const [shuffleSound, setShuffleSound] = useState(true);
    const [countdownSound, setCountdownSound] = useState(true);
    const [endSound, setEndSound] = useState(true);

    const VolumeBar = ({ value, onChange, label }) => (
        <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>{label}</Text>
            <View style={styles.volumeRow}>
                <TouchableOpacity style={styles.volBtn} onPress={() => onChange(Math.max(0, value - 10))}>
                    <Text style={styles.volBtnText}>−</Text>
                </TouchableOpacity>
                <View style={styles.volumeTrack}>
                    <View style={[styles.volumeFill, { width: `${value}%` }]} />
                </View>
                <TouchableOpacity style={styles.volBtn} onPress={() => onChange(Math.min(100, value + 10))}>
                    <Text style={styles.volBtnText}>+</Text>
                </TouchableOpacity>
                <Text style={styles.volValue}>{value}%</Text>
            </View>
        </View>
    );

    const ToggleRow = ({ label, value, onChange, desc }) => (
        <View style={styles.settingRow}>
            <View style={styles.toggleLeft}>
                <Text style={styles.settingLabel}>{label}</Text>
                {desc && <Text style={styles.settingDesc}>{desc}</Text>}
            </View>
            <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: theme.colors.border, true: theme.colors.accentPrimary }}
                thumbColor={theme.colors.textOnPrimary}
            />
        </View>
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Home')}>
                <Text style={styles.backText}>‹  HOME</Text>
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.title}>EINSTELLUNGEN</Text>

                <Text style={styles.sectionLabel}>LAUTSTÄRKE</Text>
                <View style={styles.card}>
                    <VolumeBar label="🎵 Musik" value={musicVolume} onChange={setMusicVolume} />
                </View>

                <Text style={styles.sectionLabel}>SOUND-EFFEKTE</Text>
                <View style={styles.card}>
                    <ToggleRow
                        label="🃏 Misch-Sound"
                        desc="Kartengeräusch beim Start der Runde"
                        value={shuffleSound}
                        onChange={setShuffleSound}
                    />
                    <View style={styles.divider} />
                    <ToggleRow
                        label="⏱ Countdown-Ton"
                        desc="Tick-Geräusch beim Countdown"
                        value={countdownSound}
                        onChange={setCountdownSound}
                    />
                    <View style={styles.divider} />
                    <ToggleRow
                        label="🎤 Runden-Ende"
                        desc="Ansage am Ende jeder Runde"
                        value={endSound}
                        onChange={setEndSound}
                    />
                </View>

                <Text style={styles.sectionLabel}>FEHLERBEHEBUNG</Text>
                <View style={styles.card}>
                    <Text style={styles.settingDesc}>
                        Wenn die App hängt oder Playlisten nicht geladen werden, kannst du hier alle lokalen Speicherdaten zurücksetzen.
                    </Text>
                    <TouchableOpacity
                        style={styles.resetBtn}
                        onPress={async () => {
                            Alert.alert(
                                'App zurücksetzen?',
                                'Alle deine Einstellungen und freigeschalteten Playlisten werden gelöscht. Bist du sicher?',
                                [
                                    { text: 'Abbrechen', style: 'cancel' },
                                    {
                                        text: 'Zurücksetzen',
                                        style: 'destructive',
                                        onPress: async () => {
                                            try {
                                                await AsyncStorage.clear();
                                                Alert.alert('Erfolg', 'App-Daten wurden komplett gelöscht. Bitte starte die App neu.', [{ text: 'OK' }]);
                                            } catch (e) {
                                                Alert.alert('Fehler', 'Daten konnten nicht gelöscht werden.');
                                            }
                                        }
                                    }
                                ]
                            );
                        }}
                    >
                        <Text style={styles.resetBtnText}>⚠ APP-DATEN ZURÜCKSETZEN</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.comingSoon}>Weitere Einstellungen folgen in einem Update.</Text>
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
    content: { padding: theme.layout.paddingHorizontal, paddingTop: 70, paddingBottom: 40 },
    title: {
        color: theme.colors.textPrimary,
        fontSize: theme.typography.sizes.title,
        fontWeight: '900',
        letterSpacing: 3,
        textAlign: 'center',
        marginBottom: 24,
    },
    sectionLabel: {
        color: theme.colors.accentPrimary,
        fontSize: 11, fontWeight: 'bold', letterSpacing: 2,
        marginBottom: 10, marginTop: 8,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.layout.borderRadius.card,
        borderWidth: 1, borderColor: theme.colors.border,
        marginBottom: 12, overflow: 'hidden',
    },
    settingRow: {
        padding: 16,
        flexDirection: 'row', alignItems: 'center',
    },
    toggleLeft: { flex: 1 },
    settingLabel: { color: theme.colors.textPrimary, fontWeight: '600', fontSize: 14, flex: 1 },
    settingDesc: { color: theme.colors.textSecondary, fontSize: 11, marginTop: 2, marginBottom: 8, marginHorizontal: 16 },
    divider: { height: 1, backgroundColor: theme.colors.border, marginHorizontal: 16 },
    volumeRow: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 12, gap: 8 },
    volBtn: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: theme.colors.surfaceDark,
        borderWidth: 1, borderColor: theme.colors.border,
        justifyContent: 'center', alignItems: 'center',
    },
    volBtnText: { color: theme.colors.textPrimary, fontSize: 18, lineHeight: 22 },
    volumeTrack: {
        flex: 1, height: 6, backgroundColor: theme.colors.surfaceDark,
        borderRadius: 3, overflow: 'hidden',
    },
    volumeFill: {
        height: '100%', backgroundColor: theme.colors.accentPrimary, borderRadius: 3,
    },
    volValue: { color: theme.colors.textSecondary, fontSize: 12, width: 36, textAlign: 'right' },
    comingSoon: {
        color: theme.colors.textSecondary, fontSize: 12,
        textAlign: 'center', marginTop: 24, fontStyle: 'italic',
    },
    resetBtn: {
        marginTop: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: 'rgba(255, 68, 68, 0.1)',
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#FF4444',
        alignItems: 'center',
    },
    resetBtnText: {
        color: '#FF4444',
        fontWeight: 'bold',
        fontSize: 14,
        letterSpacing: 1,
    }
});
