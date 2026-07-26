let currentLanguage = 'en';

function updateTheme(themeName) {
    chrome.storage.local.get(['lastKnownSystemTheme'], function(localResult) {
        const effectiveTheme = leakfaResolveTheme(themeName, localResult.lastKnownSystemTheme);

        chrome.storage.sync.set({ theme: themeName }, function() {
            console.log('Theme preference saved:', themeName);
        });

        chrome.runtime.sendMessage({ type: 'update_theme', theme: effectiveTheme });
        updateStylesheet(effectiveTheme);
        updateLogo(effectiveTheme);
    });
}

function updateStylesheet(themeName) {
    const stylesheet = document.getElementById('theme-stylesheet');
    if (stylesheet) {
        stylesheet.href = `css/${themeName}-settings.css`;
    }
}

function updateLogo(themeName) {
    const logoImage = document.querySelector('.logo');
    if (logoImage) {
        logoImage.src = themeName === 'light' ? 'images/dark.png' : 'images/light.png';
        logoImage.alt = themeName === 'light' ? 'Leakfa Dark Logo' : 'Leakfa Light Logo';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    const sections = document.querySelectorAll('.settings-section');
    const logoImg = document.querySelector('#message img');
    const customScheduleToggle = document.getElementById("custom-schedule-toggle");
    const customScheduleInput = document.getElementById("custom-schedule-input");

    sections.forEach((section, index) => {
        if (index !== 0) {
            section.style.display = 'none';
        }
    });

    const navLinks = document.querySelectorAll('.sidebar-nav a[href^="#"]');

    navLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href').substr(1);

            sections.forEach(section => {
                section.style.display = section.id === targetId ? 'block' : 'none';
            });

            navLinks.forEach(link => {
                link.classList.toggle('active', link === this);
            });
        });
    });

    customScheduleToggle.addEventListener("change", function() {
        customScheduleInput.disabled = !customScheduleToggle.checked;
    });

    chrome.storage.sync.get(['theme'], function(result) {
        const storedTheme = result.theme || 'system';

        const liveSystemTheme = leakfaDetectSystemTheme();
        if (liveSystemTheme) {
            leakfaCacheSystemTheme(liveSystemTheme);
        }

        chrome.storage.local.get(['lastKnownSystemTheme'], function(localResult) {
            const effectiveTheme = leakfaResolveTheme(storedTheme, localResult.lastKnownSystemTheme);
            const themeRadio = document.querySelector(`input[name="theme"][value="${storedTheme}"]`);
            if (themeRadio) {
                themeRadio.checked = true;
            }
            updateStylesheet(effectiveTheme);
            updateLogo(effectiveTheme);
        });

        if (storedTheme === 'system' && window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
                const newSystemTheme = leakfaDetectSystemTheme();
                if (newSystemTheme) {
                    leakfaCacheSystemTheme(newSystemTheme);
                    updateStylesheet(newSystemTheme);
                    updateLogo(newSystemTheme);
                }
            });
        }
    });

    const themeRadios = document.querySelectorAll('input[name="theme"]');
    themeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                const themeName = this.value;
                updateTheme(themeName);
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const weeklyRadio = document.querySelector('input[name="update-frequency"][value="weekly"]');
    const thirtyDaysRadio = document.querySelector('input[name="update-frequency"][value="every-30-days"]');
    const customRadio = document.querySelector('input[name="update-frequency"][value="custom-schedule"]');
    const customInput = document.getElementById("custom-schedule-input");
    const saveButton = document.getElementById("save-custom");

    chrome.storage.sync.get(['updateFrequency', 'customUpdateDays'], function(result) {
        const rawFrequency = result.updateFrequency || 'weekly';
        const updateFrequency = (rawFrequency === 'at-start' || rawFrequency === 'daily') ? 'weekly' : rawFrequency;
        switch (updateFrequency) {
            case 'weekly':
                weeklyRadio.checked = true;
                break;
            case 'every-30-days':
                thirtyDaysRadio.checked = true;
                break;
            case 'custom-schedule':
                customRadio.checked = true;
                customInput.disabled = false;
                customInput.value = result.customUpdateDays || '';
                saveButton.style.display = 'block';
                break;
            default:
                console.error('Invalid update frequency:', updateFrequency);
        }
    });

    weeklyRadio.addEventListener('change', function() {
        if (this.checked) {
            customInput.value = '';
            customInput.disabled = true;
            saveButton.style.display = 'none';
            chrome.storage.sync.set({ updateFrequency: 'weekly' }, function() {
                console.log('Update frequency changed to weekly');
                notifyBackgroundToUpdate('weekly');
            });
        }
    });

    thirtyDaysRadio.addEventListener('change', function() {
        if (this.checked) {
            customInput.value = '';
            customInput.disabled = true;
            saveButton.style.display = 'none';
            chrome.storage.sync.set({ updateFrequency: 'every-30-days' }, function() {
                console.log('Update frequency changed to every-30-days');
                notifyBackgroundToUpdate('every-30-days');
            });
        }
    });

    customRadio.addEventListener('change', function() {
        if (this.checked) {
            customInput.disabled = false;
            saveButton.style.display = 'block';
            chrome.storage.sync.set({ updateFrequency: 'custom-schedule' }, function() {
                console.log('Update frequency changed to custom-schedule');
            });
        }
    });

    saveButton.addEventListener('click', function() {
        const days = parseInt(customInput.value);
        if (!isNaN(days) && days > 0) {
            chrome.storage.sync.set({ customUpdateDays: days }, function() {
                console.log('Custom update days changed to:', days);
                notifyBackgroundToUpdate('custom-schedule', days);
                saveButton.textContent = leakfaTranslate('saved', currentLanguage);
                saveButton.disabled = true;
                setTimeout(function() {
                    saveButton.textContent = leakfaTranslate('save', currentLanguage);
                    saveButton.disabled = false;
                }, 1000);
            });
        }
    });

    customInput.addEventListener('change', function() {
        const days = parseInt(this.value);
        if (!isNaN(days) && days > 0) {
            saveButton.style.display = 'block';
        }
    });
});

