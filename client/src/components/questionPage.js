import { useEffect, useState } from 'react';
import axios from 'axios';
import '../stylesheets/questionPage.css'
import CreateQuestionRows from './questionRows.js'


export default function Questions({userData, pageIndex, setPageIndex, setQuestionId, questHeader, questsData, setQuestsData, questIndex, setQuestIndex, tagsData, setTagsData, tagId, sortBy, setSortBy}) {
    // const [sortBy, setSortBy] = useState(0);
    
    async function reloadQuestions() {
        await axios.get('http://localhost:8000/questions').then(res => { setQuestsData(res.data); });
    }
    
    async function reloadTags() {
        await axios.get('http://localhost:8000/tags').then(res => { setTagsData(res.data); });
    }

    async function sortByNewest() {
        const sortedQuestData = await questsData.sort(function(a,b){return new Date(b.ask_date_time).getTime() - new Date(a.ask_date_time).getTime()});
        setQuestsData(sortedQuestData);
    }
    
    async function sortByActive() {
        await axios.get(`http://localhost:8000/sortActive`).then(res => {
            setQuestsData(res.data)
        });
    }
    async function sortByUnanswered() {
        console.log(questsData)
        const response = await axios.get(`http://localhost:8000/sortUnanswered`);
        const arr = response.data.filter(function(q){
            if(!questsData.includes(q)) return q;
            return;
        })
        setQuestsData(arr);

                
    }

    async function filterByTag(tagId) {
        await axios.get(`http://localhost:8000/tag/:${tagId}`).then(res => {setQuestsData(res.data);})
    }


    useEffect(() => { 

        if (pageIndex === 0) {setSortBy(0); reloadTags(); reloadQuestions()}
        if (pageIndex === 5) {setSortBy(4); }
        if (pageIndex === 6) {setSortBy(3); }
    }, []);


    
    return (
        <div>
            <table className="right" id="questionsTable" width="100%">
                <tbody>
                    <tr height="100px">
                        <td width="30%"><p id="questionsHeader"> {questHeader} </p></td>
                        <td width="45%"></td>
                        <td id="showAskQuestion"><button className="askQuestion" id="askQuestion" onClick={() => {userData.accType !== 'Guest' ? setPageIndex(2):alert('Please sign in')}}>Ask Question</button></td>
                    </tr>
                    <tr height="50px">
                        <td><p id="numOfQuestions">{questsData.length + ' Questions'}</p></td>
                        <td className="sortby">
                            <button id="newest" onClick={() => {setSortBy(4); reloadTags(); reloadQuestions(); sortByNewest()}}>Newest</button>
                            <button id="active" onClick={() => {setSortBy(1); reloadTags(); sortByActive() }}>Active</button>
                            <button id="unanswered" onClick={() => {setSortBy(2); reloadTags(); sortByUnanswered()}}>Unanswered</button>
                        </td>
                        <td></td>
                    </tr>
                </tbody>
            </table>

            <CreateQuestionRows setPageIndex={setPageIndex} sortBy={sortBy} questsData={questsData} setQuestsData = {setQuestsData} questIndex = {questIndex} setQuestionId={setQuestionId} tagsData={tagsData} tagId = {tagId} setSortBy = {setSortBy} questHeader ={questHeader}/>
            
            <div className="viewBtn">
                <div><button className="curr">Page {questIndex+1}</button></div>
                {questIndex !== 0 && <div><button className="prev" onClick={() => setQuestIndex(questIndex-1)}>Prev</button></div>}
                {questIndex < Math.floor((questsData.length-1)/5) && <div><button className="next" onClick={() => setQuestIndex(questIndex+1)}>Next</button></div>}
            </div>
        </div>
    );
}
