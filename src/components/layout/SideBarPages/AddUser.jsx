import React from 'react'

function AddUser() {
  return (
    <div className=''>
                <div
          className='relative flex items-center gap-2 cursor-pointer'
          onClick={() => setDropDownOpen(!dropDownOpen)}
        >
          <p className='text-2xl font-semibold my-0'>Add User</p>
        </div>
        <div className='mt-10'>

            <div className='flex flex-col gap-2 w-full'>
                <p className='text-base'>Name *</p>
                <input
                type='text'
                placeholder='Enter Name'
                className='w-full outline-none text-sm border border-gray-300 py-4 px-4 rounded-md bg-white'
              />

            <div className='flex flex-col gap-2 w-full'>
                <p className='text-base'>Email Id *</p>
                <input
                type='text'
                placeholder='Enter Email Id'
                className='w-full outline-none text-sm border border-gray-300 py-4 px-4 rounded-md bg-white'
              />
            </div>

                        <div className='flex flex-col gap-2 w-full'>
                <p className='text-base'>Password *</p>
                <input
                type='text'
                placeholder='Enter Password'
                className='w-full outline-none text-sm border border-gray-300 py-4 px-4 rounded-md bg-white'
              />
            </div>
            </div>

            <div className='flex flex-col gap-2 w-full mt-2'>
                <p className='text-base'>Phone Number *</p>
                <input
                type='text'
                placeholder='Enter Phone Number'
                className='w-full outline-none text-sm border border-gray-300 py-4 px-4 rounded-md bg-white'
              />

            <div className='flex flex-col gap-2 w-full'>
                <p className='text-base'>Role *</p>
                <input
                type='text'
                placeholder='Enter Role'
                className='w-full outline-none text-sm border border-gray-300 py-4 px-4 rounded-md bg-white'
              />
            </div>
            </div>
            <div className='flex justify-end mt-10'>
                <button className='bg-[#1C2244] text-white py-3 px-24 font-semibold flex items-center justify-center gap-2 rounded-md'>Save</button>
            </div>
        </div>
    </div>
  )
}

export default AddUser