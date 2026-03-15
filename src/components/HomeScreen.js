import { useEffect, useRef } from 'react';
import {
    Animated, Easing,
    StyleSheet, Text,
    TouchableOpacity, View
} from 'react-native';
import { useGameConfig } from '../context/GameConfig';
import { theme } from '../styles/theme';

const PLATTE = require('../../icon/platte.png');

function AnimatedVinyl() {
    const spin = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.loop(
            Animated.timing(spin, { toValue: 1, duration: 18000, easing: Easing.linear, useNativeDriver: true })
        ).start();
    }, []);
    const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
    return (
        <Animated.Image
            source={PLATTE}
            style={[styles.bgVinylImg, { transform: [{ rotate }] }]}
            resizeMode="contain"
        />
    );
}

function LogoPulse() {
    const glow = useRef(new Animated.Value(0.5)).current;
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(glow, { toValue: 1, duration: 1500, useNativeDriver: true }),
                Animated.timing(glow, { toValue: 0.5, duration: 1500, useNativeDriver: true }),
            ])
        ).start();
    }, []);
    return (
        <View style={styles.logoContainer}>
            <Animated.Text style={[styles.logoText, { opacity: glow }]}>BEATMASTER</Animated.Text>
            <Text style={styles.logoSub}>Das ultimative Musikraten-Spiel</Text>
        </View>
    );
}

export default function HomeScreen({ navigation }) {
    const { config, isConfigured } = useGameConfig();

    const startGame = () => {
        if (!isConfigured) {
            navigation.navigate('Setup');
        } else {
            navigation.navigate('GameMaster', {
                players: config.players,
                questionTypes: config.questionTypes,
                settings: config.settings,
            });
        }
    };

    return (
        <View style={styles.container}>
            {/* Hintergrund-Vinyl */}
            <View style={styles.bgVinylWrapper} pointerEvents="none">
                <AnimatedVinyl />
            </View>

            {/* Logo */}
            <LogoPulse />

            {/* Menü */}
            <View style={styles.menu}>
                <TouchableOpacity style={styles.primaryBtn} onPress={startGame}>
                    <Text style={styles.primaryBtnText}>▶  SPIEL STARTEN</Text>
                    {!isConfigured && (
                        <Text style={styles.primaryBtnHint}>Noch nicht konfiguriert – Setup öffnen</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('Setup')}>
                    <Text style={styles.menuBtnIcon}>⚙</Text>
                    <Text style={styles.menuBtnText}>GAMEPLAY SETUP</Text>
                    <Text style={styles.menuBtnArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.menuBtn, { borderColor: theme.colors.accentPrimary, borderWidth: 2 }]} onPress={() => navigation.navigate('Lobby')}>
                    <Text style={styles.menuBtnIcon}>🌍</Text>
                    <Text style={[styles.menuBtnText, { color: theme.colors.accentPrimary }]}>BEATMASTER LIVE!</Text>
                    <Text style={[styles.menuBtnArrow, { color: theme.colors.accentPrimary }]}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('Playlists')}>
                    <Text style={styles.menuBtnIcon}>🎵</Text>
                    <Text style={styles.menuBtnText}>PLAYLISTEN</Text>
                    <Text style={styles.menuBtnArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.navigate('Settings')}>
                    <Text style={styles.menuBtnIcon}>🔊</Text>
                    <Text style={styles.menuBtnText}>EINSTELLUNGEN</Text>
                    <Text style={styles.menuBtnArrow}>›</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.version}>Beatmaster v1.0</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.backgroundStart,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 60,
        paddingHorizontal: theme.layout.paddingHorizontal,
    },
    // Background vinyl (echtes Bild)
    bgVinylWrapper: {
        position: 'absolute',
        top: -100,
        right: -100,
        opacity: 0.18,
    },
    bgVinylImg: {
        width: 380,
        height: 380,
    },
    // Logo
    logoContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    logoText: {
        fontSize: 42,
        fontWeight: '900',
        color: theme.colors.accentPrimary,
        letterSpacing: 4,
        textShadowColor: theme.colors.accentPrimary,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    logoSub: {
        color: theme.colors.textSecondary,
        fontSize: theme.typography.sizes.small,
        marginTop: 8,
        letterSpacing: 1,
    },
    // Menu
    menu: {
        width: '100%',
        gap: 12,
    },
    primaryBtn: {
        backgroundColor: theme.colors.accentPrimary,
        paddingVertical: 20,
        borderRadius: theme.layout.borderRadius.pill,
        alignItems: 'center',
        marginBottom: 8,
        elevation: 8,
        shadowColor: theme.colors.accentPrimary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
    },
    primaryBtnText: {
        color: theme.colors.textOnPrimary,
        fontSize: 18,
        fontWeight: '900',
        letterSpacing: 2,
    },
    primaryBtnHint: {
        color: 'rgba(0,0,0,0.5)',
        fontSize: 11,
        marginTop: 4,
    },
    menuBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        paddingVertical: 18,
        paddingHorizontal: 20,
        borderRadius: theme.layout.borderRadius.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    menuBtnIcon: {
        fontSize: 20,
        marginRight: 14,
    },
    menuBtnText: {
        flex: 1,
        color: theme.colors.textPrimary,
        fontSize: theme.typography.sizes.body,
        fontWeight: theme.typography.weights.bold,
        letterSpacing: 1,
    },
    menuBtnArrow: {
        color: theme.colors.accentPrimary,
        fontSize: 24,
        fontWeight: 'bold',
    },
    version: {
        color: theme.colors.textSecondary,
        fontSize: 11,
        opacity: 0.4,
    },
});
