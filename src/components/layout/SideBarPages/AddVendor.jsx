import React from 'react'

function AddVendor() {
    return (
        <div className=''>
            <div
                className='relative flex items-center gap-2 cursor-pointer'
                onClick={() => setDropDownOpen(!dropDownOpen)}
            >
                <p className='text-2xl font-semibold my-0'>Add Vendor</p>
            </div>
            <div className='mt-10'>

                <div className='flex flex-col gap-2 w-full'>
                    <div className='flex gap-4 justify-between'>
                        <div className='flex flex-col gap-2 w-full'>
                            <p className='text-base'>Name *</p>
                            <input
                                type='text'
                                placeholder='Enter Name'
                                className='w-full outline-none text-sm border border-gray-300 py-4 px-4 rounded-md bg-white'
                            />
                        </div>

                        <div className='flex flex-col gap-2 w-full'>
                            <p className='text-base'>Contact Person *</p>
                            <input
                                type='text'
                                placeholder='Enter Contact Person'
                                className='w-full outline-none text-sm border border-gray-300 py-4 px-4 rounded-md bg-white'
                            />
                        </div>
                    </div>
                    <div className='flex gap-4 justify-between mt-5'>
                        <div className='flex flex-col gap-2 w-full'>
                            <p className='text-base'>Email *</p>
                            <input
                                type='text'
                                placeholder='Enter Email'
                                className='w-full outline-none text-sm border border-gray-300 py-4 px-4 rounded-md bg-white'
                            />
                        </div>
                        <div className='flex flex-col gap-2 w-full'>
                            <p className='text-base'>Phone Number *</p>
                            <input
                                type='text'
                                placeholder='Enter Phone Number'
                                className='w-full outline-none text-sm border border-gray-300 py-4 px-4 rounded-md bg-white'
                            />
                        </div>
                    </div>
                </div>

                <div className='flex flex-col gap-2 w-full mt-2'>
                    <div className='flex gap-4 justify-between mt-5'>
                        <div className='flex flex-col gap-2 w-full'>
                            <p className='text-base'>Address *</p>
                            <input
                                type='text'
                                placeholder='Enter Address'
                                className='w-full outline-none text-sm border border-gray-300 py-4 px-4 rounded-md bg-white'
                            />
                        </div>
                        <div className='flex flex-col gap-2 w-full'>
                            <p className='text-base'>Gst Number *</p>
                            <input
                                type='text'
                                placeholder='Enter Gst Number'
                                className='w-full outline-none text-sm border border-gray-300 py-4 px-4 rounded-md bg-white'
                            />
                        </div>
                    </div>
                </div>
                <div className='flex justify-end mt-10'>
                    <button className='bg-[#1C2244] text-white py-3 px-24 font-semibold flex items-center justify-center gap-2 rounded-md'>Save</button>
                </div>
            </div>
        </div>
    )
}

export default AddVendor