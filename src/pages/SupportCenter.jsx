import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import React from 'react';
import { useSelector } from 'react-redux';

const SupportCenter = () => {
    const {language} = useSelector((state)=> state.home);
    const {supportCenter} = useSelector((state)=> state.translate);
    
    return (
        <Box p='2'>
            <VStack mt='4'>
                <Heading>{supportCenter[0].title[language]}</Heading>
                <Text mt='2' textAlign={'justify'}>{supportCenter[0].description[language]}</Text>
            </VStack>
            <Box textAlign={'center'} mt='5'> 
                <Box  mt='1' bg='green.100' p={2}>
                    <a href = "mailto:teeenCard@gmail.com?subject=Enter your subject here" target='_blank'>
                        Get Support Via Email
                    </a>
                </Box>
                <Box mt='1' bg='green.100' p={2}>
                    <a href = "https://facebook.com/teeenCard" target='_blank'>
                        Live agent via facebook
                    </a>
                </Box> 
                <Box mt='1' bg='green.100' p={2}>
                    <a href = "https://facebook.com/teeencardpage" target='_blank'>
                        Our official facebook page
                    </a>
                </Box>
                <Box mt='1' bg='green.100' p={2}>
                    <a href = "https://twitter.com/teeenCard" target='_blank'>
                        Our official twitter page
                    </a>
                </Box>
                <Box mt='1' bg='green.100' p={2}>
                    <a href = "https://facebook.com/groups/1797997707306415" target='_blank'>
                        Our public facebook group get support by player and moderator
                    </a>
                </Box>
                <Box mt='1' bg='green.100' p={2}>
                    <a href = "https://facebook.com/groups/847227590180361" target='_blank'>
                        Our private group for player helpline
                    </a>
                </Box>
                <Box mt='1' bg='green.100' p={2}>
                    <a href = "https://facebook.com/groups/1440469280084146" target='_blank'>
                        Our private group for agent helpline
                    </a>
                </Box>
                <Box mt='1' bg='green.100' p={2}>
                    <a href = "https://youtube.com/@teeenCard" target='_blank'>
                        Our youtube channel
                    </a>
                </Box>
            </Box>
        </Box>
    );
};

export default SupportCenter;