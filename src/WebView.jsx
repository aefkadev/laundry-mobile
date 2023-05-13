import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import { useState, useCallback, useRef, useEffect } from 'react';
import {
    RefreshControl, SafeAreaView, ScrollView, StyleSheet, View, BackHandler, ToastAndroid
} from 'react-native';
import appConfig from '../app.conf.js';

const WebViewMain = () => {
    const webViewRef = useRef();
    const [canGoBack, setCanGoBack] = useState(false);
    const [enabledRefreshing, setEnabledRefreshing] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const watchWebViewMessage = (message) => {
        if (!message.pageY) setEnabledRefreshing(true);
        else setEnabledRefreshing(false);
    };

    const onWebRefresh = () => useCallback(() => {
        setRefreshing(true);
        webViewRef.current.reload();
        setTimeout(() => setRefreshing(false), 200);
    });

    const handleBackButton = useCallback(() => {
        if (canGoBack) {
            webViewRef.current?.goBack();
            return true;
        } else {
            // ToastAndroid.show('Tekan sekali lagi untuk keluar', ToastAndroid.SHORT);
            BackHandler.exitApp();
            return true;
        }
    }, [canGoBack]);
    
    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', handleBackButton);
        return () => {
            BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
        };
    }, [handleBackButton]);
    
    const handleWebViewNavigationStateChange = (newState) => {
        setCanGoBack(newState.canGoBack);
    };
    
    // useEffect(() => {
    //     const handleBackButton = () => {
    //         // Periksa apakah halaman webview memiliki history
    //         webViewRef.current?.goBack();
    //         return true;
    //     };
    
    //     // Daftarkan event listener untuk tombol "Back"
    //     BackHandler.addEventListener('hardwareBackPress', handleBackButton);
    
    //     return () => {
    //         // Hapus event listener saat komponen unmount
    //         BackHandler.removeEventListener('hardwareBackPress', handleBackButton);
    //     };
    // }, []);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />
            <ScrollView
                contentContainerStyle={styles.scrollView}
                refreshControl={
                    <RefreshControl enabled={enabledRefreshing} refreshing={refreshing} onRefresh={onWebRefresh()} />
                }>
                <View
                    style={{ flex: 1, width: '100%' }}
                    onStartShouldSetResponder={(e) => {
                        const { pageY } = e.nativeEvent;
                        if (pageY < 140) setEnabledRefreshing(true);
                        else setEnabledRefreshing(false);
                    }}>

                    <WebView
                        ref = {webViewRef}
                        source={{ uri: appConfig.webView.uri }}
                        AllowsFullscreenVideo={true}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        startInLoadingState={true}
                        onMessage={(event) => watchWebViewMessage(JSON.parse(event.nativeEvent.data))}
                        onNavigationStateChange={handleWebViewNavigationStateChange}
                    />

                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 30,
        backgroundColor: '#FFFFF',
    },
    scrollView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default WebViewMain;