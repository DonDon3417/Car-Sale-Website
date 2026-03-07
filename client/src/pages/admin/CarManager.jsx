import { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    Upload,
    message,
    Popconfirm,
    Space,
    Tag,
    Card,
    Row,
    Col,
    Divider,
    ColorPicker,
    Typography,
    Tabs,
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    UploadOutlined,
    SearchOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import { requestGetAllCars, requestCreateCar, requestUpdateCar, requestDeleteCar } from '../../config/CarRequest';
import { requestGetAllBrands } from '../../config/BrandRequest';
import { requestGetAllCategories } from '../../config/CategoryRequest';

const { TextArea } = Input;
const { Title, Text } = Typography;

const CarManager = () => {
    const [cars, setCars] = useState([]);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCar, setSelectedCar] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [searchText, setSearchText] = useState('');
    const [fileList, setFileList] = useState([]);
    const [colors, setColors] = useState([]);
    const [versions, setVersions] = useState([]);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchCars();
    }, [pagination.current, pagination.pageSize]);

    const fetchInitialData = async () => {
        try {
            const [brandsRes, categoriesRes] = await Promise.all([requestGetAllBrands(), requestGetAllCategories()]);
            setBrands(brandsRes.metadata || []);
            setCategories(categoriesRes.metadata || []);
        } catch (error) {
            message.error('Không thể tải dữ liệu');
        }
    };

    const fetchCars = async () => {
        try {
            setLoading(true);
            const res = await requestGetAllCars({
                page: pagination.current,
                limit: pagination.pageSize,
                search: searchText,
            });
            setCars(res.metadata?.cars || []);
            setPagination((prev) => ({
                ...prev,
                total: res.metadata?.pagination?.total || 0,
            }));
        } catch (error) {
            message.error('Không thể tải danh sách xe');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        setPagination((prev) => ({ ...prev, current: 1 }));
        fetchCars();
    };

    const handleOpenModal = (car = null) => {
        setSelectedCar(car);
        if (car) {
            form.setFieldsValue({
                name: car.name,
                brand: car.brand?._id,
                category: car.category?._id,
                price: car.price,
                discountPrice: car.discountPrice,
                year: car.year,
                fuelType: car.fuelType,
                transmission: car.transmission,
                seats: car.seats,
                engine: car.engine,
                mileage: car.mileage,
                description: car.description,
                status: car.status,
                stock: car.stock,
                specifications: car.specifications || {},
            });
            setColors(car.colors || []);
            setVersions(car.versions || []);
            setFileList(
                car.images?.map((url, idx) => ({
                    uid: `-${idx}`,
                    name: `image-${idx}`,
                    status: 'done',
                    url: import.meta.env.VITE_API_URL + url,
                    originUrl: url,
                })) || [],
            );
        } else {
            form.resetFields();
            form.setFieldsValue({
                year: new Date().getFullYear(),
                fuelType: 'Xăng',
                transmission: 'Tự động',
                seats: 5,
                status: 'available',
                stock: 1,
            });
            setColors([]);
            setVersions([]);
            setFileList([]);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCar(null);
        form.resetFields();
        setColors([]);
        setVersions([]);
        setFileList([]);
    };

    const handleSubmit = async (values) => {
        try {
            setSubmitting(true);
            const formData = new FormData();

            // Basic fields
            Object.keys(values).forEach((key) => {
                if (key === 'specifications') {
                    formData.append(key, JSON.stringify(values[key] || {}));
                } else if (values[key] !== undefined && values[key] !== null && values[key] !== '') {
                    formData.append(key, values[key]);
                }
            });

            // Colors & Versions
            formData.append('colors', JSON.stringify(colors));
            formData.append('versions', JSON.stringify(versions));

            // Images - new files
            fileList.forEach((file) => {
                if (file.originFileObj) {
                    formData.append('images', file.originFileObj);
                }
            });

            // Keep old images
            const oldImages = fileList.filter((f) => f.originUrl).map((f) => f.originUrl);
            formData.append('oldImages', JSON.stringify(oldImages));

            if (selectedCar) {
                await requestUpdateCar(selectedCar._id, formData);
                message.success('Cập nhật xe thành công');
            } else {
                await requestCreateCar(formData);
                message.success('Thêm xe thành công');
            }
            handleCloseModal();
            fetchCars();
        } catch (error) {
            message.error(error.response?.data?.message || 'Có lỗi xảy ra');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await requestDeleteCar(id);
            message.success('Xóa xe thành công');
            fetchCars();
        } catch (error) {
            message.error('Không thể xóa xe');
        }
    };

    // Color management
    const addColor = () => setColors([...colors, { name: '', code: '#000000' }]);
    const removeColor = (index) => setColors(colors.filter((_, i) => i !== index));
    const updateColor = (index, field, value) => {
        const newColors = [...colors];
        newColors[index][field] = value;
        setColors(newColors);
    };

    // Version management
    const addVersion = () => setVersions([...versions, { name: '', price: 0 }]);
    const removeVersion = (index) => setVersions(versions.filter((_, i) => i !== index));
    const updateVersion = (index, field, value) => {
        const newVersions = [...versions];
        newVersions[index][field] = value;
        setVersions(newVersions);
    };

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN').format(price) + ' VNĐ';

    const columns = [
        {
            title: 'Hình ảnh',
            dataIndex: 'images',
            width: 100,
            render: (images) => (
                <div className="w-16 h-12 bg-gray-800 rounded overflow-hidden">
                    {images?.[0] ? (
                        <img
                            src={import.meta.env.VITE_API_URL + images[0]}
                            alt=""
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">N/A</div>
                    )}
                </div>
            ),
        },
        {
            title: 'Tên xe',
            dataIndex: 'name',
            sorter: true,
            render: (name, record) => (
                <div>
                    <div className="font-medium text-white">{name}</div>
                    <div className="text-xs text-gray-400">
                        {record.year} • {record.fuelType}
                    </div>
                </div>
            ),
        },
        {
            title: 'Hãng / Danh mục',
            render: (_, record) => (
                <div>
                    <Tag color="blue">{record.brand?.name}</Tag>
                    <Tag color="green">{record.category?.name}</Tag>
                </div>
            ),
        },
        {
            title: 'Giá',
            dataIndex: 'price',
            render: (price, record) => (
                <div>
                    <div className="font-semibold text-blue-400">{formatPrice(price)}</div>
                    {record.discountPrice > 0 && (
                        <div className="text-xs text-red-400 line-through">{formatPrice(record.discountPrice)}</div>
                    )}
                </div>
            ),
        },
        {
            title: 'Phiên bản',
            dataIndex: 'versions',
            render: (versions) => versions?.length || 0,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: (status) => {
                const config = {
                    available: { color: 'green', text: 'Còn hàng' },
                    out_of_stock: { color: 'red', text: 'Hết hàng' },
                    coming_soon: { color: 'orange', text: 'Sắp ra mắt' },
                };
                return <Tag color={config[status]?.color}>{config[status]?.text}</Tag>;
            },
        },
        {
            title: 'Lượt xem',
            dataIndex: 'viewCount',
            render: (count) => <span className="text-gray-400">{count}</span>,
        },
        {
            title: 'Thao tác',
            width: 100,
            render: (_, record) => (
                <Space>
                    <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
                    <Popconfirm
                        title="Xóa xe này?"
                        description="Hành động này không thể hoàn tác"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Xóa"
                        cancelText="Hủy"
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const tabItems = [
        {
            key: '1',
            label: 'Thông tin cơ bản',
            children: (
                <>
                    <Form.Item name="name" label="Tên xe" rules={[{ required: true, message: 'Vui lòng nhập tên xe' }]}>
                        <Input placeholder="VD: Mercedes-AMG GT 63" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="brand"
                                label="Hãng xe"
                                rules={[{ required: true, message: 'Chọn hãng xe' }]}
                            >
                                <Select placeholder="Chọn hãng" showSearch optionFilterProp="children">
                                    {brands.map((b) => (
                                        <Select.Option key={b._id} value={b._id}>
                                            {b.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="category"
                                label="Danh mục"
                                rules={[{ required: true, message: 'Chọn danh mục' }]}
                            >
                                <Select placeholder="Chọn danh mục" showSearch optionFilterProp="children">
                                    {categories.map((c) => (
                                        <Select.Option key={c._id} value={c._id}>
                                            {c.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="price" label="Giá (VNĐ)" rules={[{ required: true, message: 'Nhập giá' }]}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    placeholder="VD: 2500000000"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="discountPrice" label="Giá khuyến mãi">
                                <InputNumber
                                    style={{ width: '100%' }}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    placeholder="Để trống nếu không giảm giá"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={6}>
                            <Form.Item name="year" label="Năm SX" rules={[{ required: true }]}>
                                <InputNumber style={{ width: '100%' }} min={1990} max={2030} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="seats" label="Số chỗ" rules={[{ required: true }]}>
                                <InputNumber style={{ width: '100%' }} min={2} max={50} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="fuelType" label="Nhiên liệu" rules={[{ required: true }]}>
                                <Select>
                                    <Select.Option value="Xăng">Xăng</Select.Option>
                                    <Select.Option value="Dầu">Dầu</Select.Option>
                                    <Select.Option value="Hybrid">Hybrid</Select.Option>
                                    <Select.Option value="Điện">Điện</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="transmission" label="Hộp số" rules={[{ required: true }]}>
                                <Select>
                                    <Select.Option value="Tự động">Tự động</Select.Option>
                                    <Select.Option value="Số sàn">Số sàn</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="engine" label="Động cơ">
                                <Input placeholder="VD: 4.0L V8 Biturbo" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="mileage" label="Tiêu hao (L/100km)">
                                <InputNumber style={{ width: '100%' }} min={0} step={0.1} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="stock" label="Tồn kho">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="status" label="Trạng thái">
                        <Select>
                            <Select.Option value="available">Còn hàng</Select.Option>
                            <Select.Option value="out_of_stock">Hết hàng</Select.Option>
                            <Select.Option value="coming_soon">Sắp ra mắt</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="description" label="Mô tả">
                        <TextArea rows={4} placeholder="Mô tả chi tiết về xe..." />
                    </Form.Item>
                </>
            ),
        },
        {
            key: '2',
            label: 'Thông số kỹ thuật',
            children: (
                <>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name={['specifications', 'length']} label="Chiều dài (mm)">
                                <Input placeholder="VD: 4713" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name={['specifications', 'width']} label="Chiều rộng (mm)">
                                <Input placeholder="VD: 1850" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name={['specifications', 'height']} label="Chiều cao (mm)">
                                <Input placeholder="VD: 1430" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name={['specifications', 'wheelBase']} label="Chiều dài cơ sở (mm)">
                                <Input placeholder="VD: 2873" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name={['specifications', 'horsepower']} label="Công suất (HP)">
                                <Input placeholder="VD: 585" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name={['specifications', 'torque']} label="Mô-men xoắn (Nm)">
                                <Input placeholder="VD: 850" />
                            </Form.Item>
                        </Col>
                    </Row>
                </>
            ),
        },
        {
            key: '3',
            label: 'Màu sắc',
            children: (
                <>
                    <Button type="dashed" onClick={addColor} icon={<PlusOutlined />} className="mb-4">
                        Thêm màu
                    </Button>
                    {colors.map((color, index) => (
                        <Row key={index} gutter={16} className="mb-2" align="middle">
                            <Col span={10}>
                                <Input
                                    placeholder="Tên màu (VD: Đen Obsidian)"
                                    value={color.name}
                                    onChange={(e) => updateColor(index, 'name', e.target.value)}
                                />
                            </Col>
                            <Col span={10}>
                                <Space>
                                    <ColorPicker
                                        value={color.code}
                                        onChange={(_, hex) => updateColor(index, 'code', hex)}
                                    />
                                    <Input
                                        value={color.code}
                                        onChange={(e) => updateColor(index, 'code', e.target.value)}
                                        style={{ width: 100 }}
                                    />
                                </Space>
                            </Col>
                            <Col span={4}>
                                <Button
                                    danger
                                    type="text"
                                    icon={<DeleteOutlined />}
                                    onClick={() => removeColor(index)}
                                />
                            </Col>
                        </Row>
                    ))}
                </>
            ),
        },
        {
            key: '4',
            label: 'Phiên bản',
            children: (
                <>
                    <Button type="dashed" onClick={addVersion} icon={<PlusOutlined />} className="mb-4">
                        Thêm phiên bản
                    </Button>
                    {versions.map((version, index) => (
                        <Row key={index} gutter={16} className="mb-2" align="middle">
                            <Col span={10}>
                                <Input
                                    placeholder="Tên phiên bản (VD: Premium)"
                                    value={version.name}
                                    onChange={(e) => updateVersion(index, 'name', e.target.value)}
                                />
                            </Col>
                            <Col span={10}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder="Giá phiên bản"
                                    value={version.price}
                                    onChange={(val) => updateVersion(index, 'price', val)}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Col>
                            <Col span={4}>
                                <Button
                                    danger
                                    type="text"
                                    icon={<DeleteOutlined />}
                                    onClick={() => removeVersion(index)}
                                />
                            </Col>
                        </Row>
                    ))}
                </>
            ),
        },
        {
            key: '5',
            label: 'Hình ảnh',
            children: (
                <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onChange={({ fileList: newFileList }) => setFileList(newFileList)}
                    beforeUpload={() => false}
                    multiple
                    accept="image/*"
                >
                    {fileList.length >= 10 ? null : (
                        <div>
                            <PlusOutlined />
                            <div className="mt-2">Upload</div>
                        </div>
                    )}
                </Upload>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <Title level={4} className="!text-white !mb-1">
                        Quản lý xe
                    </Title>
                    <Text className="text-gray-400">Thêm, sửa, xóa thông tin xe ô tô</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
                    Thêm xe mới
                </Button>
            </div>

            {/* Search */}
            <div className="flex gap-2 max-w-md">
                <Input
                    placeholder="Tìm kiếm xe..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onPressEnter={handleSearch}
                    allowClear
                />
                <Button onClick={handleSearch}>Tìm</Button>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                dataSource={cars}
                rowKey="_id"
                loading={loading}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} xe`,
                }}
                onChange={(pag) => setPagination({ ...pagination, current: pag.current, pageSize: pag.pageSize })}
                className="dark-table"
            />

            {/* Modal */}
            <Modal
                title={selectedCar ? 'Chỉnh sửa xe' : 'Thêm xe mới'}
                open={isModalOpen}
                onCancel={handleCloseModal}
                width={900}
                footer={null}
                destroyOnClose
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
                    <Tabs items={tabItems} />

                    <Divider />

                    <div className="flex justify-end gap-2">
                        <Button onClick={handleCloseModal}>Hủy</Button>
                        <Button type="primary" htmlType="submit" loading={submitting}>
                            {selectedCar ? 'Cập nhật' : 'Thêm mới'}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default CarManager;
