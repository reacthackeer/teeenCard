import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack
} from '@chakra-ui/react';
import { useSelector } from 'react-redux';

const UserLoginForm = ({secondLoading, formData, setFormData, handleSubmit, isLoading }) => {

    const {language} = useSelector((state)=> state.home);
  const {loginPage} = useSelector((state)=> state.translate);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Stack spacing={4}> 
          <FormControl isRequired>
            <FormLabel
              fontSize={'14'}
            >{loginPage.emailField[language]}</FormLabel>
            <Input
              type="email"
              name="email"
              placeholder={loginPage.emailPlace[language]}
              value={formData.email}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel
              fontSize={'14'}
            >{loginPage.phoneField[language]}</FormLabel>
            <Input
              type="tel"
              name="phone"
              placeholder={loginPage.phonePlace[language]}
              value={formData.phone}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel
              fontSize={'14'}
            >{loginPage.passwordField[language]}</FormLabel>
            <Input
              type="password"
              placeholder={loginPage.passwordPlace[language]}
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </FormControl> 

          <Button 
            type="submit" 
            colorScheme="teal" 
            isLoading={isLoading || secondLoading}
          >
            {loginPage.login[language]}
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default UserLoginForm;
