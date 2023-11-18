import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack
} from '@chakra-ui/react';
import _ from 'lodash';
const UserRegisterForm = ({secondLoading, setSecondLoading, onNext,formData, setFormData, isLoading }) => {

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };



const debouncedOnNext = _.debounce(onNext, 700);


const handleSubmit = (e) => {
  e.preventDefault();
  debouncedOnNext();
  setSecondLoading(()=> true);
};

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Stack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              name="name"
              placeholder='Enter your name'
              value={formData.name}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              name="email"
              placeholder='Enter your email'
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
              name="password"
              placeholder='Enter your password'
              value={formData.password}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Confirm Password</FormLabel>
            <Input
              type="password"
              name="confirmPassword"
              placeholder='Enter your confirm password'
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Promo Code</FormLabel>
            <Input
              type="text"
              name="promoCode"
              placeholder='Enter your promo code'
              value={formData.promoCode}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Referral Code</FormLabel>
            <Input
              type="text"
              name="referralCode"
              placeholder='Enter your referral code'
              value={formData.referralCode}
              onChange={handleChange}
              isDisabled={true}
            />
          </FormControl>

          <Button type="submit" isLoading={isLoading || secondLoading} colorScheme="teal">
            Sign Up
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default UserRegisterForm;
