import { useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { theme } from '../styles/theme';

import { useGameConfig } from '../context/GameConfig';

export default function SetupScreen({ navigation }) {
    const { config, updateConfig } = useGameConfig();
    const [players, setPlayers] = useState(config?.players || []);
    const [newPlayerName, setNewPlayerName] = useState('');

    const addPlayer = () => {
        if (newPlayerName.trim().length > 0) {
            setPlayers([...players, { id: Date.now().toString(), name: newPlayerName.trim(), score: 0 }]);
            setNewPlayerName('');
        }
    };

    const removePlayer = (id) => {
        setPlayers(players.filter(p => p.id !== id));
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate('Home')}>
                <Text style={styles.backText}>‹  HOME</Text>
            </TouchableOpacity>
            <Text style={styles.title}>SPIELER</Text>
            <Text style={styles.subtitle}>SETUP</Text>

            <View style={styles.card}>
                <Text style={styles.label}>SPIELER HINZUFÜGEN</Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Name des Spielers/Teams"
                        placeholderTextColor={theme.colors.textSecondary}
                        value={newPlayerName}
                        onChangeText={setNewPlayerName}
                        onSubmitEditing={addPlayer}
                        returnKeyType="done"
                    />
                    <TouchableOpacity style={styles.addButton} onPress={addPlayer}>
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                </View>

                {players.length > 0 ? (
                    <FlatList
                        data={players}
                        keyExtractor={(item) => item.id}
                        style={styles.list}
                        renderItem={({ item }) => (
                            <View style={styles.playerRow}>
                                <Text style={styles.playerName}>{item.name}</Text>
                                <TouchableOpacity onPress={() => removePlayer(item.id)}>
                                    <Text style={styles.removeText}>X</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                ) : (
                    <Text style={styles.emptyText}>Noch keine Spieler hinzugefügt.</Text>
                )}
            </View>

            <TouchableOpacity
                style={[styles.button, players.length === 0 && styles.buttonDisabled]}
                onPress={() => {
                    if (players.length > 0) {
                        navigation.navigate('QuestionType', { players });
                    }
                }}
                disabled={players.length === 0}
            >
                <Text style={styles.buttonText}>ZU DEN EINSTELLUNGEN</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.backgroundStart,
        padding: theme.layout.paddingHorizontal,
        paddingTop: 70,
    },
    backBtn: {
        position: 'absolute',
        top: 16,
        left: 16,
        backgroundColor: theme.colors.surface,
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: theme.layout.borderRadius.pill,
        borderWidth: 1,
        borderColor: theme.colors.border,
        zIndex: 10,
    },
    backText: { color: theme.colors.textPrimary, fontWeight: 'bold', fontSize: 14 },
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
        flex: 1,
        marginBottom: theme.spacing.xl,
    },
    label: {
        color: theme.colors.accentPrimary,
        fontSize: theme.typography.sizes.small,
        fontWeight: theme.typography.weights.bold,
        marginBottom: theme.spacing.m,
        letterSpacing: 1,
    },
    inputContainer: {
        flexDirection: 'row',
        marginBottom: theme.spacing.m,
    },
    input: {
        flex: 1,
        backgroundColor: theme.colors.backgroundStart,
        borderColor: theme.colors.border,
        borderWidth: 1,
        borderRadius: theme.layout.borderRadius.input,
        paddingHorizontal: theme.spacing.m,
        color: theme.colors.textPrimary,
        height: 50,
    },
    addButton: {
        backgroundColor: theme.colors.accentPrimary,
        width: 50,
        height: 50,
        borderRadius: theme.layout.borderRadius.input,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: theme.spacing.s,
    },
    addButtonText: {
        color: theme.colors.textOnPrimary,
        fontSize: 24,
        fontWeight: theme.typography.weights.bold,
    },
    list: {
        marginTop: theme.spacing.s,
    },
    playerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colors.surfaceDark,
        padding: theme.spacing.m,
        borderRadius: theme.layout.borderRadius.input,
        marginBottom: theme.spacing.s,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    playerName: {
        color: theme.colors.textPrimary,
        fontSize: theme.typography.sizes.body,
    },
    removeText: {
        color: theme.colors.textSecondary,
        fontSize: theme.typography.sizes.body,
        fontWeight: theme.typography.weights.bold,
        paddingHorizontal: 10,
    },
    emptyText: {
        color: theme.colors.textSecondary,
        fontSize: theme.typography.sizes.body,
        textAlign: 'center',
        marginTop: theme.spacing.l,
        fontStyle: 'italic',
    },
    button: {
        backgroundColor: theme.colors.accentPrimary,
        paddingVertical: theme.spacing.m,
        paddingHorizontal: theme.spacing.l,
        borderRadius: theme.layout.borderRadius.pill,
        alignItems: 'center',
        marginBottom: 40,
    },
    buttonDisabled: {
        backgroundColor: theme.colors.border,
        opacity: 0.5,
    },
    buttonText: {
        color: theme.colors.textOnPrimary,
        fontWeight: theme.typography.weights.bold,
        fontSize: theme.typography.sizes.body,
    }
});
