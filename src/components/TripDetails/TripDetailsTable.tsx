import React, { useState } from "react";
import {
  Card,
  Typography,
  Table,
  Tag,
  Drawer,
  Divider,
  Descriptions,
  Row,
  Col,
  List,
} from "antd";
import type { TableColumnsType } from "antd";

import {
  GrPhone,
  GrLocation
} from "react-icons/gr";
import { CiUser } from "react-icons/ci";
import {
  AiOutlineInfoCircle,
  AiOutlineTag
} from "react-icons/ai";
import {
  MdAccessTime
} from "react-icons/md";
import { BsFillPersonFill } from "react-icons/bs";
import {
  FaFlag,
  FaMapMarkedAlt,
  FaHeadset,
  FaAddressCard,
} from "react-icons/fa";

import {
  IoReceiptOutline,
  IoLocationOutline,
  IoPeopleOutline,
  IoCalendarOutline,
  IoStarOutline,
  IoSettingsOutline,
} from "react-icons/io5";

import { CloseOutlined } from "@ant-design/icons";

import type { TripDetailsType } from "../../store/slices/tripSlice";

const { Text } = Typography;

interface Props {
  data: TripDetailsType[];
}

const TripDetailsTable: React.FC<Props> = ({ data }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [trip, setTrip] = useState<TripDetailsType | null>(null);

  const columns: TableColumnsType<TripDetailsType> = [
    {
      title: "Trip ID",
      dataIndex: "tripId",
      sorter: (a, b) => a.tripId.localeCompare(b.tripId),
    },
    {
      title: "Customer",
      render: (_, r) => (
        <div>
          <div>{r.customerName}</div>
          <small style={{ color: "#888" }}>{r.customerPhone}</small>
        </div>
      ),
    },
    {
      title: "Driver",
      render: (_, r) => (
        <div>
          <div>{r.driverName || "No Driver"}</div>
          <small style={{ color: "#888" }}>
            {r.carNumber} • {r.carType}
          </small>
        </div>
      ),
    },
    {
      title: "Trip Type",
      dataIndex: "tripType",
    },
    {
      title: "Schedule",
      dataIndex: "schedule",
    },
    {
      title: "Route",
      render: (_, r) => (
        <div>
          {r.pickup} → {r.drop}
          <div style={{ fontSize: 12, color: "#888" }}>
            {r.distance} • ~{r.duration}
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      render: (_, r) => (
        <Tag
          color={
            r.status === "Completed"
              ? "green"
              : r.status === "In Progress"
              ? "blue"
              : r.status === "Cancelled"
              ? "red"
              : "orange"
          }
        >
          {r.status}
        </Tag>
      ),
    },
    {
      title: "Fare",
      render: (_, r) => <>₹{r.fare.toFixed(2)}</>,
    },
    {
      title: "Flags",
      render: (_, r) =>
        r.flags?.length
          ? r.flags.map((f) => (
              <Tag key={f} color="purple">
                {f}
              </Tag>
            ))
          : "—",
    },
  ];

  const DetailCard = ({
    icon,
    title,
    children,
  }: {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
  }) => (
    <Card
      size="small"
      style={{ marginBottom: 16 }}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {icon}
          <span>{title}</span>
        </div>
      }
    >
      {children}
    </Card>
  );

  return (
    <div style={{ overflowX: "auto" }}>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="tripId"
        pagination={{ pageSize: 10 }}
        onRow={(record) => ({
          onClick: () => {
            setTrip(record);
            setDrawerOpen(true);
          },
          style: { cursor: "pointer" },
        })}
      />

      <Drawer
        title={`Trip Details: ${trip?.tripId}`}
        placement="right"
        width={window.innerWidth < 768 ? "100%" : 620}
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        closeIcon={<CloseOutlined />}
      >
        {!trip ? (
          <p>No trip selected</p>
        ) : (
           <>

            <DetailCard icon={<IoReceiptOutline size={20} />} title="Trip Status">
              <Descriptions column={2} size="small" colon={false}>
                <Descriptions.Item label="Status">
                  <Tag
                    color={
                      trip.status === "Completed"
                        ? "green"
                        : trip.status === "In Progress"
                          ? "blue"
                          : trip.status === "Cancelled"
                            ? "red"
                            : "orange"
                    }
                  >
                    {trip.status}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Flags">
                  {trip.flags?.length
                    ? trip.flags.map((f) => (
                      <Tag key={f} color="purple">
                        {f}
                      </Tag>
                    ))
                    : "—"}
                </Descriptions.Item>
              </Descriptions>
            </DetailCard>

            <DetailCard
              icon={<IoLocationOutline size={20} />}
              title="Trip Information"
            >
              <Descriptions layout="vertical" size="small" colon={false}>
                <Descriptions.Item
                  label={
                    <span style={{ display: "flex", alignItems: "center" }}>
                      <GrLocation color="green" /> &nbsp;Pickup
                    </span>
                  }
                >
                  {trip.pickup}
                  {trip.zone && (
                    <div
                      style={{
                        marginTop: 4,
                        padding: "2px 8px",
                        borderRadius: 10,
                        border: "1px solid #ddd",
                        background: "#fafafa",
                        width: "fit-content",
                        fontSize: 12,
                      }}
                    >
                      {trip.zone}
                    </div>
                  )}
                </Descriptions.Item>

                <Descriptions.Item
                  label={
                    <span style={{ display: "flex", alignItems: "center" }}>
                      <GrLocation color="red" /> &nbsp;Drop
                    </span>
                  }
                >
                  {trip.drop}
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              <Descriptions layout="vertical" column={2} size="small" colon={false}>
                <Descriptions.Item label="Distance">
                  {trip.distance}
                </Descriptions.Item>
                <Descriptions.Item label="Duration">
                  {trip.duration}
                </Descriptions.Item>
                <Descriptions.Item label="Trip Type">
                  {trip.tripType}
                </Descriptions.Item>
                <Descriptions.Item label="Schedule">
                  {trip.schedule}
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              <Descriptions column={1} size="small" colon={false}>
                <Descriptions.Item>
                  <Row justify="space-between">
                    <Col>Base Fare</Col>
                    <Col>₹{trip.baseFare ?? 0}</Col>
                  </Row>
                </Descriptions.Item>

                <Descriptions.Item>
                  <Row justify="space-between">
                    <Col>Discount</Col>
                    <Col style={{ color: "red" }}>₹{trip.discount ?? 0}</Col>
                  </Row>
                </Descriptions.Item>

                <Divider />

                <Descriptions.Item>
                  <Row justify="space-between">
                    <Col style={{ fontWeight: 600 }}>Total Fare</Col>
                    <Col style={{ fontWeight: 600 }}>₹{trip.fare}</Col>
                  </Row>
                </Descriptions.Item>
              </Descriptions>
            </DetailCard>

            <DetailCard icon={<IoPeopleOutline size={20} />} title="People & Vehicle">
              <Descriptions layout="vertical" column={2} colon={false}>
                <Descriptions.Item label="Customer">
                  <div style={{ display: "flex", gap: 12 }}>
                    <CiUser size={30} color="#1890ff" />
                    <div>
                      <Text strong>{trip.customerName}</Text>
                      <div style={{ fontSize: 12, color: "#666" }}>
                        <GrPhone /> {trip.customerPhone}
                      </div>
                    </div>
                  </div>
                </Descriptions.Item>

                <Descriptions.Item label="Driver">
                  <div style={{ display: "flex", gap: 12 }}>
                    <FaAddressCard size={30} />
                    <div>
                      <Text strong>{trip.driverName}</Text>
                      <div style={{ fontSize: 12, color: "#666" }}>
                        <GrPhone /> {trip.driverPhone}
                      </div>
                      <small>
                        {trip.carNumber} • {trip.carType}
                      </small>
                    </div>
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </DetailCard>

            <DetailCard icon={<IoCalendarOutline size={20} />} title="Trip Timeline">
              {[
                ["Created At", trip.createdAt],
                ["Scheduled For", trip.scheduledFor],
                ["Created By", trip.createdBy],
                ["Last Updated By", trip.lastUpdatedBy],
              ].map(([label, value]) => (
                <Row
                  key={label}
                  justify="space-between"
                  style={{ marginBottom: 10 }}
                >
                  <Col style={{ fontWeight: 500 }}>{label}</Col>
                  <Col>{value ?? "N/A"}</Col>
                </Row>
              ))}
            </DetailCard>

            <DetailCard icon={<IoStarOutline size={20} />} title="Ratings">
              {[
                ["Customer Rating", trip.customerRating],
                ["Driver Rating", trip.driverRating],
              ].map(([label, value]) => (
                <Row
                  key={label}
                  justify="space-between"
                  style={{ marginBottom: 10 }}
                >
                  <Col style={{ fontWeight: 500 }}>{label}</Col>
                  <Col>{value ? `${value}/5` : "N/A"}</Col>
                </Row>
              ))}
            </DetailCard>

            <DetailCard
              icon={<IoSettingsOutline size={20} />}
              title="Admin Actions"
            >
              <List
                size="small"
                dataSource={[
                  { icon: <BsFillPersonFill />, text: "Assign Driver" },
                  { icon: <MdAccessTime />, text: "Auto Re-route" },
                  { icon: <AiOutlineTag />, text: "Clone Trip" },
                  { icon: <AiOutlineInfoCircle />, text: "Trip Report" },
                  { icon: <FaFlag />, text: "Flag Trip" },
                  { icon: <FaMapMarkedAlt />, text: "View on Map" },
                  { icon: <FaHeadset />, text: "Contact Support" },
                ]}
                renderItem={({ icon, text }) => (
                  <List.Item style={{ cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {icon}
                      {text}
                    </div>
                  </List.Item>
                )}
              />
            </DetailCard>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default TripDetailsTable;