const LEAKFA_STRINGS = {
    en: {
        popupTitle: 'Leakfa Alert',
        popupQuestion: 'Have you an account on this site?',
        loadingDescription: 'Loading description...',
        noDescription: 'Description not available.',
        moreDetails: 'More details',
        checkMajorLeaks: 'List of Leaks',
        alertWarnOnceShort: 'Warn: Once',
        alertWarnAlwaysShort: 'Warn: Always',
        alertWarnOffShort: 'Warn: Off',
        alertNotifyOnceShort: 'Notify: Once',
        alertNotifyAlwaysShort: 'Notify: Always',
        alertNotifyOffShort: 'Notify: Off',
        settingsTitle: 'Extension Settings',
        navSettings: 'Settings',
        navGeneral: 'General',
        navHistory: 'History',
        navAbout: 'About',
        alertSettingsHeading: 'Alert Settings',
        onLabel: 'ON',
        offLabel: 'OFF',
        alertTypeWarnPage: 'Show warning page',
        alertTypeNotification: 'Show notification',
        alertFreqOnce: 'Once per site',
        alertFreqSession: 'Always per browser session',
        alertTypeOff: 'Off',
        languageSettingsHeading: 'Language Settings',
        languagePersian: 'Persian',
        languageEnglish: 'English',
        themeSettingsHeading: 'Theme Settings',
        themeSystemDefault: 'System Default',
        themeDark: 'Dark Mode',
        themeLight: 'Light Mode',
        domainUpdatesHeading: 'Domain List Updates',
        updateWeekly: 'Weekly',
        updateMonthly: 'Monthly',
        updateCustom: 'Custom Schedule (days)',
        customDaysPlaceholder: 'Enter days',
        save: 'Save',
        saved: 'Saved!',
        resetHeading: 'Reset',
        resetDescription: 'Restores alert, language, theme, and update settings to their defaults.',
        resetDefaults: 'Reset to Default Settings',
        resetConfirm: 'Click again to confirm',
        resetDone: 'Settings reset!',
        recentFindingsHeading: 'Recent Findings',
        saveHistoryToggleLabel: 'Save Recent Findings History',
        noFindings: 'No leaked sites detected yet.',
        historyDisabled: 'History is turned off, so recent findings aren’t being saved.',
        clearHistory: 'Clear History',
        aboutHeading: 'Leakfa Alert',
        aboutVersion: 'Version:',
        aboutLicense: 'License: MIT License',
        aboutPrivacyText: "Leakfa Alert checks the domains you visit against a breach list that is downloaded and stored on your device, no browsing data is sent to Leakfa's servers for this. The only network request is the periodic download of that public breach list. The Recent Findings history is also stored only in your browser and is never transmitted anywhere, you can turn it off anytime from the History tab.",
        aboutDonateText: 'If you find this extension helpful, consider donating to support further development.',
        donate: 'Donate',
        socialGithub: 'Github',
        socialTwitter: 'X (Twitter)',
        socialYoutube: 'YouTube',
        socialTelegram: 'Telegram',
        socialEmail: 'Email',
        companyResponseAcknowledged: '{name} has officially taken responsibility for this incident',
        companyResponsePartial: '{name} has only partially taken responsibility for this incident',
        companyResponseIgnored: '{name} has not taken responsibility for this incident yet',
        genericEntityFallback: 'This organization',
        notificationUpdatedMessage: 'Your domain list has been updated.',
        notificationLeakMessagePrefix: 'Have you an account on this site?',
        warnPageTitle: 'Data Breach Warning',
        warnPageHeading: 'This website has a history of data leaks!',
        warnPageAdvice: 'If you intend to log in, sign up, or enter personal information, proceed with extra care, and where possible use a unique password and two-factor authentication.',
        warnPageIntro: 'This is not a browser security warning or a site block. Information held by Leakfa indicates that this service has suffered a data leak in the past and that some of its users’ data was exposed.',
        viewLeakDetails: 'View more details',
        warnPageSettingsLink: 'Change alert settings',
        warnPageContinue: 'Continue to site',
        warnPageGoBack: 'Go back'
    },
    fa: {
        popupTitle: 'دیده‌بان لیکفا',
        popupQuestion: 'در این سایت حساب کاربری دارید؟',
        loadingDescription: 'در حال بارگذاری توضیحات...',
        noDescription: 'توضیحی موجود نیست.',
        moreDetails: 'جزئیات بیشتر',
        checkMajorLeaks: 'فهرست نشت‌ها',
        alertWarnOnceShort: 'هشدار: یک‌بار',
        alertWarnAlwaysShort: 'هشدار: همیشه',
        alertWarnOffShort: 'هشدار: خاموش',
        alertNotifyOnceShort: 'اعلان: یک‌بار',
        alertNotifyAlwaysShort: 'اعلان: همیشه',
        alertNotifyOffShort: 'اعلان: خاموش',
        settingsTitle: 'تنظیمات افزونه',
        navSettings: 'تنظیمات',
        navGeneral: 'عمومی',
        navHistory: 'تاریخچه',
        navAbout: 'درباره',
        alertSettingsHeading: 'تنظیمات هشدار',
        onLabel: 'روشن',
        offLabel: 'خاموش',
        alertTypeWarnPage: 'نمایش هشدار',
        alertTypeNotification: 'نمایش اعلان',
        alertFreqOnce: 'یک‌بار برای هر سایت',
        alertFreqSession: 'همیشه در هر اجرای مرورگر',
        alertTypeOff: 'خاموش',
        languageSettingsHeading: 'تنظیمات زبان',
        languagePersian: 'فارسی',
        languageEnglish: 'انگلیسی',
        themeSettingsHeading: 'تنظیمات ظاهر',
        themeSystemDefault: 'پیش‌فرض سیستم',
        themeDark: 'حالت تیره',
        themeLight: 'حالت روشن',
        domainUpdatesHeading: 'به‌روزرسانی فهرست دامنه‌ها',
        updateWeekly: 'هفتگی',
        updateMonthly: 'ماهانه',
        updateCustom: 'زمان‌بندی سفارشی (روز)',
        customDaysPlaceholder: 'تعداد روز را وارد کنید',
        save: 'ذخیره',
        saved: 'ذخیره شد!',
        resetHeading: 'بازگردانی',
        resetDescription: 'تنظیمات هشدار، زبان، ظاهر و به‌روزرسانی به حالت پیش‌فرض بازمی‌گردد.',
        resetDefaults: 'بازگردانی به تنظیمات پیش‌فرض',
        resetConfirm: 'برای تأیید دوباره کلیک کنید',
        resetDone: 'تنظیمات بازگردانی شد!',
        recentFindingsHeading: 'یافته‌های اخیر',
        saveHistoryToggleLabel: 'ذخیره یافته‌های اخیر',
        noFindings: 'هنوز سایت نشت‌یافته‌ای شناسایی نشده است.',
        historyDisabled: 'تاریخچه غیرفعال است، بنابراین یافته‌های اخیر ذخیره نمی‌شوند.',
        clearHistory: 'پاک کردن تاریخچه',
        aboutHeading: 'دیده‌بان لیکفا',
        aboutVersion: 'نسخه:',
        aboutLicense: 'مجوز: MIT License',
        aboutPrivacyText: 'دیده‌بان لیکفا دامنه‌هایی را که بازدید می‌کنید با فهرست نشتی که روی دستگاه شما دانلود و ذخیره شده مقایسه می‌کند؛ برای این کار هیچ داده‌ای از مرور شما به سرورهای لیکفا ارسال نمی‌شود. تنها درخواست شبکه‌ای، دانلود دوره‌ای همان فهرست عمومی نشت‌ها است. تاریخچه «یافته‌های اخیر» نیز فقط در مرورگر شما ذخیره می‌شود و هرگز به جایی ارسال نمی‌شود؛ می‌توانید آن را هر زمان از تب «تاریخچه» غیرفعال کنید.',
        aboutDonateText: 'اگر این افزونه برایتان مفید بوده، برای حمایت از توسعه بیشتر می‌توانید کمک مالی کنید.',
        donate: 'حمایت مالی',
        socialGithub: 'گیت‌هاب',
        socialTwitter: 'ایکس (توییتر)',
        socialYoutube: 'یوتیوب',
        socialTelegram: 'تلگرام',
        socialEmail: 'ایمیل',
        companyResponseAcknowledged: '{name} رسماً مسئولیت این رخداد را پذیرفته است',
        companyResponsePartial: '{name} مسئولیت رخداد را تا حدی پذیرفته است',
        companyResponseIgnored: '{name} تاکنون مسئولیت این رخداد را نپذیرفته است',
        genericEntityFallback: 'این مجموعه',
        notificationUpdatedMessage: 'فهرست دامنه‌ها به‌روزرسانی شد.',
        notificationLeakMessagePrefix: 'آیا در این سایت حساب کاربری دارید؟',
        warnPageTitle: 'هشدار نشت اطلاعات',
        warnPageHeading: 'این وب‌سایت سابقه نشت اطلاعات دارد!',
        warnPageAdvice: 'اگر قصد ورود، ثبت‌نام یا وارد کردن اطلاعات شخصی را دارید، با دقت بیشتری ادامه دهید و در صورت امکان از گذرواژه‌ای منحصربه‌فرد و احراز هویت دومرحله‌ای استفاده کنید.',
        warnPageIntro: 'این یک هشدار امنیتی مرورگر یا مسدودسازی سایت نیست. اطلاعات موجود در لیکفا نشان می‌دهد این سرویس در گذشته دچار نشت اطلاعات شده و بخشی از داده‌های کاربران آن افشا شده است.',
        viewLeakDetails: 'مشاهده جزئیات بیشتر',
        warnPageSettingsLink: 'تغییر تنظیمات هشدار',
        warnPageContinue: 'ادامه و ورود به سایت',
        warnPageGoBack: 'بازگشت'
    }
};

