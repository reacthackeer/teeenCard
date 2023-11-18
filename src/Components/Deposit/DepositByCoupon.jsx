    import { Box, Button, FormControl, FormLabel, Input } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

    import { useToast } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateUserAuthInfo } from '../../App/features/auth/authSlice';
import { useApplyCouponMutation } from '../../App/features/coupon/api';
    

    const DepositByCoupon = () => {
    const [couponCode, setCouponCode] = useState('');
    const [amount, setAmount] = useState('');
    const [email, setEmail] = useState('');
    const [userId, setUserId] = useState('empty');
    const [balanceType, setBalanceType] = useState('');
    const {userId:adminId, referralCode, email: adminEmail} = useSelector((state)=> state.auth.auth);

    const dispatch = useDispatch();
    const toast = useToast();
    const [provideCouponInfo, {data, isLoading, isError, isSuccess, error}] = useApplyCouponMutation();
    const handleSubmit = (event) => {
        event.preventDefault();
        if(couponCode && amount && email && balanceType && adminId && userId && adminEmail){
        if(balanceType === 'DEMO' || balanceType === 'REAL' || balanceType === 'OFFLINE'){
            let postData = {
                couponCode,
                amount,
                email,
                balanceType,
                adminId,
                userId,
                refId: referralCode,
                adminEmail
            }  
            provideCouponInfo(postData);
        }else{
            toast({
            title: 'Invalid Request',
            duration: 4000,
            isClosable: true,
            status: 'warning'
            })
        }
        }else{
        toast({
            title: 'Invalid Request',
            duration: 4000,
            isClosable: true,
            status: 'warning'
        })
        }
    };
    const navigate = useNavigate();
    useEffect(()=>{   
        if(!isLoading && isSuccess && !isError){
        if(data && data?.id){  
            setCouponCode('');
            setAmount('');
            setEmail('');
            setUserId('');
            setBalanceType('');
            dispatch(updateUserAuthInfo({auth: data}))
            toast({
            title: "Successfully coupon recharged!",
            duration: 4000,
            isClosable: true,
            status: 'success'
            })
            navigate('/profile');
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
    
    return (
        <Box bg="white"> 
        <form onSubmit={handleSubmit}>
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
            <Button type="submit" colorScheme="blue">
            Apply Coupon
            </Button>
        </form>
        </Box>
    );
    };


    export default DepositByCoupon;