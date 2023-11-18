import { Box, Button, HStack, Heading, Text, useToast } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useSelector } from 'react-redux';

const StartEarning = () => {
    let [referralLink, setReferralLink] = useState('');
    const {userId} = useSelector((state)=> state.auth.auth);
    useEffect(()=>{
        let origin = window.location.origin;
        if(origin && userId){
            setReferralLink(()=> origin+'/register?'+userId)
        }
    },[userId])

    const toast = useToast();

    const handleCopySuccess = () => {
        toast({
            title: 'Copied',
            status: 'success',
            isClosable: true
        })
    }
    return (
        <Box p='2'>
            <Box mt='2'>
                <Heading textAlign={'center'} mb='2'>Earn unlimited</Heading>
                <Text textAlign={'justify'}>Refer friends and earn unlimited money. If any of your friends login and play with us here on your referral, you will get 5% commission per transaction and our system will deduct 5% commission. By depositing 5% commission of his total amount you and 5% commission will be deducted by our system and your friend will play unlimited without any commission.</Text>
            </Box>
            <Box   
                mt='5'
            >
                <Button width={'100%'} mb='2'>{referralLink}</Button>
                <HStack justify={'flex-end'}>
                    <CopyToClipboard text={referralLink}>
                        <Button
                            onClick={handleCopySuccess}
                        >Copy</Button>
                    </CopyToClipboard>
                </HStack>
            </Box>
        </Box>
    );
};

export default StartEarning;