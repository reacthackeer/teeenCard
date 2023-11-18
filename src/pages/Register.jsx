import { Box, Container, Heading, useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
    
import nuid from 'number-uid';
import { useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useRegisterUserMutation } from '../App/features/auth/api';
import { userLoggedIn } from '../App/features/auth/authSlice';
import UserRegisterForm from '../Components/Register/UserRegisterForm';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [myRef, setMyRef] = useState('');
  const [prevUserId, setPrevUserId] = useState('');
  const params =  useLocation().search.split('?')[1]; 
  const [provideInfo, {data, isLoading, isSuccess, isError, error}] = useRegisterUserMutation(); 
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    promoCode: '',
    referralCode: params,
  });
  const toast = useToast();
  const [secondLoading, setSecondLoading] = useState(false);
  const handleNextStep = () => { 
    setSecondLoading(()=> false); 
    if(formData && formData.name && formData.email && formData.phone && formData.password && formData.confirmPassword && formData?.promoCode && formData.referralCode && userId && myRef){
      if(formData.password === formData.confirmPassword){
        let postData = {
          name: formData.name,
          email:  formData.email,
          phone: formData.phone,
          password: formData.password, 
          referralCode: formData.referralCode,
          promoCode: formData.promoCode,
          currentBalance: 0,
          demoBalance: 10000, 
          offlineBalance: 0, 
          userId: userId, 
          myRef,
          prevUserId: prevUserId,
          currentUserId: userId
        }
        provideInfo(postData);
      }else{
        toast({
          title: 'Password and Confirm Password must me same',
          duration: 4000,
          status: 'error',
          isClosable: true
        })
      }
    }else{

        toast({
          title: 'Please fill up all the fields!',
          duration: 4000,
          status: 'error',
          isClosable: true
        })
    }
  }

  useEffect(()=>{ 
    if(!isLoading && isSuccess && !isError){
      if(data && data?.token){
        dispatch(userLoggedIn({auth: data.auth, isLoggedIn: true, isFilled: true, token: data.token}))
        localStorage.setItem('user__id', data.auth.userId)
        navigate('/profile');
        localStorage.setItem('token', JSON.stringify(data.token))
        toast({
          title: 'Successfully account created',
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

  useEffect(()=>{
      let newUserId = localStorage.getItem('user__id') || '';
      if(!newUserId){
        newUserId = nuid(10);
      }
    let newMyRef = nuid(10);
    let currentUserId = nuid(10);

    setUserId(()=> currentUserId);
    setMyRef(()=> newMyRef);
    setPrevUserId(()=> newUserId);
  },[])
  return (  
        <Container maxW="sm" mt={10}>
            <Heading mb={8} size={'lg'} textAlign="center">
              User Registration
            </Heading>

            <Box>
            <UserRegisterForm 
              formData={formData} 
              isLoading={isLoading} 
              setFormData={setFormData} 
              onNext={handleNextStep} 
              secondLoading={secondLoading}
              setSecondLoading={setSecondLoading}
            />
                <Box p={5} display={'flex'} justifyContent={'center'}>
                    <Link to='/login'>Login</Link>
                </Box>
            </Box> 

        </Container>  
  );
};

export default RegisterPage;
