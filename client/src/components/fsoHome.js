import Header from './fsoHeader.js'
import Main from './fsoMain.js'
import { useState } from 'react';

export default function FakeStackOverflow({userData, setUserData}) {
  const [pageIndex, setPageIndex] = useState(0);
  const [questsData, setQuestsData] = useState([]);
  const [questIndex, setQuestIndex] = useState(0);
  const [tagsData, setTagsData] = useState([]);
  const [sortBy, setSortBy] = useState(0);

  // useEffect(() => { 
  //   async function fetchData(){
  //     await axios.get('http://localhost:8000/questions').then(res => { setQuestsData(res.data); }); 
  //     await axios.get('http://localhost:8000/tags').then(res => { setTagsData(res.data); }); 
  //   }
    
  // });
  
  return (
    <>
      <Header 
        setQuestsData = {setQuestsData} 
        setPageIndex = {setPageIndex}
        sortBy = {sortBy} setSortBy = {setSortBy}
      />
      <Main 
        userData = {userData} setUserData = {setUserData} 
        pageIndex = {pageIndex} setPageIndex = {setPageIndex} 
        questsData = {questsData} setQuestsData = {setQuestsData} 
        questIndex ={questIndex} setQuestIndex ={setQuestIndex} 
        tagsData = {tagsData} setTagsData = {setTagsData} 
        sortBy = {sortBy} setSortBy = {setSortBy}
      />
    </> 
  ); 
}