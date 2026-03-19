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

const FUEL_TYPE_MAP = {
    xang: 'Gasoline',
    dau: 'Diesel',
    dien: 'Electric',
    hybrid: 'Hybrid',
};

const TRANSMISSION_MAP = {
    'tu dong': 'Automatic',
    'so san': 'Manual',
    automatic: 'Automatic',
    manual: 'Manual',
};

const COLOR_NAME_MAP = {
    den: 'Black',
    trang: 'White',
    bac: 'Silver',
    do: 'Red',
    'do do': 'Burgundy Red',
    'do ruby': 'Ruby Red',
    'xanh duong': 'Ocean Blue',
    'xanh la': 'Forest Green',
    'xam titanium': 'Titanium Gray',
    'nau dong': 'Copper Brown',
    'den obsidian': 'Obsidian Black',
    'trang ngoc trai': 'Pearl White',
    'bac anh kim': 'Metallic Silver',
};

const VERSION_TEXT_REPLACEMENTS = [
    [/đặc biệt/gi, 'Special'],
    [/cao cấp/gi, 'Premium'],
    [/tiêu chuẩn/gi, 'Standard'],
    [/nâng cao/gi, 'Advanced'],
    [/thể thao/gi, 'Sport'],
];

const VIETNAMESE_HINT_REGEX = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i;

const normalizeTextKey = (value = '') =>
    value
        .toString()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .toLowerCase();

const normalizeFuelType = (value = '') => FUEL_TYPE_MAP[normalizeTextKey(value)] || value;
const normalizeTransmission = (value = '') => TRANSMISSION_MAP[normalizeTextKey(value)] || value;

const normalizeColorName = (value = '') => {
    const normalizedKey = normalizeTextKey(value);
    return COLOR_NAME_MAP[normalizedKey] || value;
};

const normalizeVersionName = (value = '') => {
    if (!value) return value;
    return VERSION_TEXT_REPLACEMENTS.reduce(
        (result, [pattern, replacement]) => result.replace(pattern, replacement),
        value,
    );
};

const hasVietnameseContent = (value = '') => {
    const lower = value.toString().toLowerCase();
    return (
        VIETNAMESE_HINT_REGEX.test(lower) ||
        /(mau xe|hang|noi that|dong co|van hanh|tiet kiem|phu hop|gia dinh|tien nghi)/i.test(normalizeTextKey(lower))
    );
};

