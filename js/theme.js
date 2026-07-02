function leakfaDetectSystemTheme() {
    if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return null;
}

function leakfaResolveTheme(storedTheme, cachedSystemTheme) {
    if (storedTheme === 'dark' || storedTheme === 'light') {
        return storedTheme;
    }
    const liveDetected = leakfaDetectSystemTheme();
    if (liveDetected) {
        return liveDetected;
    }
    return cachedSystemTheme === 'light' ? 'light' : 'dark';
}

function leakfaCacheSystemTheme(themeName) {
    if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ lastKnownSystemTheme: themeName });
    }
}
