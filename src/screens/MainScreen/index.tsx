import React, {useEffect, useState, useRef, useMemo, useCallback} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {WebView, WebViewMessageEvent} from 'react-native-webview';

import {storage} from '../../navigation';

interface ISiteData {
  name: string;
  url: string;
}

const MainScreen = () => {
  const [sitesData, setSitesData] = useState<ISiteData[]>([]);
  const [activeItem, setActiveItem] = useState<string>('');
  const [copyright, setCopyright] = useState<string | undefined>('');
  const [isLoading, setIsLoading] = useState<Boolean>(false);
  const [isLoadingPage, setIsLoadingPage] = useState<Boolean>(false);

  const webViewRef = useRef<WebView>(null);
  const copyrightRegex = useMemo(
    () => /©\s*(?:\d{4}\s*)?[a-zA-Z\s.,&;]+/gi,
    [],
  );

  const fetchData = useCallback(async () => {
    const response = await fetch(
      'https://6389df1b4eccb986e89cf319.mockapi.io/give-some-data/websites',
    );
    const data: ISiteData[] = await response.json();
    setSitesData(data);
  }, []);

  const injectedJavaScript = useMemo(
    () => `
    (function() {
      const copyrightTexts = [];
      let findCopyrightFromFooter = () => {
        const footerElements = document.querySelectorAll('footer');
        footerElements.forEach((footerElement) => {
          const innerHTML = footerElement.innerHTML;
          const innerText = footerElement.innerText;
        
          let match = innerHTML.match(${copyrightRegex});
          
          if (match) {
            copyrightTexts.push(...match);
            return;
          }

          match = innerText.match(${copyrightRegex});
          if (match) {
            copyrightTexts.push(...match);
          }
        });
      };
      
      let footerCopyrights = findCopyrightFromFooter();
      copyrightTexts.length && window.ReactNativeWebView.postMessage(copyrightTexts[0]);
    })();
    true
  `,
    [copyrightRegex],
  );

  const handleSelectSite = useCallback((item: string) => {
    setActiveItem(item);
  }, []);

  const handleStartLoad = useCallback(() => {
    setCopyright('');
    setIsLoadingPage(true);
    const cp = storage.getString(activeItem);
    cp && setCopyright(cp);
    !cp && setIsLoading(true);
  }, [activeItem]);

  const handleLoadEnd = useCallback(() => {
    webViewRef.current?.injectJavaScript(injectedJavaScript);
    setIsLoadingPage(false);
    setIsLoading(false);
  }, [injectedJavaScript]);

  const handleOnMessage = useCallback(
    (data: WebViewMessageEvent & string) => {
      setCopyright('');
      const getText = data.trim();
      if (getText) {
        storage.set(activeItem, getText);
        setCopyright(getText);
      }
    },
    [activeItem],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.greeting}>
        <Text style={styles.textGreeting}>{`Hello ${
          storage.getString('email') ?? ''
        }`}</Text>
      </View>
      <View style={styles.container}>
        <View style={styles.scrollWrapper}>
          <ScrollView horizontal>
            {Array.isArray(sitesData) &&
              sitesData.map(item => {
                return (
                  !!item?.url && (
                    <TouchableOpacity
                      key={item?.name}
                      style={styles.button}
                      onPress={() => handleSelectSite(item?.url)}>
                      <Text
                        style={activeItem === item?.url && styles.activeButton}>
                        {item?.name}
                      </Text>
                    </TouchableOpacity>
                  )
                );
              })}
          </ScrollView>
        </View>
        <View style={styles.webWrapper}>
          {!!activeItem && (
            <WebView
              ref={webViewRef}
              source={{uri: activeItem}}
              javaScriptEnabled={true}
              allowFileAccessFromFileURLs={true}
              allowFileAccess={true}
              allowUniversalAccessFromFileURLs={true}
              onLoadStart={handleStartLoad}
              onLoadEnd={handleLoadEnd}
              onMessage={event => handleOnMessage(event.nativeEvent.data)}
              cacheEnabled={true}
            />
          )}
          {isLoadingPage && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size={'large'} />
            </View>
          )}
        </View>
        <View style={styles.cpWrapper}>
          {activeItem &&
            (isLoading ? (
              <ActivityIndicator />
            ) : (
              <Text>{isLoadingPage ? '' : copyright}</Text>
            ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  scrollWrapper: {
    marginBottom: 10,
  },
  innerContent: {
    marginBottom: 10,
  },
  greeting: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loaderContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  textGreeting: {
    fontSize: 15,
    fontWeight: '500',
  },
  button: {
    padding: 5,
    marginBottom: 5,
  },
  activeButton: {
    color: 'red',
    fontWeight: 'bold',
  },
  webWrapper: {
    flex: 1,
  },
  cpWrapper: {
    paddingTop: 15,
    alignItems: 'center',
  },
});

export default MainScreen;
