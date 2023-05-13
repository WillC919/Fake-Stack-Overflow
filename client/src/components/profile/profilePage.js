import axios from "axios";
import { useState, useEffect } from "react";

export default function Profile({userData}) {
    const [questions, setQuestions] = useState([]);

    useEffect(() => {
        async function fetchQuestionData(questionId){
            try {
                const response = await axios.get(`http://localhost:8000/question/:${questionId}`);
                return response.data;
            } catch (error) {
                console.log('Error in fetching answer');
                return null;
            }
        }

        async function fetchUserData() {
            try {
                const questionId = userData.questions;
                const questionPromises = questionId.map(fetchQuestionData);
                const questions = await Promise.all(questionPromises);
                questions.sort(function(a,b){return new Date(b.ask_date_time).getTime() - new Date(a.ask_date_time).getTime()});
                setQuestions();
            } catch (error) {
                console.log('Something went wrong');
                setQuestion(false);
            }
        }
        fetchUserData();
    }, [user.questions]);
    
    return (
        <div id="profile">
            <h2>You have been a Fake Stack Overflow member for: {calcTime(new Date(userData.member_since))}</h2>
            <h3>Your reputation: {userData.reputation}</h3>
            <div>
                <table id="profileQuestion">
                    {/* <tbody>
                        {userData.questions.map((q) => 
                            (<tr key={q._id}>
                                <td>
                                    <p>{q.answers.length + ' answers'}</p>
                                    <p>{q.views + ' views'}</p>      
                                    <p>{q.votes + ' votes'}</p>             
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
                    </tbody> */}
                </table>
            </div>
            
        </div>
    );
}

function calcTime(t){
    let now = new Date().getTime();
    let diff = (now - t.getTime())/1000;
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