const LEAKFA_RESETTABLE_SYNC_KEYS = [
    'alertStyle',
    'alertFrequency',
    'alertMode',
    'notificationMode',
    'showNotifications',
    'notificationButtonColor',
    'theme',
    'language',
    'updateFrequency',
    'customUpdateDays',
    'saveFindingsHistory'
];

const RESET_CONFIRM_TIMEOUT_MS = 4000;

document.addEventListener('DOMContentLoaded', function () {
    const resetButton = document.getElementById('reset-defaults-button');
    if (!resetButton) {
        return;
    }

    let awaitingConfirmation = false;
    let confirmationTimer = null;

    function cancelConfirmation() {
        awaitingConfirmation = false;
        clearTimeout(confirmationTimer);
        resetButton.classList.remove('confirming');
        resetButton.textContent = leakfaTranslate('resetDefaults', currentLanguage);
    }

    resetButton.addEventListener('click', function () {
        if (!awaitingConfirmation) {
            awaitingConfirmation = true;
            resetButton.classList.add('confirming');
            resetButton.textContent = leakfaTranslate('resetConfirm', currentLanguage);
            confirmationTimer = setTimeout(cancelConfirmation, RESET_CONFIRM_TIMEOUT_MS);
            return;
        }

        awaitingConfirmation = false;
        clearTimeout(confirmationTimer);
        resetButton.disabled = true;
        resetButton.classList.remove('confirming');

        chrome.storage.sync.remove(LEAKFA_RESETTABLE_SYNC_KEYS, function () {
            notifyBackgroundToUpdate('weekly');
            chrome.runtime.sendMessage({ type: 'update_theme', theme: 'system' });
            resetButton.textContent = leakfaTranslate('resetDone', currentLanguage);
            setTimeout(function () {
                window.location.reload();
            }, 800);
        });
    });
});

function notifyBackgroundToUpdate(updateFrequency, customDays) {
    const message = {
        type: 'update_frequency',
        frequency: updateFrequency,
        customDays: customDays
    };
    chrome.runtime.sendMessage(message);
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
    for (let key in changes) {
        console.log('Storage key changed:', key);
        console.log('New value:', changes[key].newValue);
    }
});

document.addEventListener("DOMContentLoaded", function() {
  var donateButton = document.getElementById("donate-button");
  donateButton.addEventListener("click", function() {
    window.open('https://extension.leakfarsi.workers.dev/donate', '_blank');
  });
});

