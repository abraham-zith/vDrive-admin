import React from "react";
import {
    DollarOutlined,
    WalletOutlined ,
    RiseOutlined,
    FallOutlined,
    BarChartOutlined,
    DownloadOutlined
  } from "@ant-design/icons";
  import {
    Button,
    Card,
  } from "antd";
import TitleBar from "../components/TitleBarCommon/TitleBar";
import AdvancedFilters from "../components/AdvancedFilters/AdvanceFilters";
import type { FilterField } from "../components/AdvancedFilters/AdvanceFilters";
import DriverTransactionTable from "../components/DriverTransaction/DriverTransactionTable"
export interface Driver {
    fullName: string;
    id: string;
    phone: string;
  }

  export type TransactionStatus =
    | "Success"
    | "Failed"
    | "Pending"
    | "Processed"
    | "Cancelled"
    | "Refunded"
    | "Reversed"
    | "Initiated";

    export type PaymentMethod =
    | "UPI"
    | "Wallet"
    | "Card"
    | "Bank Transfer"
    
    export type TransactionSource =
    | "Driver Self-Recharge"
    | "Admin Recharge"
    | "System Auto-Deduction"
  

 export interface DriverTransaction {
   transactionId: string;
   driver: Driver;
   amount: string;
   paymentMethod: PaymentMethod;
   type: string;
   source: TransactionSource;
   balanceBefore: string;
   balanceAfter: string;
   status: TransactionStatus;
   date: string;
   reference: string;
 }

  interface TransactionCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    subtitle:string;
    valueColor:string;
    amount?:number
    date?:Date |null
  }

  export interface FilterValue{
    status?:string;
    transacionType?:string;
    paymentMethod?:string;
    source?:string
  }

const TransactionCard: React.FC<TransactionCardProps> = ({ title, value, icon,subtitle,valueColor }) => {
  return (
    <div className="flex flex-col justify-center rounded-2xl  border border-neutral-300 gap-2 px-4 py-5  bg-white hover:shadow-md transition-all">
      <div className="flex items-center gap-3  text-sm font-medium">
        <span className="text-gray-500">{title}</span>
        <span>{icon}</span>
      </div>
      <div className={`text-2xl font-bold  ${valueColor}`}>{value}</div>
      <p className="text-gray-500 text-sm flex items-center mt-2 gap-2">
        {subtitle}
      </p>
    </div>
  );
};

const fields:FilterField[]=[
{
    name:"status",
    label:"Status",
    type:"select",
    options:[
        
            { value: "success", label: "Success" },
            { value: "failed", label: "Failed" },  
            { value: "pending", label: "Pending" },
            { value: "processed", label: "Processed" },
            { value: "cancelled", label: "Cancelled" },
            { value: "refunded", label: "Refunded" },
            { value: "reversed", label: "Reversed" },
            { value: "initiated", label: "Initiated" },
    ]
},
{
    name:"transacionType",
    label:"Transacion Type",
    type:"select",
    options:[
        
            { value: "recharge", label: "Recharge" },
            { value: "rideCommissionDeduction", label: "Ride Commission Deduction" },  
            { value: "penalty", label: "Penalty" },
            { value: "refund", label: "Refund" },
            { value: "payout", label: "Payout" }
    ]
},
{
    name:"paymentMethod",
    label:"Payment Method",
    type:"select",
    options:[
        
            { value: "upi", label: "UPI" },
            { value: "wallet", label: "Wallet" },  
            { value: "card", label: "Card" },
            { value: "bankTransfer", label: "Bank Transfer" },
           
    ]
},
{
    name:"source",
    label:"Source",
    type:"select",
    options:[
        
            { value: "driverSelfRecharge", label: "Driver Self-Recharge" },
            { value: "adminRecharge", label: "Admin Recharge" },  
            { value: "systemAutoDeduction", label: "System Auto-Deduction" },
           
    ]
},
{
    name: "amount",
    label: "Amount",
    type: "range",
    minPlaceholder: "0",
    maxPlaceholder: "500",
  },
  { name: "date", label: "Date", type: "date" },

]

const applyFilters =(value:FilterValue)=>{

}


const DriverTransaction =()=>{
      const transactions = [
        {
          title: "Total Transactions",
          value: "12,458",
          valueColor:"text-grey-500",
          icon: (
            <span className="text-blue-500 text-base">
              <WalletOutlined />
            </span>
          ),
           subtitle:"Today: 1,247"
        },
        {
          title: "Total Recharges",
          value: "₹2,45,890",
          valueColor:"text-green-500",
          icon: (
            <span className="text-green-500 text-base">
              <RiseOutlined />
            </span>
          ),
          subtitle:"+12% from yesterday"
        },
        {
          title: "Total Deductions",
          value: "₹45,230",
          valueColor:"text-red-500",
          icon: (
            <span className="text-blue-400 text-base">
              <FallOutlined />
            </span>
          ),
           subtitle:"Commission & penalties"
        },
        {
          title: "Total Payouts",
          value: "₹1,89,560",
          valueColor:"text-green-500",
          icon: (
            <span className="text-yellow-500 text-base">
              <DollarOutlined />
            </span>
          ),
          subtitle:"8 pending payouts"
        },
        {
          title: "Net Balance Impact",
          value: "₹+2,00,660",
          valueColor:"text-green-500",
          icon: (
            <span className="text-green-500 text-base">
              <BarChartOutlined />
            </span>
          ),
          subtitle:"Net driver earnings"
        }
      ];
      
      const DATA:DriverTransaction[]=[
        {
            transactionId:"TNX-001",
            driver: { fullName: "John Smith", id: "DRV-001", phone: "+1234567890" },
            amount:"1000",
            paymentMethod:"Card",
            type:"recharge",
            source:"Admin Recharge",
            balanceBefore:"500",
            balanceAfter:"1000",
            status:"Cancelled",
            date:"2024-01-08",
            reference:"REF-001"
        },
        {
            transactionId:"TNX-002",
            driver: { fullName: "Steve", id: "DRV-002", phone: "+1234567890" },
            amount:"1500",
            paymentMethod:"Wallet",
            type:"commission",
            source:"Admin Recharge",
            balanceBefore:"1500",
            balanceAfter:"3000",
            status:"Success",
            date:"2024-04-08",
            reference:"REF-004"
        },
        {
            transactionId:"TNX-003",
            driver: { fullName: "Lucas", id: "DRV-002", phone: "+1234567890" },
            amount:"2500",
            paymentMethod:"Card",
            type:"recharde",
            source:"Admin Recharge",
            balanceBefore:"1500",
            balanceAfter:"2000",
            status:"Success",
            date:"2024-07-08",
            reference:"REF-074"
        }
      ]

      return(
        <TitleBar
        title="Driver Transaction"
        description="Monitor and manage all driver transactions"
      >
        <div className="grid  grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-6">
        {transactions.map((transaction, index) => (
          <TransactionCard key={index} {...transaction} />
        ))}
      </div>
      
      <div>
      <AdvancedFilters filterFields={fields} applyFilters={applyFilters} />
      <Card
          title="Driver Transactions"
          extra={
              <Button icon={<DownloadOutlined />} >
                Export
              </Button>
          }
        >
            <DriverTransactionTable data ={DATA} />
        </Card>
      </div>
      </TitleBar>
      )
     
}
export default DriverTransaction;