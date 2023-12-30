import {
  Avatar,
  Box,
  Button,
  Container,
  Divider,
  Heading,
  Text,
  VStack,
  useToast
} from '@chakra-ui/react';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateSystemCurrency } from '../App/features/Home/homeSlice';
import { useToggleInvitationMutation } from '../App/features/auth/api';
import { updateUserAuthInfo, userLoggedOut } from '../App/features/auth/authSlice';
import { useToggleCurrencyMutation } from '../App/features/currency/api';
const UserProfilePage = () => {
  const toast = useToast();
  const navigate = useNavigate(); 
  const {name, email, phone, myRef, demoBalance, realBalance, offlineBalance, userId, src, invitation, role, designation, isJail , isDisabled} = useSelector((state)=> state.auth?.auth); 
  const defaultCurrency = useSelector((state)=> state?.home?.currency); 
  const [provideInfo,{data, isLoading, isError, isSuccess, error}] = useToggleInvitationMutation(); 
  const [debounceLoading, setDebounceLoading] = useState(false);
  const dispatch = useDispatch();
  const handleLogOut = () => {
    dispatch(userLoggedOut({
      auth: {},
      isLoggedIn: false,
      isFilled: false,
      token: ''
    }))
    localStorage.removeItem('token') 
  }

  const handleToggleInvitation = () => {
    setDebounceLoading(()=> false);
    provideInfo({ userId, email });
  };
  
  // Create a debounced version of handleToggleInvitation
  const debouncedHandleToggleInvitation = _.debounce(handleToggleInvitation, 1000); // Adjust the debounce wait time as needed
  
  // Use the debounced function in your code
  const handleDebouncedToggleInvitation = () => {
    setDebounceLoading(()=> true);
    debouncedHandleToggleInvitation();
  };

  useEffect(()=>{ 
    if(!isLoading && isSuccess && !isError){
      if(data && data?.id > 0){
        dispatch(updateUserAuthInfo({auth: data})) 
        toast({
          title: 'Successfully invitation '+data.invitation,
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
  
  const handleCheckAdmin = () => {
    let result = false;
    
    if(Number(role) === 1 && designation === 'admin' && isJail === 'false' && isDisabled === 'false'){
      result = true
    }
    return result;
  } 
  const [toggleCurrencyDebounceLoading, setToggleCurrencyDebounceLoading] = useState(false);
  const [provideToggleCurrencyInfo, {
      data: toggleCurrencyData, 
      isLoading: toggleCurrencyIsLoading, 
      isSuccess: toggleCurrencyIsSuccess, 
      isError: toggleCurrencyIsError,
      error: toggleCurrencyError
    }
    ] = useToggleCurrencyMutation();

  const handleToggleCurrency = () => {
    setToggleCurrencyDebounceLoading(()=> false);
    provideToggleCurrencyInfo(defaultCurrency?.name || "Usd");
  };
  const debouncedHandleToggleCurrency = _.debounce(handleToggleCurrency, 1000); 
  const handleDebounceToggleCurrency = () => {
    setToggleCurrencyDebounceLoading(()=> true);
    debouncedHandleToggleCurrency();
  }
  useEffect(()=>{ 
    if(!toggleCurrencyIsLoading && toggleCurrencyIsSuccess && !toggleCurrencyIsError){
      if(toggleCurrencyData && toggleCurrencyData?.id > 0){
        dispatch(updateSystemCurrency(toggleCurrencyData))
        toast({
          title: 'Successfully '+toggleCurrencyData?.name+" currency toggled.",
          duration: 4000,
          isClosable: true,
          status: 'success'
        })
        localStorage.setItem('default__currency', JSON.stringify(toggleCurrencyData))
      }else{
        toast({
          title: toggleCurrencyError?.data?.error?.message || "Internal server error!",
          duration: 4000,
          isClosable: true,
          status: 'error'
        })
      }
    }
    if(!toggleCurrencyIsLoading && toggleCurrencyIsError && !toggleCurrencyIsSuccess){
      toast({
        title: toggleCurrencyError?.data?.error?.message || "Internal server error!",
        duration: 4000,
        isClosable: true,
        status: 'error'
      })
    }
  },[toggleCurrencyData, toggleCurrencyIsLoading, toggleCurrencyIsSuccess, toggleCurrencyIsError, toggleCurrencyError])
  return (
    <Container maxW="lg" mt={10}>
      <Box display="flex" flexDirection="column" alignItems="center">
      
        <Avatar size="xl" name={name} src={'http://localhost:3000'+src}/>
        <Heading as="h2" size="lg" my={3}>
          {name}
        </Heading>
        <Text fontSize="lg" mb={1}>
          {email}
        </Text>
        <Text fontSize="lg" mb={1}>
          Phone: {phone}
        </Text>
        <Text fontSize="lg" mb={1}>
          Referral Code: {myRef.toUpperCase()}
        </Text>
        <Text fontSize="lg" mb={1}>
          Demo Balance: {Number(Number(demoBalance) * (defaultCurrency.currencyRate)).toFixed(2)} {defaultCurrency?.name.toUpperCase()}
        </Text>
        <Text 
          fontSize="lg" 
          mb={1}
        >
          Current Balance: {Number(Number(realBalance) * (defaultCurrency.currencyRate)).toFixed(2)} {defaultCurrency?.name?.toUpperCase()}
        </Text>
        <Text fontSize="lg" mb={1}>
          Offline Balance: {Number(Number(offlineBalance) * (defaultCurrency.currencyRate)).toFixed(2)} {defaultCurrency?.name?.toUpperCase()}
        </Text>
        <Text 
          fontSize={'lg'} 
        >Invitation: 
          <Button 
            ml='2'
            onClick={handleDebouncedToggleInvitation}
            isLoading={isLoading || debounceLoading}
          >{invitation}</Button>
        </Text>
        <Text 
          fontSize={'lg'} 
        >Currency: 
          <Button 
            mt='2'
            ml='2'
            onClick={handleDebounceToggleCurrency}
            isLoading={toggleCurrencyIsLoading || toggleCurrencyDebounceLoading}
          >{defaultCurrency?.name?.toUpperCase()}</Button>
        </Text>
          <Text 
            fontSize="lg" 
            mt={2}
          >
          User ID: <CopyToClipboard 
                      text={userId.toUpperCase()}
                      >
                        <Button 
                          size={'sm'} 
                          ml='2' 
                          onClick={()=> toast({title: 'Successfully copied', status: 'success', isClosable: true})}
                        >{userId.toUpperCase()}</Button>
                    </CopyToClipboard>
        </Text> 

        <Divider my={6} />
      </Box>
      <VStack>
        <Button display={handleCheckAdmin() ? 'block' : 'block'} onClick={handleLogOut} width={'100%'}>Log out</Button> 
        <Button display={handleCheckAdmin() ? 'block' : 'block'} onClick={()=>navigate('/boards')} width={'100%'}>Board Page</Button>
        <Button display={handleCheckAdmin() ? 'block' : 'block'} onClick={()=>navigate('/')} width={'100%'}>Home Page</Button>
        <Button display={handleCheckAdmin() ? 'block' : 'block'} onClick={()=>navigate('/backup-password')} width={'100%'}>Backup password</Button>  
        <Button display={handleCheckAdmin() ? 'block' : 'block'} onClick={()=>navigate('/upload/profile-picture')} width={'100%'}>Upload profile picture</Button>
        <Button display={handleCheckAdmin() ? 'block' : 'none'} onClick={()=>navigate('/admin/add/currency')} width={'100%'}>Add Currency</Button>  
        <Button display={handleCheckAdmin() ? 'block' : 'none'} onClick={()=>navigate('/admin/add/deposit-request')} width={'100%'}>Deposit Request</Button>  
        <Button display={handleCheckAdmin() ? 'block' : 'none'} onClick={()=>navigate('/admin/add/withdrawal-request')} width={'100%'}>Withdrawal Request</Button>  
        <Button display={handleCheckAdmin() ? 'block' : 'none'} onClick={()=>navigate('/admin/add/coupon-code')} width={'100%'}>Add Coupon Code</Button>  
        <Button display={handleCheckAdmin() ? 'block' : 'block'} onClick={()=>navigate('/deposit')} width={'100%'}>Deposit</Button> 
        <Button display={handleCheckAdmin() ? 'block' : 'none'} onClick={()=>navigate('/admin/add/deposit-wallet')} width={'100%'}>Add Deposit Wallet</Button> 
        <Button display={handleCheckAdmin() ? 'block' : 'none'} onClick={()=>navigate('/admin/update/admin-access')} width={'100%'}>Update admin access</Button>
        <Button display={handleCheckAdmin() ? 'block' : 'none'} onClick={()=>navigate('/admin/update/user-access')} width={'100%'}>Update user access</Button>
        <Button display={handleCheckAdmin() ? 'block' : 'block'} onClick={()=>navigate('/transaction')} width={'100%'}>Transaction History</Button> 
        <Button display={handleCheckAdmin() ? 'block' : 'block'} onClick={()=>navigate('/playing-history')} width={'100%'}>Playing History</Button> 
        <Button display={handleCheckAdmin() ? 'block' : 'block'} onClick={()=>navigate('/withdrawal')} width={'100%'}>Withdrawal</Button> 
        <Button display={handleCheckAdmin() ? 'block' : 'block'} onClick={()=>navigate('/referral-income')} width={'100%'}>Referral Income</Button> 
        <Button display={handleCheckAdmin() ? 'block' : 'block'} onClick={()=>navigate('/balance-transfer')} width={'100%'}>Balance Transfer</Button>  
        <Button display={handleCheckAdmin() ? 'block' : 'block'} onClick={()=>navigate('/referral-balance-transfer')} width={'100%'}>Referral Balance Transfer</Button>  
        <Button display={handleCheckAdmin() ? 'block' : 'block'} onClick={()=>navigate('/change-password')} width={'100%'}>Change Password</Button> 
        <Button display={handleCheckAdmin() ? 'block' : 'block'} onClick={()=>navigate('/start-earning')} width={'100%'}>Start Earning</Button>
        <Button display={handleCheckAdmin() ? 'block' : 'block'} onClick={()=>navigate('/video-tutorial')} width={'100%'}>Video tutorial</Button>
        <Button display={handleCheckAdmin() ? 'block' : 'block'} onClick={()=>navigate('/support-center')} width={'100%'}>Support Center</Button>
        <Button display={handleCheckAdmin() ? 'block' : 'block'} onClick={()=>navigate('/reset-connection')} width={'100%'}>Reset Connection</Button>
      </VStack>
    </Container>
  );
};

export default UserProfilePage;
