const ACCESS_TOKEN_KEY = 'tab_access_token';
const REFRESH_TOKEN_KEY = 'tab_refresh_token';
export const AUTH_SESSION_CHANGED_EVENT = 'auth-session-changed';

const hasWindow = typeof window !== 'undefined';

export const getAccessToken = () => {
    if (!hasWindow) return '';
    return window.sessionStorage.getItem(ACCESS_TOKEN_KEY) || '';
};

export const getRefreshToken = () => {
    if (!hasWindow) return '';
    return window.sessionStorage.getItem(REFRESH_TOKEN_KEY) || '';
};

export const setAuthSession = ({ accessToken, refreshToken, token } = {}) => {
    if (!hasWindow) return;

    const nextAccessToken = accessToken || token || '';
    if (nextAccessToken) {
        window.sessionStorage.setItem(ACCESS_TOKEN_KEY, nextAccessToken);
    }

    if (refreshToken) {
        window.sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }

    window.dispatchEvent(new CustomEvent(AUTH_SESSION_CHANGED_EVENT, { detail: { loggedIn: true } }));
};

export const clearAuthSession = () => {
    if (!hasWindow) return;
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    window.dispatchEvent(new CustomEvent(AUTH_SESSION_CHANGED_EVENT, { detail: { loggedIn: false } }));
};

export const isTabLoggedIn = () => {
    return Boolean(getAccessToken());
};
