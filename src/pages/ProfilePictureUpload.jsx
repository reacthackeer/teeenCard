    import { Box, Button, CircularProgress, Heading, Text, useToast } from "@chakra-ui/react";
import axios from "axios";
import _ from 'lodash';
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { updateUserAuthInfo } from "../App/features/auth/authSlice";

    function ProfilePictureUpload() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [debounceIsLoading, setDebounceIsLoading] = useState(false);
    const {userId} = useSelector((state)=> state.auth.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const toast = useToast();
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    // const handleUpload = () => {
    //     if(!selectedFile) return;
    //     setUploading(()=> true);
    //     const formData = new FormData();
    //     formData.append('file', selectedFile);
    //     formData.append('userId', userId);
    //     axios.post('http://localhost:3000/api/upload',formData,{
    //         headers:{
    //             "Content-Type": 'multipart/form-data'
    //         }
    //     }).then((res)=>{ 
    //         if(res && res.data){ 
    //             setUploading(()=> false);
    //             dispatch(updateUserAuthInfo({auth: res.data}));
    //             toast({
    //                 title: "Successfully profile image uploaded",
    //                 status: 'success',
    //                 isClosable: true
    //             });
    //             navigate('/profile')
    //         }
    //     }).catch((error)=>{ 
    //         setUploading(()=> false);
    //         toast({
    //             title: error?.data?.error?.message || "Internal server error!",
    //             duration: 4000,
    //             isClosable: true,
    //             status: 'error'
    //         })
    //     })
    // };

const handleUpload = () => {
    setDebounceIsLoading(()=> false);
    if (!selectedFile) return;
    setUploading(() => true);
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('userId', userId);
    
    axios
        .post('http://localhost:3000/api/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
        })
        .then((res) => {
        if (res && res.data) {
            setUploading(() => false);
            dispatch(updateUserAuthInfo({ auth: res.data }));
            toast({
            title: 'Successfully profile image uploaded',
            status: 'success',
            isClosable: true,
            });
            navigate('/profile');
        }
        })
        .catch((error) => {
        setUploading(() => false);
        toast({
            title: error?.data?.error?.message || 'Internal server error!',
            duration: 4000,
            isClosable: true,
            status: 'error',
        });
        });
    };
    
    // Create a debounced version of handleUpload
    const debouncedHandleUpload = _.debounce(handleUpload, 1000); // Adjust the debounce wait time as needed
    
    // Use the debounced function in your code
    const handleDebouncedUpload = () => {
        setDebounceIsLoading(()=> true);
        debouncedHandleUpload();
    };


    return (
        <Box 
            display={'flex'}
            flexDir={'column'}
            justifyContent={'center'}
            alignItems={'center'}
        >
        <Heading fontSize={'2xl'} my='5'>Upload your profile picture</Heading>
        <input type="file" onChange={handleFileChange} />
        <Button 
            onClick={handleDebouncedUpload} 
            disabled={uploading} mt={3}
            isLoading={uploading || debounceIsLoading} 
        >
            Upload
        </Button>
        {uploading && (
            <Box mt="3">
            <CircularProgress value={progress} />
            <Text>{progress}% Uploaded</Text>
            </Box>
        )}
        </Box>
    );
    }

    export default ProfilePictureUpload;