document.addEventListener('DOMContentLoaded', function() {
    const versionEl = document.getElementById('about-version');
    if (versionEl && chrome.runtime && chrome.runtime.getManifest) {
        versionEl.textContent = chrome.runtime.getManifest().version;
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const typeRadios = document.querySelectorAll('input[name="alert-type"]');
    const frequencyRadios = document.querySelectorAll('input[name="alert-frequency"]');
    const frequencyControl = document.getElementById('alert-frequency-control');

    let lastActiveStyle = 'warn-page';
    let lastActiveFrequency = 'once';

    function renderAlertSettings(alert) {
        const isOff = alert.frequency === 'off';
        if (!isOff) {
            lastActiveStyle = alert.style;
            lastActiveFrequency = alert.frequency;
        }

        const typeRadio = document.querySelector(`input[name="alert-type"][value="${isOff ? 'off' : alert.style}"]`);
        if (typeRadio) {
            typeRadio.checked = true;
        }
        const frequencyRadio = document.querySelector(`input[name="alert-frequency"][value="${isOff ? lastActiveFrequency : alert.frequency}"]`);
        if (frequencyRadio) {
            frequencyRadio.checked = true;
        }

        if (!frequencyControl) {
            return;
        }
        if (isOff || !typeRadio) {
            frequencyControl.style.display = 'none';
            return;
        }
        const activeOption = typeRadio.closest('.alert-option');
        if (activeOption && frequencyControl.parentNode !== activeOption) {
            activeOption.appendChild(frequencyControl);
        }
        frequencyControl.style.display = 'inline-flex';
    }

    chrome.storage.sync.get(['alertStyle', 'alertFrequency', 'alertMode', 'notificationMode', 'showNotifications'], function(result) {
        renderAlertSettings(leakfaResolveAlertSettings(result));
    });

    typeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (!this.checked) {
                return;
            }
            const next = this.value === 'off'
                ? { style: lastActiveStyle, frequency: 'off' }
                : { style: this.value, frequency: lastActiveFrequency };
            chrome.storage.sync.set({ alertStyle: next.style, alertFrequency: next.frequency }, function() {
                console.log('Alert type saved:', next.style, next.frequency);
                renderAlertSettings(next);
            });
        });
    });

    frequencyRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (!this.checked) {
                return;
            }
            const frequency = this.value;
            chrome.storage.sync.set({ alertFrequency: frequency }, function() {
                console.log('Alert frequency saved:', frequency);
                lastActiveFrequency = frequency;
            });
        });
    });
});

function renderHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) {
        return;
    }
    chrome.storage.local.get(['findingsHistory'], function(result) {
        const history = result.findingsHistory || [];
        historyList.innerHTML = '';

        if (history.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.textContent = leakfaTranslate('noFindings', currentLanguage);
            historyList.appendChild(emptyItem);
            return;
        }

        history.forEach(function(entry) {
            const item = document.createElement('li');

            const domainEl = document.createElement('strong');
            domainEl.textContent = entry.domain;
            item.appendChild(domainEl);

            item.appendChild(document.createTextNode(` – ${leakfaGetLocalizedDescription(entry, currentLanguage)} `));

            const link = document.createElement('a');
            link.href = leakfaResolveSafeURL(entry.relatedURL, 'https://extension.leakfarsi.workers.dev/leaks');
            link.target = '_blank';
            link.textContent = leakfaTranslate('viewLeakDetails', currentLanguage);
            item.appendChild(link);

            historyList.appendChild(item);
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const languageRadios = document.querySelectorAll('input[name="language"]');
    const clearHistoryButton = document.getElementById('clear-history-button');

    chrome.storage.sync.get(['language'], function(result) {
        currentLanguage = leakfaResolveLanguage(result.language);
        const targetRadio = document.querySelector(`input[name="language"][value="${result.language || 'fa'}"]`);
        if (targetRadio) {
            targetRadio.checked = true;
        }
        leakfaApplyTranslations(currentLanguage);
        renderHistory();
    });

    languageRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                const languagePref = this.value;
                chrome.storage.sync.set({ language: languagePref }, function() {
                    currentLanguage = leakfaResolveLanguage(languagePref);
                    leakfaApplyTranslations(currentLanguage);
                    renderHistory();
                });
            }
        });
    });

    if (clearHistoryButton) {
        clearHistoryButton.addEventListener('click', function() {
            chrome.storage.local.set({ findingsHistory: [] }, renderHistory);
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const saveHistoryRadios = document.querySelectorAll('input[name="save-history"]');
    const disabledNotice = document.getElementById('history-disabled-notice');

    function applyNoticeVisibility(saveHistory) {
        if (disabledNotice) {
            disabledNotice.style.display = saveHistory ? 'none' : 'block';
        }
    }

    chrome.storage.sync.get(['saveFindingsHistory'], function(result) {
        const saveHistory = result.saveFindingsHistory === undefined ? true : result.saveFindingsHistory;
        const targetRadio = document.querySelector(`input[name="save-history"][value="${saveHistory ? 'ON' : 'OFF'}"]`);
        if (targetRadio) {
            targetRadio.checked = true;
        }
        applyNoticeVisibility(saveHistory);
    });

    saveHistoryRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                const saveHistory = this.value === 'ON';
                chrome.storage.sync.set({ saveFindingsHistory: saveHistory }, function() {
                    console.log('Save findings history preference saved:', saveHistory);
                    applyNoticeVisibility(saveHistory);
                });
            }
        });
    });
});
