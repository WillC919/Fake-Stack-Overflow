import Header from './fsoHeader.js'
import Main from './fsoMain.js'
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function FakeStackOverflow({userData}) {
  const [pageIndex, setPageIndex] = useState(0);
  const [questsData, setQuestsData] = useState([]);
  const [questIndex, setQuestIndex] = useState(0);
  const [tagsData, setTagsData] = useState([]);

  useEffect(() => { 
    axios.get('http://localhost:8000/questions').then(res => { setQuestsData(res.data); }); 
    axios.get('http://localhost:8000/tags').then(res => { setTagsData(res.data); }); 
  }, []);
  
  return (
    <>
      <Header setQuestsData = {setQuestsData} setPageIndex = {setPageIndex}/>
      <Main pageIndex = {pageIndex} setPageIndex = {setPageIndex} questsData = {questsData} setQuestsData = {setQuestsData} questIndex={questIndex} setQuestIndex={setQuestIndex} tagsData = {tagsData} setTagsData = {setTagsData}/>
    </> 
  ); 
}