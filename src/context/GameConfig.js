import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const GameConfigContext = createContext(null);

const STORAGE_KEY = 'beatmaster_game_config_v1';

const DEFAULT_CONFIG = {
    players: [],
    questionTypes: ['artist'],
    settings: {
        rounds: 10,
        timerBefore: 5,
        timerAfter: 5,
        genre: 'Alle',
        decade: 'Alle',
        playlistId: null,
    },
};

export function GameConfigProvider({ children }) {
    const [config, setConfig] = useState(DEFAULT_CONFIG);
    const [loaded, setLoaded] = useState(false);

    // Beim Start aus AsyncStorage laden
    useEffect(() => {
        const load = async () => {
            try {
                const stored = await AsyncStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    // Sicherstellen dass alle Default-Felder vorhanden sind
                    setConfig(prev => ({
                        ...DEFAULT_CONFIG,
                        ...parsed,
                        settings: { ...DEFAULT_CONFIG.settings, ...parsed.settings }
                    }));
                }
            } catch (e) {
                console.warn('[GameConfig] Laden fehlgeschlagen:', e);
            } finally {
                setLoaded(true);
            }
        };
        load();
    }, []);

    const updateConfig = async (partial) => {
        const next = (prev) => ({
            ...prev,
            ...partial,
            settings: { ...prev.settings, ...(partial.settings || {}) },
        });
        setConfig(prev => {
            const updated = next(prev);
            // Async in Firestore speichern (fire-and-forget)
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(e =>
                console.warn('[GameConfig] Speichern fehlgeschlagen:', e)
            );
            return updated;
        });
    };

    const resetConfig = async () => {
        setConfig(DEFAULT_CONFIG);
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);
        } catch (e) { }
    };

    const isConfigured = config.players.length > 0;

    return (
        <GameConfigContext.Provider value={{ config, updateConfig, resetConfig, isConfigured, loaded }}>
            {children}
        </GameConfigContext.Provider>
    );
}

export function useGameConfig() {
    return useContext(GameConfigContext);
}
