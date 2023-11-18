import { Box, Container, Heading, Text } from '@chakra-ui/react';
import { useState } from 'react';
    
import { Link } from 'react-router-dom';
import BackupPasswordComponent from '../Components/Register/BackupPassword';

const BackupPassword = () => {

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    email: '',
    mainPassword: ''
  });
  
    return (  
        <Container mt={5}>
            <Heading mb={4} textAlign="center">
                Setup your backup password
            </Heading>
            <Text textAlign={'justify'}>Your account is 100% safe if you setup a backup password. By setting this password, no one else can access your account. No one can withdraw money from your account. No one can change your password and you will need this backup password if you want to forget your password.</Text>
            <Text textAlign={'justify'} color={'red'} fontWeight={'bold'}>You must remember your email and backup password well or write it down somewhere if you forget your email and backup password you will lose your account forever.</Text>
            <Box boxShadow="base" p={0} rounded="md" mt='2'>
                <BackupPasswordComponent 
                  formData={formData} 
                  setFormData={setFormData}
                />
                <Box p={5} display={'flex'} justifyContent={'center'}>
                    <Link to='/profile'>Profile</Link>
                </Box>
            </Box> 

        </Container>  
  );
};

export default BackupPassword;
