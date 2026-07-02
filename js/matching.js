function leakfaPathMatches(pathname, keyPath) {
    if (pathname === keyPath) {
        return true;
    }
    return pathname.startsWith(keyPath.endsWith('/') ? keyPath : keyPath + '/');
}

function leakfaMatchDomain(hostname, pathname, domainDescriptions) {
    let bestPathKey = null;
    let bestPathLength = -1;
    for (const key in domainDescriptions) {
        const slashIndex = key.indexOf('/');
        if (slashIndex === -1) {
            continue;
        }
        const keyHost = key.slice(0, slashIndex);
        const keyPath = key.slice(slashIndex);
        if (keyHost === hostname && leakfaPathMatches(pathname, keyPath) && keyPath.length > bestPathLength) {
            bestPathKey = key;
            bestPathLength = keyPath.length;
        }
    }
    if (bestPathKey) {
        return bestPathKey;
    }

    if (Object.prototype.hasOwnProperty.call(domainDescriptions, hostname)) {
        return hostname;
    }

    for (const key in domainDescriptions) {
        if (key.indexOf('/') !== -1) {
            continue;
        }
        if (hostname.endsWith('.' + key)) {
            return key;
        }
    }

    return null;
}
