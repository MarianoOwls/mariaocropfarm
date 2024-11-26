import React, { useEffect, useState } from 'react';
import youtube from "../assets/youtube.png";
import telegram from "../assets/telegram.png";
import twitter from "../assets/twitter.png";
import friend from "../assets/friend.png";
import check from "../assets/check.png";
import LoadingModul from "./LoadingModul";
import { useDispatch, useSelector } from 'react-redux';
import { setShowMessage } from "../features/messageSlice";
import { setCoinShow } from "../features/coinShowSice";
import { db } from "../firebase";
import {doc, serverTimestamp, setDoc, Timestamp} from "firebase/firestore";
import { selectUser } from "../features/userSlice";
import { useNavigate } from 'react-router-dom';

const LinkButton = ({ image, name, amount, link }) => {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const navigate = useNavigate();

    const [checking, setIsChecking] = useState(false);
    const [isClaimed, setIsClaimed] = useState(false);
    const [isClicked, setIsClicked] = useState(false);
    const [canClaim, setCanClaim] = useState(false);

    const formatNumber = (num) => {
        let numStr = num.toFixed(3);

        let [intPart, decPart] = numStr.split(".");

        intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        if (num < 0.01) {
            return `${intPart},${decPart}`;
        }

        decPart = decPart.slice(0, 2);

        return `${intPart}.${decPart}`;
    };

    const getToLink = async () => {
        if (link === "referral") {
            navigate("/shares");
        } else {
            if (user.links && user.links[link]) {
                window.open(link, "_blank");
            } else {
                try {
                    window.open(link, "_blank");
                    await setDoc(
                        doc(db, "users", user.uid),
                        {
                            links: {
                                [link]: {
                                    claimed: false,
                                    time: serverTimestamp(),
                                },
                            },
                        },
                        { merge: true }
                    );
                } catch (error) {
                    console.error("Error updating link date:", error);
                    dispatch(
                        setShowMessage({
                            message: "Error. Please try again!",
                            color: "rd"
                        })
                    );
                }
            }
        }
    };

    const claimRewards = async () => {
        try {
            dispatch(
                setShowMessage({
                    message: "Claiming rewards in progress...",
                    color: "green",
                })
            );
            dispatch(setCoinShow(true));
            await setDoc(
                doc(db, "users", user.uid),
                {
                    links: {
                        [link]: {
                            claimed: true,
                        },
                    },
                    balance: user.balance + amount,
                },
                { merge: true}
            )
        } catch (error) {
            console.error("Error claiming rewards:", error);
            dispatch(
                setShowMessage({
                    message: "Error. Please try again!",
                    color: "red",
                })
            );
            dispatch(setCoinShow(false));
        }
    };

    useEffect(() => {
        setIsClicked(false);
        setIsChecking(false);
        setIsClaimed(false);

        if (user.links && user.links[link]) {
            setIsChecking(true);
        }
        if (user.links && user.links[link] && user.links[link].claimed) {
            setIsClaimed(true);
        }
        if (user.links && user.links[link] && !user.links[link].claimed) {
            const now = Timestamp.now();
            const timeDiff = now.toMillis() - user.links[link].time;

            if (!user.links[link].time) {
                setIsChecking(true);
            }

            if (timeDiff < 3600000) {
                setIsChecking(true);
            } else if (timeDiff > 3600000) {
                setCanClaim(true);
            }
        }
    }, [user.links, link]);

    useEffect(() => {
        if (
            link === "referral" &&
            Object.keys(user.referrals).length >= 10 &&
            !user.links[link]
        ) {
            const setLink = async () => {
                try {
                    await setDoc(
                        doc(db, "users", user.uid),
                        {
                            links: {
                                [link]: {
                                    claimed: false,
                                    time: serverTimestamp(),
                                },
                            },
                        },
                        { merge: true }
                    )
                } catch (error) {
                    console.error("Error updating link data:", error);
                    dispatch(
                        setShowMessage({
                            message: "Error. Please try again!",
                            color: "red"
                        })
                    );
                }
            };

            setLink();
        }
    }, [link, user, dispatch]);

  return (
    <div onClick={getToLink} className='bg-gray-900 rounded-xl flex items-center p-2 cursor-pointer'
    >
        <div className='flex items-center justify-center w-[80px]'>
            <img 
                src={
                    image === "youtube"
                    ? youtube
                    : image === "telegram"
                    ? telegram
                    : image === "twitter"
                    ? twitter
                    : image === "referral"
                    ? friend
                    : null
                }
                alt='L'
            />
        </div>
        <div className='mx-3 w-full'>
            <p className='text-sm'>{name}</p>
            <p className='font-bold'>+🌿 {formatNumber(amount)}</p>
        </div>
        {isClicked && (
            <div>
                {checking ? (
                    <div className='mr-2'>
                        <LoadingModul size={26} />
                    </div>
                ) : (
                    <div className='mr-1' onClick={(e) => e.stopPropagation()}>
                        {isClaimed ? (
                            <img
                                className='w-12 h-12 object-contain' 
                                src={check}
                                alt='C'
                            />
                        ) : canClaim ? (
                            <button
                                onClick={claimRewards} 
                                className='bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold px-2 py-1 rounded'
                            >
                                Claim
                            </button>
                        ) : null}
                    </div>
                )}
            </div>
        )}
    </div>
  )
}

export default LinkButton