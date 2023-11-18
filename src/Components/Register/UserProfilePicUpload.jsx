import {
  Box,
  Button,
  Center,
  FormLabel,
  Image,
  Input
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { useUploadSingleImageMutation } from '../../App/features/upload/api';

const UserProfilePicUpload = ({ onPrev, onComplete, profilePic, setProfilePic, pic, setPic }) => {


  const handlePicChange = (e) => {
    const file = e.target.files[0];
    setPic(file)
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = () => {
      setProfilePic(reader.result);
    };
  };
  const [provideFile,{data, isLoading, isSuccess, isError}] = useUploadSingleImageMutation();
  const handleSubmit = (e) => {
    e.preventDefault(); 
    let formData = new FormData();
      formData.append('image', pic);
      provideFile(formData);
  };
  useEffect(()=>{
    // console.log({data, isLoading, isSuccess, isError});
  },[data, isLoading, isSuccess, isError])
  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Center mb={4}>
          {profilePic ? (
            <Image src={profilePic} alt="Profile Pic" maxH="200px" maxW="200px" />
          ) : (
            <Box borderWidth="1px" p={4} borderRadius="md">
              <FormLabel htmlFor="profile-pic" cursor="pointer">
                Choose Profile Picture
              </FormLabel>
              <Input
                type="file"
                id="profile-pic"
                accept="image/*"
                display="none"
                onChange={handlePicChange}
              />
            </Box>
          )}
        </Center>
        
        <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}> 
            <Button size={'sm'} onClick={onPrev} mr={4}>
                Previous
            </Button>
            <Button size={'sm'} type="submit" colorScheme="teal">
                Update
            </Button>
        </Box>
      </form>
    </Box>
  );
};

export default UserProfilePicUpload;
