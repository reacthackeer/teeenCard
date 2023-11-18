let messages = [
    {
        bengali: 'তুমি নিজেই খেলা থেকে বের হয়েছো ',
        english: `You're out of the game yourself`,
        languages: ['bengali','english']
    },
    {
        bengali: `তুমি এই খেলার প্রধান বিজয়ী `,
        english: `You are the main winner of this game`,
        languages: ['bengali','english']
    },
    {
        bengali: `তুমি নিজেই তোমার কার্ড প্যাক করেছো`,
        english: `You packed your card yourself`,
        languages: ['bengali','english']
    },
    {
        bengali: `আপনি যখন না দেখে হিট দেন (১x ব্লাইন্ড) । তখন আপনার একাউন্ট এ পর্যাপ্ত ব্যালান্স ছিল না। খেলায় তুলনা চালু থাকায় । আপনার কার্ড সবার সাথে তুলনা করা হয়। এবং আপনি বিজয়ী হন। `,
        english: `Hit when you don't see (1x blind). Then your account did not have sufficient balance. As the comparison is on in the game. Your card is compared to everyone else. And you win.`,
        languages: ['bengali','english']
    },
    {
        bengali: `আপনি যখন না দেখে হিট দেন (১x ব্লাইন্ড) । তখন আপনার একাউন্ট এ পর্যাপ্ত ব্যালান্স ছিল না। খেলায় তুলনা চালু থাকায় । আপনার কার্ড সবার সাথে তুলনা করা হয়। এবং আপনি পরাজিত হন।`,
        english: `Hit when you don't see (1x blind). Then your account did not have sufficient balance. As the comparison is on in the game. Your card is compared to everyone else. And you lose.`,
        languages: ['bengali','english']
    },
    {
        bengali: `আপনি যখন না দেখে দ্বিগুন  হিট দেন (২x ব্লাইন্ড) । তখন আপনার একাউন্ট এ পর্যাপ্ত ব্যালান্স ছিল না। খেলায় তুলনা চালু থাকায় । আপনার কার্ড সবার সাথে তুলনা করা হয়। এবং আপনি বিজয়ী হন। `,
        english: `Double hits when you are blind (2x blind). Then your account did not have sufficient balance. As the comparison is on in the game. Your card is compared to everyone else. And you win.`,
        languages: ['bengali','english']
    },
    {
        bengali: `আপনি যখন না দেখে দ্বিগুন  হিট দেন (২x ব্লাইন্ড) । তখন আপনার একাউন্ট এ পর্যাপ্ত ব্যালান্স ছিল না। খেলায় তুলনা চালু থাকায় । আপনার কার্ড সবার সাথে তুলনা করা হয়। এবং আপনি পরাজিত হন। `,
        english: `Double hits when you are blind (1x blind). Then your account did not have sufficient balance. As the comparison is on in the game. Your card is compared to everyone else. And you lose.`,
        languages: ['bengali','english']
    },
    {
        bengali: `আপনি যখন দেখে হিট দেন (১x chaal ) । তখন আপনার একাউন্ট এ পর্যাপ্ত ব্যালান্স ছিল না। খেলায় তুলনা চালু থাকায় । আপনার কার্ড সবার সাথে তুলনা করা হয়। এবং আপনি বিজয়ী হন। `,
        english: `Hit when you see (1x chaal). Then your account did not have sufficient balance. As the comparison is on in the game. Your card is compared to everyone else. And you win.`,
        languages: ['bengali','english']
    },
    {
        bengali: `আপনি যখন দেখে হিট দেন (১x chaal ) । তখন আপনার একাউন্ট এ পর্যাপ্ত ব্যালান্স ছিল না। খেলায় তুলনা চালু থাকায় । আপনার কার্ড সবার সাথে তুলনা করা হয়। এবং আপনি পরাজিত হন। `,
        english: `Hit when you see (1x chaal). Then your account did not have sufficient balance. As the comparison is on in the game. Your card is compared to everyone else. And you lose.`,
        languages: ['bengali','english']
    },
    {
        bengali: `আপনি যখন দেখে দ্বিগুন  হিট দেন (২x chaal ) । তখন আপনার একাউন্ট এ পর্যাপ্ত ব্যালান্স ছিল না। খেলায় তুলনা চালু থাকায় । আপনার কার্ড সবার সাথে তুলনা করা হয়। এবং আপনি বিজয়ী হন। `,
        english: `Give double hit when you see (2x chaal). Then your account did not have sufficient balance. As the comparison is on in the game. Your card is compared to everyone else. And you win.`,
        languages: ['bengali','english']
    },
    {
        bengali: `আপনি যখন দেখে দ্বিগুন  হিট দেন (২x chaal ) । তখন আপনার একাউন্ট এ পর্যাপ্ত ব্যালান্স ছিল না। খেলায় তুলনা চালু থাকায় । আপনার কার্ড সবার সাথে তুলনা করা হয়। এবং আপনি পরাজিত হন। `,
        english: `Give double hit when you see (2x chaal). Then your account did not have sufficient balance. As the comparison is on in the game. Your card is compared to everyone else. And you lose.`,
        languages: ['bengali','english']
    },
    {
        bengali: `শামীম বিজয়ী হয় যখন সে তার কার্ড তোমার সাথে সাইড করে `,
        english: `Shamim wins when he sides his cards with you`,
        languages: ['bengali','english']
    },
    {
        bengali: `তুমি যখন তোমার কার্ড শামীম এর সাথে সাইড করে তখন শামীম বিজয়ী হয় এবং তুমি পরাজিত হও `,
        english: `When you side your cards with Shamim, Shamim wins and you lose`,
        languages: ['bengali','english']
    },
    {
        bengali: `যখন তুমি তোমার কার্ড সাইড করো তখন তোমার একাউন্ট এ পর্যাপ্ত পরিমান টাকা ছিল না। খেলায় তুলনা চালু থাকায় । আপনার কার্ড সবার সাথে তুলনা করা হয়। এবং আপনি বিজয়ী হন।`,
        english: `Your account did not have enough funds when you side your card. As the comparison is on in the game. Your card is compared to everyone else. And you win.`,
        languages: ['bengali','english']
    },
    {
        bengali: `যখন তুমি তোমার কার্ড সাইড করো তখন তোমার একাউন্ট এ পর্যাপ্ত পরিমান টাকা ছিল না। খেলায় তুলনা চালু থাকায় । আপনার কার্ড সবার সাথে তুলনা করা হয়। এবং আপনি পরাজিত হন।`,
        english: `Your account did not have enough funds when you side your card. As the comparison is on in the game. Your card is compared to everyone else. And you lose.`,
        languages: ['bengali','english']
    },
    {
        bengali: `শামীম যখন তার কার্ড তোমার সাথে  শো করে তখন সে বিজয়ী হয় `,
        english: `Shamim wins when he shows his card to you`,
        languages: ['bengali','english']
    },
    {
        bengali: `শামীম এর সাথে যখন তুমি তোমার কার্ড শো করো তখন শামীম বিজয়ী হয় এবং তুমি পরাজিত হও। `,
        english: `When you show your cards with Shamim, Shamim wins and you lose`,
        languages: ['bengali','english']
    },
    {
        bengali: `যখন তুমি তোমার কার্ড শো করো তখন তোমার একাউন্ট এ পর্যাপ্ত পরিমান টাকা ছিল না। খেলায় তুলনা চালু থাকায় । আপনার কার্ড সবার সাথে তুলনা করা হয়। এবং আপনি বিজয়ী হন।`,
        english: `When you show your card, you don't have enough money in your account. As the comparison is on in the game. Your card is compared to everyone else. And you win.`,
        languages: ['bengali','english']
    },
    {
        bengali: `যখন তুমি তোমার কার্ড শো করো তখন তোমার একাউন্ট এ পর্যাপ্ত পরিমান টাকা ছিল না। খেলায় তুলনা চালু থাকায় । আপনার কার্ড সবার সাথে তুলনা করা হয়। এবং আপনি পরাজিত হন।`,
        english: `When you show your card, you don't have enough money in your account. As the comparison is on in the game. Your card is compared to everyone else. And you lose.`,
        languages: ['bengali','english']
    },
    {
        bengali: `তোমাকে দেয়া টাইম এর ভিতরে তুমি খেলায় কোনো রেসপন্স করোনি তাই তোমাকে রিফ্রেশ এর মাধ্যমে প্যাক করা হয়েছে `,
        english: `You did not respond to the game within the time given to you so you are packed with refresh`,
        languages: ['bengali','english']
    },
    {
        bengali: `আপনি খেলার প্রধান বিজয়ী `,
        english: `You are the main winner of the game`,
        languages: ['bengali','english']
    }
]