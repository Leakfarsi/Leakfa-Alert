importScripts('i18n.js', 'theme.js', 'notifications.js', 'matching.js');

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading' && tab.active) {
        checkURL(tab.url);
    }
});

function applyUpdateFrequency() {
    chrome.storage.sync.get(['updateFrequency', 'customUpdateDays'], function(result) {
        const rawFrequency = result.updateFrequency || 'weekly';
        const updateFrequency = (rawFrequency === 'at-start' || rawFrequency === 'daily') ? 'weekly' : rawFrequency;
        const days = updateFrequency === 'every-30-days' ? 30
            : updateFrequency === 'custom-schedule' ? (result.customUpdateDays || 7)
            : 7;
        const desiredPeriodInMinutes = days * 24 * 60;

        chrome.alarms.get('updateDomainList', function(existingAlarm) {
            if (existingAlarm && Math.abs(existingAlarm.periodInMinutes - desiredPeriodInMinutes) < 1) {
                return;
            }
            scheduleCustomUpdate(days);
        });
    });
}

chrome.runtime.onInstalled.addListener(applyUpdateFrequency);
chrome.runtime.onStartup.addListener(applyUpdateFrequency);

function checkURL(url) {
    let hostname, pathname;
    try {
        const parsedURL = new URL(url);
        hostname = parsedURL.hostname;
        pathname = parsedURL.pathname;
    } catch (e) {
        return;
    }

    chrome.storage.local.get(['domainDescriptions', 'notifiedDomains'], function(localResult) {
        const domainDescriptions = localResult.domainDescriptions || {};
        const notifiedDomains = localResult.notifiedDomains || {};
        const domain = leakfaMatchDomain(hostname, pathname, domainDescriptions);
        const descriptionObj = domain ? domainDescriptions[domain] : null;
        const hasMatch = !!descriptionObj;

        chrome.action.setBadgeText({ text: hasMatch ? '!' : '' });

        if (!hasMatch) {
            return;
        }

        chrome.storage.sync.get(['notificationMode', 'showNotifications', 'language', 'saveFindingsHistory'], function(syncResult) {
            const notificationMode = leakfaResolveNotificationMode(syncResult.notificationMode, syncResult.showNotifications);
            const language = leakfaResolveLanguage(syncResult.language);
            const saveFindingsHistory = syncResult.saveFindingsHistory === undefined ? true : syncResult.saveFindingsHistory;

            if (saveFindingsHistory) {
                addToHistory(domain, descriptionObj);
            }

            if (notificationMode === 'off') {
                return;
            }
            if (notificationMode === 'once' && notifiedDomains[domain]) {
                return;
            }

            const description = leakfaGetLocalizedDescription(descriptionObj, language);
            const relatedURL = descriptionObj.relatedURL;
            const notificationOptions = {
                type: 'basic',
                iconUrl: chrome.runtime.getURL('images/icon128.png'),
                title: 'Leakfa',
                message: `${leakfaTranslate('notificationLeakMessagePrefix', language)} ${description}`
            };
            chrome.notifications.create(null, notificationOptions, function(notificationId) {
                if (chrome.runtime.lastError) {
                    console.error("Error creating notification:", chrome.runtime.lastError.message);
                } else {
                    console.log("Notification created successfully:", notificationId);
                    chrome.storage.local.set({ [notificationId]: relatedURL });
                    if (notificationMode === 'once') {
                        notifiedDomains[domain] = true;
                        chrome.storage.local.set({ notifiedDomains: notifiedDomains });
                    }
                }
            });
        });
    });
}

const MAX_HISTORY_ENTRIES = 200;

function addToHistory(domain, descriptionObj) {
    chrome.storage.local.get(['findingsHistory'], function(result) {
        const history = result.findingsHistory || [];
        const existingIndex = history.findIndex(function(entry) {
            return entry.domain === domain;
        });
        if (existingIndex !== -1) {
            history.splice(existingIndex, 1);
        }
        history.unshift({
            domain: domain,
            status: descriptionObj.status,
            description_fa: descriptionObj.description_fa || '',
            description_en: descriptionObj.description_en || '',
            relatedURL: descriptionObj.relatedURL
        });
        if (history.length > MAX_HISTORY_ENTRIES) {
            history.length = MAX_HISTORY_ENTRIES;
        }
        chrome.storage.local.set({ findingsHistory: history });
    });
}

function checkForDomainListUpdate() {
    const githubURL = 'https://raw.githubusercontent.com/Leakfarsi/Leakfa-Alert/refs/heads/domains/leaks.json';
    fetch(githubURL)
        .then(response => response.json())
        .then(data => {
            const newTimestamp = new Date(data.timestamp).getTime();
            chrome.storage.local.get(['lastUpdateTimestamp'], function(localResult) {
                const storedTimestamp = new Date(localResult.lastUpdateTimestamp).getTime() || 0;
                const isFirstEverLoad = storedTimestamp === 0;

                if (newTimestamp > storedTimestamp) {
                    chrome.storage.local.set({
                        domainDescriptions: data.domains,
                        lastUpdateTimestamp: newTimestamp
                    }, function() {
                        console.log('Domain list has been updated.');

                        if (!isFirstEverLoad) {
                            return;
                        }
                        chrome.storage.sync.get(['notificationMode', 'showNotifications', 'language'], function(syncResult) {
                            const notificationMode = leakfaResolveNotificationMode(syncResult.notificationMode, syncResult.showNotifications);
                            if (notificationMode === 'off') {
                                return;
                            }
                            const language = leakfaResolveLanguage(syncResult.language);
                            const notificationOptions = {
                                type: 'basic',
                                iconUrl: chrome.runtime.getURL('images/icon128.png'),
                                title: 'Leakfa',
                                message: leakfaTranslate('notificationUpdatedMessage', language)
                            };
                            chrome.notifications.create(null, notificationOptions, function(notificationId) {
                                if (chrome.runtime.lastError) {
                                    console.error("Error creating notification:", chrome.runtime.lastError.message);
                                }
                            });
                        });
                    });
                }
            });
        })
        .catch(error => {
            console.error('Error fetching data from GitHub:', error);
        });
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type === 'update_frequency') {
        const updateFrequency = message.frequency;
        const customDays = message.customDays;

        switch (updateFrequency) {
            case 'at-start':
            case 'daily':
            case 'weekly':
                scheduleCustomUpdate(7);
                break;
            case 'every-30-days':
                scheduleCustomUpdate(30);
                break;
            case 'custom-schedule':
                if (customDays) {
                    scheduleCustomUpdate(customDays);
                }
                break;
            default:
                console.error('Invalid update frequency:', updateFrequency);
        }
    }
});

function scheduleCustomUpdate(customDays) {
    const periodInMinutes = customDays * 24 * 60;

    chrome.alarms.clear('updateDomainList', function() {
        chrome.alarms.create('updateDomainList', {
            delayInMinutes: 1,
            periodInMinutes: periodInMinutes
        });
    });
}

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'updateDomainList') {
        checkForDomainListUpdate();
    }
});

chrome.notifications.onClicked.addListener(function(notificationId) {
    chrome.storage.local.get(notificationId, function(result) {
        const relatedURL = leakfaResolveSafeURL(result[notificationId], null);
        if (relatedURL) {
            chrome.tabs.create({ url: relatedURL });
        }
    });
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type === 'update_theme') {
        const newTheme = message.theme;
        console.log('Received theme update message. New theme:', newTheme);
    }
});
