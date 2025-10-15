import React from 'react'
import logo from '../../assets/Company_logo1.png'
import { Minus } from 'lucide-react'
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

        <div className='flex gap-7 p-24 bg-white'>
            <div>
                <h1 className='text-3xl font-bold'>From</h1>
                <p>Atelier creation</p>
                <p>Coimbatore</p>
            </div>
            <div>
                <h1>To</h1>
                <p>Mr. Howard Ong</p>
                <p>Coimbatore</p>
            </div>
        </div>
    </div>
  )
}

export default ViewOrderDetails