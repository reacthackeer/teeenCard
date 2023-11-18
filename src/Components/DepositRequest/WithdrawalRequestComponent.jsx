import { Box, Button, HStack, Heading, Text, VStack } from '@chakra-ui/react';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserAuthInfo } from '../../App/features/auth/authSlice';
import { useBlockSingleWithdrawalRequestMutation, useConfirmSingleWithdrawalRequestMutation, useDeleteSingleWithdrawalRequestMutation } from '../../App/features/withdrawalRequest/api';
const WithdrawalRequestComponent = () => {
    let data = useSelector((state)=> state.withdrawalRequest.data); 
    let adminId = useSelector((state)=> state.auth.auth.userId);

    const dispatch = useDispatch();

    const [provideCancelId] = useDeleteSingleWithdrawalRequestMutation();
    const [provideBlockId] = useBlockSingleWithdrawalRequestMutation();
    let [provideConfirmIdAndUserId,{data:confirmData, isSuccess}] = useConfirmSingleWithdrawalRequestMutation();
    
    const handleCancelSingleRequest = (id) => {
        let result = window.confirm('Are you sure to cancel this request?');
        if(id && result){
            provideCancelId({id});
        }
    };

    const handleBlockSingleRequest = (id, userId) => {
        let result = window.confirm('Are you sure to block this user?');
        if(id && result && userId){
            provideBlockId({id, userId});
        }
    };
    
    const handleConfirmSingleRequest = (id, userId) => {
        let result = window.confirm('Are you sure to confirm this request?');
        if(id && result && userId){
            provideConfirmIdAndUserId({id, userId});
        }
    };
    
    useEffect(()=>{
        if(isSuccess && confirmData && confirmData?.userId === adminId){
            dispatch(updateUserAuthInfo({auth: confirmData}))
        }
    },[confirmData,isSuccess])
    return (
        <Box> 
            <Box mt='2' mb='3'>
                <Heading textAlign={'center'}>Withdrawal request</Heading>
                <Text textAlign={'center'}>Please complete as soon as possible</Text>
            </Box>
            {
                data.map((info, index)=> { 
                    let result = moment(info.createdAt).startOf('millisecond').fromNow(); 
                    return(
                        <VStack key={index} mb='4'>
                            <HStack>
                                <Button width={'100px'}>{info.wallet}</Button>
                                <Button width={'160px'}>{info.account}</Button> 
                                <Button width={'100px'}>{info.currency}</Button>
                            </HStack>
                            <HStack>
                                <Button width={'100px'}>{info.reference}</Button>
                                <Button width={'160px'}>{info.userId}</Button> 
                                <Button width={'100px'}>{info.amount}</Button>
                            </HStack>
                            <HStack>
                                <Button width={'160px'}>{info.idType}</Button>
                                <Button width={'100px'}>{result}</Button> 
                                <Button 
                                    width={'100px'} 
                                    colorScheme='orange'
                                    onClick={()=> handleCancelSingleRequest(info.id)}
                                >Cancel</Button>
                            </HStack> 
                            <HStack>
                                <Button 
                                    width={'160px'}
                                    colorScheme='red' 
                                    onClick={()=> handleBlockSingleRequest(info.id, info.userId)}
                                >BLOCK</Button> 
                                <Button
                                    width={'160px'} 
                                    colorScheme='green'
                                    onClick={()=> handleConfirmSingleRequest(info.id, info.userId)}
                                >Confirm</Button> 
                            </HStack>
                        </VStack>
                    )
                })
            }
        </Box>
    );
};

export default WithdrawalRequestComponent;