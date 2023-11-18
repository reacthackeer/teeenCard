import { allDatabase } from "../Components/Database/lesson/AllData";

const nihonUtils = {};

nihonUtils.getAllSerialData = () => {
    let result = allDatabase;
    let dataset2 = []
    result.forEach((info, index)=>{
        let smallCollection = [];
        info.forEach((info)=>{
            let newInfo = {...info, bengaliMeaning: '', example: '', lesson: index+1};
            smallCollection.push(newInfo);
        })
        dataset2.push(smallCollection);
        
    })

    let allDatabaseSingleCollection = dataset2.flat(Infinity);
    return allDatabaseSingleCollection;
}

nihonUtils.getAllRandomDatabase = () => {
    let data = nihonUtils.getAllSerialData();
        data = data.sort(()=> Math.random() - 0.5);
        data = data.sort(()=> Math.random() - 0.5);
        data = data.sort(()=> Math.random() - 0.5);
        data = data.sort(()=> Math.random() - 0.5);
        data = data.sort(()=> Math.random() - 0.5);
        data = data.sort(()=> Math.random() - 0.5);
        data = data.sort(()=> Math.random() - 0.5);
        data = data.sort(()=> Math.random() - 0.5);
        data = data.sort(()=> Math.random() - 0.5);
        return data;
}

nihonUtils.getSingleLessonData = (lesson) => {
    return nihonUtils.getAllSerialData().filter((info)=> info.lesson === lesson);
}

nihonUtils.getSingleLessonRandomData = (lesson) => {
    let data = nihonUtils.getAllSerialData().filter((info)=> info.lesson === lesson);
    data = data.sort(()=> Math.random() - 0.5);
    data = data.sort(()=> Math.random() - 0.5);
    data = data.sort(()=> Math.random() - 0.5);
    data = data.sort(()=> Math.random() - 0.5);
    data = data.sort(()=> Math.random() - 0.5);
    data = data.sort(()=> Math.random() - 0.5);
    data = data.sort(()=> Math.random() - 0.5);
    data = data.sort(()=> Math.random() - 0.5);
    data = data.sort(()=> Math.random() - 0.5);
    return data;
}

nihonUtils.getRangeLessonData = (startLesson, endLesson) => {
    let allLesson = [];
    nihonUtils.getAllSerialData().forEach((info)=>{
        if(startLesson-1 < info.lesson){
            if(info.lesson < endLesson+1){
                allLesson.push(info)
            }
        }
    }) 
    return allLesson;
}

nihonUtils.getRangeLessonRandomData = (startLesson, endLesson) => { 
    let allLesson = [];
    nihonUtils.getAllSerialData().forEach((info)=>{
        if(startLesson-1 < info.lesson){
            if(info.lesson < endLesson+1){
                allLesson.push(info)
            }
        }
    });

    let data = allLesson.sort(()=> Math.random() - 0.5);
    data = data.sort(()=> Math.random() - 0.5);
    data = data.sort(()=> Math.random() - 0.5);
    data = data.sort(()=> Math.random() - 0.5);
    data = data.sort(()=> Math.random() - 0.5);
    data = data.sort(()=> Math.random() - 0.5);
    data = data.sort(()=> Math.random() - 0.5);
    data = data.sort(()=> Math.random() - 0.5);
    data = data.sort(()=> Math.random() - 0.5);
    return data;
}


export { nihonUtils };

