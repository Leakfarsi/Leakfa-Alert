let currentLanguage = 'en';

document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.sync.get(['notificationMode', 'showNotifications', 'language'], function(result) {
        currentLanguage = leakfaResolveLanguage(result.language);
        leakfaApplyTranslations(currentLanguage);

        updateNotificationButton(leakfaResolveNotificationMode(result.notificationMode, result.showNotifications));

        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            const currentTab = tabs[0];
            let hostname = null;
            let pathname = null;
            if (currentTab && currentTab.url) {
                try {
                    const parsedURL = new URL(currentTab.url);
                    hostname = parsedURL.hostname;
                    pathname = parsedURL.pathname;
                } catch (e) {
                    hostname = null;
                }
            }

            chrome.storage.local.get(['domainDescriptions'], function(localResult) {
                const domainDescriptions = localResult.domainDescriptions || {};
                const descriptionElement = document.getElementById('description');
                const responseBanner = document.getElementById('response-banner');
                if (descriptionElement) {
                    const domain = hostname ? leakfaMatchDomain(hostname, pathname, domainDescriptions) : null;
                    const descriptionObj = domain ? domainDescriptions[domain] : null;
                    if (descriptionObj) {
                        descriptionElement.textContent = leakfaGetLocalizedDescription(descriptionObj, currentLanguage);
                        if (responseBanner) {
                            const companyResponse = leakfaResolveCompanyResponse(descriptionObj);
                            const COMPANY_RESPONSE_KEYS = {
                                acknowledged: 'companyResponseAcknowledged',
                                partial: 'companyResponsePartial',
                                ignored: 'companyResponseIgnored'
                            };
                            const entityName = leakfaResolveEntityName(descriptionObj, currentLanguage);
                            const template = leakfaTranslate(COMPANY_RESPONSE_KEYS[companyResponse], currentLanguage);
                            responseBanner.textContent = template.replace('{name}', entityName);
                            responseBanner.className = 'response-banner ' + companyResponse;
                            responseBanner.style.display = 'flex';
                        }
                        const safeRelatedURL = leakfaResolveSafeURL(descriptionObj.relatedURL, 'https://leakfa.com/leaks');
                        const checkLeakfaButton = document.getElementById('check-leakfa');
                        if (checkLeakfaButton) {
                            checkLeakfaButton.addEventListener('click', function() {
                                chrome.tabs.create({ url: safeRelatedURL });
                            });
                        }
                    } else {
                        descriptionElement.textContent = leakfaTranslate('noDescription', currentLanguage);
                        if (responseBanner) {
                            responseBanner.style.display = 'none';
                        }
                        const checkLeakfaButton = document.getElementById('check-leakfa');
                        if (checkLeakfaButton) {
                            checkLeakfaButton.href = 'https://leakfa.com/leaks';
                            checkLeakfaButton.textContent = leakfaTranslate('checkMajorLeaks', currentLanguage);

                            checkLeakfaButton.addEventListener('click', function() {
                                chrome.tabs.create({ url: 'https://leakfa.com/leaks' });
                            });
                        }
                    }
                }
            });
        });
    });

    const toggleButton = document.getElementById('toggle-notification');
    if (toggleButton) {
        const NOTIFICATION_MODE_CYCLE = ['off', 'once', 'every-time'];
        toggleButton.addEventListener('click', function () {
            chrome.storage.sync.get(['notificationMode', 'showNotifications'], function(result) {
                const current = leakfaResolveNotificationMode(result.notificationMode, result.showNotifications);
                const next = NOTIFICATION_MODE_CYCLE[(NOTIFICATION_MODE_CYCLE.indexOf(current) + 1) % NOTIFICATION_MODE_CYCLE.length];
                chrome.storage.sync.set({ notificationMode: next }, function() {
                    updateNotificationButton(next);
                });
            });
        });
    }
});

function updateNotificationButton(mode) {
    const button = document.getElementById('toggle-notification');
    if (button) {
        button.classList.remove('off', 'once', 'every-time');
        button.classList.add(mode);
        const key = mode === 'off' ? 'notificationOff' : mode === 'once' ? 'notificationOnce' : 'notificationEveryTime';
        button.textContent = leakfaTranslate(key, currentLanguage);
    }
}

function extractColor(css, selector, property) {
    const match = css.match(new RegExp(`${selector}\\s*{[^}]*${property}\\s*:\\s*([^;}]+)`));
    return match ? match[1].trim() : '';
}

function applyPopupTheme(themeName) {
    const imagePath = themeName === 'light' ? 'images/dark.png' : 'images/light.png';

    const logoImg = document.querySelector('#message img');
    if (logoImg) {
        logoImg.src = imagePath;
    }

    if (themeName === 'light') {
        addTheme('light-theme');
        removeTheme('dark-theme');
    } else {
        addTheme('dark-theme');
        removeTheme('light-theme');
    }
}

chrome.storage.sync.get(['theme'], function(result) {
    const storedTheme = result.theme || 'system';

    const liveSystemTheme = leakfaDetectSystemTheme();
    if (liveSystemTheme) {
        leakfaCacheSystemTheme(liveSystemTheme);
    }

    chrome.storage.local.get(['lastKnownSystemTheme'], function(localResult) {
        applyPopupTheme(leakfaResolveTheme(storedTheme, localResult.lastKnownSystemTheme));
    });

    if (storedTheme === 'system' && window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
            const newSystemTheme = leakfaDetectSystemTheme();
            if (newSystemTheme) {
                leakfaCacheSystemTheme(newSystemTheme);
                applyPopupTheme(newSystemTheme);
            }
        });
    }
});

function addTheme(themeName) {
    const linkElement = document.createElement('link');
    linkElement.rel = 'stylesheet';
    linkElement.type = 'text/css';
    linkElement.href = 'css/' + themeName + '.css';
    linkElement.id = themeName;
    document.head.appendChild(linkElement);
}

function removeTheme(themeName) {
    const themeLink = document.getElementById(themeName);
    if (themeLink) {
        themeLink.parentNode.removeChild(themeLink);
    }
}
