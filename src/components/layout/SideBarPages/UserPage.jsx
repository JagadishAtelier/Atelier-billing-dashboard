import { ChevronDown, Plus, Search } from 'lucide-react'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const columns = ["ID", "Name", "Email", "Phone", "Role", "Status"];

const data = [
  { ID: 1, Name: "Alice", Email: "alice@example.com", Phone: "9876543210", Role: "Admin", Status: "Active" },
  { ID: 2, Name: "Bob", Email: "bob@example.com", Phone: "9876500011", Role: "User", Status: "Inactive" },
  { ID: 3, Name: "Charlie", Email: "charlie@example.com", Phone: "9876522233", Role: "Moderator", Status: "Active" },
  { ID: 4, Name: "David", Email: "david@example.com", Phone: "9876544455", Role: "User", Status: "Active" },
  { ID: 5, Name: "Eve", Email: "eve@example.com", Phone: "9876566677", Role: "Admin", Status: "Inactive" },
  { ID: 6, Name: "Frank", Email: "frank@example.com", Phone: "9876588899", Role: "User", Status: "Active" },
  { ID: 7, Name: "Grace", Email: "grace@example.com", Phone: "9876511122", Role: "Moderator", Status: "Active" },
  { ID: 8, Name: "Hannah", Email: "hannah@example.com", Phone: "9876533344", Role: "User", Status: "Inactive" },
  { ID: 9, Name: "Ian", Email: "ian@example.com", Phone: "9876555566", Role: "Admin", Status: "Active" },
  { ID: 10, Name: "Jack", Email: "jack@example.com", Phone: "9876577788", Role: "User", Status: "Active" },
];

function UserPage() {
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  // Filter data by searchTerm (Name or Phone)
  const filteredData = data.filter((user) =>
    user.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.Phone.includes(searchTerm)
  );

  return (
    <div>
      <div className='flex items-center justify-between relative'>
        {/* Dropdown Section */}
        <div
          className='relative flex items-center gap-2 cursor-pointer'
          onClick={() => setDropDownOpen(!dropDownOpen)}
        >
          <p className='text-2xl font-semibold my-0'>All Users</p>
          <div className='mt-2'><ChevronDown /></div>
        </div>

        {/* Dropdown Menu */}
        {dropDownOpen && (
          <div className='absolute bg-white shadow-lg w-60 top-12 left-0 rounded-lg border border-gray-200 p-3 z-10'>
            <div className='flex items-center gap-2 border border-gray-300 rounded-md px-2 py-1'>
              <Search size={16} className='text-gray-500' />
              <input
                type='text'
                placeholder='Search by name or phone...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full outline-none text-sm'
              />
            </div>

            <div className='mt-2 max-h-48 overflow-y-auto'>
              {filteredData.length > 0 ? (
                filteredData.map((user) => (
                  <p
                    key={user.ID}
                    className='p-2 hover:bg-[#E1E6FF] cursor-pointer rounded-md text-base'
                    onClick={() => {
                      setSearchTerm(user.Name);
                      setDropDownOpen(false);
                    }}
                  >
                    {user.Name}
                  </p>
                ))
              ) : (
                <p className='p-2 text-gray-500 text-sm'>No results found</p>
              )}
            </div>
          </div>
        )}

        {/* Add Users Button */}
        <div
          className='bg-[#1C2244] text-white py-3 px-6 font-semibold flex items-center justify-center gap-2 rounded-md cursor-pointer'
          onClick={() => navigate('/user/add')}
        >
          <Plus size={16} />
          <button>Add Users</button>
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
                      {row[col]}
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
  )
}

export default UserPage;
