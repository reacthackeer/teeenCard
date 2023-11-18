import { Box, Button, FormControl, FormLabel, HStack, Heading, Input, Select, useToast } from '@chakra-ui/react';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useGetAllCurrencyQuery } from '../../App/features/currency/api';
import { useAddSingleWalletMutation, useDeleteSingleWalletMutation, useGetAllWalletQuery } from '../../App/features/wallet/api';

const DepositCouponForm = () => {
const [wallet, setWallet] = useState('');
const [idesType, setIdesType] = useState('');
const [debounceLoading, setDebounceLoading] = useState(false);
const [deleteDebounceLoading, setDeleteDebounceLoading] = useState(false);
const [deletedId, setDeletedId] = useState('');
const [ides, setIdes] = useState('');
const [currency, setCurrency] = useState('');  
const toast = useToast();
const [provideCouponInfo, {data, isLoading, isError, isSuccess, error}] = useAddSingleWalletMutation();
const {data: walletData, isSuccess: walletIsSuccess} = useGetAllWalletQuery();
const [provideWalletId,{isLoading: deleteIsLoading}] = useDeleteSingleWalletMutation();
const {data: currencyData, isSuccess: currencyIsSuccess} = useGetAllCurrencyQuery();

const handleSubmit = (event) => {
    event.preventDefault();
    setDebounceLoading(()=> false);
    if(wallet && ides && currency){
        let newIdesType = idesType.split('=');
        let newIdes = ides.split('=');
        let postData = {wallet, idesType: newIdesType, ides: newIdes, currency};
        provideCouponInfo(postData)  
    }else{
        toast({
            title: 'Invalid Request',
            duration: 4000,
            isClosable: true,
            status: 'warning'
        })
    }
}; 

// Create a debounced version of handleSubmit
const debouncedHandleSubmit = _.debounce(handleSubmit, 1000); // Adjust the debounce wait time as needed

// Use the debounced function in your code
const handleDebouncedSubmit = (event) => {
    event.preventDefault();
    setDebounceLoading(()=> true);
    debouncedHandleSubmit(event);
};

useEffect(()=>{  
    if(!isLoading && isSuccess && !isError){
    if(data && data?.id > 0){ 
        setWallet('');
        setIdes('');
        setIdesType('');
        setCurrency(""); 
        toast({
        title: "Successfully wallet added!",
        duration: 4000,
        isClosable: true,
        status: 'success'
        })
    }else{
        toast({
        title: error?.data?.error?.message || "Internal server error!",
        duration: 4000,
        isClosable: true,
        status: 'error'
        })
    }
    }
    if(!isLoading && isError && !isSuccess){
    toast({
        title: error?.data?.error?.message || "Internal server error!",
        duration: 4000,
        isClosable: true,
        status: 'error'
    })
    }
},[data, isLoading, isSuccess, isError, error])

const handleDeleteSingleWallet = (id) => { 
    setDeleteDebounceLoading(()=> false);
    if(id){
        provideWalletId({id})
    }
}


// Create a debounced version of handleDeleteSingleCurrency
const debouncedHandleDeleteSingleCurrency = _.debounce(handleDeleteSingleWallet, 1000); // Adjust the debounce wait time as needed

// Use the debounced function in your code
const handleDebouncedDeleteSingleCurrency = (id) => {
    setDeletedId(()=> id);
    setDeleteDebounceLoading(()=> true);
    debouncedHandleDeleteSingleCurrency(id);
};


return (
    <React.Fragment>
        <Box p={2} bg="white">
            <Heading size={'lg'} textAlign={'center'} mt='4' mb='6'>
                Add Deposit Wallet
            </Heading>
            <form onSubmit={handleDebouncedSubmit}>
                <FormControl mb={3}>
                <FormLabel>Wallet Name</FormLabel>
                <Input
                    type="text"
                    placeholder="Enter wallet name"
                    value={wallet}
                    onChange={(e) => setWallet(e.target.value)}
                    required
                />
                </FormControl>
                <FormControl mb={3}>
                <FormLabel>Enter your ides Type</FormLabel>
                <Input
                    type="text"
                    placeholder="example email=ID"
                    value={idesType}
                    onChange={(e) => setIdesType(e.target.value)}
                    required
                />
                </FormControl>
                <FormControl mb={3}>
                <FormLabel>Enter your ides</FormLabel>
                <Input
                    type="text"
                    placeholder="example mail@gmail.com=2222222"
                    value={ides}
                    onChange={(e) => setIdes(e.target.value)}
                    required
                />
                </FormControl>

                {currencyIsSuccess && currencyData && currencyData?.length > 0 && 
                    <FormControl mb='3'>
                        <FormLabel>Select ID type:</FormLabel>
                        <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                            <option value="">Select Currency</option>
                            {
                                currencyData.map((info, index)=> <option value={info.name} key={index}>{info.name}</option>)
                            } 
                        </Select>
                    </FormControl>
                }

                <Button 
                    type="submit" 
                    colorScheme="blue"
                    isLoading={isLoading || debounceLoading}
                >
                    Add Wallet
                </Button>
            </form>
        </Box>
        {
            walletIsSuccess && walletData && walletData?.length > 0 &&
        <Box p={4} bg="white">
            <Heading size={'lg'} textAlign={'center'} mt='4' mb='6'>
                Previous Deposit Wallet
            </Heading> 
            <Box>
                {
                    walletData.map((info, index)=>{
                        return(
                            <HStack key={index} justifyContent={'space-between'} my='1'>
                                <Button width={'90px'}>{info.name}</Button>
                                <Button width={'90px'}>{info.currency}</Button>
                                <Button 
                                    width={'90px'} 
                                    onClick={()=> handleDebouncedDeleteSingleCurrency(info.id)}
                                    isLoading={deleteIsLoading && info.id === deletedId || deleteDebounceLoading && info.id === deletedId}
                                >DELETE</Button>
                            </HStack>
                        )
                    })
                }
            </Box>
        </Box>
    
    }
    </React.Fragment>
);
};

export default DepositCouponForm;
