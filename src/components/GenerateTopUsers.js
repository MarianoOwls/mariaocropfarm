import React from 'react';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

async function GenerateTopUsers(numberOfUsers) {
    function UserAvatar(index) {
        return `https://randomuser.me/api/portraits/men/${index % 100}.jpg`;
    }

    async function generateRandomUser() {
        try {
            const response = await fetch(
                "https://randomuser.me/api/?gender=male&inc=name,login"
            );
            const data = await response.json();
            const { first, last } = data.results[0].name;
            const { username } = data.results[0].login;
            return { firstName: first, lastName: last, username: username}
        } catch (error) {
            console.error("Error fetching random user:", error);
            return { firstName: "Joe", lastName: "Kambele", username: "joeKambele"};
        }
    }

    function generateRandomNumber () {
        return Math.floor(Math.random() * (2000000 - 1000000 + 1)) + 1000000;
    }

    for (let i = 0; i < numberOfUsers; i++) {
        const { firstName, lastName, username } = await generateRandomUser();
        const randomNum = generateRandomNumber();
        const randomID = `top_${generateRandomNumber()}`;

        await setDoc(doc(db, "users", randomID), {
            userImage: UserAvatar(randomNum),
            firstName,
            lastName,
            username,
            languageCode: "en",
            referrals: null,
            referredBy: null,
            isPremium: false,
            balance: randomNum,
            mineRate: 0.001,
            isMining: false,
            miningStartedTime: null,
            daily: {
                claimTime: null,
                claimedDay: 0,
            },
            links: null,
        });

        console.log(`User ${i + 1} generated and saved`);
    }

    console.log(`${numberOfUsers} users generated and saved to Database`);
  
}

export default GenerateTopUsers