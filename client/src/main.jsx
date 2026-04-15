import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { routes } from './routes';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Provider } from './store/Provider.jsx';

const router = createBrowserRouter(routes);

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Provider>
            <RouterProvider router={router} />
        </Provider>
    </StrictMode>,
);
