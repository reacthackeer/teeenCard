import { Box, Container, Heading, useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
    
import _ from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginUserMutation } from '../App/features/auth/api';
import { userLoggedIn } from '../App/features/auth/authSlice';
import UserLoginForm from '../Components/Register/UserLoginForm';
 
const LoginPage = () => {

  const {language} = useSelector((state)=> state.home);
  const {loginPage} = useSelector((state)=> state.translate);
  const toast = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [secondLoading, setSecondLoading] = useState(false);
  const [provideInfo, {data, isLoading, isSuccess, isError, error}] = useLoginUserMutation(); 
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '', 
  });

  useEffect(()=>{ 
    if(!isLoading && isSuccess && !isError){
      if(data && data?.token){ 
        dispatch(userLoggedIn({auth: data.auth, isLoggedIn: true, isFilled: true, token: data.token}))
        localStorage.setItem('user__id', data.auth.userId)
        navigate('/profile');
        localStorage.setItem('token', JSON.stringify(data.token))
        toast({
          title: 'Successfully logged in!',
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
  
// Your original handleSubmit function
const handleSubmit = (e) => { 
  setSecondLoading(()=> false);
  e.preventDefault();
  let prevUserId = localStorage.getItem('user__id');
  if (!prevUserId) {
    prevUserId = nuid(10);
  }
  if (formData.email && formData.password && formData.phone) {
    provideInfo({ ...formData, prevUserId });
  } else {
    toast({
      title: 'Fill up all the fields!',
      duration: 4000,
      isClosable: true,
      status: 'error',
    });
  }
};

// Create a debounced version of handleSubmit
const debouncedHandleSubmit = _.debounce(handleSubmit, 700); // Adjust the debounce wait time as needed

// Use the debounced function in your event handler
const handleDebouncedSubmit = (e) => {
  setSecondLoading(()=> true);
  e.preventDefault();
  debouncedHandleSubmit(e);
};




  return (  
        <Container maxW="sm" mt={10}>
            <Heading mb={8} size={'lg'} textAlign="center">
                {loginPage.login[language]}
            </Heading>
    
            <Box>
                <UserLoginForm 
                  formData={formData} 
                  isLoading={isLoading} 
                  handleSubmit={handleDebouncedSubmit} 
                  setFormData={setFormData}
                  secondLoading={secondLoading}
                  setSecondLoading={setSecondLoading}
                />
                <Box p={5} display={'flex'} justifyContent={'center'}>
                    <Link to='/register?999999999999'>{loginPage.createField[language]}</Link>
                </Box>
            </Box> 

        </Container>  
  );
};

export default LoginPage;
