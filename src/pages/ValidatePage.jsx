import { Box, Container, Heading } from '@chakra-ui/react';
import { useState } from 'react';
    
import { Link } from 'react-router-dom';
import UserValidateForm from '../Components/Register/UserValidateForm';
import Cover from '../Cover';

const ValidatePage = () => {

  const [formData, setFormData] = useState({
    password: '', 
    email: '',
    phone: ''
  });

  

  return ( 
    <Cover>
        <Container maxW="sm" mt={10}>
            <Heading mb={8} textAlign="center">
                Verify Account
            </Heading>

            <Box boxShadow="base" p={8} rounded="md">
                <UserValidateForm formData={formData} setFormData={setFormData}/>
                <Box p={5} display={'flex'} justifyContent={'center'}>
                    <Link to='/profile'>Profile</Link>
                </Box>
            </Box> 

        </Container> 
      </Cover>
  );
};

export default ValidatePage;