const normalizeDescription = (description = '', carInfo = {}) => {
    if (!description) return description;
    if (!hasVietnameseContent(description)) return description;

    const carName = carInfo?.name || 'This vehicle';
    const fuelType = normalizeFuelType(carInfo?.fuelType || 'Gasoline');
    const transmission = normalizeTransmission(carInfo?.transmission || 'Automatic');

    return `${carName} features modern styling, a comfortable interior, advanced safety technology, and efficient daily performance. It uses a ${fuelType.toLowerCase()} powertrain with ${transmission.toLowerCase()} transmission for smooth driving.`;
};

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
            message.error('Unable to load data');
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
            message.error('Unable to load cars');
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
                description: normalizeDescription(car.description, car),
                status: car.status,
                stock: car.stock,
                specifications: car.specifications || {},
            });
            setColors((car.colors || []).map((color) => ({ ...color, name: normalizeColorName(color.name) })));
            setVersions(
                (car.versions || []).map((version) => ({ ...version, name: normalizeVersionName(version.name) })),
            );
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
                fuelType: 'Gasoline',
                transmission: 'Automatic',
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
            const normalizedValues = {
                ...values,
                description: normalizeDescription(values.description, {
                    name: values.name,
                    fuelType: values.fuelType,
                    transmission: values.transmission,
                }),
            };

            // Basic fields
            Object.keys(normalizedValues).forEach((key) => {
                if (key === 'specifications') {
                    formData.append(key, JSON.stringify(normalizedValues[key] || {}));
                } else if (key === 'price') {
                    // Ensure price is a number
                    formData.append(key, Number(normalizedValues[key]) || 0);
                } else if (key === 'discountPrice') {
                    // Always send discountPrice, even if 0 or empty (to allow removal of discount)
                    formData.append(key, Number(normalizedValues[key]) || 0);
                } else if (
                    normalizedValues[key] !== undefined &&
                    normalizedValues[key] !== null &&
                    normalizedValues[key] !== ''
                ) {
                    formData.append(key, normalizedValues[key]);
                }
            });

            // Colors & Versions
            const normalizedColors = colors.map((color) => ({
                ...color,
                name: normalizeColorName(color.name),
            }));
            formData.append('colors', JSON.stringify(normalizedColors));
            // Ensure all version prices are numbers
            const versionsWithNumberPrices = versions.map((v) => ({
                ...v,
                name: normalizeVersionName(v.name),
                price: Number(v.price) || 0,
            }));
            formData.append('versions', JSON.stringify(versionsWithNumberPrices));

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
                message.success('Update cars successfully');
            } else {
                await requestCreateCar(formData);
                message.success('Car created successfully');
            }
            handleCloseModal();
            fetchCars();
        } catch (error) {
            message.error(error.response?.data?.message || 'An error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await requestDeleteCar(id);
            message.success('Delete cars successfully');
            fetchCars();
        } catch (error) {
            message.error('Unable to delete car');
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

    const formatPrice = (price) => new Intl.NumberFormat('en-US').format(price) + ' VND';

    const columns = [
        {
            title: 'Image',
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
            title: 'Car name',
            dataIndex: 'name',
            sorter: true,
            render: (name, record) => (
                <div>
                    <div className="font-medium text-white">{name}</div>
                    <div className="text-xs text-gray-400">
                        {record.year} • {normalizeFuelType(record.fuelType)}
                    </div>
                </div>
            ),
        },
        {
            title: 'Brand / Category',
            render: (_, record) => (
                <div>
                    <Tag color="blue">{record.brand?.name}</Tag>
                    <Tag color="green">{record.category?.name}</Tag>
                </div>
            ),
        },
        {
            title: 'Price',
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
            title: 'Version',
            dataIndex: 'versions',
            render: (versions) => versions?.length || 0,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            render: (status) => {
                const config = {
                    available: { color: 'green', text: 'In stock' },
                    out_of_stock: { color: 'red', text: 'Out of stock' },
                    coming_soon: { color: 'orange', text: 'Coming soon' },
                };
                return <Tag color={config[status]?.color}>{config[status]?.text}</Tag>;
            },
        },
        {
            title: 'Views',
            dataIndex: 'viewCount',
            render: (count) => <span className="text-gray-400">{count}</span>,
        },
        {
            title: 'Actions',
            width: 100,
            render: (_, record) => (
                <Space>
                    <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} />
                    <Popconfirm
                        title="Delete this car?"
                        description="This action cannot be undone"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Delete"
                        cancelText="Cancel"
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
            label: 'Basic information',
            children: (
                <>
                    <Form.Item
                        name="name"
                        label="Car name"
                        rules={[{ required: true, message: 'Please enter car name' }]}
                    >
                        <Input placeholder="Ex: Mercedes-AMG GT 63" />
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="brand" label="Brand" rules={[{ required: true, message: 'Select brand' }]}>
                                <Select placeholder="Select brand" showSearch optionFilterProp="children">
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
                                label="Category"
                                rules={[{ required: true, message: 'Select category' }]}
                            >
                                <Select placeholder="Select category" showSearch optionFilterProp="children">
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
                            <Form.Item
                                name="price"
                                label="Price (VND)"
                                rules={[{ required: true, message: 'Enter price' }]}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    placeholder="Ex: 2500000000"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="discountPrice" label="Discount price">
                                <InputNumber
                                    style={{ width: '100%' }}
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    placeholder="Leave empty if no discount"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={6}>
                            <Form.Item name="year" label="Model year" rules={[{ required: true }]}>
                                <InputNumber style={{ width: '100%' }} min={1990} max={2030} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="seats" label="Seats" rules={[{ required: true }]}>
                                <InputNumber style={{ width: '100%' }} min={2} max={50} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="fuelType" label="Fuel type" rules={[{ required: true }]}>
                                <Select>
                                    <Select.Option value="Gasoline">Gasoline</Select.Option>
                                    <Select.Option value="Diesel">Diesel</Select.Option>
                                    <Select.Option value="Hybrid">Hybrid</Select.Option>
                                    <Select.Option value="Electric">Electric</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="transmission" label="Transmission" rules={[{ required: true }]}>
                                <Select>
                                    <Select.Option value="Automatic">Automatic</Select.Option>
                                    <Select.Option value="Manual">Manual</Select.Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name="engine" label="Engine">
                                <Input placeholder="Ex: 4.0L V8 Biturbo" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="mileage" label="Consumption (L/100km)">
                                <InputNumber style={{ width: '100%' }} min={0} step={0.1} />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="stock" label="Stock">
                                <InputNumber style={{ width: '100%' }} min={0} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="status" label="Status">
                        <Select>
                            <Select.Option value="available">In stock</Select.Option>
                            <Select.Option value="out_of_stock">Out of stock</Select.Option>
                            <Select.Option value="coming_soon">Coming soon</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="description" label="Description">
                        <TextArea rows={4} placeholder="Detailed car description..." />
                    </Form.Item>
                </>
            ),
        },
        {
            key: '2',
            label: 'Technical specifications',
            children: (
                <>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name={['specifications', 'length']} label="Length (mm)">
                                <Input placeholder="Ex: 4713" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name={['specifications', 'width']} label="Width (mm)">
                                <Input placeholder="Ex: 1850" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name={['specifications', 'height']} label="Height (mm)">
                                <Input placeholder="Ex: 1430" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={8}>
                            <Form.Item name={['specifications', 'wheelBase']} label="Wheelbase (mm)">
                                <Input placeholder="Ex: 2873" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name={['specifications', 'horsepower']} label="Power (HP)">
                                <Input placeholder="Ex: 585" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name={['specifications', 'torque']} label="Torque (Nm)">
                                <Input placeholder="Ex: 850" />
                            </Form.Item>
                        </Col>
                    </Row>
                </>
            ),
        },
        {
            key: '3',
            label: 'Colors',
            children: (
                <>
                    <Button type="dashed" onClick={addColor} icon={<PlusOutlined />} className="mb-4">
                        Add color
                    </Button>
                    {colors.map((color, index) => (
                        <Row key={index} gutter={16} className="mb-2" align="middle">
                            <Col span={10}>
                                <Input
                                    placeholder="Color name (e.g. Obsidian Black)"
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
            label: 'Version',
            children: (
                <>
                    <Button type="dashed" onClick={addVersion} icon={<PlusOutlined />} className="mb-4">
                        Add version
                    </Button>
                    {versions.map((version, index) => (
                        <Row key={index} gutter={16} className="mb-2" align="middle">
                            <Col span={10}>
                                <Input
                                    placeholder="Version name (e.g. Premium)"
                                    value={version.name}
                                    onChange={(e) => updateVersion(index, 'name', e.target.value)}
                                />
                            </Col>
                            <Col span={10}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    placeholder="Version price"
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
            label: 'Image',
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
                    <Title level={4} className="text-white! mb-1!">
                        Car Management
                    </Title>
                    <Text className="text-gray-400">Create, edit, and delete car information</Text>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
                    Add New Car
                </Button>
            </div>

            {/* Search */}
            <div className="flex gap-2 max-w-md">
                <Input
                    placeholder="Search cars..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onPressEnter={handleSearch}
                    allowClear
                />
                <Button onClick={handleSearch}>Search</Button>
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
                    showTotal: (total) => `Total ${total} cars`,
                }}
                onChange={(pag) => setPagination({ ...pagination, current: pag.current, pageSize: pag.pageSize })}
                className="dark-table"
            />

            {/* Modal */}
            <Modal
                title={selectedCar ? 'Edit car' : 'Add New Car'}
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
                        <Button onClick={handleCloseModal}>Cancel</Button>
                        <Button type="primary" htmlType="submit" loading={submitting}>
                            {selectedCar ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default CarManager;
