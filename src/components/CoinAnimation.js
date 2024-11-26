import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux';
import { setCoinShow } from '../features/coinShowSice';
import "./CoinAnimation.css";

export const CoinAnimation = ({ showAnimation }) => {
    const [coins, setCoins] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        if (showAnimation) {
            const newCoins = Array.from({ length: 70 }, (_, i) => ({
                id: 1,
                left: `${Math.random() * 100}%`,
                delay: `${Math.random() * 1.4}s`,
            }));
            setCoins(newCoins);

            const timer = setTimeout(() => {
                dispatch(setCoinShow(false));
                setCoins([]);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [showAnimation, dispatch]);

  return (
    <div className='coin-animation-container'>
        {showAnimation && (
            <div className='coin-overlay'>
                {coins.map((coin)=> (
                    <div 
                        key={coin.id}
                        className='coin'
                        style={{ left: coin.left, animationDelay: coin.delay }}
                    />
                ))}
            </div>
        )}
    </div>
  );
};

export default CoinAnimation;
