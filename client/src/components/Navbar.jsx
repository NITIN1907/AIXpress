import React from 'react'
import assets from '../assets/logs.png';
import { useClerk, useUser, UserButton } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

const Navbar = () => {
   const navigate = useNavigate()
    const {user} = useUser();
    const {openSignIn} = useClerk();
  return (
    <div className='fixed z-5 w-full backdrop-blur-2xl flex justify-between item-center cursor-pointer py-3 px-4 sm:px-20 xl:px-32'>
      <img src={assets} alt="" className='w-32 sm:w-44' onClick={() => navigate('/')} />

      {
        user ? <UserButton /> : (
          <button onClick={openSignIn} className='flex item-center gap-2 rounded-full text-sm cursor-pointer bg-primary text-white px-10 py-2.5' >Get started <ArrowRight className='w-4 h-4' /></button>
        )
      }
    </div>
  )
}

export default Navbar