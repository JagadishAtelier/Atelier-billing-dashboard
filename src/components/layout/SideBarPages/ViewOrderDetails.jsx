import React from 'react'
import logo from '../../assets/Company_logo1.png'
import { FileText, Minus } from 'lucide-react'

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
              {/* Add Order Button */}
        <div
          className=" text-black border border-gray-400 py-3 my-5  px-6 w-fit font-semibold flex items-center justify-center gap-2 rounded-md cursor-pointer ms-auto"
          onClick={() => navigate("/order/add")}
        >
          <FileText/>
          <button>Add Order</button>
        </div>
    <div className='bg-[#F7F8FC]'>
      {/* HEADER */}
      <div className='bg-[#1C2244] p-6 md:p-10 lg:p-24 text-white'>
        <div className='flex flex-col lg:flex-row justify-between items-center gap-6 lg:gap-0'>
          <div className='flex flex-col gap-3 text-center lg:text-left'>
            <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold'>INVOICE</h1>
            <div className='flex justify-center lg:justify-start gap-2 items-center'>
              <p className='text-base md:text-lg font-semibold'>Invoice Number</p>
              <Minus />
              <p className='text-base md:text-lg font-semibold'>01234</p>
            </div>
            <div className='flex justify-center lg:justify-start gap-2 items-center'>
              <p className='text-base md:text-lg font-semibold'>Date</p>
              <Minus />
              <p className='text-base md:text-lg font-semibold'>15 October 2025</p>
            </div>
          </div>

          <div className='text-center'>
            <img src={logo} className='w-32 md:w-40 lg:w-50 h-auto mx-auto' alt="Company Logo" />
            <p className='text-sm md:text-base font-semibold mt-2'>ATELIER CREATION</p>
          </div>
        </div>
      </div>

      {/* FROM - TO SECTION */}
      <div className='flex flex-col md:flex-row gap-8 md:gap-20 px-6 md:px-12 lg:px-24 py-10 bg-white justify-between'>
        <div>
          <h1 className='text-2xl md:text-3xl font-bold mb-1'>From</h1>
          <p className='text-base md:text-lg'>Atelier creation</p>
          <p className='text-base md:text-lg'>Coimbatore</p>
        </div>
        <div>
          <h1 className='text-2xl md:text-3xl font-bold mb-1'>To</h1>
          <p className='text-base md:text-lg'>Mr. Howard Ong</p>
          <p className='text-base md:text-lg'>Coimbatore</p>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className='bg-white pb-10'>
        <div className="overflow-x-auto bg-white w-[95%] md:w-[90%] mx-auto rounded-lg">
          <table className="min-w-full bg-white rounded-lg">
            <thead className="bg-[#1C2244] text-white">
              <tr>
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className="py-4 px-3 md:py-5 md:px-4 text-left text-sm md:text-base font-semibold"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order, index) => (
                  <tr key={index} className="hover:bg-[#E1E6FF]">
                    <td className="py-3 px-3 md:py-4 md:px-4 text-sm md:text-base">{order.productId}</td>
                    <td className="py-3 px-3 md:py-4 md:px-4 text-sm md:text-base">{order.vendor_name}</td>
                    <td className="py-3 px-3 md:py-4 md:px-4 text-sm md:text-base">{order.total_quantity}</td>
                    <td className="py-3 px-3 md:py-4 md:px-4 text-sm md:text-base">₹{order.tax_amount}</td>
                    <td className="py-3 px-3 md:py-4 md:px-4 text-sm md:text-base">₹{order.total_amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="py-4 text-center text-gray-500 text-sm md:text-base">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* SUMMARY SECTION */}
        <div className='flex flex-col gap-2 w-[90%] lg:w-[67%] mx-auto mt-5'>
          <div className='flex flex-row gap-2 sm:gap-3 ms-auto text-right'>
            <p className='font-semibold text-base md:text-lg'>Sub Total :</p>
            <p className='font-semibold text-base md:text-lg'>₹ 50,000</p>
          </div>
          <div className='flex flex-row gap-2 sm:gap-3 ms-auto text-right'>
            <p className='font-semibold text-base md:text-lg'>Total Tax :</p>
            <p className='font-semibold text-base md:text-lg'>₹ 38,000</p>
          </div>
        </div>

        {/* GRAND TOTAL */}
        <div className='w-[95%] lg:w-[70%] mx-auto mt-4'>
          <div className='bg-[#1C2244] text-white py-4 px-5 md:py-5 md:px-6 font-semibold flex items-center justify-start gap-2 rounded-md w-fit ms-auto'>
            <p className='text-base md:text-lg'>Total :</p>
            <p className='text-base md:text-lg'>₹ 88,000</p>
          </div>
        </div>

        {/* NOTES */}
        <div className='lg:px-20 px-3'>
          <p className='text-lg font font-semibold mt-10 mb-5'>Notes</p>
          <ul className='ms-5 list-disc list-inside'>
            <li className='text-base mb-2'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</li>
            <li className='text-base mb-2'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</li>
            <li className='text-base mb-2'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</li>
            <li className='text-base mb-2'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</li>
            <li className='text-base mb-2'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</li>
          </ul>
        </div>

      {/* Signature */}
      <div className='flex justify-between lg:px-20 px-3 mt-40'>
        <div>
          <p>Manager Signature</p>
        </div>
        <div>
          <p>Client Signature</p>
        </div>
      </div>
      </div>
    </div>
    </div>
  )
}

export default ViewOrderDetails
