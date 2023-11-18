import { Box, Button, HStack, Heading, Text, VStack } from '@chakra-ui/react';
import _ from 'lodash';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserAuthInfo } from '../../App/features/auth/authSlice';
import { useBlockSingleWithdrawalRequestMutation, useConfirmSingleWithdrawalRequestMutation, useDeleteSingleWithdrawalRequestMutation } from '../../App/features/withdrawalRequest/api';
const WithdrawalRequestComponent = () => {
    let data = useSelector((state)=> state.withdrawalRequest.data); 
    let adminId = useSelector((state)=> state.auth.auth.userId);
    
    const [debounceConfirmLoading, setDebounceConfirmLoading] = useState(false);
    const [debounceBlockLoading, setDebounceBlockLoading] = useState(false);
    const [debounceCancelLoading, setDebounceCancelLoading] = useState(false);
    const [cancelId, setCancelId] = useState('');
    const [confirmId, setConfirmId] = useState('');
    const [blockId, setBlockId] = useState('');
    const dispatch = useDispatch();

    
    const [provideCancelId, {isLoading: cancelIsLoading}] = useDeleteSingleWithdrawalRequestMutation();
    const [provideBlockId, {isLoading: blockIsLoading}] = useBlockSingleWithdrawalRequestMutation();
    let [provideConfirmIdAndUserId,{data:confirmData, isSuccess, isLoading: confirmIsLoading}] = useConfirmSingleWithdrawalRequestMutation();
    
    const handleCancelSingleRequest = (id) => {
            setDebounceCancelLoading(()=> false);
            provideCancelId({id});
    };

    const handleBlockSingleRequest = (id, userId) => {
            setDebounceBlockLoading(()=> false);
            provideBlockId({id, userId});
    };
    
    const handleConfirmSingleRequest = (id, userId) => {
            setDebounceConfirmLoading(()=> false);
            provideConfirmIdAndUserId({id, userId});
    };

    const confirmDebounce = _.debounce(handleConfirmSingleRequest, 1000);
    const blockDebounce = _.debounce(handleBlockSingleRequest, 1000);
    const cancelDebounce = _.debounce(handleCancelSingleRequest, 1000);

    const handleCancelSingleRequestFirst = (id) => {
        let result = window.confirm('Are you sure to cancel this request?');
        if(id && result){ 
            setCancelId(()=> id);
            setDebounceCancelLoading(()=> true);
            cancelDebounce(id);
        }
    };

    const handleBlockSingleRequestFirst = (id, userId) => {
        let result = window.confirm('Are you sure to block this user?');
        if(id && result && userId){
            setBlockId(()=> id);
            setDebounceBlockLoading(()=> true)
            blockDebounce(id, userId)
        }
    };
    
    const handleConfirmSingleRequestFirst = (id, userId) => {
        let result = window.confirm('Are you sure to confirm this request?');
        if(id && result && userId){
            setConfirmId(()=> id);
            setDebounceConfirmLoading(()=> true);
            confirmDebounce(id, userId);
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
                                <Button>{info.idType}</Button>
                                <Button>{result}</Button> 
                            </HStack> 
                            <HStack>
                                <Button  
                                    colorScheme='orange'
                                    onClick={()=> handleCancelSingleRequestFirst(info.id)}
                                    size={'sm'}
                                    isLoading={cancelId === info.id && cancelIsLoading || cancelId === info.id && debounceCancelLoading}
                                >Cancel</Button>
                                <Button  
                                    colorScheme='red' 
                                    onClick={()=> handleBlockSingleRequestFirst(info.id, info.userId)}
                                    size={'sm'}
                                    isLoading={blockId === info.id && blockIsLoading || debounceBlockLoading && blockId === info.id}
                                >BLOCK</Button> 
                                <Button 
                                    colorScheme='green'
                                    onClick={()=> handleConfirmSingleRequestFirst(info.id, info.userId)}
                                    size={'sm'}
                                    isLoading={confirmId === info.id && confirmIsLoading || confirmId === info.id && debounceConfirmLoading}
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