import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import { useState, useCallback, useRef, useEffect } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, StyleSheet, View, BackHandler, ToastAndroid, Linking } from 'react-native';
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

    const onWebRefresh = useCallback(() => {
        setRefreshing(true);
        webViewRef.current.reload();
        setTimeout(() => setRefreshing(false), 200);
    }, []);

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

    const handleShouldStartLoadWithRequest = (request) => {
        const { url } = request;
        const whatsappURL = 'https://wa.me/';
        const whatsappMobile = 'whatsapp://';
    
        if (url.startsWith(whatsappURL) || url.startsWith(whatsappMobile)) {
            Linking.openURL(url).then(() => null).catch(() => null);
            return false; // Prevent WebView from loading the URL
        }
    
        return true; // Allow WebView to load the URL
    };

    const handleWebViewNavigationStateChange = useCallback(
        (newState) => {
            setCanGoBack(newState.canGoBack);
        },[]
    );

    return (
        <SafeAreaView style={styles.container}>
        <StatusBar style="dark" />
        <ScrollView
            contentContainerStyle={styles.scrollView}
            refreshControl={
            <RefreshControl enabled={enabledRefreshing} refreshing={refreshing} onRefresh={onWebRefresh} />
            }
        >
            <View style={{ flex: 1, width: '100%' }} onStartShouldSetResponder={(e) => {
            const { pageY } = e.nativeEvent;
            if (pageY < 140) setEnabledRefreshing(true);
            else setEnabledRefreshing(false);
            }}>
            <WebView
                ref={webViewRef}
                source={{ uri: appConfig.webView.uri }}
                AllowsFullscreenVideo={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={true}
                onMessage={(event) => watchWebViewMessage(JSON.parse(event.nativeEvent.data))}
                onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
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
        paddingTop: 40,
        backgroundColor: '#FFFFF',
    },
    scrollView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default WebViewMain;
