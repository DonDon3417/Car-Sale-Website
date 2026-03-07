import { Navigate } from 'react-router-dom';
import App from '../App';
import Login from '../pages/Login';
import Register from '../pages/Register';
import CarDetail from '../pages/CarDetail';
import CarSearch from '../pages/CarSearch';
import PaymentSuccess from '../pages/PaymentSuccess';
import BlogListPage from '../pages/BlogListPage';
import BlogDetailPage from '../pages/BlogDetailPage';
import AdminLayout from '../layouts/AdminLayout';
import AccountLayout from '../layouts/AccountLayout';
import Dashboard from '../pages/admin/Dashboard';
import BrandManager from '../pages/admin/BrandManager';
import CategoryManager from '../pages/admin/CategoryManager';
import CarManager from '../pages/admin/CarManager';
import ChatManager from '../pages/admin/ChatManager';
import TestDriveManager from '../pages/admin/TestDriveManager';
import UserManager from '../pages/admin/UserManager';
import DepositManager from '../pages/admin/DepositManager';
import ProfilePage from '../pages/account/ProfilePage';
import MyDepositsPage from '../pages/account/MyDepositsPage';
import BlogAdmin from '../pages/admin/BlogAdmin';
import ContactManager from '../pages/admin/ContactManager';
import ContactPage from '../pages/ContactPage';
import ChangePasswordPage from '../pages/account/ChangePasswordPage';
import ChatbotPage from '../pages/ChatbotPage';
import ChatbotStats from '../pages/admin/ChatbotStats';

export const routes = [
    { path: '/', element: <App /> },
    { path: '/cars', element: <CarSearch /> },
    { path: '/cars/:slug', element: <CarDetail /> },
    { path: '/payment/success/:id', element: <PaymentSuccess /> },
    { path: '/tin-tuc', element: <BlogListPage /> },
    { path: '/tin-tuc/:id', element: <BlogDetailPage /> },
    { path: '/lien-he', element: <ContactPage /> },
    { path: '/chatbot', element: <ChatbotPage /> },
    { path: '/account/login', element: <Login /> },
    { path: '/account/register', element: <Register /> },
    {
        path: '/account',
        element: <AccountLayout />,
        children: [
            { index: true, element: <Navigate to="/account/profile" replace /> },
            { path: 'profile', element: <ProfilePage /> },
            { path: 'deposits', element: <MyDepositsPage /> },
            { path: 'change-password', element: <ChangePasswordPage /> },
        ],
    },
    {
        path: '/admin',
        element: <AdminLayout />,
        children: [
            { index: true, element: <Dashboard /> },
            { path: 'cars', element: <CarManager /> },
            { path: 'brands', element: <BrandManager /> },
            { path: 'categories', element: <CategoryManager /> },
            { path: 'chat', element: <ChatManager /> },
            { path: 'test-drives', element: <TestDriveManager /> },
            { path: 'deposits', element: <DepositManager /> },
            { path: 'promotions', element: <Dashboard /> },
            { path: 'orders', element: <Dashboard /> },
            { path: 'customers', element: <UserManager /> },
            { path: 'news', element: <BlogAdmin /> },
            { path: 'contacts', element: <ContactManager /> },
            { path: 'chatbot-stats', element: <ChatbotStats /> },
            { path: 'statistics', element: <Dashboard /> },
            { path: 'settings', element: <Dashboard /> },
        ],
    },
];
