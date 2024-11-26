import React, { useState } from 'react';
import { selectUser } from "../features/userSlice";
import { useDispatch, useSelector } from 'react-redux';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from '../firebase';
import { selectCalculated } from "../features/calculateSlice";
import { setShowMessage } from "../features/messageSlice";
import { selectCoinShow, setCoinShow } from "../features/coinShowSice";

const MiningButton = () => {
  const dispatch = useDispatch();

  const user = useSelector(selectUser);
  const calculate = useSelector(selectCalculated);

  const [showUpgrade, setShowUpgrade] = useState(false);
  const [claimDisabled, setClaimDisabled] = useState(false);

  const MAX_MINE_RATE = 100.0;

  const calculateMinedValue = (miningStartedTime, mineRate) => {
    if (!miningStartedTime || !mineRate) return 0;

    const now = Date.now();
    const totalMiningTime = 6 * 60 * 60 * 1000;
    let elapsedTime = now - miningStartedTime;

    elapsedTime = Math.round(elapsedTime / 1000) * 1000;

    if (elapsedTime >= totalMiningTime) {
      // Mining completed, return possible minned value
      return mineRate * (totalMiningTime / 1000);
    }

    // calculate mined value based on elapsed time
    const minedValue = mineRate * (elapsedTime /1000);

    // Ronded to 3 decimal places to avoid floating point issues
    return Math.round(minedValue * 1000) / 1000;
  };

  const startFarming = async () => {
    try {
      dispatch(
        setShowMessage({
          message: "Mining is starting...",
          color: 'green',
        })
      );
      await updateDoc(doc(db, "users", user.uid), {
        isMining: true,
        miningStartedTime: serverTimestamp(),
      });
    } catch (error) {
      console.log("Error starting farming:", error);
      dispatch(
        setShowMessage({
          message: "Error. Please try again",
          color: 'red',
        })
      );
    }
  };

  const claimRewards = async () => {
    try {
      dispatch(
        setShowMessage({
          message: "Claiming coins in progress...",
          color: "yellow",
        })
      );
      setClaimDisabled(true);
      // Get the current server times
      const getServerTime = async (db, userId) => {
        await updateDoc(doc(db, 'users', userId), {
          time: serverTimestamp(),
        });

        const checkTime = async () => {
          const docSnap = await getDoc(doc(db, 'users', userId));
          const serverTime = docSnap.data()?.time;

          if (serverTime) {
            return serverTime;
          } else {
            return new Promise((resolve) => {
              setTimeout(() => resolve(checkTime()), 1000);
            });
          }
        };
        return checkTime();
      };

      // Usage
      const serverNow = await getServerTime(db, user.uid);

      // calculate the time different in miliseconds
      const timeDifference = serverNow.toMillis() - user.miningStartedTime;

      //check if 6 hr (21600000 miliseconds) have passed
      if (timeDifference >= 21600000) {
        dispatch(selectCoinShow(true));

        const minedAmount = calculateMinedValue(
          user.miningStartedTime,
          user.mineRate,
          serverNow
        );
        console.log("Mined Amount:", minedAmount);

        const newBalance = Number((user.balance + minedAmount).toFixed(2));

        await updateDoc(doc(db, "users", user.uid), {
          balance: newBalance,
          isMining: false,
          miningStartedTime: null,
        });
        
        if (user.referredBy) {
          const referralBonus = Number((minedAmount * 0.1).toFixed(2));
          const referrerDoc = doc(db, "users", user.referredBy);
          const referrerSnapshot = await getDoc(referrerDoc);

          if (referrerSnapshot.exists()) {
            const referrerBalance = referrerSnapshot.data().balance;
            const referralAddedValue = referrerSnapshot.data().referrals[user.uid].addedValue;
            const updatedBalance = Number(
              (referrerBalance + referralBonus).toFixed(2)
            );
            const updatedAddedValue = Number(
              (referralAddedValue + referralBonus).toFixed(2)
            );

            await setDoc(
              referrerDoc,
              {
                referrals:{
                  [user.uid]: {
                    addedValue: updatedAddedValue,
                  },
                },
                balance: updatedBalance,
              },
              { merge: true }
            );
          }
        }
        setClaimDisabled(false);
      } else {
        console.log("Not enough time has passed to claim reward");
        //optionally, you can show message 
        dispatch(
          setShowMessage({
            message: "Error. Please try again!",
            color: "red",
          })
        );
      }
    } catch (error) {
      console.error("Error claiming reward:", error);
      dispatch(
        setShowMessage({
          message: "Error. Please try again!",
          color: "red",
        })
      );
      dispatch(setCoinShow(false));
      setClaimDisabled(false);
    }
  };

  const upgradeMinerate = async () => {
    try {
      dispatch(
        setShowMessage({
          message: "Upgrading in progress...",
          color: "blue",
        })
      );

      const nextRate = Math.min(
        addPrecise(user.mineRate, getUpgradeStep(user.mineRate)),
        MAX_MINE_RATE
      );
      const price = getUpgradePrice(getNextUpgradeRate());
      const newBalance = Number((user.balance - price).toFixed(2));

      setShowUpgrade(false);

      if (user.balance >= price) {
        await updateDoc(doc(db, "users", user.uid), {
          balance: newBalance,
          mineRate: nextRate,
        });
      }
    } catch (error) {
      console.error("Error upgrading mine rate:", error);
      dispatch(
        setShowMessage({
          message: "Error. Please try again!",
          color: "red",
        })
      );
    }
  };

  const addPrecise = (a, b) => {
    return parseFloat((a + b).toFixed(3));
  };

  const formatNumer = (num) => {
    let numStr = num.toFixed(3);

    let [intPart, decPart] = numStr.split(".");

    intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    if (num < 0.01) {
      return `${intPart},${decPart}`;
    }

    decPart = decPart.slice(0, 2);

    return `${intPart},${decPart}`;
  }

  const getUpgradeStep = (rate) => {
    if (rate < 0.01) return 0.001;
    if (rate < 0.1) return 0.01;
    if (rate < 1) return 0.1;
    return Math.pow(10, Math.floor(Math.log10(rate)));
  };

  const getUpgradePrice = (nextRate) => {
    return nextRate * 100000;
  };

  const getNextUpgradeRate = () => {
    const step = getUpgradeStep(user.mineRate);
    return Math.min(addPrecise(user.mineRate, step), MAX_MINE_RATE);
  };

  return (
    <div className='relative w-full mx-4'>
      <div className='absolute -top-12 left-0 text-white text-lg bg-gray-800 p-2 rounded'>
        Balance: 🌿{formatNumer(user.balance)}
      </div>

      {!showUpgrade && !user.isMining && (
        <button
          onClick={() => setShowUpgrade(true)}
          className={`absolute -top-3 right-0 text-xs text-black font-bold py-1 px-2 rounded ${
            calculate.canUgrade
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          disabled={!calculate.canUgrade}>
            {user.mineRate < MAX_MINE_RATE ? "Upgrade" : "Max Upgrade"}
        </button>
      )}

      {showUpgrade && (
        <div className='absolute -bottom-[130px] left-0 w-full bg-gray-900 p-4 rounded-lg transform transition-all duration-300 ease-in-out'
          style={{ transform: "translateY(-100%)"}}
        >
          {user.mineRate < MAX_MINE_RATE ? (
            <div>
              <p className='text-white mb-2 -mt-2 text-center'>
                Upgrade to {formatNumer(getNextUpgradeRate())} 🌿/s
              </p>
              <button onClick={upgradeMinerate} className='w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded'
            >
              Cost: 🌿{formatNumer(getUpgradePrice(getNextUpgradeRate()))}
            </button>
          </div>
          ) : (
            <div className="text-white text-center font-bold py-2">
              Maximum upgrade reached!
            </div>
          )}
          <button 
            onClick={() => setShowUpgrade(false)} className='w-full mt-2 bg-red-500 hover:bg-red-600 text-white font-boldpy-2 px-4 rounded'  
          >
            Close
          </button>
        </div>
      )}

      <div className='bg-gray-800 p-4 rounded-lg w-full'>
        <div className='flex justify-between items-center mb-2'>
          <span className='text-white text-lg'>
            {(user.isMining && "Activated") || "Deactivated"}
          </span>
          <div className='text-white'>
            <span className='text-sm'>{formatNumer(user.mineRate)} 🌿/s</span>
          </div>
        </div>
        <div className='bg-gray-700 h-2 rounded-full mb-2'>
          <div className='bg-blue-500 h-full rounded-full transition-all duration-1000 ease-linear' style={{
            width: `${calculate.progress}%`
          }}></div>
        </div>

        <div className='flex justify-between items-center mb-4'>
          <span className='text-white text-2xl font-bold'>
          🌿 {formatNumer(calculate.mined)}
          </span>
          <span className='text-white'>
            {String(calculate.remainingTime.hours).padStart(2, "0")}h{" "}
            {String(calculate.remainingTime.minutes).padStart(2, "0")}m{" "}
            {String(calculate.remainingTime.seconds).padStart(2, "0")}s
          </span>
        </div>
        {!user.isMining && !calculate.canClaim && (
          <button onClick={startFarming} className='w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>
            Start Mining
          </button>
        )}
        {calculate.canClaim && (
          <button
            disabled={claimDisabled} 
            onClick={claimRewards}
            className={`w-full ${claimDisabled ? "bg-gray-500" : "bg-green-500 hover:bg-green-700"} 
            text-white font-bold py-2 px-4 rounded`}
          >
            Claim Rewards
          </button>
        )}
      </div>
    </div>
  )
}

export default MiningButton