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
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useChangePasswordMutation } from '../../App/features/auth/api';
import { userReset } from '../../App/features/auth/authSlice';
const UserChangePasswordForm = ({ formData, setFormData }) => {

  const {email: adminEmail} = useSelector((state)=> state.auth.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const [debounceLoading, setDebounceLoading] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();  
    setDebounceLoading(()=> false);
    let {email, password, confirmPassword, oldPassword, backupPassword} = formData;
    if(password && email && confirmPassword && adminEmail && oldPassword && backupPassword){
      if(password === confirmPassword){
          if(email === adminEmail){
              if(password !== oldPassword){
                if(backupPassword !== oldPassword){
                    if(backupPassword !== password){
                        provideBackupInfo({email, password, oldPassword, backupPassword});
                    }else{
                      toast({
                        title: 'Backup password and password must be different!',
                        duration: 4000,
                        status: 'warning',
                        isClosable: true
                      })
                    }
                }else{
                  toast({
                    title: 'Backup password and old password must be different!',
                    duration: 4000,
                    status: 'warning',
                    isClosable: true
                  })
                }
              }else{
                toast({
                  title: 'Old password and new password must be different!',
                  duration: 4000,
                  status: 'warning',
                  isClosable: true
                })
              }
          }else{
            toast({
              title: 'Please enter your account email',
              duration: 4000,
              status: 'warning',
              isClosable: true
            })
          }
      }else{
        toast({
          title: 'Password and confirm password must be same',
          duration: 4000,
          status: 'warning',
          isClosable: true
        })
      }
    }else{
      toast({
        title: 'Invalid post request!',
        duration: 4000,
        status: 'warning',
        isClosable: true
      })
    }
  };

  const [provideBackupInfo, {data, isLoading, isError, error, isSuccess}] = useChangePasswordMutation();
  
  useEffect(()=>{ 
    if(!isLoading && isSuccess && !isError){
      if(data && data?.id){
          setFormData({
            password: '',
            oldPassword: '',
            backupPassword: '',
            confirmPassword: '',
            email: ''
          });
          dispatch(userReset());
          navigate('/login');
          toast({
            title: "Successfully password changed!",
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

  const changePasswordDebounce = _.debounce(handleSubmit,1000);

  const handleFirstSubmit = (e) => {
    e.preventDefault();
    setDebounceLoading(()=> true);
    changePasswordDebounce(e);
  }

  return (
    <Box>
      <form onSubmit={handleFirstSubmit}>
        <Stack spacing={4}>   
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              placeholder='Enter your email password'
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </FormControl> 
          <FormControl isRequired>
            <FormLabel>Backup Password</FormLabel>
            <Input
              type="password"
              placeholder='Enter your old password'
              name="backupPassword"
              value={formData.backupPassword}
              onChange={handleChange}
            />
          </FormControl> 
          <FormControl isRequired>
            <FormLabel>Old Password</FormLabel>
            <Input
              type="password"
              placeholder='Enter your old password'
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
            />
          </FormControl> 
          <FormControl isRequired>
            <FormLabel>New Password</FormLabel>
            <Input
              type="password"
              placeholder='Enter your password'
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </FormControl> 

          <FormControl isRequired>
            <FormLabel>Confirm New Password</FormLabel>
            <Input
              type="password"
              placeholder='Enter your confirm password'
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </FormControl> 

          <Button 
            type="submit" 
            colorScheme="teal"
            isLoading={isLoading || debounceLoading}
          >
            Update Password
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default UserChangePasswordForm;
