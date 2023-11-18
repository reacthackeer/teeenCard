
const cardUtils = {}; 
cardUtils.timeManagements = {};
    

cardUtils.productRandomization = (array=[]) => {
    array = array.sort(()=> Math.random() - 0.5); 
    array = array.sort(()=> Math.random() - 0.5); 
    array = array.sort(()=> Math.random() - 0.5); 
    array = array.sort(()=> Math.random() - 0.5); 
    array = array.sort(()=> Math.random() - 0.5); 
    array = array.sort(()=> Math.random() - 0.5); 
    array = array.sort(()=> Math.random() - 0.5); 
    array = array.sort(()=> Math.random() - 0.5); 
    array = array.sort(()=> Math.random() - 0.5); 
    array = array.sort(()=> Math.random() - 0.5); 
    array = array.sort(()=> Math.random() - 0.5); 
    array = array.sort(()=> Math.random() - 0.5); 
    array = array.sort(()=> Math.random() - 0.5); 
    return array;
}

cardUtils.currentHaveUser = (array, user) => {
    let id = [];
    let newArray = array;
    array.forEach(info => {
        id.push(info.uid);
    })

    let index = id.indexOf(user.uid);
    newArray.splice(index, 1);
    return [...newArray, user];
}

cardUtils.threeCardPositionHandler = (carts) => {
    carts = carts.sort((a,b)=>a.card__symble__point - b.card__symble__point)
    let totalPoints = 0;
    // ------------------------------------
    // ----------Three card same start-------------
    //-------------------------------------
    if(carts[0].card__symble__point === carts[1].card__symble__point && carts[0].card__symble__point === carts[2].card__symble__point){
        totalPoints += (carts[0].card__symble__point * 10000000) + (carts[1].card__symble__point * 10000000) + (carts[2].card__symble__point * 10000000);
        return {point: totalPoints, position: 1, one: carts[0].card__symble__point, two: carts[1].card__symble__point, three: carts[2].card__symble__point};
    } 
    // ------------------------------------
    // ----------Three card same end-------------
    //-------------------------------------  

    // ------------------------------------
    // ----------sp running  start-------------
    //-------------------------------------
    if(carts[0].card__symble__point === 30 && carts[1].card__symble__point === 60 && carts[2].card__symble__point === 90 && carts[0].name === carts[1].name && carts[0].name === carts[2].name){
        totalPoints += (carts[0].card__symble__point * 1000000) + (carts[1].card__symble__point * 1000000) + (carts[2].card__symble__point * 1000000);
        return {point: totalPoints, position: 2,  one: carts[0].card__symble__point, two: carts[1].card__symble__point, three: carts[2].card__symble__point};
    }
    // ------------------------------------
    // ----------sp running  end-------------
    //-------------------------------------

    
    // ------------------------------------
    // ---------- running  start-------------
    //-------------------------------------
    if(carts[0].card__symble__point+20 === carts[2].card__symble__point && carts[0].card__symble__point+10 === carts[1].card__symble__point && carts[0].name === carts[1].name && carts[0].name === carts[2].name ){
        totalPoints += (carts[0].card__symble__point * 100000) + (carts[1].card__symble__point * 100000) + (carts[2].card__symble__point * 100000);
        return {point: totalPoints, position: 3, one: carts[0].card__symble__point, two: carts[1].card__symble__point, three: carts[2].card__symble__point};
    }else if(carts[0].card__symble__point === 20 && carts[1].card__symble__point === 30 && carts[2].card__symble__point === 140 && carts[0].name === carts[1].name && carts[0].name === carts[2].name){
        totalPoints += (carts[0].card__symble__point * 100000) + (carts[1].card__symble__point * 100000) + (carts[2].card__symble__point * 100000);
        return {point: totalPoints, position: 3, one: carts[2].card__symble__point, two: carts[1].card__symble__point, three: carts[0].card__symble__point};
    }
    // ------------------------------------
    // ---------- running  end-------------
    //-------------------------------------

    // ------------------------------------
    // ----------sp    start-------------
    //-------------------------------------
    if(carts[0].card__symble__point === 30 && carts[1].card__symble__point === 60 && carts[2].card__symble__point === 90){
        totalPoints += (carts[0].card__symble__point * 10000) + (carts[1].card__symble__point * 10000) + (carts[2].card__symble__point * 10000);
        return {point: totalPoints, position: 4, one: carts[0].card__symble__point, two: carts[1].card__symble__point, three: carts[2].card__symble__point};
    }
    // ------------------------------------
    // ----------sp    end-------------
    //-------------------------------------

    // ------------------------------------
    // ---------- run  start-------------
    //-------------------------------------
    
    if(carts[0].card__symble__point+20 === carts[2].card__symble__point && carts[0].card__symble__point+10 === carts[1].card__symble__point){
        totalPoints += (carts[0].card__symble__point * 1000) + (carts[1].card__symble__point * 1000) + (carts[2].card__symble__point * 1000);
        return {point: totalPoints, position: 5, one: carts[0].card__symble__point, two: carts[1].card__symble__point, three: carts[2].card__symble__point};
    }else if(carts[0].card__symble__point === 20 && carts[1].card__symble__point === 30 && carts[2].card__symble__point === 140){
        totalPoints += (carts[0].card__symble__point * 1000) + (carts[1].card__symble__point * 1000) + (carts[2].card__symble__point * 1000);
        return {point: totalPoints, position: 5, one: carts[2].card__symble__point, two: carts[1].card__symble__point, three: carts[0].card__symble__point};
    }
    // ------------------------------------
    // ---------- run  end-------------
    //-------------------------------------

    // ------------------------------------
    // ---------- color  start-------------
    //-------------------------------------
    if(carts[0].name === carts[1].name && carts[0].name === carts[2].name){
        totalPoints += (carts[0].card__symble__point * 100) + (carts[1].card__symble__point * 100) + (carts[2].card__symble__point * 100);
        return {point: totalPoints, position: 6, one: carts[0].card__symble__point, two: carts[1].card__symble__point, three: carts[2].card__symble__point};
    }
    // ------------------------------------
    // ---------- color  end-------------

    // TODO ---------- tee able -------------
    // TODO ---------- sp running -------------
    // TODO ---------- running -------------
    // TODO ---------- sp -------------
    // TODO ---------- run -------------`
    // TODO ---------- color -------------
    // TODO ---------- twin -------------
    // TODO ---------- top -------------

    //-------------------------------------
    let ides = []; 
    let twin = [];
    let twinIndex = [];
    carts.forEach((info, mainIndex) => {
        let index = ides.indexOf(info.card__symble__point);
        if( index === -1){
            ides.push(info.card__symble__point)
        }else{
            let infos = {
                index,
                info
            }
            twin.push(infos); 
            twinIndex.push(index)
            twinIndex.push(mainIndex)
        }
    })
    
    if(twin.length){       
        if(twinIndex[0] === 0){
            totalPoints += (carts[0].card__symble__point * 10) + (carts[1].card__symble__point * 10) + (carts[2].card__symble__point * 10);
            return {point: totalPoints, position: 7, one: carts[2].card__symble__point, two: carts[1].card__symble__point, three: carts[0].card__symble__point}; 
        }else{
            totalPoints += (carts[0].card__symble__point * 10) + (carts[1].card__symble__point * 10) + (carts[2].card__symble__point * 10);
            return {point: totalPoints, position: 7, one: carts[0].card__symble__point, two: carts[1].card__symble__point, three: carts[2].card__symble__point}; 
        }
    } else{
        totalPoints += (carts[0].card__symble__point * 1) + (carts[1].card__symble__point * 1) + (carts[2].card__symble__point * 1);
        return {point: totalPoints, position: 8, one: carts[0].card__symble__point, two: carts[1].card__symble__point, three: carts[2].card__symble__point}; 
    }
}
cardUtils.winnerCheckerHandler = (cardOne, cardTwo) => {
    let myResult = cardUtils.threeCardPositionHandler(cardOne);
    let prevUserResult = cardUtils.threeCardPositionHandler(cardTwo); 

            if(myResult.position < prevUserResult.position){ 
                return true;
            } 
    
            if(myResult.position > prevUserResult.position){ 
                return false;
            }
    
            if(myResult.position === prevUserResult.position){
    
                    if(myResult.three > prevUserResult.three){ 
                        return true;
                    }
    
                    if(myResult.three < prevUserResult.three){ 
                        return false;
                    }
    
                    if(myResult.three === prevUserResult.three){
    
                        if(myResult.two > prevUserResult.two){ 
                            return true;
                        }
        
                        if(myResult.two < prevUserResult.two){ 
                            return false;
                        }
        
                        if(myResult.two === prevUserResult.two){
                            
                            if(myResult.one > prevUserResult.one){ 
                                return true;
                            }
            
                            if(myResult.one < prevUserResult.one){ 
                                return false;
                            }
            
                            if(myResult.one === prevUserResult.one){ 
                                return false; 
                            } 
                            
                        } 
                }
            }
}
cardUtils.cardCompareHandler = (boardInfo, currentUser) => {
    let allResult = [];
    boardInfo.playing.forEach((info) => {
        if(info.userId !== currentUser.userId && info.packed === false){
            let cr = cardUtils.winnerCheckerHandler(currentUser.card, info.card);
            allResult.push(cr);
        }
    })
    let index = allResult.indexOf(false);
    if(index === -1){
        return true;
    }else{
        return false
    }
};
cardUtils.sideHandlerWithTwoUserCardCompare = (myCard, nextUserCard) =>{
    return cardUtils.winnerCheckerHandler(myCard, nextUserCard);
}
const cart__img__src = ["k2.png" ,"k3.png" ,"k4.png" ,"k5.png" ,"k6.png" ,"k7.png" ,"k8.png" ,"k9.png" ,"k10.png" ,"kj.png" ,"kq.png" ,"kk.png" ,"ka.png" ,"l2.png" ,"l3.png" ,"l4.png" ,"l5.png" ,"l6.png" ,"l7.png" ,"l8.png" ,"l9.png" ,"l10.png" ,"lj.png" ,"lq.png" ,"lk.png" ,"la.png" ,"p2.png" ,"p3.png" ,"p4.png" ,"p5.png" ,"p6.png" ,"p7.png" ,"p8.png" ,"p9.png" ,"p10.png" ,"pj.png" ,"pq.png" ,"pk.png" ,"pa.png" ,"s2.png" ,"s3.png" ,"s4.png" ,"s5.png" ,"s6.png" ,"s7.png" ,"s8.png" ,"s9.png" ,"s10.png" ,"sj.png" ,"sq.png" ,"sk.png" ,"sa.png"]

