function leakfaResolveNotificationMode(storedMode, legacyShowNotifications) {
    if (storedMode === 'off' || storedMode === 'once' || storedMode === 'every-time') {
        return storedMode;
    }
    if (legacyShowNotifications === false) {
        return 'off';
    }
    if (legacyShowNotifications === true) {
        return 'every-time';
    }
    return 'once';
}
