import { Box, Button, FormControl, FormLabel, HStack, Heading, Input, VStack, useToast } from '@chakra-ui/react';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useBalanceTransferMutation } from '../App/features/auth/api';

const BalanceTransferPage = () => {
  const {realBalance, userId} = useSelector((state)=> state.auth.auth);
  const toast = useToast();
  const [ID, setID] = useState('');
  const [amount, setAmount] = useState('');
  const [backupPassword, setBackupPassword] = useState('');
  const [debounceLoading, setDebounceLoading] = useState(false);
  const [password, setPassword] = useState('');

  const [provideTransferInfo,{data, isLoading, isSuccess, isError, error}] = useBalanceTransferMutation();

  const handleSubmit = (e) => {
    e.preventDefault();
    setDebounceLoading(()=> false);
    if(backupPassword !== password){
        if(ID && amount && backupPassword && password && userId){
            if(Number(amount) <= Number(realBalance)){
                let postInfo = {
                  userId,
                  backupPassword,
                  password,
                  amount: Number(amount),
                  receiverId: ID
                }
                provideTransferInfo(postInfo);
            }else{
              toast({
                title: 'You have not enough balance!',
                status: 'warning',
                isClosable: true
              })
            }
        }else{
          toast({
            title: 'Invalid post request',
            status: 'warning',
            isClosable: true
          })
        }
    }else{
      toast({
        title: 'Password and backup password must different!',
        status: 'warning',
        isClosable: true
      })
    }
  };

  const debounceTransfer = _.debounce(handleSubmit,1000);
  const handleSubmitFirst = (e) => {
    e.preventDefault();
    setDebounceLoading(()=> true);
    debounceTransfer(e);
  }
  const navigate = useNavigate();
  
  useEffect(()=>{  
    if(!isLoading && isSuccess && !isError){
    if(data && data?.senderUpdate){ 
        setID('');
        setAmount('');
        setBackupPassword('');
        setPassword('');
        navigate('/profile');
        toast({
        title: "Successfully transfer!",
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


  return (
    <Box maxWidth={500} mt={10} p='2'>
      <Heading mb={6} textAlign="center">Transfer your funds with your friends</Heading>
      <VStack spacing={4} align="stretch">
        <Box>
          <strong>Current Balance:</strong> $ {Number(realBalance).toFixed(2)}
        </Box>
        <form onSubmit={handleSubmitFirst}>
          <FormControl mt='2'>
            <FormLabel>Enter Receiver User ID.</FormLabel>
            <Input type="text" placeholder='User ID' value={ID} onChange={(e) => setID(e.target.value)} required/>
          </FormControl>
          <FormControl mt='2'>
            <FormLabel>How much dollar do you want to transfer?</FormLabel>
            <Input type="number" placeholder='Enter amount' value={amount} onChange={(e) => setAmount(e.target.value)} required/>
          </FormControl>
          <FormControl mt='2'>
            <FormLabel>Enter Backup Password</FormLabel>
            <Input type="password" placeholder='Enter backup password' value={backupPassword} onChange={(e) => setBackupPassword(e.target.value)} required/>
          </FormControl>
          <FormControl mt='2'>
            <FormLabel>Password</FormLabel>
            <Input type="password" placeholder='Enter password' value={password} onChange={(e) => setPassword(e.target.value)} required/>
          </FormControl>
          <HStack mt={6} spacing={4} justify="center">
            <Button 
              type="submit" 
              colorScheme="blue" 
              isLoading={isLoading || debounceLoading}
            >Transfer</Button>
            <Button type="reset" colorScheme="gray" variant="outline">Clear</Button>
          </HStack>
        </form>
      </VStack>
    </Box>
  );
};

export default BalanceTransferPage;
