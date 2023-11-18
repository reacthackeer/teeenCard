import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  useToast
} from '@chakra-ui/react';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAddBackupPasswordMutation } from '../../App/features/auth/api';
const BackupPasswordComponent = ({ formData, setFormData }) => {

  const {email:adminEmail} = useSelector((state)=> state.auth.auth);
  const [provideBackupInfo, {data, isLoading, isError, error, isSuccess}] = useAddBackupPasswordMutation();
  const [debounceIsLoading, setDebounceIsLoading] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    setDebounceIsLoading(()=> false);
    e.preventDefault();  
    let { email, password, confirmPassword,  mainPassword } = formData;
    if (password && email && confirmPassword && adminEmail && mainPassword) {
      if (password === confirmPassword) {
        if (email === adminEmail) {
          if (mainPassword !== password) {
            provideBackupInfo({ email, password, mainPassword });
          } else {
            toast({
              title: 'Password and backup password must be different!',
              duration: 4000,
              status: 'warning',
              isClosable: true
            });
          }
        } else {
          toast({
            title: 'Please enter your account email',
            duration: 4000,
            status: 'warning',
            isClosable: true
          });
        }
      } else {
        toast({
          title: 'Password and confirm password must be the same',
          duration: 4000,
          status: 'warning',
          isClosable: true
        });
      }
    } else {
      toast({
        title: 'Invalid post request!',
        duration: 4000,
        status: 'warning',
        isClosable: true
      });
    }
  };
  
  // Create a debounced version of handleSubmit
  const debouncedHandleSubmit = _.debounce(handleSubmit, 1000); // Adjust the debounce wait time as needed
  
  // Use the debounced function in your code
  const handleDebouncedSubmit = (e) => {
    setDebounceIsLoading(()=> true);
    e.preventDefault();
    debouncedHandleSubmit(e);
  };

  useEffect(()=>{ 
    if(!isLoading && isSuccess && !isError){
      if(data && data?.id){
          setFormData({
            password: '',
            confirmPassword: '',
            email: '',
            mainPassword: ''
          });
          navigate('/profile')
          toast({
            title: "Successfully backup password added!",
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
    <Box>
      <form onSubmit={handleDebouncedSubmit}>
        <Stack spacing={4}>   
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              placeholder='Enter your email'
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </FormControl> 
          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              placeholder='Enter your password'
              name="mainPassword"
              value={formData.mainPassword}
              onChange={handleChange}
            />
          </FormControl> 
          <FormControl isRequired>
            <FormLabel>Backup Password</FormLabel>
            <Input
              type="password"
              placeholder='Enter your backup password'
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </FormControl> 

          <FormControl isRequired>
            <FormLabel>Confirm Password</FormLabel>
            <Input
              type="password"
              placeholder='Enter your confirm backup password'
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </FormControl> 

          <Button 
            type="submit" 
            colorScheme="teal"
            isLoading={isLoading || debounceIsLoading}
          >
            Confirm Backup Password
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default BackupPasswordComponent;
