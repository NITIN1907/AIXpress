import { Protect, useClerk, useUser } from '@clerk/clerk-react'
import {
  Eraser, FileText, Hash, House, Image,
  LogOut,
  Scissors, SquarePen, Users
} from 'lucide-react'
import React from 'react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/ai', label: 'Dashboard', Icon: House },
  { to: '/ai/write-artical', label: 'Write Article', Icon: SquarePen },
  { to: '/ai/blog-titles', label: 'Blog Titles', Icon: Hash },
  { to: '/ai/generate-images', label: 'Generate Images', Icon: Image },
  { to: '/ai/remove-background', label: 'Remove Background', Icon: Eraser },
  { to: '/ai/remove-object', label: 'Remove Object', Icon: Scissors },
  { to: '/ai/pdf-summary', label: 'pdf summary', Icon: FileText },
  { to: '/ai/community', label: 'Community', Icon: Users }
]

const Sidebar = ({ sidebar, setSidebar }) => {
  const { user } = useUser()
  const { signOut, openUserProfile } = useClerk()

  return (
    <div
      className={`w-60 bg-white border-r border-gray-200 flex flex-col justify-between items-center
      max-sm:absolute top-14 bottom-0 left-0
      ${sidebar ? 'translate-x-0' : 'max-sm:-translate-x-full'}
      transition-all duration-300 ease-in-out z-20`}
    >
      <div className='my-7 w-full'>
        <img src={user.imageUrl} alt="User Avatar" className='w-14 h-14 rounded-full mx-auto' />
        <h1 className='mt-2 text-center font-medium'>{user.fullName}</h1>

        <div className='px-6 mt-5 text-sm text-gray-600 font medium'>
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/ai'}
              onClick={() => setSidebar(false)}
              className={({ isActive }) =>
                `px-3.5 py-2.5 flex items-center gap-3 rounded ${
                  isActive
                    ? 'bg-gradient-to-r from-[#3C81F6] to-[#9234EA] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`
              }
            >
              <Icon className='w-4 h-4' />
              {label}
            </NavLink>
          ))}
        </div>
      </div>

          <div className='w-full border-t border-gray-200 p-4 px-7 flex items-center justify-between'>
            <div onClick={openUserProfile} className='flex gap-2 items-center cursor-pointer'>
                <img src={user.imageUrl} className='w-8 rounded-full' alt="" />
                <div>
                    <h1 className='text-xs font-medium'>{user.fullName}</h1>
                    <p className='text-xs text-gray-500'>
                        <Protect plan='premium' fallback="Free">Premium</Protect>
                            Plan
                    </p>
                </div>

            </div>
            <LogOut onClick={signOut} className='w-4.5 text-gry-400 hover:text-gray-700 transition curson-pointer'/>

          </div>

    </div>
  )
}

export default Sidebar