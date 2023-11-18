import { Box, Button, HStack, Heading, Image, Text, VStack, useToast } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useReactPWAInstall } from 'react-pwa-install';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateSystemLanguage } from '../App/features/Home/homeSlice';
const HomeGame = () => {
    const navigate = useNavigate();
    const {infos, language} = useSelector((state)=> state.home);
    const {isLoggedIn, auth} = useSelector((state)=> state.auth); 
    
    const dispatch = useDispatch();
    const [one, setOne] = useState(infos[0]);

    const {pwaInstall, supported, isInstalled} = useReactPWAInstall()
    const handleNavigatePage = (destination) => {
        navigate(destination)
    }
    const toast = useToast();
    const handleDownloadApplication = () => {
        if(supported() && !isInstalled()){
            pwaInstall({
                title: 'Install teeenCard app in your device',
                logo: '/logo.png',
                description: 'Most popular apps for teen patti game lover if your like this please download and play'
            }).then((res)=>{
                toast({
                    title: 'Successfully Installed!',
                    status: 'success',
                    isClosable: true
                })
            })
        }
    }

    const handleChangeLanguage = () => {
        let newLanguage = language;
        if(language === 'english'){
            newLanguage = 'bengali'
        }else{
            newLanguage = `english`
        }
        if(language){
            localStorage.setItem('system__language', newLanguage);
            dispatch(updateSystemLanguage(newLanguage));
        }
    }
    return (
        <Box p='2'> 
            <Box
                width={'100%'}
                height={'200px'}
                marginY={'20px'}
                display={'flex'}  
                position={'relative'}  
                justifyContent={'center'}
                alignItems={'center'}

            >
                <Box borderRadius={'50%'} overflow={'hidden'}>
                    <Image position={'relative'} bg='red' width={'fit-content'}  src='/logo.png'></Image>
                </Box>
            </Box>
            {
                infos && infos?.length &&
                <Box>
                    {
                        infos.map((info, index)=> {
                            return(
                                <VStack key={index} my='5'>
                                    <Heading textAlign={'center'} fontSize={'larger'}>{info.title[language]}</Heading>
                                    <Text textAlign={'justify'}>{info.description[language]}</Text>
                                </VStack>
                            )
                        })
                    }
                </Box>
            }
            <HStack mt='2'>
                {isLoggedIn ? <Button width={'100%'} onClick={()=> handleNavigatePage('/profile')}>Profile</Button> : 
                    (
                        <React.Fragment>
                            <Button width={'65%'} onClick={()=> handleNavigatePage('/register?999999999999')}>Create New Account</Button>
                            <Button width={'35%'} onClick={()=> handleNavigatePage('/login')}>Login</Button>
                        </React.Fragment>
                    )}
            </HStack>
            {!isInstalled() && supported() && <HStack mt='2'>
                <Button width={'100%'} onClick={handleDownloadApplication}>Download our application</Button>
            </HStack>}
            <HStack mt='2'>
                <Button width={'65%'} onClick={handleChangeLanguage}>Change Language</Button> <Button width={'35%'}>{language.toUpperCase()}</Button>
            </HStack>
            <HStack mt='2'>
                <Button width={'100%'} onClick={()=> handleNavigatePage('/video-tutorial')}>Video tutorial</Button>
            </HStack>
            <HStack mt='2'>
                <Button width={'100%'} onClick={()=> handleNavigatePage('/support-center')}>Support Center</Button>
            </HStack>
        </Box>
    );
};

export default HomeGame;