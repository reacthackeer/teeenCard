import { Box, Button, FormControl, FormLabel, HStack, Heading, Input, Select, Text, VStack, useToast } from '@chakra-ui/react';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetAllWalletQuery } from '../App/features/wallet/api';
import { useAddSingleWithdrawalRequestMutation } from '../App/features/withdrawalRequest/api';

const DepositByWallet = () => {
        let {data, isSuccess} = useGetAllWalletQuery(); 
        const [selectedWallet, setSelectedWallet] = useState('');
        const [debounceLoading, setDebounceLoading] = useState(false);
        const [selectedIdType, setSelectedIdType] = useState(''); 
        const [reference, setReference] = useState('');
        const [wallet, setWallet] = useState("");
        const authInfo = useSelector((state)=> state.auth.auth); 
        const [amount, setAmount] = useState('');
        const toast = useToast();

        const getSelectedWalletIdType = () => {
            let idesType = [];
            
            if(isSuccess && data && data?.length > 0 && selectedWallet){
                data.forEach((info)=>{
                    if(info.name === selectedWallet){
                        idesType = info.idesType
                    }
                })
            }

            return idesType;
        };
        
        const getSelectedWalletInfo = () => {
            let accountNumber = '';
            if(isSuccess && data && data?.length > 0 && selectedWallet && selectedIdType){
                data.forEach((info)=>{
                    if(info.name === selectedWallet){
                        let idesTypeIndex = info.idesType.indexOf(selectedIdType);
                        accountNumber = info.ides[idesTypeIndex];
                    }
                })
            }

            return accountNumber;
        }; 

        const getSelectedWalletCurrency = () => {
            let walletCurrency = '';
            if(isSuccess && data && data?.length > 0 && selectedWallet && selectedIdType){
                data.forEach((info)=>{
                    if(info.name === selectedWallet){
                        walletCurrency = info.currency;
                    }
                })
            }

            return walletCurrency;
        }; 

        const [provideDepositRequestInfo,{data: drData, isLoading: drIsLoading, isSuccess: drIsSuccess, isError: drIsError, error: drError}] = useAddSingleWithdrawalRequestMutation();

        const handleSubmit = (e) => {
            e.preventDefault(); 
            setDebounceLoading(()=> false);
            if(selectedIdType && selectedWallet && wallet && amount && reference && authInfo?.userId){
            if(Number(authInfo.realBalance) > Number(amount) || Number(authInfo.realBalance) === Number(amount)){
                let postInfo = {
                    wallet: selectedWallet,
                    idType: selectedIdType,
                    account: wallet,
                    amount,
                    reference,
                    currency: 'Usd',
                    userId: authInfo.userId
                }  
                provideDepositRequestInfo(postInfo);
              }else{
                toast({
                  title: 'Balance low!',
                  status: 'warning',
                  isClosable: true
                })
              }
            }else{
              toast({
                title: 'Invalid post request!',
                status: 'warning',
                isClosable: true
              })
            }
        };

        const debounceWithdrawal = _.debounce(handleSubmit, 1000);
        
        const handleSubmitFirst = (e) => {
            e.preventDefault();
            setDebounceLoading(()=> true);
            debounceWithdrawal(e);
        }

        useEffect(()=>{  
            if(!drIsLoading && drIsSuccess && !drIsError){
                if(drData && drData?.id > 0){ 
                    setSelectedIdType('');
                    setSelectedWallet('');
                    setReference('');
                    setAmount('');
                    setWallet('')
                    // navigate('/profile')
                    toast({
                    title: "Successfully withdrawal request submitted!",
                    duration: 4000,
                    isClosable: true,
                    status: 'success'
                    })
                }else{
                    toast({
                    title: drError?.data?.error?.message || "Internal server error!",
                    duration: 4000,
                    isClosable: true,
                    status: 'error'
                    })
                }
            }
            if(!drIsLoading && drIsError && !drIsSuccess){
                toast({
                    title: drError?.data?.error?.message || "Internal server error!",
                    duration: 4000,
                    isClosable: true,
                    status: 'error'
                })
            }
        },[drData, drIsLoading, drIsSuccess, drIsError, drError])
        
        return (
        <VStack spacing={4} align="stretch" p='2'>
        <Heading fontSize={'2xl'} mt='2' textAlign={'center'}>Withdrawal your founds within 5 minutes</Heading>
        <Text fontSize={'small'}>Copy the user id from your profile and use it as a reference code.</Text>
        <Box> 
            <Button width={'100%'}>REAL BALANCE {Number(authInfo.realBalance).toFixed(2)} $</Button>
        </Box>
        <form onSubmit={handleSubmitFirst}>

            {isSuccess&& data && data?.length > 0 && <FormControl mt='2'>
                <FormLabel>Select your wallet type:</FormLabel>
                <Select value={selectedWallet} onChange={(e) => setSelectedWallet(e.target.value)}>
                    <option value="">Select Wallet</option> 
                    {
                        isSuccess && data && data?.length > 0 && data.map((info, index)=> <option value={info.name} key={index}>{info.name}</option>)
                    }
                </Select>
            </FormControl>}

            {selectedWallet && <FormControl mt='2'>
                <FormLabel>Select ID type:</FormLabel>
                <Select value={selectedIdType} onChange={(e) => setSelectedIdType(e.target.value)}>
                    <option value="">Select ID Type</option>
                    {
                        getSelectedWalletIdType().map((info, index)=> <option value={info} key={index}>{info}</option>)
                    } 
                </Select>
            </FormControl>}
            
            {selectedIdType && selectedWallet && getSelectedWalletInfo() &&
                <FormControl mt='2'>
                    <FormLabel>Withdrawal {selectedWallet} wallet {selectedIdType}:</FormLabel>
                    <Input type="text" placeholder='Enter your wallet info' value={wallet} onChange={(e) => setWallet(e.target.value)}/>
                </FormControl>
            }
            
            {selectedIdType && selectedWallet && getSelectedWalletInfo() && getSelectedWalletCurrency() &&
            <FormControl mt='2'>
                <FormLabel>how much dollar do you want to withdrawal ?</FormLabel>
                <Input type="number" placeholder='Enter amount' value={amount} onChange={(e) => setAmount(e.target.value)} />
            </FormControl>}
            {  selectedIdType && selectedWallet && getSelectedWalletInfo() && getSelectedWalletCurrency() &&
            <FormControl mt='2'>
                <FormLabel>Enter your reference code that we use</FormLabel>
                <Input type="text" placeholder='Enter Your User ID' value={reference} onChange={(e) => setReference(e.target.value)} />
            </FormControl>}
            <HStack mt={6} spacing={4} justify="center">
                <Button 
                    type="submit" 
                    colorScheme="blue"
                    isLoading={drIsLoading || debounceLoading}
                >Submit Deposit Request</Button> 
            </HStack>
        </form>
        </VStack>
        )
    }


export default DepositByWallet;