function leakfaResolveLanguage(storedLanguage) {
    return (storedLanguage === 'fa' || storedLanguage === 'en') ? storedLanguage : 'fa';
}

function leakfaTranslate(key, language) {
    const lang = (language === 'fa') ? 'fa' : 'en';
    return (LEAKFA_STRINGS[lang] && LEAKFA_STRINGS[lang][key]) || LEAKFA_STRINGS.en[key] || key;
}

function leakfaGetLocalizedDescription(entry, language) {
    if (!entry) {
        return '';
    }
    if (language === 'en') {
        return entry.description_en || entry.description_fa || entry.description || '';
    }
    return entry.description_fa || entry.description_en || entry.description || '';
}

function leakfaResolveEntityName(entry, language) {
    const fallback = leakfaTranslate('genericEntityFallback', language);
    if (!entry) {
        return fallback;
    }
    if (language === 'en') {
        return entry.name_en || entry.name_fa || fallback;
    }
    return entry.name_fa || entry.name_en || fallback;
}

function leakfaResolveCompanyResponse(entry) {
    if (entry && entry.companyResponse === 'acknowledged') {
        return 'acknowledged';
    }
    if (entry && entry.companyResponse === 'partial') {
        return 'partial';
    }
    return 'ignored';
}

function leakfaResolveSafeURL(url, fallbackURL) {
    return (typeof url === 'string' && /^https?:\/\//i.test(url)) ? url : fallbackURL;
}

function leakfaApplyTranslations(language) {
    if (typeof document === 'undefined') {
        return;
    }
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
        el.textContent = leakfaTranslate(el.getAttribute('data-i18n'), language);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
        el.placeholder = leakfaTranslate(el.getAttribute('data-i18n-placeholder'), language);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function(el) {
        el.title = leakfaTranslate(el.getAttribute('data-i18n-title'), language);
    });
}
