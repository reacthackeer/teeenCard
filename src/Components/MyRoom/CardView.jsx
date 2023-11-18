    import { Box, Button, Image, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { resetRoomFinish } from '../../App/features/room/roomSlice';


    const PlayingCardView = () => {

    let [currentIndex, setCurrentIndex] = useState(0);

    const [languages, setLanguages] = useState([]);
    let [currentLanguage, setCurrentLanguage] = useState('');
    
    const {nameWithCard} = useSelector((state)=> state.room);
    let {userId} = useSelector((state)=> state.auth.auth);
    const dispatch = useDispatch();
    let [currentUser, setCurrentUser] = useState(nameWithCard[0]); 
    const handleNext = () => { 
        let newCurrentIndex = currentIndex+1;
        if(nameWithCard[newCurrentIndex]){
            setCurrentUser(()=> nameWithCard[newCurrentIndex]);
            setCurrentIndex((prevState)=> prevState+1);
        }
    };

    const handlePrev = () => {
        let newCurrentIndex = currentIndex-1;
        if(nameWithCard[newCurrentIndex]){
            setCurrentUser(()=> nameWithCard[newCurrentIndex]);
            setCurrentIndex((prevState)=> prevState-1);
        }
    };

    const handleCloseCard = () => {
        let confirmResult = window.confirm('Are sure to close player card view?');
        if(confirmResult){
            dispatch(resetRoomFinish())
        }
    }
    
    useEffect(()=>{
        if(currentUser && currentUser?.name && currentUser?.packedReasonMess?.length > 0){
            let languagesD = [];
            currentUser.packedReasonMess.forEach((info)=>{
                for(let language in info){
                    languagesD.push(language)
                }
            })

            setLanguages(()=> languagesD);
            setCurrentLanguage(()=> languagesD[languagesD.length-1]);
        }
    },[currentUser])

    return (
        <Box 
            className='all__player__single__card__view' 
            rounded={'md'}
        >   
            <Box className='three__card__view__container'>
                {
                    currentUser.card.map((info, index)=> { 
                        return <Image position={index === 0 ? 'relative': 'absolute'} className={`my__card__image my__card__image__${index}`} key={index} src={`${info.img__src}`} title={info.img__src+"__"+index} alt={info.img__src+"__"+index}/>
                    })
                }
            </Box>
            {
                nameWithCard && nameWithCard.length > 1 && currentUser?.packedReasonMess.length > 0 && <Box my='2'>
                    {
                        currentUser?.packedReasonMess.map((info,index)=>{
                            
                            return(
                                <Text 
                                    key={index}
                                    textAlign={'justify'}
                                    mb='2'
                                >{info[currentLanguage] ? info[currentLanguage] : ''}</Text>
                            )
                        })
                    }
                </Box>
            }
            {
                nameWithCard && nameWithCard.length > 1 && languages.length > 1 > 0 && <Box my='2'>
                    {
                        languages.map((info,index)=>{
                            
                            return(
                                <Button 
                                    key={index}
                                    ml='1'
                                    display={currentLanguage === info ? 'none' : 'inline'}
                                    onClick={()=> setCurrentLanguage(info)}
                                >{info}</Button>
                            )
                        })
                    }
                </Box>
            }
            <Text fontSize="lg" fontWeight="bold" mt="2" textAlign={'center'}>
                {currentUser.userId === userId ? 'Your Card' : currentUser.name}
            </Text> 
        
            <Box mt='2'>
                <Button 
                    onClick={handlePrev}
                    isDisabled={currentIndex === 0}
                >
                    Previous
                </Button>
                <Button 
                    onClick={handleNext} 
                    ml="2"
                    isDisabled={currentIndex === nameWithCard.length -1}
                >
                    Next
                </Button>
                <Button 
                    onClick={handleCloseCard} 
                    ml="2" 
                >
                    Close
                </Button>
            </Box>
        </Box>
    );
    };

    export default PlayingCardView;
