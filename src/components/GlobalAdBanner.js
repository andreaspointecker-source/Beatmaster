import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function GlobalAdBanner() {
    const [refreshCount, setRefreshCount] = useState(0);

    // Erneuert die Werbung (bzw. die Dummy-Zahl) alle 30 Sekunden (für mehr "Views")
    useEffect(() => {
        const interval = setInterval(() => {
            setRefreshCount(prev => prev + 1);
        }, 15000); // 15 Sekunden Intervall für den Platzhalter
        return () => clearInterval(interval);
    }, []);

    return (
        <View style={styles.adBannerContainer}>
            <View style={styles.adBannerInner}>
                <Text style={styles.adBannerText}>WERBUNG ({refreshCount})</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    adBannerContainer: {
        width: '100%',
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: '#111625',
    },
    adBannerInner: {
        width: 320,
        height: 50,
        backgroundColor: '#0a0d14',
        borderWidth: 1,
        borderColor: '#1d2538',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    adBannerText: {
        color: '#445173',
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
});
