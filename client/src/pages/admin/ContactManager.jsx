import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Search, Trash2, CheckCircle, Clock } from 'lucide-react';
import { message } from 'antd';
import { Table, Tag, Tooltip, Modal, Button } from 'antd';
import { requestGetAllContacts, requestUpdateContactStatus, requestDeleteContact } from '../../config/ContactRequest';

const ContactManager = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [searchText, setSearchText] = useState('');

    const fetchContacts = async (page = 1, search = '') => {
        setLoading(true);
        try {
            const res = await requestGetAllContacts({ page, limit: pagination.pageSize, search });
            setContacts(res.metadata.contacts);
            setPagination({
                ...pagination,
                current: res.metadata.pagination.page,
                total: res.metadata.pagination.total,
            });
        } catch (error) {
            console.error(error);
            message.error('Error loading contacts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, []);

    const handleSearch = (e) => {
        setSearchText(e.target.value);
        fetchContacts(1, e.target.value);
    };

    const handleTableChange = (pagination) => {
        fetchContacts(pagination.current, searchText);
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await requestUpdateContactStatus(id, status);
            message.success('Status updated successfully');
            fetchContacts(pagination.current, searchText);
        } catch (error) {
            message.error('Error while updating status');
        }
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Confirm deletion',
            content: 'Are you sure you want to delete this contact?',
            okText: 'Delete',
            cancelText: 'Cancel',
            okType: 'danger',
            onOk: async () => {
                try {
                    await requestDeleteContact(id);
                    message.success('Contact deleted successfully');
                    fetchContacts(pagination.current, searchText);
                } catch (error) {
                    message.error('Error deleting contact');
                }
            },
        });
    };

    const columns = [
        {
            title: 'Full name',
            dataIndex: 'fullName',
            key: 'fullName',
            render: (text) => <span className="font-medium text-white">{text}</span>,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (text) => (
                <div className="flex items-center gap-1.5 text-white/70">
                    <Mail className="w-3.5 h-3.5" />
                    {text}
                </div>
            ),
        },
        {
            title: 'Phone number',
            dataIndex: 'phone',
            key: 'phone',
            render: (text) => (
                <div className="flex items-center gap-1.5 text-white/70">
                    <Phone className="w-3.5 h-3.5" />
                    {text}
                </div>
            ),
        },
        {
            title: 'Message',
            dataIndex: 'message',
            key: 'message',
            width: '30%',
            render: (text) => <p className="text-white/70 line-clamp-2">{text}</p>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => (
                <div
                    className="cursor-pointer"
                    onClick={() => handleUpdateStatus(record._id, status === 'pending' ? 'processed' : 'pending')}
                >
                    {status === 'pending' ? (
                        <Tag color="orange" icon={<Clock className="w-3 h-3" />}>
                            Pending
                        </Tag>
                    ) : (
                        <Tag color="green" icon={<CheckCircle className="w-3 h-3" />}>
                            Processed
                        </Tag>
                    )}
                </div>
            ),
        },
        {
            title: 'Sent at',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => <span className="text-white/50">{new Date(date).toLocaleDateString('en-US')}</span>,
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Tooltip title="Delete">
                    <button
                        onClick={() => handleDelete(record._id)}
                        className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </Tooltip>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">Contact Management</h1>
                    <p className="text-white/50 text-sm">View and respond to customer messages</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchText}
                        onChange={handleSearch}
                        className="pl-9 pr-4 py-2 bg-[#1E293B] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#0066FF] w-64"
                    />
                </div>
            </div>

            <div className="bg-[#1E293B] border border-white/5 rounded-2xl overflow-hidden">
                <Table
                    columns={columns}
                    dataSource={contacts}
                    rowKey="_id"
                    pagination={{
                        ...pagination,
                        position: ['bottomCenter'],
                        showSizeChanger: false,
                    }}
                    onChange={handleTableChange}
                    loading={loading}
                    className="custom-table"
                    rowClassName="hover:bg-white/5 transition-colors"
                />
            </div>
        </div>
    );
};

export default ContactManager;
