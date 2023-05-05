import { StatusBar } from 'expo-status-bar';
import { WebView } from 'react-native-webview';
import { useState, useCallback, useRef } from 'react';
import {
    RefreshControl, SafeAreaView, ScrollView, StyleSheet, View,
} from 'react-native';
import appConfig from '../app.conf.js';

const WebViewMain = () => {
    const webViewRef = useRef();

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