import { Box, Container, Heading } from '@chakra-ui/react';
import { useState } from 'react';
    
import { Link } from 'react-router-dom';
import UserChangePasswordForm from '../Components/Register/UserChangePasswordForm';

const ChangePasswordPage = () => {

  const [formData, setFormData] = useState({
    password: '',
    oldPassword: '',
    backupPassword: '',
    confirmPassword: '',
    email: ''
  });

  

  return (  
        <Container mt={10}>
            <Heading mb={8} textAlign="center">
                Change Your Password
            </Heading>

            <Box>
                <UserChangePasswordForm formData={formData} setFormData={setFormData}/>
                <Box p={5} display={'flex'} justifyContent={'center'}>
                    <Link to='/profile'>Profile</Link>
                </Box>
            </Box> 

        </Container>  
  );
};

export default ChangePasswordPage;
