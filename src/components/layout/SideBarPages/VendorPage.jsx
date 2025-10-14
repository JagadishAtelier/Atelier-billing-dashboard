import { ChevronDown, Plus, Search } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const columns = ["ID", "Name", "Contact Person", "Email", "Phone", "Address", "Gst Number"];

const data = [
  { 
    ID: 1, 
    Name: "A-One Traders", 
    "Contact Person": "Alice Johnson", 
    Email: "alice@aonetraders.com", 
    Phone: "9876543210", 
    Address: "12, MG Road, Bengaluru, Karnataka", 
    "Gst Number": "29ABCDE1234F1Z5" 
  },
  { 
    ID: 2, 
    Name: "Bright Supplies", 
    "Contact Person": "Bob Smith", 
    Email: "bob@brightsupplies.com", 
    Phone: "9876500011", 
    Address: "45, Mount Road, Chennai, Tamil Nadu", 
    "Gst Number": "33ABCDS7890G2Z3" 
  },
  { 
    ID: 3, 
    Name: "City Hardware", 
    "Contact Person": "Charlie Davis", 
    Email: "charlie@cityhardware.com", 
    Phone: "9876522233", 
    Address: "22, Park Street, Kolkata, West Bengal", 
    "Gst Number": "19ABCDE4567H3Z9" 
  },
  { 
    ID: 4, 
    Name: "Delta Enterprises", 
    "Contact Person": "David Miller", 
    Email: "david@deltaent.com", 
    Phone: "9876544455", 
    Address: "101, FC Road, Pune, Maharashtra", 
    "Gst Number": "27ABCDF2345K4Z1" 
  },
  { 
    ID: 5, 
    Name: "Elite Stationers", 
    "Contact Person": "Eve Brown", 
    Email: "eve@elitestationers.com", 
    Phone: "9876566677", 
    Address: "8, Connaught Place, Delhi", 
    "Gst Number": "07ABCDE6789P5Z2" 
  },
  { 
    ID: 6, 
    Name: "Fresh Mart", 
    "Contact Person": "Frank Wilson", 
    Email: "frank@freshmart.com", 
    Phone: "9876588899", 
    Address: "11, Lalbagh Road, Bengaluru, Karnataka", 
    "Gst Number": "29ABCDW5678Q6Z8" 
  },
  { 
    ID: 7, 
    Name: "Global Distributors", 
    "Contact Person": "Grace Lee", 
    Email: "grace@globaldist.com", 
    Phone: "9876511122", 
    Address: "201, Gariahat, Kolkata, West Bengal", 
    "Gst Number": "19ABCDE8901R7Z5" 
  },
  { 
    ID: 8, 
    Name: "Hitech Equipments", 
    "Contact Person": "Hannah Clark", 
    Email: "hannah@hitechequip.com", 
    Phone: "9876533344", 
    Address: "17, Nungambakkam, Chennai, Tamil Nadu", 
    "Gst Number": "33ABCFG3456S8Z0" 
  },
  { 
    ID: 9, 
    Name: "Innova Traders", 
    "Contact Person": "Ian Taylor", 
    Email: "ian@innovatraders.com", 
    Phone: "9876555566", 
    Address: "77, Sector 22, Chandigarh", 
    "Gst Number": "04ABCDT4567U9Z4" 
  },
  { 
    ID: 10, 
    Name: "Jupiter Tools", 
    "Contact Person": "Jack Martin", 
    Email: "jack@jupitertools.com", 
    Phone: "9876577788", 
    Address: "9, Banjara Hills, Hyderabad, Telangana", 
    "Gst Number": "36ABCDE2345V1Z3" 
  },
];

function VendorPage() {
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Filter data by searchTerm (Name, Contact Person, or Phone)
  const filteredData = data.filter((vendor) =>
    vendor.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor["Contact Person"].toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.Phone.includes(searchTerm)
  );

  return (
    <div>
      <div className='flex items-center justify-between relative'>
        {/* Dropdown Section */}
        <div
          className='relative flex items-center gap-2 cursor-pointer'
          onClick={() => setDropDownOpen(!dropDownOpen)}
        >
          <p className='text-2xl font-semibold my-0'>All Vendors</p>
          <div className='mt-2'><ChevronDown /></div>
        </div>

        {/* Dropdown Menu */}
        {dropDownOpen && (
          <div className='absolute bg-white shadow-lg w-60 top-12 left-0 rounded-lg border border-gray-200 p-3 z-10'>
            <div className='flex items-center gap-2 border border-gray-300 rounded-md px-2 py-1'>
              <Search size={16} className='text-gray-500' />
              <input
                type='text'
                placeholder='Search vendor...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full outline-none text-sm'
              />
            </div>

            <div className='mt-2 max-h-48 overflow-y-auto'>
              {filteredData.length > 0 ? (
                filteredData.map((vendor) => (
                  <p
                    key={vendor.ID}
                    className='p-2 hover:bg-[#E1E6FF] cursor-pointer rounded-md text-base'
                    onClick={() => {
                      setSearchTerm(vendor.Name);
                      setDropDownOpen(false);
                    }}
                  >
                    {vendor.Name}
                  </p>
                ))
              ) : (
                <p className='p-2 text-gray-500 text-sm'>No results found</p>
              )}
            </div>
          </div>
        )}

        {/* Add Vendor Button */}
        <div
          className='bg-[#1C2244] text-white py-3 px-6 font-semibold flex items-center justify-center gap-2 rounded-md cursor-pointer'
          onClick={() => navigate('/vendor/add')}
        >
          <Plus size={16} />
          <button>Add Vendor</button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-10">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-[#1C2244] text-white">
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="py-4 px-4 text-left text-white font-semibold border-b"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData && filteredData.length > 0 ? (
              filteredData.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-[#E1E6FF]">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="py-4 px-4 border-b border-gray-300">
                      {row[col] || "-"}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-4 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default VendorPage;
