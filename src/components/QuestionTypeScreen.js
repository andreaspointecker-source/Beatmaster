import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGameConfig } from '../context/GameConfig';
import { theme } from '../styles/theme';

const QUESTION_TYPES = [
    { id: 'artist', label: 'WER SINGT DEN SONG?', icon: '🎤', description: 'Errate den Künstler/die Band' },
    { id: 'title', label: 'WIE HEISST DER SONG?', icon: '🎵', description: 'Errate den Songtitel' },
    { id: 'year', label: 'AUS WELCHEM JAHR?', icon: '📅', description: 'Errate das Erscheinungsjahr' },
    { id: 'genre', label: 'WELCHES GENRE?', icon: '🎸', description: 'Errate das Musikgenre' },
    { id: 'film', label: 'AUS WELCHEM FILM / WELCHER SERIE?', icon: '🎬', description: 'Errate den Filmtitel oder die Serienname · nur bei Film & Serien Playlist' },
];

export default function QuestionTypeScreen({ route, navigation }) {
    const { players } = route.params || { players: [] };
    const { config } = useGameConfig();
    const [selected, setSelected] = useState(config?.questionTypes?.length > 0 ? config.questionTypes : []);
    const [isSoundtracksUnlocked, setIsSoundtracksUnlocked] = useState(false);

    useEffect(() => {
        const checkUnlock = async () => {
            try {
                const STORAGE_KEY_UNLOCKED = 'beatmaster_unlocked_playlists_v2';
                const UNLOCK_DURATION_MS = 24 * 60 * 60 * 1000;
                const stored = await AsyncStorage.getItem(STORAGE_KEY_UNLOCKED);

                if (stored) {
                    const parsed = JSON.parse(stored);
                    const data = parsed['soundtracks'];
                    if (data) {
                        let ts = typeof data === 'number' ? data : data.unlockedAt;
                        let dur = typeof data === 'number' ? UNLOCK_DURATION_MS : (data.durationMs || UNLOCK_DURATION_MS);
                        if ((Date.now() - ts) < dur) {
                            setIsSoundtracksUnlocked(true);
                        }
                    }
                }
            } catch (e) {
                console.error('Error checking unlocked playlists', e);
            }
        };
        checkUnlock();
    }, []);

    const toggle = (id) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const next = () => {
        if (selected.length > 0) {
            navigation.navigate('GameSettings', { players, questionTypes: selected });
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>FRAGETYPEN</Text>
            <Text style={styles.subtitle}>Was muss erraten werden?</Text>
            <Text style={styles.hint}>Mindestens eine Auswahl erforderlich</Text>

            {QUESTION_TYPES.map(qt => {
                const isFilmLocked = qt.id === 'film' && !isSoundtracksUnlocked;
                const isSelected = selected.includes(qt.id);

                return (
                    <TouchableOpacity
                        key={qt.id}
                        style={[
                            styles.card,
                            isSelected && styles.cardSelected,
                            isFilmLocked && styles.cardLocked
                        ]}
                        onPress={() => {
                            if (isFilmLocked) {
                                navigation.navigate('Playlists'); // Springt direkt zu den Playlisten
                            } else {
                                toggle(qt.id);
                            }
                        }}
                    >
                        <Text style={[styles.cardIcon, isFilmLocked && { opacity: 0.5 }]}>{qt.icon}</Text>
                        <View style={styles.cardText}>
                            <Text style={[
                                styles.cardLabel,
                                isSelected && styles.cardLabelSelected,
                                isFilmLocked && { color: theme.colors.textSecondary }
                            ]}>
                                {qt.label}
                            </Text>
                            {isFilmLocked ? (
                                <Text style={styles.lockedDesc}>🔒 Benötigt "Film & Serien" Playlist. Tippe hier zum Freischalten.</Text>
                            ) : (
                                <Text style={styles.cardDesc}>{qt.description}</Text>
                            )}
                        </View>
                        {!isFilmLocked && (
                            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                {isSelected && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                        )}
                    </TouchableOpacity>
                );
            })}

            <TouchableOpacity
                style={[styles.button, selected.length === 0 && styles.buttonDisabled]}
                onPress={next}
                disabled={selected.length === 0}
            >
                <Text style={styles.buttonText}>WEITER ZU DEN EINSTELLUNGEN</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Home')}>
                <Text style={styles.backText}>Zurück zu den Spielern</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.backgroundStart },
    content: { padding: theme.layout.paddingHorizontal, paddingTop: 60, paddingBottom: 40 },
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
        marginBottom: theme.spacing.s,
    },
    hint: {
        color: theme.colors.textSecondary,
        fontSize: theme.typography.sizes.small,
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
        fontStyle: 'italic',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.m,
        borderRadius: theme.layout.borderRadius.card,
        borderWidth: 2,
        borderColor: theme.colors.border,
        marginBottom: theme.spacing.m,
    },
    cardSelected: {
        borderColor: theme.colors.accentPrimary,
        backgroundColor: theme.colors.surfaceDark,
    },
    cardIcon: { fontSize: 32, marginRight: theme.spacing.m },
    cardText: { flex: 1 },
    cardLabel: {
        color: theme.colors.textSecondary,
        fontSize: theme.typography.sizes.small,
        fontWeight: theme.typography.weights.bold,
        letterSpacing: 1,
        marginBottom: 2,
    },
    cardLabelSelected: { color: theme.colors.accentPrimary },
    cardDesc: {
        color: theme.colors.textSecondary,
        fontSize: theme.typography.sizes.small,
    },
    cardLocked: {
        borderColor: theme.colors.border,
        backgroundColor: `${theme.colors.surface}80`, // Halbtransparent
        borderStyle: 'dashed',
    },
    lockedDesc: {
        color: theme.colors.accentPrimary,
        fontSize: theme.typography.sizes.small,
        fontWeight: 'bold',
        marginTop: 4,
    },
    checkbox: {
        width: 28, height: 28, borderRadius: 14,
        borderWidth: 2, borderColor: theme.colors.border,
        justifyContent: 'center', alignItems: 'center',
    },
    checkboxSelected: {
        borderColor: theme.colors.accentPrimary,
        backgroundColor: theme.colors.accentPrimary,
    },
    checkmark: { color: theme.colors.textOnPrimary, fontWeight: 'bold', fontSize: 14 },
    button: {
        backgroundColor: theme.colors.accentPrimary,
        paddingVertical: theme.spacing.m,
        borderRadius: theme.layout.borderRadius.pill,
        alignItems: 'center',
        marginTop: theme.spacing.xl,
        marginBottom: theme.spacing.m,
    },
    buttonDisabled: { backgroundColor: theme.colors.border, opacity: 0.5 },
    buttonText: {
        color: theme.colors.textOnPrimary,
        fontWeight: theme.typography.weights.bold,
        fontSize: theme.typography.sizes.body,
    },
    backBtn: { alignItems: 'center', paddingVertical: theme.spacing.m },
    backText: { color: theme.colors.textSecondary, fontSize: theme.typography.sizes.body },
});
