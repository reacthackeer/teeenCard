import { Box, Image, Text } from '@chakra-ui/react';
import React from 'react';

const LoadingComponent = () => {
    return (
        <div className='loading__container'>
            <Box
                width={'fit-content'}
                height={'fit-content'}
                overflow={'hidden'}
                borderRadius={'50%'}
            >
                <Image src='/logo.png'/> 
            </Box>
            <Text mt='3'>Loading.....</Text>
        </div>
    );
};

export default LoadingComponent;