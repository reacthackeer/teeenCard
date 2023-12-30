import { Box, Button, FormControl, FormLabel, HStack, Heading, Input, Text, useToast } from '@chakra-ui/react';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useReferralBalanceTransferMutation } from '../App/features/auth/api';
import { useGetAllReferralIncomeQuery } from '../App/features/currency/api';
import LoadingComponent from '../Components/Loading/Loading';

const ReferralBalanceTransfer = () => {
    const currency = useSelector((state)=> state.home.currency);
    const userId = useSelector((state)=> state.auth.auth.userId);
    const [currentSelect, setCurrentSelect] = useState('');
    const {data, isSuccess, isLoading, isError} = useGetAllReferralIncomeQuery(userId);
    const [provideTransferInfo, {data: dataT, isLoading: isLoadingT, isError: isErrorT, isSuccess: isSuccessT, error: errorT}] = useReferralBalanceTransferMutation();
    const [password, setPassword] = useState('');
    const [debounceLoading, setDebounceLoading] = useState(false);
    const [backupPassword, setBackupPassword] = useState('');
    const navigate = useNavigate();
    const toast = useToast();

    useEffect(()=>{  
        if(!isLoadingT && isSuccessT && !isErrorT){
        if(dataT && dataT?.id > 0){  
            setBackupPassword('');
            setPassword('');
            setCurrentSelect('')
            navigate('/profile');
            toast({
            title: "Successfully transfer!",
            duration: 4000,
            isClosable: true,
            status: 'success'
            })
        }else{
            toast({
            title: errorT?.data?.error?.message || "Internal server error!",
            duration: 4000,
            isClosable: true,
            status: 'error'
            })
        }
        }
        if(!isLoadingT && isErrorT && !isSuccessT){
        toast({
            title: errorT?.data?.error?.message || "Internal server error!",
            duration: 4000,
            isClosable: true,
            status: 'error'
        })
        }
    },[dataT, isLoadingT, isSuccessT, isErrorT, errorT])

    const handleBalanceTransfer = () => {
        setDebounceLoading(()=> false);
        if(currentSelect){
            let balance = data[`${currentSelect}Balance`];
            if(balance > 0){
                if(balance && password && backupPassword && userId){
                    let postData = {
                        password, 
                        backupPassword,
                        balanceType: currentSelect.toUpperCase(),
                        userId
                    }
                    provideTransferInfo(postData);
                }
            }else{
                toast({
                    title: 'Balance low!',
                    isClosable: true,
                    status: 'warning'
                })
            }
        }else{
            toast({
                title: 'please select balance!',
                isClosable: true,
                status: 'warning'
            })
        }
    }

    const debounceTransfer = _.debounce(handleBalanceTransfer,1000);
    const handleBalanceTransferFirst = () => {
        setDebounceLoading(()=> true);
        debounceTransfer()
    }
    // decide what to render
    let content = null;
    if(!isSuccess && !isError && isLoading){
    content = <LoadingComponent/>
    }

    if(!isSuccess && !isLoading && isError){
    content = <div className='loading__container'>
                    <h1>Internal server error!</h1>
                    <Button onClick={()=> navigate('/profile')}>Go Back Profile</Button>
                </div>
    }

    if(isSuccess && !isError && !isLoading){
    if(data && (data?.realBalance || data?.demoBalance || data?.offlineBalance)){ 
        content = (
        <Box p={4}> 
            <Text
                fontSize={'xl'}
                textAlign={'center'}
                mb='3'
            >Your referral income</Text>
            <Box
                width={'100%'} 
            >
                <HStack
                    display={'grid'}
                    gridTemplateColumns={'65% 35%'}
                >
                    <Button 
                        colorScheme={currentSelect === 'real' ? 'whatsapp' : 'gray'}
                        onClick={()=> setCurrentSelect(()=> 'real')}
                    >REAL BALANCE</Button>
                    <Button>{Number(Number(data?.realBalance) * currency.currencyRate).toFixed(1)} {currency?.name.toUpperCase()}</Button>
                </HStack>
                <HStack
                    mt='2'
                    display={'grid'}
                    gridTemplateColumns={'65% 35%'}
                >
                    <Button 
                        colorScheme={currentSelect === 'offline' ? 'whatsapp' : 'gray'}
                        onClick={()=> setCurrentSelect(()=> 'offline')}
                    >OFFLINE BALANCE</Button>
                    <Button>{Number(Number(data?.offlineBalance) * currency.currencyRate).toFixed(1)} {currency?.name.toUpperCase()}</Button>
                </HStack>
                <HStack
                    mt='2' 
                    display={'grid'}
                    gridTemplateColumns={'65% 35%'}
                >
                    <Button 
                        colorScheme={currentSelect === 'demo' ? 'whatsapp' : 'gray'}
                        onClick={()=> setCurrentSelect(()=> 'demo')}
                    >DEMO BALANCE</Button>
                    <Button>{Number(Number(data?.demoBalance) * currency.currencyRate).toFixed(1)} {currency?.name.toUpperCase()}</Button>
                </HStack> 
                {
                    currentSelect && 
                    <Box>
                        <FormControl 
                            mt='10'
                            isDisabled={data[`${currentSelect}Balance`] === 0}
                        >
                            <FormLabel>Enter Backup Password</FormLabel>
                            <Input type="password" placeholder='Enter backup password' value={backupPassword} onChange={(e) => setBackupPassword(e.target.value)} required/>
                        </FormControl>
                        <FormControl 
                            mt='2'
                            isDisabled={data[`${currentSelect}Balance`] === 0}
                        >
                            <FormLabel>Password</FormLabel>
                            <Input type="password" placeholder='Enter password' value={password} onChange={(e) => setPassword(e.target.value)} required/>
                        </FormControl>
                        <Button
                            width={'100%'}
                            mt='5'
                            colorScheme={'orange'}
                            textTransform={'uppercase'}
                            onClick={handleBalanceTransferFirst}
                            isDisabled={data[`${currentSelect}Balance`] === 0}
                            isLoading={isLoading || debounceLoading}
                        >{currentSelect} Balance Transfer</Button>
                    </Box>
                }
            </Box>
        </Box>
        )
    }else{
        content = <div className='loading__container'>
                    <Heading fontSize={'large'}>No referral Income found</Heading>
                    <Button size={'sm'} mt='3' onClick={()=> navigate('/start-earning')}>Start Earning</Button>
                </div>
    }
    }

    return content;
};


export default ReferralBalanceTransfer;