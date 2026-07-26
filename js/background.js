importScripts('i18n.js', 'theme.js', 'notifications.js', 'matching.js');

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'loading') {
        checkURL(tabId, tab.url);
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

function checkURL(tabId, url) {
    let hostname, protocol;
    try {
        const parsedURL = new URL(url);
        hostname = parsedURL.hostname;
        protocol = parsedURL.protocol;
    } catch (e) {
        return;
    }

    clearWarningTab(tabId);

    chrome.storage.local.get(['domainDescriptions', 'notifiedDomains'], function(localResult) {
        const domainDescriptions = localResult.domainDescriptions || {};
        const notifiedDomains = localResult.notifiedDomains || {};
        const domain = leakfaMatchDomain(hostname, domainDescriptions);
        const descriptionObj = domain ? domainDescriptions[domain] : null;
        const hasMatch = !!descriptionObj;

        chrome.action.setBadgeText({ text: hasMatch ? '!' : '' });

        if (!hasMatch) {
            return;
        }

        chrome.storage.session.get(['pendingBack', 'sessionAlertedDomains'], function(sessionResult) {
            if (consumePendingBack(sessionResult.pendingBack, tabId, domain)) {
                return;
            }
            const sessionAlertedDomains = sessionResult.sessionAlertedDomains || {};

            chrome.storage.sync.get(['alertStyle', 'alertFrequency', 'alertMode', 'notificationMode', 'showNotifications', 'language', 'saveFindingsHistory'], function(syncResult) {
                const alert = leakfaResolveAlertSettings(syncResult);
                const language = leakfaResolveLanguage(syncResult.language);
                const saveFindingsHistory = syncResult.saveFindingsHistory === undefined ? true : syncResult.saveFindingsHistory;

                if (saveFindingsHistory) {
                    addToHistory(domain, descriptionObj);
                }

                if (alert.frequency === 'off') {
                    return;
                }
                const alreadyAlerted = alert.frequency === 'session' ? sessionAlertedDomains : notifiedDomains;
                if (alreadyAlerted[domain]) {
                    return;
                }

                if (alert.style === 'warn-page') {
                    if (protocol !== 'http:' && protocol !== 'https:') {
                        return;
                    }
                    if (typeof tabId !== 'number') {
                        return;
                    }
                    const warningURL = chrome.runtime.getURL('blocked.html') + '?url=' + encodeURIComponent(url);
                    chrome.tabs.update(tabId, { url: warningURL });
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
                        leakfaMarkDomainAlerted(domain, alert.frequency, function() {});
                    }
                });
            });
        });
    });
}

function clearWarningTab(tabId) {
    if (typeof tabId !== 'number') {
        return;
    }
    chrome.storage.session.get(['warningTabs'], function(result) {
        const warningTabs = result.warningTabs || {};
        if (!(tabId in warningTabs)) {
            return;
        }
        delete warningTabs[tabId];
        chrome.storage.session.set({ warningTabs: warningTabs });
    });
}

const PENDING_BACK_TTL_MS = 5000;

function consumePendingBack(pendingBack, tabId, domain) {
    if (!pendingBack || pendingBack.tabId !== tabId || pendingBack.domain !== domain) {
        return false;
    }
    if (Date.now() - pendingBack.at > PENDING_BACK_TTL_MS) {
        chrome.storage.session.remove('pendingBack');
        return false;
    }
    chrome.storage.session.remove('pendingBack', function() {
        chrome.tabs.goBack(tabId, function() {
            if (chrome.runtime.lastError) {
                chrome.tabs.remove(tabId);
            }
        });
    });
    return true;
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
                        chrome.storage.sync.get(['alertStyle', 'alertFrequency', 'alertMode', 'notificationMode', 'showNotifications', 'language'], function(syncResult) {
                            if (leakfaResolveAlertSettings(syncResult).frequency === 'off') {
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