const getAllRandomCards = () => { 

    let cards__infos = [];

    cart__img__src.forEach((info, index) => { 
    let name = info.split('.')[0];  
    let nameE = name.split('')[0];
    let symbleE = name.slice(1,name.length).toUpperCase();

    // get card infos

    let card__name = ''; 
    let card__symble = symbleE;
    let card__symble__point = 0; 
    let card__point = 0;
    
    if(Number(card__symble)){
    card__point += Number(card__symble);
    }else{
        if(card__symble === 'J' || card__symble === 'Q' || card__symble === 'K'){
        card__point += 10;
        }else if (card__symble === 'A'){
        card__point += 1;
        }
    } 

    if(Number(card__symble)){
        let num = Number(card__symble); 
        card__symble__point += num * 10;
    }else{ 
        if(card__symble === 'J'){
        card__symble__point += 11 * 10;
        }
        if(card__symble === 'Q'){
        card__symble__point += 12 * 10;
        }
        if(card__symble === 'K'){
        card__symble__point += 13 * 10;
        }
        if(card__symble === 'A'){
        card__symble__point += 14 * 10;
        }
    }


    if(nameE==='k'){
        card__name = 'Clubs'
    }else if(nameE === 's'){
        card__name = 'Hearts'
    }else if(nameE === 'l'){
        card__name = 'Diamonds'
    }else if(nameE === 'p'){
        card__name  = 'Spades'
    }  

    let cardInfo = {
        name: card__name,
        img__src: '/cards/'+info,
        card__index: index+1,
        card__symble,
        card__point,
        card__symble__point
    }

    cards__infos.push(cardInfo);
    }) 

    cards__infos =  cardUtils.productRandomization(cards__infos);

    return cards__infos;

}

