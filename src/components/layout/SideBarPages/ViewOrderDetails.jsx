import React from 'react'
import logo from '../../assets/Company_logo1.png'
import { Minus } from 'lucide-react'

const columns = [
    "Product Id",
  "Product Name",
  "Total Quantity",
  "Tax Amount",
    "Total Amount",

];

const orders = [
  {
    po_no: "PO-001",
    vendor_name: "A-One Traders",
    order_date: "2025-10-10",
    total_quantity: 120,
    total_amount: 54000,
    tax_amount: 2700,
    status: "pending",
    productId: "PROD-1"
  },
  {
    po_no: "PO-002",
    vendor_name: "Bright Supplies",
    order_date: "2025-10-12",
    total_quantity: 80,
    total_amount: 41000,
    tax_amount: 2050,
    status: "completed",
    productId: "PROD-2"
  },
  {
    po_no: "PO-003",
    vendor_name: "City Hardware",
    order_date: "2025-10-13",
    total_quantity: 60,
    total_amount: 30500,
    tax_amount: 1525,
    status: "approval",
    productId: "PROD-3"
  },
  {
    po_no: "PO-004",
    vendor_name: "Delta Enterprises",
    order_date: "2025-10-13",
    total_quantity: 200,
    total_amount: 105000,
    tax_amount: 5250,
    status: "cancelled",
    productId: "PROD-4"
  },
];
function ViewOrderDetails() {
  return (
    <div>
        <div className='bg-[#1C2244] p-24 text-white'>
            <div className='flex justify-between items-center'>
                <div className='flex flex-col gap-2'>
                    <h1 className='text-5xl font-bold'>INVOICE</h1> 
                    <div className='flex gap-2 items-center'>
                        <p className='text-lg font-semibold'>Invoice Number</p> 
                        <Minus/>
                        <p className='text-lg font-semibold'>01234</p>
                    </div>
                    <div className='flex gap-2 items-center'>
                    <p className='text-lg font-semibold'>Date</p> 
                                            <Minus/>
                    <p className='text-lg font-semibold'>15 October 2025</p>
                    </div>
                </div>
                <div>
                <img src={logo} className='w-50 h-20 aspect-square'/>
                    <p className='text-base font-semibold mt-3 text-center'>ATELIER CREATION</p> 
                </div>
            </div>
        </div>

        <div className='flex gap-7 px-24 py-10 bg-white justify-between'>
            <div>
                <h1 className='text-3xl font-bold'>From</h1>
                <p className='text-lg'>Atelier creation</p>
                <p className='text-lg'>Coimbatore</p>
            </div>
            <div>
                <h1 className='text-3xl font-bold'>To</h1>
                <p className='text-lg'>Mr. Howard Ong</p>
                <p className='text-lg'>Coimbatore</p>
            </div>
        </div>
        <div className='bg-white pb-10'>
        <div className="overflow-x-auto bg-white w-[90%] mx-auto">
        <table className="min-w-full bg-white rounded-lg relative">
          <thead className="bg-[#1C2244] text-white">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="py-5 px-4 text-left text-white font-semibold "
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order, index) => (
                <tr
                  key={index}
                  className="hover:bg-[#E1E6FF] relative"
                >
                                      <td className="py-4 px-4 ">{order.productId}</td>
                  <td className="py-4 px-4 ">{order.vendor_name}</td>
                  {/* <td className="py-4 px-4 ">
                    {new Date(order.order_date).toLocaleDateString()}
                  </td> */}
                  <td className="py-4 px-4 ">{order.total_quantity}</td>

                  <td className="py-4 px-4 ">₹{order.tax_amount}</td>
                 <td className="py-4 px-4 ">₹{order.total_amount}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-4 text-center text-gray-500"
                >
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className='w-[95%] mt-10'>
      <div className='bg-[#1C2244] text-white py-5 px-6 font-semibold flex items-center justify-start gap-2 rounded-md w-75 ms-auto'>
        <p className='text-lg'>Total : </p>
        <p className='text-lg'>₹ 88,000</p>
      </div>
      </div>

      
      </div>
    </div>
  )
}

export default ViewOrderDetails