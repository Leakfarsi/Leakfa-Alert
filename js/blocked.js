let currentLanguage = 'en';
let targetURL = null;
let alertFrequency = 'once';
let matchedDomain = null;
let warningTabId = null;

function applyBlockedTheme(themeName) {
    const stylesheet = document.getElementById('theme-stylesheet');
    if (stylesheet) {
        stylesheet.href = 'css/' + themeName + '-blocked.css';
    }
    const logo = document.querySelector('.warn-logo');
    if (logo) {
        logo.src = themeName === 'light' ? 'images/dark.png' : 'images/light.png';
    }
}

chrome.storage.sync.get(['theme'], function(result) {
    const storedTheme = result.theme || 'system';

    const liveSystemTheme = leakfaDetectSystemTheme();
    if (liveSystemTheme) {
        leakfaCacheSystemTheme(liveSystemTheme);
    }

    chrome.storage.local.get(['lastKnownSystemTheme'], function(localResult) {
        applyBlockedTheme(leakfaResolveTheme(storedTheme, localResult.lastKnownSystemTheme));
    });

    if (storedTheme === 'system' && window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
            const newSystemTheme = leakfaDetectSystemTheme();
            if (newSystemTheme) {
                leakfaCacheSystemTheme(newSystemTheme);
                applyBlockedTheme(newSystemTheme);
            }
        });
    }
});

function closeCurrentTab() {
    chrome.tabs.getCurrent(function(tab) {
        if (tab && typeof tab.id === 'number') {
            chrome.tabs.remove(tab.id);
        }
    });
}

function goBack() {
    if (window.history.length <= 1) {
        closeCurrentTab();
        return;
    }
    chrome.tabs.getCurrent(function(tab) {
        const tabId = tab && typeof tab.id === 'number' ? tab.id : null;
        if (tabId === null || !matchedDomain) {
            window.history.back();
            return;
        }
        chrome.storage.session.set({
            pendingBack: { tabId: tabId, domain: matchedDomain, at: Date.now() }
        }, function() {
            window.history.back();
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);
    targetURL = leakfaResolveSafeURL(params.get('url'), null);

    const continueButton = document.getElementById('warn-continue');
    const backButton = document.getElementById('warn-back');

    if (backButton) {
        backButton.addEventListener('click', goBack);
    }

    chrome.storage.sync.get(['language', 'alertStyle', 'alertFrequency', 'alertMode', 'notificationMode', 'showNotifications'], function(syncResult) {
        currentLanguage = leakfaResolveLanguage(syncResult.language);
        alertFrequency = leakfaResolveAlertSettings(syncResult).frequency;
        leakfaApplyTranslations(currentLanguage);
        document.title = leakfaTranslate('popupTitle', currentLanguage) + ' | ' + leakfaTranslate('warnPageTitle', currentLanguage);



        if (!targetURL) {
            if (continueButton) {
                continueButton.style.display = 'none';
            }
            return;
        }

        let hostname = '';
        try {
            hostname = new URL(targetURL).hostname;
        } catch (e) {
            hostname = '';
        }

        const domainElement = document.getElementById('warn-domain');
        if (domainElement) {
            domainElement.textContent = hostname;
        }

        chrome.action.setBadgeText({ text: '!' });

        chrome.storage.local.get(['domainDescriptions'], function(localResult) {
            const domainDescriptions = localResult.domainDescriptions || {};
            matchedDomain = hostname ? leakfaMatchDomain(hostname, domainDescriptions) : null;
            const entry = matchedDomain ? domainDescriptions[matchedDomain] : null;

            renderEntry(entry);
            publishWarningTab();

            if (continueButton) {
                continueButton.addEventListener('click', function() {
                    continueButton.disabled = true;
                    leakfaMarkDomainAlerted(matchedDomain, alertFrequency, function() {
                        window.location.replace(targetURL);
                    });
                });
            }
        });
    });
});

function publishWarningTab() {
    if (!matchedDomain) {
        return;
    }
    chrome.tabs.getCurrent(function(tab) {
        if (!tab || typeof tab.id !== 'number') {
            return;
        }
        warningTabId = tab.id;
        chrome.storage.session.get(['warningTabs'], function(result) {
            const warningTabs = result.warningTabs || {};
            warningTabs[tab.id] = matchedDomain;
            chrome.storage.session.set({ warningTabs: warningTabs });
        });
    });
}

window.addEventListener('pagehide', function() {
    if (warningTabId === null) {
        return;
    }
    chrome.storage.session.get(['warningTabs'], function(result) {
        const warningTabs = result.warningTabs || {};
        delete warningTabs[warningTabId];
        chrome.storage.session.set({ warningTabs: warningTabs });
    });
});

function renderEntry(entry) {
    const descriptionElement = document.getElementById('warn-description-text');
    if (descriptionElement) {
        descriptionElement.textContent = entry
            ? leakfaGetLocalizedDescription(entry, currentLanguage)
            : leakfaTranslate('noDescription', currentLanguage);
    }

    const responseBanner = document.getElementById('response-banner');
    if (responseBanner && entry) {
        const COMPANY_RESPONSE_KEYS = {
            acknowledged: 'companyResponseAcknowledged',
            partial: 'companyResponsePartial',
            ignored: 'companyResponseIgnored'
        };
        const companyResponse = leakfaResolveCompanyResponse(entry);
        const entityName = leakfaResolveEntityName(entry, currentLanguage);
        const template = leakfaTranslate(COMPANY_RESPONSE_KEYS[companyResponse], currentLanguage);
        responseBanner.textContent = template.replace('{name}', entityName);
        responseBanner.className = 'response-banner ' + companyResponse;
        responseBanner.style.display = 'flex';
    }

    const detailsLink = document.getElementById('warn-details');
    if (detailsLink && entry) {
        detailsLink.href = leakfaResolveSafeURL(entry.relatedURL, 'https://extension.leakfarsi.workers.dev/leaks');
    }
}
