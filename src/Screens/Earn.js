import React from 'react'
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
import logo from "../assets/logo.png";
import LinkButton from '../components/LinkButton';

const Earn = () => {
  const user = useSelector(selectUser);

  return (
    <div className='text-white mb-24'>
      <div className='flex items-center justify-center py-8'>
        <div className='rounded-full p-4'>
          <img className='w-28 h-28 object-contain' src={logo} alt='M' />
        </div>
      </div>
      <p className='text-center font-bold text-3xl'>Earn coins</p>
      <div className='mx-4 mt-8'>
        <p className='text-lg font-bold mb-4'>Important tasks</p>
        <LinkButton
          image={"referral"}
          name={
            Object.keys(user.referrals).length >= 10
            ? `You invited ${Object.keys(user.referrals).length} friends`
            : `Invited ${10 - Object.keys(user.referrals).length} friends`
          }
          amount={100000}
          link={"referral"}
        />
      </div>
    </div>
  )
}

export default Earn;