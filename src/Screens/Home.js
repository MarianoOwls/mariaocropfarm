import React from 'react';
import MiningButton from '../components/MiningButton';
import UserRank from '../components/UserRank';
import Liders from '../components/Liders';
import { useSelector } from 'react-redux';
import { selectUser } from '../features/userSlice';
// import LoadingModul from '../components/LoadingModul';
import { selectCalculated } from '../features/calculateSlice';
import backgroundImage from "../assets/bg.png";

const Home = () => {
  const user = useSelector(selectUser);
  const calculate = useSelector(selectCalculated);

  return (
    <>
      {user && calculate ? (   
        <div className='flex flex-col h-screen relative'>
          <div className='flex items-center justify-center mt-16'>
            <MiningButton />
          </div>
          <div>
            <UserRank />
          </div>
          <div>
            <Liders />
          </div>
        </div>
      ) : (
        <div
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
          className='h-screen relative'
        >
          <div
            style={{
              position: "absolute",
              display: "flex",
              justifyContent: "center",
              width: "100%",
              bottom: "14%",
            }}
          >
            {/* <LoadingModul size={60} /> */}
          </div>
        </div>
      )}
    </>
  );
};

export default Home