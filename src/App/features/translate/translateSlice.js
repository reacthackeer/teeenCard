import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    infos: [
        {   
            title: {
                bengali: `আমাদের সম্পর্কে `,
                english: `About Us`
            } ,
            description: {
                bengali: `teeenCard  গেম একটি teen patti গেমিং প্লাটফ্রম। আপনি এখানে teen patti  খেলতে পারবেন নিরাপদে এবং আপনার প্রাইভেসী আপনি নিজেই নিয়ন্ত্রণ করবেন। আমার এই সার্ভিস প্রদান করি খুবই গোপন ভাবে। খেলা চলা কালীন কেউ কারো কার্ড দেখতে পাবে না। খেলা শেষে সবাইকে সবার কার্ড দেখানো হবে। আপনি একাউন্ট খোলার সাথে সাথে ১০০০০ ডলার ডেমো ব্যালান্স পাবেন। আমাদের খেলার সিস্টেম চেক করার জন্য। আপনি প্রথমে এই ডেমো ব্যালান্স দিয়ে আমাদের খেলার সিস্টেম চেক করে দেখবেন। যদি ভালো লাগে তাহলে আপনি চাইলে রিয়েল ডলার দিয়ে খেলতে পারেন। আপনি আপনার লোকাল কারেন্সী সহ ক্রিপ্টো কারেন্সী এর মাধ্যমে ডিপোজিট এবং উইথড্রয়াল করতে পারবেন। আপনি চাইলে সর্বনিম্ন ১ ডলার ডিপোজিট করতে পারেন এবং চাইলে সর্বনিম্ন ০.১ উইথড্রয়াল করলতে পারেন।  যদি আপনার লোকাল ওয়ালেট বা ক্রিপ্টো ওয়ালেট এ তা eligible হয়। আপনার প্রতিটি ট্রানসাকশান আমাদের সার্ভার এ রেকর্ড থাকবে আপনি চাইলে যেকোনো সময় আপনার ট্রানসাকশান হিস্ট্রি চেক করতে পারেন। সর্বোচ্চ ১০ মিনিট এর মধ্য আপনার ডিপোজিট বা উইথড্রয়াল কন্ফার্ম হবে। `,
                english: `teeenCard Game is a teen patti gaming platform. You can play teen patti here safely and you control your privacy. I provide this service in a very confidential manner. No one can see anyone's cards during the game. At the end of the game everyone will be shown everyone's cards. You will get $10000 demo balance as soon as you open the account. To check our game system. You can first check our game system with this demo balance. You can play with real dollars if you like. You can make deposits and withdrawals through cryptocurrencies including your local currency. You can deposit minimum 1$ and withdraw minimum 0.1 if you want. If your local wallet or crypto wallet is eligible. Every transaction of yours will be recorded on our server, you can check your transaction history anytime you want. Your deposit or withdrawal will be confirmed within 10 minutes maximum.`
            }
        },
        {
            title: {
                bengali: `কেন আপনি এখানে খেলবেন`,
                english: `Why should you play here?`
            },
            description: {
                bengali: `আপনি এখানে স্বাধীন এবং দুর্নীতি মুক্ত খেলা খেলতে এবং উপভোগ করতে পারবেন যা আমরা আপনাকে প্রদান করবো। যার বিনিময়ে প্রতিটি winner এর কাছ থেকে আমার কমিশন নিবো। আর যদি কেউ আমাদের খেলার দুর্নীতি বাহির করতে পারেন তাহলে আমরা সাথে সাথে সকল এর টাকা আমরা রিফান্ড করবো এবং আমাদের খেলা বন্ধ করে দিবো। আরো যেসকল সুবিধা পাবেন নিচে তা উল্লেখ করা হলো। `,
                english: `Here you can play and enjoy free and corruption free games that we provide you. In exchange for which I will take my commission from each winner. And if anyone can expose the corruption of our game then we will immediately refund all their money and stop our game. The other benefits you will get are mentioned below`
            }
        },
        {
            title: {
                bengali: `কাস্টম বোর্ড `,
                english: `Custom board`
            },
            description: {
                bengali: `আপনি চাইলে নিজের মতো করে কাস্টম বোর্ড তৈরী করতে পারবেন নির্ধারণ করতে পারবেন নিজের মতো করে সব কিছু। যেমন :-`,
                english: `If you want, you can create your own custom board and define everything yourself. such as :-`
            }
        },
        {
            title: {
                bengali: `কাস্টম বোর্ড নাম`,
                english: `Custom board name`
            },
            description: {
                bengali: ` আপনি চাইলে নিজের মতো করে বোর্ড এর নাম দিতে পারেন। `,
                english: `You can name the board as you wish.`
            }
        },
        {
            title: {
                bengali: `কাস্টম বোর্ড লিমিট`,
                english: `Custom board limit`
            },
            description: {
                bengali: `আপনি চাইলে নিজের মতো করে নির্ধারণ করতে পারবেন প্রতি বোর্ড কত ডলার হবে। `,
                english: `You can decide how much dollars per board you want.`
            }
        },
        {
            title: {
                bengali: `কাস্টম blind হিট লিমিট (১x )`,
                english: `Custom blind hit limit (1x)`
            },
            description: {
                bengali: `আপনি চাইলে নিজের মতো করে নির্ধারণ করতে পারবেন প্রতি blind হিট (১x ) কত ডলার হবে। `,
                english: `If you want, you can determine how many dollars will be per blind hit (1x).`
            }
        },
        {
            title: {
                bengali: `কাস্টম blind হিট লিমিট (২x )`,
                english: `Custom blind hit limit (2x)`
            },
            description: {
                bengali: `আপনি চাইলে নিজের মতো করে নির্ধারণ করতে পারবেন প্রতি blind হিট (২x যদি ইন্ক্রিস্যাবলে এনাবল থাকে  ) কত ডলার হবে। `,
                english: ` You can set your own dollar amount per blind hit (2x if Incresable is enabled).`
            }
        },
        {
            title: {
                bengali: `কাস্টম Chaal  হিট লিমিট (১x )`,
                english: `Custom Chaal Hit Limit (1x)`
            },
            description: {
                bengali: `আপনি চাইলে নিজের মতো করে নির্ধারণ করতে পারবেন প্রতি Chaal  হিট (১x ) কত ডলার হবে। `,
                english: `If you want, you can set your own amount of dollars per Chaal hit (1x).`
            }
        },
        {
            title: {
                bengali: `কাস্টম Chaal  হিট লিমিট (২x )`,
                english: `Custom Chaal Hit Limit (2x)`
            },
            description: {
                bengali: `আপনি চাইলে নিজের মতো করে নির্ধারণ করতে পারবেন প্রতি Chaal  হিট (২x যদি ইন্ক্রিস্যাবলে এনাবল থাকে  ) কত ডলার হবে। `,
                english: `You can set your own amount of dollars per Chaal hit (2x if Incresable is enabled).`
            }
        },
        {
            title: {
                bengali: `ম্যাক্স প্লেয়ার লিমিট`,
                english: `Max player limit`
            },
            description: {
                bengali: `আপনি চাইলে নির্ধারণ করতে পারবেন সর্বোচ্চ কত জন প্লেয়ার আপনার বোর্ড  এ খেলবে। `,
                english: `You can set the maximum number of players to play on your board if you want.`
            }
        },
        {
            title: {
                bengali: `join লিমিট `,
                english: `join limit`
            },
            description: {
                bengali: `আপনি চাইলে নির্ধারণ করতে পারবেন প্লেয়ার এর একাউন্ট এ কত ডলার থাকলে সে আপনার বোর্ড এ join করতে পারবে। `,
                english: `You can decide how many dollars the player has in his account before he can join your board.`
            }
        },
        {
            title: {
                bengali: `ম্যাক্সিমাম  ব্লাইন্ড হিট লিমিট `,
                english: `Maximum blind heat limit`
            },
            description: {
                bengali: `আপনি চাইলে নির্ধারণ করতে পারবেন একজন প্লেয়ার সর্বোচ্চ কয়টি blind হিট দিতে পারবে।`,
                english: `You can set the maximum number of blind hits a player can give if you want.`
            }
        },
        {
            title: {
                bengali: `ম্যাক্সিমাম Chaal হিট লিমিট`,
                english: `Maximum Chaal hit limit`
            },
            description: {
                bengali: `আপনি চাইলে নির্ধারণ করতে পারবেন একজন প্লেয়ার সর্বোচ্চ কয়টি Chaal হিট দিতে পারবে।`,
                english: `You can set the maximum number of Chaal hits a player can give if you want.`
            }
        },
        {
            title: {
                bengali: `মিনিমাম ব্লাইন্ড হিট লিমিট`,
                english: `Minimum blind heat limit`
            },
            description: {
                bengali: `আপনি চাইলে নির্ধারণ করতে পারবেন একজন প্লেয়ার সর্বনীম্ন কয়টি blind হিট দিতে পারবে।`,
                english: `You can optionally set the minimum number of blind hits a player can give.`
            }
        },
        {
            title: {
                bengali: `মিনিমাম Chaal হিট লিমিট`,
                english: `Minimum Chaal hit limit`
            },
            description: {
                bengali: `আপনি চাইলে নির্ধারণ করতে পারবেন একজন প্লেয়ার সর্বনীম্ন কয়টি Chaal হিট দিতে পারবে। `,
                english: `You can optionally set the minimum number of Chaal hits a player can give.`
            }
        },
        {
            title: {
                bengali: `ডাবল হিট`,
                english: `Double hit`
            },
            description: {
                bengali: `আপনি চাইলে আপনার বোর্ড এ ডাবল হিট সক্রিয় রাখতে পারেন । যদি রাখেন, তাহলে ওপর প্লেয়ার যদি ২X হিট দেয়, যদি ২X হিট থাকে ২ ডলার, তাহলে আপনার বেলায় ১X হিট হবে ২ ডলার এবং ২X হিট হবে ৪ডলার।`,
                english: `You can keep Double Hit enabled on your board if you want. If you put it, then if the above player gives 2X hits, if 2X hits is 2 dollars, then 1X hits will be 2 dollars and 2X hits will be 4 dollars.`
            }
        },
        {
            title: {
                bengali: `বোর্ড তুলনা`,
                english: `Compare the board`
            },
            description: {
                bengali: `আপনি চাইলে আপনার বোর্ড এ বোর্ড তুলনা  সক্রিয়  রাখতে পারেন । যদি রাখেন  খেলার সময় যদি, আপনার  একাউন্ট এ পর্যাপ্ত পরিমান  টাকা না থাকে, তাহলে আপনার card , সকল প্লেয়ার দের সাথে তুলনা করা হবে , যদি আপনি বিজয়ী হন, তাহলে সেই বোর্ড এর সকল টাকা আপনার একাউন্ট এ যোগ যবে এবং বোর্ড ব্যালান্স জিরো হয়ে খেলা চলতে থাকবে। `,
                english: `You can keep the board comparison active on your board if you want. If during the game, if you do not have enough money in your account, then your card will be compared with all the players, if you win, then all the money of that board will be added to your account and the board balance will be zero and the game will continue. will be`
            }
        },
        {
            title: {
                bengali: `ব্যালান্স টাইপ`,
                english: `Balance type`
            },
            description: {
                bengali: `আপনি বোর্ড তৈরী করার সময় নির্ধারণ করতে পারবেন বোর্ড চলা কালীন আপনার  একাউন্ট থেকে কোন ধরণের balance টাকা যাবে। আপনি যদি ডেমো ব্যালান্স সিলেক্ট করেন তাহলে আপনার একাউন্ট থেকে খেলা চলা কালীন সময়ে ডেমো ব্যালান্স কাটা হবে। `,
                english: `You can decide when creating the board, what kind of balance money will go from your account while the board is running. If you select demo balance then the demo balance will be deducted from your account during the game.`
            }
        },
        {
            title: {
                bengali: `বোর্ড টাইপ`,
                english: `Board type`
            },
            description: {
                bengali: `আপনি চাইলে একাউন্ট খোলার   নির্ধারণ করতে পারবেন আপনার বোর্ড  পাবলিক হবে নাকি প্রাইভেট হবে। যদি প্রাইভেট রাখেন তাহলে আপনি প্লেয়ার দের ID ব্যবহার করে তাদের বোর্ড এ invite করতে হবে। তাহলে তারা খেলতে পাবে আর যদি পাবলিক রাখেন তাহলে আপনার বোর্ড এ যে কেউ প্রবেশ করে খেলতে পাবে `,
                english: `You can choose to open an account whether your board is public or private. If set to private then you have to invite players to the board using their ID. Then they can play and if you keep it public then anyone can access your board and play`
            }
        },
        {
            title: {
                bengali: `সময় নির্ধারণ`,
                english: `Schedule`
            },
            description: {
                bengali: `আপনি চাইলে বোর্ড এর সময় নির্ধারণ নির্ধারণ করতে পারবেন যে বোর্ড কয়টায় চালু হবে বা কোন সময়ে বোর্ড চালু হবে। সময়ের আগে আপনি চাইলে বোর্ড শুরু করতে পারবেন। `,
                english: `If you want, you can determine the schedule of the board at what time the board will be launched or at what time the board will be launched. You can start the board ahead of time if you want`
            }
        },    
        {
            title: {
                bengali: `কিভাবে খেলবে `,
                english: ` how to play`
            },
            description: {
                bengali: `আপনার পছন্দের বোর্ড সিলেক্ট করে বা তৈরী করে সেখানে join করুন আর যদি খেলতে চান তাহলে বোর্ড এ প্রবেশ করুন তার পর enter player room বাটন এ ক্লিক করুন। যদি সেই রুম এ দুই জন বা তার বেশি প্লেয়ার থাকে তাহলে start board বাটন এ ক্লিক করলে খেলা শুরু হয়ে যাবে। বোর্ড এ প্রবেশ করার জন্য অবশ্যই আপনাকে বোর্ড এর শর্ত পূরণ করতে হবে। `,
                english: `Select or create your favorite board and join there and if you want to play then enter the board then click on enter player room button. If there are two or more players in that room then clicking on the start board button will start the game. To enter the board you must fulfill the conditions of the board.`
            }
        }
    ],
    videoTutorial: [
        {
            title: {
                english: `Video tutorial`,
                bengali: `ভিডিও টিউটোরিয়াল`,
            },
            description: {
                english: `To know more about our game you can watch video tutorial from our youtube channel`,
                bengali: `আমাদের গেম সম্পর্কে বিস্তারিত জানতে  আমাদের youtube চ্যানেল থেকে ভিডিও টিউটোরিয়াল দেখতে পারেন`,
            }
        }
    ],
    supportCenter: [
        {
            title: {
                english: `Support Center`,
                bengali: `সাপোর্ট সেন্টার`,
            },
            description: {
                english: `If you need any assistance or know anything related to deposit or withdrawal, then you can get assistance through the following channels, we will try to solve your problem quickly. Of course you have to send us your user ID mentioning the subject.`,
                bengali: `যদি আপনার কোনো সহযোগিতা প্রয়োজন হয় অথবা ডিপোজিট বা উইথড্র সংক্রান্ত কোনো বিষয় জানার থাকে তাহলে দেয়া নিচের মাধ্যম গুলোর মাধ্যমে সহযোগিতা পেয়ে যাবেন আমরা দ্রুত চেষ্টা করবো আপনার সমস্যা সমাধানের ।  অবশ্যই আপনাকে বিষয় উল্লেখ করে আপনার ইউসার ID পাঠিয়ে দিতে হবে আমাদেরকে। `,
            }
        }
    ],
    footerBottom: {
        login: {
            bengali: `লগইন করুন`,
            english: `Login`
        },
        create: {
            bengali: `নতুন একাউন্ট তৈরি করুন `,
            english: `Create a new account`
        },
        profile: {
            bengali: `প্রোফাইল`,
            english: `Profile`
        },
        download: {
            bengali: `আমাদের গেম  ডাউনলোড করুন`,
            english: `Download our game`
        },
        changeLanguage: {
            bengali: `ভাষা পরিবর্তন করুন`,
            english: `Change the language`
        },
        videoTutorial: {
            bengali: `ভিডিও দেখে আমাদের খেলা শিখুন`,
            english: `Learn our game by watching videos`
        },
        supportCenter: {
            bengali: `সাপোর্ট সেন্টার`,
            english: `Support center`
        }
    },
    login: {
        login: {
            bengali: `লগইন করুন`,
            english: `Login`
        },
    },
    loginPage: {
        login: {
            bengali: `লগইন করুন`,
            english: `Login`
        },
        emailField: {
            bengali:  `ইমেইল`,
            english: `Email`
        },
        phoneField: {
            bengali: `ফোন নম্বর`,
            english: `Phone`
        },
        passwordField: {
            bengali:  `পাসওয়ার্ড`,
            english: `Password`
        },        
        emailPlace: {
            bengali:  `আপনার ইমেইল বসান`,
            english: `Enter your email`
        },
        phonePlace: {
            bengali: `আপনার ফোন নাম্বার বসান`,
            english: `Enter your phone number`
        },
        passwordPlace: {
            bengali:  `আপনার পাসওয়ার্ড বসান`,
            english: `Enter your password`
        },
        createField: {
            bengali: `নতুন অ্যাকাউন্ট খুলুন`,
            english: `Create a new account`
        },
    },
    registerPage: {
        login: {
            bengali: `লগইন করুন`,
            english: `Login`
        },
        name: {

        },
        emailField: {
            bengali:  `ইমেইল`,
            english: `Email`
        },
        phoneField: {
            bengali: `ফোন নম্বর`,
            english: `Phone`
        },
        passwordField: {
            bengali:  `পাসওয়ার্ড`,
            english: `Password`
        },        
        emailPlace: {
            bengali:  `আপনার ইমেইল বসান`,
            english: `Enter your email`
        },
        phonePlace: {
            bengali: `আপনার ফোন নাম্বার বসান`,
            english: `Enter your phone number`
        },
        passwordPlace: {
            bengali:  `আপনার পাসওয়ার্ড বসান`,
            english: `Enter your password`
        },
        createField: {
            bengali: `নতুন অ্যাকাউন্ট খুলুন`,
            english: `Create a new account`
        },
    },
    language: 'english',
    currency: {name: 'Usd', dollar: 1, currencyRate: 1}
}
const transaleSlice = createSlice({
    name: 'transale',
    initialState,
});

export default transaleSlice.reducer;


// {
//     title: {
//         english: ``,
//         bengali: ``,
//     },
//     description: {
//         english: ``,
//         bengali: ``,
//     }
// }