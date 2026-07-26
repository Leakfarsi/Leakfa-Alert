function leakfaMatchDomain(hostname, domainDescriptions) {
    if (Object.prototype.hasOwnProperty.call(domainDescriptions, hostname)) {
        return hostname;
    }

    for (const key in domainDescriptions) {
        if (hostname.endsWith('.' + key)) {
            return key;
        }
    }

    return null;
}
