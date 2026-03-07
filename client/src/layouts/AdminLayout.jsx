import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from '../components/admin/Sidebar';

const AdminLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-[#0a0d14]">
            {/* Sidebar */}
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            {/* Main Content */}
            <motion.div
                initial={false}
                animate={{ marginLeft: isCollapsed ? 72 : 260 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="min-h-screen"
            >
                {/* Topbar */}

                {/* Page Content */}
                <main className="p-6">
                    <Outlet />
                </main>
            </motion.div>
        </div>
    );
};

export default AdminLayout;
