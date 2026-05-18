const ONE_DAY_MS = 1000 * 60 * 60 * 24;
const ONE_WEEK_MS = ONE_DAY_MS * 7;

export function isHttpsDashboard() {
    const frontendUrl = process.env.DASHBOARD_FRONTEND_URL || process.env.NEXT_PUBLIC_DASHBOARD_URL || '';
    const callbackUrl = process.env.DASHBOARD_CALLBACK_URL || '';
    const apiUrl = process.env.API_URL || '';
    return [frontendUrl, callbackUrl, apiUrl].some((value) => value.startsWith('https://'));
}

export function shouldUseSecureCookies() {
    if (process.env.COOKIE_SECURE === 'true') return true;
    if (process.env.COOKIE_SECURE === 'false') return false;
    return isHttpsDashboard();
}

export function buildSessionCookieOptions({ maxAge = ONE_DAY_MS } = {}) {
    return {
        maxAge,
        secure: shouldUseSecureCookies(),
        httpOnly: true,
        sameSite: process.env.COOKIE_SAME_SITE || 'lax',
        path: '/'
    };
}

export { ONE_DAY_MS, ONE_WEEK_MS };