const handleGetCardByPlayer = (player) => {
    let allPlayerCard = []; 
    let newCards = [...getAllRandomCards()]; 
    for(let i = 1; i<= player; i++){
        let playerCard = newCards.splice(0,3);
        playerCard = playerCard.sort((a,b)=>a.card__symble__point - b.card__symble__point);
        allPlayerCard.push(playerCard)
    } 
    // // return allPlayerCard;
    // let isThree = false;
    // allPlayerCard.forEach((info) => {
    //     let one = info[0].card__symble;
    //     let two = info[1].card__symble;
    //     let three = info[2].card__symble; 
    //     if(one == two && one == three){ 
    //         isThree = true;
    //     }
    // })
    // if(!isThree){
    //     return allPlayerCard;
    // }else{
    //     return handleGetCardByPlayer(player);
    // }

    return allPlayerCard;

}
const handleGetMyCardsByRandomly = (cards) => {
    let newCards = cards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        return newCards;
}
const handleGetMyUserByRandomly = (cards) => {
    let newCards = cards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        newCards =  newCards.sort(()=> Math.random() - 0.5);
        return newCards.slice(0,17);
}
const handleGetCardByPlayerHome = (player) => {
    let allPlayerCard = []; 
    let newCards = [...getAllRandomCards()]; 
    for(let i = 1; i<= player; i++){
        let playerCard = newCards.splice(0,3);
        playerCard = playerCard.sort((a,b)=>a.card__symble__point - b.card__symble__point);
        allPlayerCard.push(playerCard)
    } 
    // return allPlayerCard;
    let isThree = false;
    allPlayerCard.forEach((info) => {
        let one = info[0].card__symble;
        let two = info[1].card__symble;
        let three = info[2].card__symble; 
        if(one == two && one == three){ 
            isThree = true;
        }
    })

    return allPlayerCard; 
}

module.exports = { cardUtils, getAllRandomCards, handleGetCardByPlayer, handleGetCardByPlayerHome, handleGetMyCardsByRandomly };
