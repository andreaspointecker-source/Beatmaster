import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState, StatusBar as RNStatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import GlobalAdBanner from './src/components/GlobalAdBanner';
import { GameConfigProvider } from './src/context/GameConfig';

// Screens
import GameMaster from './src/components/GameMaster';
import GameSettingsScreen from './src/components/GameSettingsScreen';
import HomeScreen from './src/components/HomeScreen';
import LiveGameMaster from './src/components/LiveGameMaster';
import LobbyScreen from './src/components/LobbyScreen';
import OnlineWaitingRoom from './src/components/OnlineWaitingRoom';
import PlaylistScreen from './src/components/PlaylistScreen';
import QuestionTypeScreen from './src/components/QuestionTypeScreen';
import SettingsScreen from './src/components/SettingsScreen';
import SetupScreen from './src/components/SetupScreen';

const Stack = createNativeStackNavigator();
const BG = '#111625';

export default function App() {
    const hideStatusBar = () => {
        RNStatusBar.setHidden(true, 'none');
    };

    // Statusleiste jedes Mal verstecken wenn App in den Vordergrund kommt
    useEffect(() => {
        hideStatusBar();
        const sub = AppState.addEventListener('change', (state) => {
            if (state === 'active') {
                // Sofort und nach kurzer Verzögerung (Android stellt sie manchmal verzögert wieder her)
                hideStatusBar();
                setTimeout(hideStatusBar, 100);
                setTimeout(hideStatusBar, 300);
            }
        });
        return () => sub.remove();
    }, []);
    return (
        <SafeAreaProvider style={styles.safeArea}>
            <StatusBar style="light" backgroundColor={BG} translucent={false} hidden={true} />
            <GameConfigProvider>
                <View style={styles.root}>
                    <NavigationContainer>
                        <Stack.Navigator
                            screenOptions={{
                                headerShown: false,
                                contentStyle: { backgroundColor: BG },
                                animation: 'slide_from_right',
                            }}
                        >
                            <Stack.Screen name="Home" component={HomeScreen} />
                            <Stack.Screen name="Setup" component={SetupScreen} />
                            <Stack.Screen name="QuestionType" component={QuestionTypeScreen} />
                            <Stack.Screen name="GameSettings" component={GameSettingsScreen} />
                            <Stack.Screen name="GameMaster" component={GameMaster} />
                            <Stack.Screen name="Playlists" component={PlaylistScreen} />
                            <Stack.Screen name="Settings" component={SettingsScreen} />
                            <Stack.Screen name="Lobby" component={LobbyScreen} />
                            <Stack.Screen name="OnlineWaitingRoom" component={OnlineWaitingRoom} />
                            <Stack.Screen name="LiveGameMaster" component={LiveGameMaster} />
                        </Stack.Navigator>
                    </NavigationContainer>
                    <GlobalAdBanner />
                </View>
            </GameConfigProvider>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    safeArea: { backgroundColor: BG },
    root: { flex: 1, backgroundColor: BG },
});
