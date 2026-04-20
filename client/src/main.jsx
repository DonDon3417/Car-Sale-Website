import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { routes } from './routes';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from './store/Provider.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

const router = createBrowserRouter(routes);
const googleClientId = import.meta.env.VITE_CLIENT_ID;

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <GoogleOAuthProvider clientId={googleClientId}>
            <Provider>
                <RouterProvider router={router} />
            </Provider>
        </GoogleOAuthProvider>
    </StrictMode>,
);
