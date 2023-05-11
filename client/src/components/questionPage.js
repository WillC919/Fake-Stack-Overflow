import { useEffect, useState } from 'react';
import axios from 'axios';
import '../stylesheets/questionPage.css'
import CreateQuestionRows from './questionRows.js'


export default function Questions({pageIndex, setPageIndex, setQuestionId, questHeader, questsData, setQuestsData, questIndex, setQuestIndex, tagsData, setTagsData, tagId}) {
    const [sortBy, setSortBy] = useState(0);
    
    
    function reloadQuestions() {
        axios.get('http://localhost:8000/questions').then(res => { setQuestsData(res.data); });
        axios.get('http://localhost:8000/tags').then(res => { setTagsData(res.data); });
    }

    function filterByTag(tagId) {
        axios.get(`http://localhost:8000/tag/:${tagId}`).then(res => {setQuestsData(res.data);})
    }

    function sortByActive() {
        axios.get(`http://localhost:8000/sortActive`).then(res => {setQuestsData(res.data)});
    }
    
    function sortByUnanswered() {
        axios.get(`http://localhost:8000/sortUnanswered`).then(res => {setQuestsData(res.data); });
    }

    useEffect(() => { 
        if (pageIndex === 0 && sortBy === 0) reloadQuestions(); 
        if (pageIndex === 6) filterByTag(tagId);
    }, []);
    return (
        <div>
            <table className="right" id="questionsTable" width="100%">
                <tbody>
                    <tr height="100px">
                        <td width="30%"><p id="questionsHeader"> {questHeader} </p></td>
                        <td width="45%"></td>
                        <td id="showAskQuestion"><button className="askQuestion" id="askQuestion" onClick={() => setPageIndex(2)}>Ask Question</button></td>
                    </tr>
                    <tr height="50px">
                        <td><p id="numOfQuestions">{questsData.length + ' Questions'}</p></td>
                        <td className="sortby">
                            <button id="newest" onClick={() => {setSortBy(0); setPageIndex(0); reloadQuestions();}}>Newest</button>
                            <button id="active" onClick={() => {sortByActive(); setPageIndex(0);}}>Active</button>
                            <button id="unanswered" onClick={() => {sortByUnanswered(); setPageIndex(0);}}>Unanswered</button>
                        </td>
                        <td></td>
                    </tr>
                </tbody>
            </table>

            <CreateQuestionRows setPageIndex={setPageIndex} sortBy={sortBy} questsData={questsData} setQuestionId={setQuestionId} tagsData={tagsData}/>
            
            <div id="viewBtn">
                <div><button id="prev" classNaonClick={() => changeQuestPageIndex(questIndex, setQuestIndex, -1)}>Prev</button></div>
                <div><button id="curr">Page {questIndex+1}</button></div>
                <div><button id="next" onClick={() => changeQuestPageIndex(questIndex, setQuestIndex, 1)}>Next</button></div>
            </div>
        </div>
    );
}

async function changeQuestPageIndex(questIndex, setQuestIndex, incrementer) {
    setQuestIndex(questIndex+incrementer);
}
