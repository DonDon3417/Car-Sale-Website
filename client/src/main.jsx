import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { routes } from './routes';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from './store/Provider.jsx';
import { ConfigProvider, theme } from 'antd';
import viVN from 'antd/locale/vi_VN';

const router = createBrowserRouter(routes);

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ConfigProvider
            locale={viVN}
            theme={{
                algorithm: theme.darkAlgorithm,
                token: {
                    colorPrimary: '#0066FF',
                    colorBgContainer: '#1E293B',
                    colorBgElevated: '#1E293B',
                    colorBorder: 'rgba(255, 255, 255, 0.1)',
                    colorText: '#ffffff',
                    colorTextSecondary: 'rgba(255, 255, 255, 0.7)',
                    colorTextTertiary: 'rgba(255, 255, 255, 0.5)',
                    borderRadius: 12,
                    fontFamily: 'Inter, sans-serif',
                },
                components: {
                    Table: {
                        headerBg: '#1E293B',
                        rowHoverBg: 'rgba(255, 255, 255, 0.02)',
                        borderColor: 'rgba(255, 255, 255, 0.05)',
                    },
                    Modal: {
                        contentBg: '#1E293B',
                        headerBg: '#1E293B',
                    },
                    Input: {
                        colorBgContainer: 'rgba(255, 255, 255, 0.05)',
                        activeBorderColor: '#0066FF',
                    },
                    Select: {
                        colorBgContainer: 'rgba(255, 255, 255, 0.05)',
                        optionSelectedBg: 'rgba(0, 102, 255, 0.2)',
                    },
                    InputNumber: {
                        colorBgContainer: 'rgba(255, 255, 255, 0.05)',
                    },
                    Button: {
                        primaryShadow: 'none',
                    },
                    Tabs: {
                        itemSelectedColor: '#0066FF',
                        inkBarColor: '#0066FF',
                    },
                    Upload: {
                        colorBorder: 'rgba(255, 255, 255, 0.2)',
                    },
                },
            }}
        >
            <Provider>
                <RouterProvider router={router} />
            </Provider>
        </ConfigProvider>
    </StrictMode>,
);
