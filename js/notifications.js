const LEAKFA_ALERT_STYLES = ['warn-page', 'notification'];
const LEAKFA_ALERT_FREQUENCIES = ['once', 'session', 'off'];

function leakfaLegacyAlertSettings(raw) {
    if (raw.alertMode === 'off') {
        return { style: 'warn-page', frequency: 'off' };
    }
    if (raw.alertMode === 'warn-page') {
        return { style: 'warn-page', frequency: 'once' };
    }
    if (raw.alertMode === 'notify-once') {
        return { style: 'notification', frequency: 'once' };
    }
    if (raw.alertMode === 'notify-always') {
        return { style: 'notification', frequency: 'session' };
    }
    if (raw.notificationMode === 'off') {
        return { style: 'warn-page', frequency: 'off' };
    }
    if (raw.notificationMode === 'once') {
        return { style: 'notification', frequency: 'once' };
    }
    if (raw.notificationMode === 'every-time') {
        return { style: 'notification', frequency: 'session' };
    }
    if (raw.showNotifications === false) {
        return { style: 'warn-page', frequency: 'off' };
    }
    if (raw.showNotifications === true) {
        return { style: 'notification', frequency: 'session' };
    }
    return { style: 'warn-page', frequency: 'once' };
}

function leakfaResolveAlertSettings(rawSettings) {
    const raw = rawSettings || {};
    const hasStyle = LEAKFA_ALERT_STYLES.indexOf(raw.alertStyle) !== -1;
    const hasFrequency = LEAKFA_ALERT_FREQUENCIES.indexOf(raw.alertFrequency) !== -1;
    if (hasStyle && hasFrequency) {
        return { style: raw.alertStyle, frequency: raw.alertFrequency };
    }
    const legacy = leakfaLegacyAlertSettings(raw);
    return {
        style: hasStyle ? raw.alertStyle : legacy.style,
        frequency: hasFrequency ? raw.alertFrequency : legacy.frequency
    };
}

function leakfaNextAlertFrequency(frequency) {
    const index = LEAKFA_ALERT_FREQUENCIES.indexOf(frequency);
    return LEAKFA_ALERT_FREQUENCIES[(index + 1) % LEAKFA_ALERT_FREQUENCIES.length];
}

const LEAKFA_ALERT_SHORT_KEYS = {
    'warn-page': { once: 'alertWarnOnceShort', session: 'alertWarnAlwaysShort', off: 'alertWarnOffShort' },
    'notification': { once: 'alertNotifyOnceShort', session: 'alertNotifyAlwaysShort', off: 'alertNotifyOffShort' }
};

function leakfaAlertShortKey(settings) {
    return LEAKFA_ALERT_SHORT_KEYS[settings.style][settings.frequency];
}

function leakfaMarkDomainAlerted(domain, frequency, callback) {
    if (!domain) {
        callback();
        return;
    }
    if (frequency === 'session') {
        chrome.storage.session.get(['sessionAlertedDomains'], function(result) {
            const alerted = result.sessionAlertedDomains || {};
            alerted[domain] = true;
            chrome.storage.session.set({ sessionAlertedDomains: alerted }, callback);
        });
        return;
    }
    chrome.storage.local.get(['notifiedDomains'], function(result) {
        const alerted = result.notifiedDomains || {};
        alerted[domain] = true;
        chrome.storage.local.set({ notifiedDomains: alerted }, callback);
    });
}
