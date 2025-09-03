import React, { useState } from 'react';
import {
  Form,
  Row,
  Col,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Button,
  Radio,
  Table,
  Space,
  Card,
  Collapse,
  Drawer, 
  Typography, 
  Descriptions, 
  Divider, 
} from 'antd';
import {
  DownloadOutlined,
  SettingOutlined,
  FilterOutlined,
  EyeOutlined, 
} from '@ant-design/icons';
import moment from 'moment';
import { FiUsers } from "react-icons/fi";

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;
const { Title, Text } = Typography; 



interface FilterValues {
  country?: string;
  state?: string;
  district?: string;
  area?: string;
  pincode?: string;
  isHotspot?: boolean;
  hotspotId?: string;
  hotspotName?: string;
  baseFareRangeMin?: number;
  baseFareRangeMax?: number;
  driverType?: string;
  cancellationFeeRangeMin?: number;
  cancellationFeeRangeMax?: number;
  waitingFeePerMinMin?: number;
  waitingFeePerMinMax?: number;
  waitingFeeAmountMin?: number;
  waitingFeeAmountMax?: number;
  dayOfWeek?: string;
  timeFrom?: moment.Moment | null;
  timeTo?: moment.Moment | null;
  rateRangeMin?: number;
  rateRangeMax?: number;
}

interface PriceSetting {
  key: string;
  country: string;
  state: string;
  district: string;
  area: string;
  pincode: string;
  hotspotName: string;
  hotspotId: string;
  isHotspot: boolean;
  baseFare: string;
  driverType: string;
  cancellationFee: string;
  waitingFee: string;
  day: string;
  timeRange: string;
  rateRange: string;
}

const initialTableData: PriceSetting[] = [
  {
    key: '1',
    country: 'India',
    state: 'Karnataka',
    district: 'Bangalore Urban',
    area: 'Koramangala',
    pincode: '560034',
    hotspotName: 'Koramangala Business District',
    hotspotId: 'HSP001',
    isHotspot: true,
    baseFare: '₹50',
    driverType: 'Premium',
    cancellationFee: '₹25',
    waitingFee: '2min / ₹5',
    day: 'Monday',
    timeRange: '08:00 AM - 05:00 PM',
    rateRange: '18',
  },
  {
    key: '2',
    country: 'India',
    state: 'Maharashtra',
    district: 'Mumbai Suburban',
    area: 'Bandra',
    pincode: '400050',
    hotspotName: 'Bandra West Market',
    hotspotId: 'HSP002',
    isHotspot: false,
    baseFare: '₹60',
    driverType: 'Standard',
    cancellationFee: '₹30',
    waitingFee: '3min / ₹7',
    day: 'Tuesday',
    timeRange: '10:00 AM - 06:00 PM',
    rateRange: '20',
  },
  {
    key: '3',
    country: 'USA',
    state: 'California',
    district: 'Los Angeles',
    area: 'Hollywood',
    pincode: '90028',
    hotspotName: 'Hollywood Walk of Fame',
    hotspotId: 'HSP003',
    isHotspot: true,
    baseFare: '$5',
    driverType: 'Luxury',
    cancellationFee: '$2',
    waitingFee: '1min / $1',
    day: 'Wednesday',
    timeRange: '09:00 AM - 07:00 PM',
    rateRange: '25',
  },
];

