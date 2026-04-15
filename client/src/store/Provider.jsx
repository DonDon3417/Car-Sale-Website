import Context from './Context';
import CryptoJS from 'crypto-js';
import { AUTH_SESSION_CHANGED_EVENT, clearAuthSession, isTabLoggedIn } from '../config/authSession';

import { useEffect, useState } from 'react';
import { requestAuth } from '../config/UserRequest';
import { ConfigProvider, theme as antdTheme } from 'antd';
import viVN from 'antd/locale/vi_VN';

export function Provider({ children }) {
    const [dataUser, setDataUser] = useState({});
    const [themeMode, setThemeMode] = useState(() => {
        if (typeof window === 'undefined') return 'light';

        const savedTheme = window.localStorage.getItem('site_theme_mode');
        if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;

        return 'light';
    });

    const isLightTheme = themeMode === 'light';

    const fetchAuth = async () => {
        try {
            const res = await requestAuth();
            const bytes = CryptoJS.AES.decrypt(res.metadata, import.meta.env.VITE_SECRET_CRYPTO);
            const originalText = bytes.toString(CryptoJS.enc.Utf8);
            if (!originalText) {
                console.error('Failed to decrypt data');
                return;
            }
            const user = JSON.parse(originalText);
            setDataUser(user);
        } catch (error) {
            console.error('Auth error:', error);
            setDataUser({});
            clearAuthSession();
        }
    };

    useEffect(() => {
        if (!isTabLoggedIn()) {
            return;
        }
        fetchAuth();
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        window.localStorage.setItem('site_theme_mode', themeMode);
        document.documentElement.classList.toggle('light', isLightTheme);
    }, [themeMode, isLightTheme]);

    const toggleTheme = () => {
        setThemeMode((current) => (current === 'light' ? 'dark' : 'light'));
    };

    useEffect(() => {
        const handleAuthSessionChanged = (event) => {
            const isLoggedIn = event?.detail?.loggedIn ?? isTabLoggedIn();

            if (!isLoggedIn) {
                setDataUser({});
                return;
            }

            fetchAuth();
        };

        window.addEventListener(AUTH_SESSION_CHANGED_EVENT, handleAuthSessionChanged);
        return () => window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, handleAuthSessionChanged);
    }, []);

    return (
        <Context.Provider
            value={{
                dataUser,
                fetchAuth,
                themeMode,
                setThemeMode,
                toggleTheme,
                isLightTheme,
            }}
        >
            <ConfigProvider
                locale={viVN}
                theme={{
                    algorithm: isLightTheme ? antdTheme.defaultAlgorithm : antdTheme.darkAlgorithm,
                    token: {
                        colorPrimary: '#0066FF',
                        colorBgContainer: isLightTheme ? '#ffffff' : '#1E293B',
                        colorBgElevated: isLightTheme ? '#ffffff' : '#1E293B',
                        colorBorder: isLightTheme ? 'rgba(15, 23, 42, 0.12)' : 'rgba(255, 255, 255, 0.1)',
                        colorText: isLightTheme ? '#0f172a' : '#ffffff',
                        colorTextSecondary: isLightTheme ? 'rgba(15, 23, 42, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                        colorTextTertiary: isLightTheme ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.5)',
                        borderRadius: 12,
                        fontFamily: 'Inter, sans-serif',
                    },
                    components: {
                        Table: {
                            headerBg: isLightTheme ? '#f8fafc' : '#1E293B',
                            rowHoverBg: isLightTheme ? 'rgba(15, 23, 42, 0.03)' : 'rgba(255, 255, 255, 0.02)',
                            borderColor: isLightTheme ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                        },
                        Modal: {
                            contentBg: isLightTheme ? '#ffffff' : '#1E293B',
                            headerBg: isLightTheme ? '#ffffff' : '#1E293B',
                        },
                        Input: {
                            colorBgContainer: isLightTheme ? 'rgba(15, 23, 42, 0.03)' : 'rgba(255, 255, 255, 0.05)',
                            activeBorderColor: '#0066FF',
                        },
                        Select: {
                            colorBgContainer: isLightTheme ? 'rgba(15, 23, 42, 0.03)' : 'rgba(255, 255, 255, 0.05)',
                            optionSelectedBg: 'rgba(0, 102, 255, 0.2)',
                        },
                        InputNumber: {
                            colorBgContainer: isLightTheme ? 'rgba(15, 23, 42, 0.03)' : 'rgba(255, 255, 255, 0.05)',
                        },
                        Button: {
                            primaryShadow: 'none',
                        },
                        Tabs: {
                            itemSelectedColor: '#0066FF',
                            inkBarColor: '#0066FF',
                        },
                        Upload: {
                            colorBorder: isLightTheme ? 'rgba(15, 23, 42, 0.12)' : 'rgba(255, 255, 255, 0.2)',
                        },
                    },
                }}
            >
                {children}
            </ConfigProvider>
        </Context.Provider>
    );
}
