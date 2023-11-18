import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const VideoTutorial = () => {
    const {videoTutorial, language} = useSelector((state)=> state.home);
    
    return (
        <Box p='2'>
            <VStack mt='4'>
                <Heading>{videoTutorial[0].title[language]}</Heading>
                <Text mt='2' textAlign={'justify'}>{videoTutorial[0].description[language]}</Text>
            </VStack>
            <Box textAlign={'center'} mt='2'>
            <Link to='https://youtube.com/@teeenCard' target='_blank'>Start Learning</Link>
            </Box>
        </Box>
    );
};

export default VideoTutorial;