const PricingAndFareRules: React.FC = () => {
  const [filterForm] = Form.useForm<FilterValues>();
  const [filteredTableData, setFilteredTableData] = useState<PriceSetting[]>(initialTableData);
  const [activeFilterPanel, setActiveFilterPanel] = useState<string | string[]>(['advanced-filters']);


  const [drawerVisible, setDrawerVisible] = useState(false);
  const [currentPriceSetting, setCurrentPriceSetting] = useState<PriceSetting | null>(null);


  const applyFilters = (values: FilterValues) => {
    let tempData = initialTableData;

    if (values.country) {
      tempData = tempData.filter(item => item.country.toLowerCase().includes(values.country!.toLowerCase()));
    }
    if (values.state) {
      tempData = tempData.filter(item => item.state.toLowerCase().includes(values.state!.toLowerCase()));
    }
  

    setFilteredTableData(tempData);
  };

  const handleClearAllFilters = () => {
    filterForm.resetFields();
    setFilteredTableData(initialTableData); // Reset table to original data
    console.log("Filters Cleared!");
  };

  const onFilterValuesChange = (changedValues: any, allValues: FilterValues) => {
    applyFilters(allValues);
  };


  const showDrawer = (record: PriceSetting) => {
    setCurrentPriceSetting(record);
    setDrawerVisible(true);
  };

  const onCloseDrawer = () => {
    setDrawerVisible(false);
    setCurrentPriceSetting(null); 
  };

  const columns = [
    { title: 'Country', dataIndex: 'country', key: 'country' },
    { title: 'State', dataIndex: 'state', key: 'state' },
    { title: 'District', dataIndex: 'district', key: 'district' },
    { title: 'Area', dataIndex: 'area', key: 'area' },
    { title: 'Pincode', dataIndex: 'pincode', key: 'pincode' },
    { title: 'Hotspot Name', dataIndex: 'hotspotName', key: 'hotspotName' },
    { title: 'Hotspot ID', dataIndex: 'hotspotId', key: 'hotspotId' },
    {
      title: 'Is Hotspot',
      dataIndex: 'isHotspot',
      key: 'isHotspot',
      render: (text: boolean) => (text ? 'Yes' : 'No'),
    },
    { title: 'Base Fare', dataIndex: 'baseFare', key: 'baseFare' },
    { title: 'Driver Type', dataIndex: 'driverType', key: 'driverType' },
    { title: 'Cancellation Fee', dataIndex: 'cancellationFee', key: 'cancellationFee' },
    { title: 'Waiting Fee', dataIndex: 'waitingFee', key: 'waitingFee' },
    { title: 'Day', dataIndex: 'day', key: 'day' },
    { title: 'Time Range', dataIndex: 'timeRange', key: 'timeRange' },
    { title: 'Rate Range', dataIndex: 'rateRange', key: 'rateRange' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: PriceSetting) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />} 
            onClick={() => showDrawer(record)} 
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
    <div style={{width:'100%', backgroundColor:'rgb(41 121 245)' ,display:'flex', paddingTop:'1rem', paddingBottom:'1rem',paddingLeft:'1.5rem',paddingRight:'1.5rem',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{display:'flex',gap:'.5rem'}}>
        <div style={{padding:'.5rem',backgroundColor:'#fff3',borderRadius:'10px',color:'rgb(255, 255, 255)',fontSize:'1.5rem',marginBottom:'auto'}}> <SettingOutlined /></div>
        <div>
        <h1 style={{fontSize:'1.5rem', fontWeight:700, color:'rgb(255 255 255', lineHeight:'1rem'}}>Driver Price Management</h1>
        <p style={{color:'#fffc',fontSize:'.875rem;'}}>Advanced admin interface for pricing control</p>
        </div>
        </div>
        <div style={{display:'flex',gap:'1rem',alignItems:'normal',color:'rgb(255, 255, 255)'}}>
        <div style={{display:'flex',gap:'.3rem'}}>
        <FiUsers />
        5 Settings
        </div>
        <div style={{display:'flex',gap:'.3rem'}}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trending-up h-5 w-5" data-lov-id="src/pages/DriverPriceAdmin.tsx:86:16" data-lov-name="TrendingUp" data-component-path="src/pages/DriverPriceAdmin.tsx" data-component-line="86" data-component-file="DriverPriceAdmin.tsx" data-component-name="TrendingUp" data-component-content="%7B%22className%22%3A%22h-5%20w-5%22%7D"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
        <p>Active</p>
        </div>
        </div>
   
    </div>
    <div style={{ padding: 24 ,backgroundColor:'white'}}>
      <Collapse
        activeKey={activeFilterPanel}
        onChange={(key) => setActiveFilterPanel(key)}
        style={{ marginBottom: 24 , backgroundColor:'white'}}
         expandIconPosition="right"
      >
        <Panel
          header={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8}}>
              <FilterOutlined />
              <span style={{fontSize:'1.125rem', lineHeight:'1.75rem', fontWeight:600}}>Advanced Filters</span>
            </div>
          }
          key="advanced-filters"
          extra={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button type="text" onClick={(event) => {
              event.stopPropagation();
              handleClearAllFilters();
            }}>
              Clear All
            </Button>
          </div>
          }
        >
          <Form
            form={filterForm}
            name="advanced_filters"
            onValuesChange={onFilterValuesChange}
            layout="vertical"
            initialValues={{
              baseFareRangeMin: 0,
              baseFareRangeMax: 1000,
              cancellationFeeRangeMin: 0,
              cancellationFeeRangeMax: 100,
              waitingFeePerMinMin: 0,
              waitingFeePerMinMax: 10,
              waitingFeeAmountMin: 0,
              waitingFeeAmountMax: 20,
              rateRangeMin: 0,
              rateRangeMax: 50,
            }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="country" label="Country">
                  <Select placeholder="Select country">
                    <Option value="india">India</Option>
                    <Option value="usa">USA</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="state" label="State">
                  <Select placeholder="Select state">
                    <Option value="karnataka">Karnataka</Option>
                    <Option value="maharashtra">Maharashtra</Option>
                    <Option value="california">California</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="district" label="District">
                  <Select placeholder="Select district">
                    <Option value="bangalore urban">Bangalore Urban</Option>
                    <Option value="mumbai suburban">Mumbai Suburban</Option>
                    <Option value="los angeles">Los Angeles</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="area" label="Area">
                  <Input placeholder="Enter area" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item name="pincode" label="Pincode">
                  <Input placeholder="Enter pincode" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="isHotspot" label="Is Hotspot">
                  <Radio.Group>
                    <Radio value={true}>Yes</Radio>
                    <Radio value={false} >No</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="hotspotId" label="Hotspot ID">
                  <Input placeholder="Enter hotspot ID" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="hotspotName" label="Hotspot Name">
                  <Input placeholder="Enter hotspot name" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item label="Base Fare Range">
                  <Input.Group compact>
                    <Form.Item name="baseFareRangeMin" noStyle>
                      <InputNumber min={0} placeholder="0" style={{ width: '50%' }} />
                    </Form.Item>
                    <Form.Item name="baseFareRangeMax" noStyle>
                      <InputNumber min={0} placeholder="1000" style={{ width: '50%' }} />
                    </Form.Item>
                  </Input.Group>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="driverType" label="Driver Type">
                  <Select placeholder="Select driver type">
                    <Option value="premium">Premium</Option>
                    <Option value="standard">Standard</Option>
                    <Option value="luxury">Luxury</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item label="Cancellation Fee Range">
                  <Input.Group compact>
                    <Form.Item name="cancellationFeeRangeMin" noStyle>
                      <InputNumber min={0} placeholder="0" style={{ width: '50%' }} />
                    </Form.Item>
                    <Form.Item name="cancellationFeeRangeMax" noStyle>
                      <InputNumber min={0} placeholder="100" style={{ width: '50%' }} />
                    </Form.Item>
                  </Input.Group>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item label="Waiting Fee (Per Min)">
                  <Input.Group compact>
                    <Form.Item name="waitingFeePerMinMin" noStyle>
                      <InputNumber min={0} placeholder="0" style={{ width: '50%' }} />
                    </Form.Item>
                    <Form.Item name="waitingFeePerMinMax" noStyle>
                      <InputNumber min={0} placeholder="10" style={{ width: '50%' }} />
                    </Form.Item>
                  </Input.Group>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item label="Waiting Fee Amount">
                  <Input.Group compact>
                    <Form.Item name="waitingFeeAmountMin" noStyle>
                      <InputNumber min={0} placeholder="0" style={{ width: '50%' }} />
                    </Form.Item>
                    <Form.Item name="waitingFeeAmountMax" noStyle>
                      <InputNumber min={0} placeholder="20" style={{ width: '50%' }} />
                    </Form.Item>
                  </Input.Group>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="dayOfWeek" label="Day of Week">
                  <Select placeholder="Select day">
                    <Option value="monday">Monday</Option>
                    <Option value="tuesday">Tuesday</Option>
                    <Option value="wednesday">Wednesday</Option>
                    <Option value="thursday">Thursday</Option>
                    <Option value="friday">Friday</Option>
                    <Option value="saturday">Saturday</Option>
                    <Option value="sunday">Sunday</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="timeFrom" label="Time From">
                  <DatePicker.TimePicker style={{ width: '100%' }} format="HH:mm" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="timeTo" label="Time To">
                  <DatePicker.TimePicker style={{ width: '100%' }} format="HH:mm" />
                </Form.Item>
              </Col>

              <Col xs={24} sm={12} md={6}>
                <Form.Item label="Rate Range">
                  <Input.Group compact>
                    <Form.Item name="rateRangeMin" noStyle>
                      <InputNumber min={0} placeholder="0" style={{ width: '50%' }} />
                    </Form.Item>
                    <Form.Item name="rateRangeMax" noStyle>
                      <InputNumber min={0} placeholder="50" style={{ width: '50%' }} />
                    </Form.Item>
                  </Input.Group>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Panel>
      </Collapse>


      <Card
        title="Driver Price Settings"
        extra={
          <Space>
            <Button icon={<DownloadOutlined />}>CSV</Button>
            <Button icon={<DownloadOutlined />}>Excel</Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredTableData}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
        />
      </Card>


      <Drawer
        title="Pricing Details"
        width={450} 
        onClose={onCloseDrawer}
        open={drawerVisible}
        destroyOnClose
      >
        {currentPriceSetting ? (
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {/* Location Information */}
            <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src="https://img.icons8.com/ios/50/000000/marker.png" alt="location icon" style={{ width: 20, height: 20 }} />
              Location Information
            </Title>
            <Descriptions column={1} size="small" colon={false} layout="horizontal">
              <Descriptions.Item label="Country">{currentPriceSetting.country}</Descriptions.Item>
              <Descriptions.Item label="State">{currentPriceSetting.state}</Descriptions.Item>
              <Descriptions.Item label="District">{currentPriceSetting.district}</Descriptions.Item>
              <Descriptions.Item label="Area">{currentPriceSetting.area}</Descriptions.Item>
              <Descriptions.Item label="Pincode">{currentPriceSetting.pincode}</Descriptions.Item>
            </Descriptions>

            <Divider />

   
            <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src="https://img.icons8.com/ios/50/000000/fire-station.png" alt="hotspot icon" style={{ width: 20, height: 20 }} />
              Hotspot Details
            </Title>
            <Descriptions column={1} size="small" colon={false} layout="horizontal">
              <Descriptions.Item label="Hotspot ID">{currentPriceSetting.hotspotId}</Descriptions.Item>
              <Descriptions.Item label="Hotspot Name">{currentPriceSetting.hotspotName}</Descriptions.Item>
              <Descriptions.Item label="Is Hotspot">{currentPriceSetting.isHotspot ? 'Yes' : 'No'}</Descriptions.Item>
              <Descriptions.Item label="Base Fare">{currentPriceSetting.baseFare}</Descriptions.Item>
            </Descriptions>

            <Divider />

      
            <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <img src="https://img.icons8.com/ios/50/000000/card-in-use.png" alt="rate icon" style={{ width: 20, height: 20 }} />
              Rate Details
            </Title>

            <Card size="small" title={`${currentPriceSetting.driverType.toUpperCase()} DRIVER`} style={{ marginTop: 16 }}>
              <Space direction="vertical">
                <Text strong>Cancellation Fee: {currentPriceSetting.cancellationFee}</Text>
                <Text strong>Waiting Fee: {currentPriceSetting.waitingFee}</Text>
              </Space>
            </Card>

            <Title level={5} style={{ marginTop: 16 }}>Time-based Rates</Title>
            <Card size="small">
              <Descriptions column={1} size="small" colon={false} layout="horizontal">
                 <Descriptions.Item label="Day">{currentPriceSetting.day}</Descriptions.Item>
                 <Descriptions.Item label="Time Range">{currentPriceSetting.timeRange}</Descriptions.Item>
                 <Descriptions.Item label="Rate Range">{currentPriceSetting.rateRange}</Descriptions.Item>
              </Descriptions>
            </Card>

        
          </Space>
        ) : (
          <p>No pricing details selected.</p>
        )}
      </Drawer>
    </div>
   </>
  );
};

export default PricingAndFareRules;