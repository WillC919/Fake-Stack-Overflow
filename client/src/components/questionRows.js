import { useEffect, useState } from 'react';
import '../stylesheets/questionRows.css';
import axios from 'axios';

export default function CreateQuestionRows({setPageIndex, sortBy, questsData, setQuestsData, questIndex, setQuestionId, tagsData, tagId}) {
    useEffect(() => {
        async function fetchQuestionData(){
            const questions = await axios.get('http://localhost:8000/questions');
            questions.data.sort(function(a,b){return new Date(b.ask_date_time).getTime() - new Date(a.ask_date_time).getTime()});
            setQuestsData(questions.data);
        }
        
        async function sortByActive() {
            await axios.get(`http://localhost:8000/sortActive`).then(res => {setQuestsData(res.data)});
        }
        
        async function sortByUnanswered() {
            await axios.get(`http://localhost:8000/sortUnanswered`).then(res => {setQuestsData(res.data); });
        }

        async function filterByTag(tagId) {
            await axios.get(`http://localhost:8000/tag/:${tagId}`).then(res => {setQuestsData(res.data);})
        }

        if (sortBy === 0) fetchQuestionData();
        if (sortBy === 1) sortByActive();
        if (sortBy === 2) sortByUnanswered();
        if (sortBy === 3) filterByTag(tagId);

    })

    return (
        <table id="questionRows">
            <tbody>
                {questsData.slice(questIndex*5, questIndex*5+5).map((q) => 
                    (<tr key={q._id}>
                        <td>
                            <p>{q.answers.length + ' answers'}</p>
                            <p>{q.views + ' views'}</p>      
                            <p>{(q.upvotes.length - q.downvotes.length) + ' votes'}</p>             
                        </td>
                        <td>
                            <button className='links' id={q._id} onClick={()=>{setQid(q._id, setPageIndex, setQuestionId)}}>{q.title}</button>
                            <p>{q.summary}</p>
                            <div>
                                {q.tags.map((idTag) => <button key={idTag}>{matchTagIDWithName(idTag, tagsData)}</button>)}
                            </div>
                        </td>
                        <td>
                            <p><span>{q.asked_by}</span>{' asked ' + calcTime(q.ask_date_time)}</p>
                        </td>
                    </tr>)
                )} 
            </tbody>
        </table>
    )
}

async function incQuestionView(qid) {
    try {
        await axios.get(`http://localhost:8000/question/:${qid}/view`);
    } catch (error) {
        console.log('Inc view count err');
    }
}

function setQid(qid, setPageIndex, setQuestionId){
    incQuestionView(qid);
    setPageIndex(3);
    setQuestionId(qid);
}

function matchTagIDWithName(tagId, tagsData) {
    for (let i = 0; i < tagsData.length; i++) {
        if (tagsData[i]._id === tagId) return tagsData[i].name;
    }
    return "NULL";
}

function calcTime(t) {
    t = new Date(t)
    let now = new Date();
    let diff = (now - t)/1000;
    let str = "";
    let month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    if (diff <= 1) { str += "now"; } 
    else if (diff > 1 && diff < 60) { str += Math.floor(diff) + " seconds ago"; } 
    else if (diff >= 60 && diff < 3600) { str += Math.floor(diff/60) + " minutes ago"; } 
    else if (diff >= 3600 && diff < 86400) { str += Math.floor(diff/1440) + " hours ago"; } 
    else if (diff >= 86400 && diff < 31536000) { str += month[t.getMonth()] + " " + t.getDate().toString() + " at " + addZero(t.getHours()) + ":" + addZero(t.getMinutes()); } 
    else { str += month[t.getMonth()] + " " + t.getDate().toString() + ", " + t.getFullYear().toString() + " at " + addZero(t.getHours()) + ":" + addZero(t.getMinutes());
    }
    return str;
}
function addZero(i) {
    if (i < 10) {i = "0" + i}
    return i;
}