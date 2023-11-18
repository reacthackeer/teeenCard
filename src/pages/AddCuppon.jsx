import { Box, Button, FormControl, FormLabel, HStack, Heading, Input, useToast } from '@chakra-ui/react';
import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAddCouponMutation, useDeleteSingleCouponMutation, useGetAllCouponQuery } from '../App/features/coupon/api';

const CouponForm = () => {
  const [couponCode, setCouponCode] = useState('');
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('empty');
  const [debounceLoading, setDebounceLoading] = useState(false);
  const [balanceType, setBalanceType] = useState('');
  const adminId = useSelector((state)=> state.auth.auth.userId);

  const toast = useToast();
  
  const [provideCouponInfo, {data, isLoading, isError, isSuccess, error}] = useAddCouponMutation();
  const [deletedId, setDeletedId] = useState('');
  const {data: couponData, isSuccess: couponIsSuccess} = useGetAllCouponQuery();
  const [provideCouponId, {isLoading: deleteCouponIsLoading}] = useDeleteSingleCouponMutation();
  const [deleteDebounceLoading, setDeleteDebounceLoading] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault(); 
    setDebounceLoading(()=> false);
    if (couponCode && amount && email && balanceType && adminId && userId) {
      if (['DEMO', 'REAL', 'OFFLINE'].includes(balanceType)) {
        let postData = {
          couponCode,
          amount,
          email,
          balanceType,
          adminId,
          userId,
        };
        provideCouponInfo(postData);
      } else {
        toast({
          title: 'Invalid Request',
          duration: 4000,
          isClosable: true,
          status: 'warning',
        });
      }
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
    event.preventDefault();
    setDebounceLoading(()=> true);
    debouncedHandleSubmit(event);
  };
  
  useEffect(()=>{  
    if(!isLoading && isSuccess && !isError){
      if(data && data?.id > 0){ 
        setCouponCode('');
        setAmount('');
        setEmail('');
        setUserId('');
        setBalanceType('');
        // navigate('/profile');
        toast({
          title: "Successfully coupon added!",
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
  
  // const handleDeleteSingleCoupon = (id) => {
  //     let result = window.confirm('Are you sure to delete this item?');
  //     if(result && id){
  //         provideCouponId({id});
  //     }
  // }

  // Your original handleDeleteSingleCurrency function
const handleDeleteSingleCurrency = (id) => {
  setDeleteDebounceLoading(()=> false); 
  if (id) {
    provideCouponId({ id });
  }
};

// Create a debounced version of handleDeleteSingleCurrency
const debouncedHandleDeleteSingleCoupon = _.debounce(handleDeleteSingleCurrency, 1000); // Adjust the debounce wait time as needed

// Use the debounced function in your code
const handleDebouncedDeleteSingleCoupon = (id) => {
  setDeletedId(()=> id);
  setDeleteDebounceLoading(()=> true);
  debouncedHandleDeleteSingleCoupon(id);
};


  return (
    <React.Fragment>
      <Box p={2} bg="white">
        <Heading size={'lg'} textAlign={'center'} mt='4' mb='6'>
            Add Coupon Code
        </Heading>
        <form onSubmit={handleDebouncedSubmit}>
          <FormControl mb={3}>
            <FormLabel>Coupon Code</FormLabel>
            <Input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              required
            />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Balance Type</FormLabel>
            <Input
              type="text"
              placeholder="Enter Balance Type"
              value={balanceType}
              onChange={(e) => setBalanceType(e.target.value)}
              required
            />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Amount</FormLabel>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>User ID</FormLabel>
            <Input
              type="text"
              placeholder="Enter user ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </FormControl>
          <Button 
            type="submit" 
            colorScheme="blue"
            isLoading={debounceLoading || isLoading}
          >
            Add Coupon
          </Button>
        </form>
      </Box>
      {
        couponIsSuccess && couponData && couponData?.length > 0 &&
      <Box p={4} bg="white">
        <Heading size={'lg'} textAlign={'center'} my='2'>
            Previous Coupon
        </Heading> 
        <Box>
          {
            couponData.map((info, index)=> {
              return (
                <React.Fragment>
                  <HStack key={index}>
                    <Button>{info.coupon}</Button>
                    <Button>{info.balanceType}</Button>
                    <Button>{Number(info.amount).toFixed(2)}</Button>
                    <Button>{info.userId}</Button> 
                  </HStack>
                  <HStack key={index} mt='1' mb='4'>
                    <Button>{info.email}</Button> 
                    <Button 
                      onClick={()=> handleDebouncedDeleteSingleCoupon(info.id)}
                      isLoading={deleteCouponIsLoading || deleteDebounceLoading && info.id === deletedId}
                    >DELETE</Button> 
                  </HStack>
                </React.Fragment>
              )
            })
          }
        </Box>
      </Box>
    }
    </React.Fragment>
  );
};

export default CouponForm;
