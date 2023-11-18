import { Box, Button, FormControl, FormLabel, HStack, Heading, Input, useToast } from '@chakra-ui/react';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useAddSingleCurrencyMutation, useDeleteSingleCurrencyMutation, useGetAllCurrencyQuery } from '../../App/features/currency/api';

const AddCurrencyForm = () => {
const [name, setName] = useState('');
const [dollar, setDollar] = useState('');
const [currencyRate, setCurrencyRate] = useState('');
const [provideCurrencyId, {isLoading: deleteIsLoading}] = useDeleteSingleCurrencyMutation();
const [debounceLoading, setDebounceLoading] = useState(false);
const [deletedId, setDeletedId] = useState("")
const [deleteDebounceLoading, setDeleteDebounceLoading] = useState(false);
const [provideCurrencyInfo, {data, isLoading, isError, isSuccess, error}] = useAddSingleCurrencyMutation();
const toast = useToast();

const handleSubmit = (event) => {
    setDebounceLoading(()=> false);
    event.preventDefault();
    if (name && dollar && currencyRate) {
    let postData = { name, dollar, currencyRate };
    provideCurrencyInfo(postData);
    } else {
    toast({
        title: 'Invalid Request',
        duration: 4000,
        isClosable: true,
        status: 'warning',
    });
    }
};

// Create a debounced version of handleSubmit
const debouncedHandleSubmit = _.debounce(handleSubmit, 1000); // Adjust the debounce wait time as needed

// Use the debounced function in your code
const handleDebouncedSubmit = (event) => {
    setDebounceLoading(()=> true);
    event.preventDefault();
    debouncedHandleSubmit(event);
};


const {isSuccess: currencyIsSuccess, data: currencyData} = useGetAllCurrencyQuery();


useEffect(()=>{  
    if(!isLoading && isSuccess && !isError){
    if(data && data?.id > 0){ 
        setName('');
        setDollar('');
        setCurrencyRate(''); 
        // navigate('/profile')
        toast({
        title: "Successfully currency added!",
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


// Your original handleDeleteSingleCurrency function
const handleDeleteSingleCurrency = (id) => {
    setDeleteDebounceLoading(()=> false); 
    if (id) {
    provideCurrencyId({ id });
    }
};

// Create a debounced version of handleDeleteSingleCurrency
const debouncedHandleDeleteSingleCurrency = _.debounce(handleDeleteSingleCurrency, 1000); // Adjust the debounce wait time as needed

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
                Add Currency
            </Heading>
            <form onSubmit={handleDebouncedSubmit}>
                <FormControl mb={3}>
                <FormLabel>Currency Name</FormLabel>
                <Input
                    type="text"
                    placeholder="Enter currency name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                </FormControl>
                <FormControl mb={3}>
                <FormLabel>Enter dollar rate</FormLabel>
                <Input
                    type="number"
                    placeholder="Enter dollar rate"
                    value={dollar}
                    onChange={(e) => setDollar(e.target.value)}
                    required
                />
                </FormControl>
                <FormControl mb={3}>
                <FormLabel>Enter currency rate</FormLabel>
                <Input
                    type="number"
                    placeholder="Enter currency rate"
                    value={currencyRate}
                    onChange={(e) => setCurrencyRate(e.target.value)}
                    required
                />
                </FormControl> 
                <Button 
                    type="submit" 
                    colorScheme="blue"
                    isLoading={debounceLoading || isLoading}
                >
                    Add Currency
                </Button>
            </form>
        </Box>
        {
            currencyIsSuccess && currencyData && currencyData?.length > 0 &&
        <Box p={4} bg="white">
            <Heading size={'lg'} textAlign={'center'} mt='4' mb='6'>
                Previous Added Currency
            </Heading>
            <Box>
                {
                    currencyData.map((info,index)=>{
                        return (
                            <HStack key={index} my='1' justifyContent={'space-between'}>
                                <Button width={'80px'}>{info.name}</Button>
                                <Button width={'40px'}>{Number(info.dollar).toFixed(2)}</Button>
                                <Button width={'60px'}>{Number(info.currencyRate).toFixed(2)}</Button>
                                <Button 
                                    width={'90px'} 
                                    onClick={()=> handleDebouncedDeleteSingleCurrency(info.id)}
                                    isLoading={deleteDebounceLoading && info.id === deletedId || deleteIsLoading && info.id === deletedId}
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

export default AddCurrencyForm;
