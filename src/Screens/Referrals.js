import React from 'react';
import gift from "../assets/gift.png";
import copy from 'clipboard-copy';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
import { setShowMessage } from '../features/messageSlice';
import { TelegramShareButton } from 'react-share';

function Referrals() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);

  const refLink = `https://t.me/MarianoCropFarmBot?start=ref_${user.uid}`;
  const messageToRef = 
    "Its Crop season. Join us on Mariano Crop Farm and let's earn coins! Use my link to join and earn more coins"

  const handleCopy = () => {
    copy(refLink)
    .then(() => {
      dispatch(
        setShowMessage({
          message: "Copy this link to clipboard...",
          color: "blue",
        })
      );
    })
    .catch((err) => {
      console.error("Failed to copy:", err);
      dispatch(
        setShowMessage({
          message: "Error please try again!",
          color: "red",
        })
      );
    });
  };

  const formatNumber = (num) => {
    let numStr = num.toFixed(3);

    let [intPart, decPart] = numStr.split(".");

    intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    if (num < 0.01) {
      return `${intPart},${decPart}`;
    }

    decPart = decPart.slice(0, 2);

    return `${intPart},${decPart}`;
  };

  return (
    <div className='text-white mb-24'>
      <p className='mt-4 text-center font-bold text-4xl'>Invite friends</p>
      <p className='text-center mt-4 mx-4'>
        You can recieve 10% of your invite friend's mined coins
      </p>
      <div className='bg-gray-800 mt-6 mx-4 rounded-lg p-2 flex items-center'>
        <div>
          <img className='w-20 h-20 object-contain' src={gift} alt='G'/>
        </div>
        <div className='mx-3 w-full'>
          <p className='text-lg font-bold'>Invite a friend</p>
          <p className='font-bold'>+🌿 10,000</p>
        </div>
      </div>
      <div className='bg-gray-800 mt-6 mx-4 rounded-lg p-2 flex items-center'>
        <div>
          <img className='w-20 h-20 object-contain' src={gift} alt='G'/>
        </div>
        <div className='mx-3 w-full'>
          <p className='text-lg font-bold'>
            Invite a friend with Telegram Premium
          </p>
          <p className='font-bold'>+🌿 50,000</p>
        </div>
      </div>
      <div className='bg-gray-800 mt-6 mx-4 rounded-lg p-2'>
        <div className='flex'>
          <div className='flex-grow min-w-0 mr-2'>
            <p onClick={handleCopy} className='bg-gray-700 rounded-md py-1 px-2 break-words h-full'
            >
              {refLink}
            </p>
          </div>
          <div className='flex-shrink-0 flex flex-col'>
            <button onClick={handleCopy}
              className='bg-blue-500 mb-2 hover:bg-blue-700 text-white text-sm font-bold p-2 rounded whitespace-nowrap'
          >
            Copy
          </button>
          <TelegramShareButton url={refLink} title={messageToRef}>
            <div className='bg-blue-500 mb-2 hover:bg-blue-700 text-white text-sm font-bold p-2 rounded whitespace-nowrap'>
              Invite
            </div>
          </TelegramShareButton>
          </div>
        </div>
      </div>
      <div className='bg-gray-800 mx-4 py-2 mt-6 h-60 rounded-lg overflow-hidden overflow-y-auto hide-scrollbar mb-2'>
        {user.referrals && Object.keys(user.referrals).length > 0 ? (
          Object.entries(user.referrals)
            .sort((a, b) => b[1].addedValue - a[1].addedValue)
            .map(([key, value]) => (
              <div
                key={key}
                className='flex items-center p-2 bg-gray-900 rounded-lg mx-2 mb-1' 
              >
                <div className='flex-shrink-0 mr-2'>
                  <div className='border-2 border-yellow-700 overflow-hidden flex items-center rounded-full bg-gray-800 h-10 w-10'>
                    {value.userImage ? (
                      <img 
                        className='w-9 h-9 object-contain'
                        src={value.userImage}
                        alt={value.firstName[0].toUpperCase()}
                      />
                    ) : (
                      <div className='text-xl text-white bg-black w-full h-full flex items-center justify-center'>
                        {value.firstName[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <div className='flex-grow min-w-0 flex items-center justify-between'>
                  <p className='text-white font-bold truncate mr-2'>
                    {value.firstName} {value.lastName}
                  </p>
                  <p className='text-white whitespace-nowrap flex-shrink-0'>
                    {formatNumber(value.addedValue)}
                  </p>
                </div>
              </div>
            )) 
        ) : (
          <div className='flex items-center justify-center h-full text-lg text-white'>
            You didn't invite friends yet
          </div>
        )}
      </div>
    </div>
  );
};

export default Referrals;