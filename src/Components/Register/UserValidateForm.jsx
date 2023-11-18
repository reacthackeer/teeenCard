import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack
} from '@chakra-ui/react';

const UserValidateForm = ({ formData, setFormData }) => {

  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate form data and handle form submission here
  };

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Stack spacing={4}> 
          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              name="email"
              placeholder='Enter your email address'
              value={formData.email}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Phone</FormLabel>
            <Input
              type="tel"
              name="phone"
              placeholder='Enter your phone number'
              value={formData.phone}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              placeholder='Enter your password'
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </FormControl> 

          <Button type="submit" colorScheme="teal">
            Next
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default UserValidateForm;
