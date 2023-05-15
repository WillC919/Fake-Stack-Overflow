import axios from "axios";
import { useState, useEffect } from "react";
import '../../stylesheets/profilePage.css'

export default function Profile({userData, questsData, setPageIndex, setQuestionId}) {
    const [questions, setQuestions] = useState(null);
    const [user, setUser] = useState(userData);

    useEffect(() => {
        async function fetchData(){
            try {
            const user = await axios.get(`http://localhost:8000/userId/:${userData._id}`);
            setUser(user.data);
            const questionIds = await user.data.questions;
            const questionPromises = questionIds.map(q => fetchQuestionData(q));
            const questions = await Promise.all(questionPromises);
            questions.sort(function(a,b){return new Date(b.ask_date_time).getTime() - new Date(a.ask_date_time).getTime()});
            setQuestions(questions);

        } catch (err) {
            console.log('Please ask a question')
        }
        }

        async function fetchQuestionData(questionId){
            try {
                const response = await axios.get(`http://localhost:8000/question/:${questionId}`);
                return response.data;
            } catch (error) {
                console.log('Error in fetching question');
                return null;
            }
        }

        
        fetchData();
    }, [userData]);
    
    return (
        <div id="profile">
            <h2>You have been a Fake Stack Overflow member for: {calcTime(new Date(user.member_since))}</h2>
            <h3>Your reputation: {user.reputation}</h3>
            
            <h4>Your questions:</h4>            
            <div id="profileQuestions">
                {questions !== null ?
                    <ol id="profileQuestion">
                        {questions.map((q) => 
                            (<li key={q._id}>
                                <button className='links' id={q._id} onClick={()=>{handleClick(q._id, setPageIndex, setQuestionId)}}>{q.title}</button>
                            </li>)
                        )} 
                    </ol>
                    :
                    <h3>Oops, nothing to show here, ask a question!</h3>
                }
            </div>
            <button className='links' id='editTagsLink' onClick={()=>{goToTags(setPageIndex)}}>View all tags created by you</button>
            
            
        </div>
    );
}

function handleClick(qid, setPageIndex, setQuestionId){
    setQuestionId(qid)
    setPageIndex(8)
}

function goToTags(setPageIndex){
    setPageIndex(9)
}

function calcTime(t){
    let now = new Date().getTime();
    let diff = (now - t.getTime())/1000;
    let str = "";
    let month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    if (diff <= 1) { str += "now"; } 
    else if (diff > 1 && diff < 60) { str += Math.floor(diff) + " seconds"; } 
    else if (diff >= 60 && diff < 3600) { str += Math.floor(diff/60) + " minutes"; } 
    else if (diff >= 3600 && diff < 86400) { str += Math.floor(diff/1440) + " hours"; } 
    else if (diff >= 86400 && diff < 31536000) { str += month[t.getMonth()] + " " + t.getDate().toString() + " at " + addZero(t.getHours()) + ":" + addZero(t.getMinutes()); } 
    else { str += month[t.getMonth()] + " " + t.getDate().toString() + ", " + t.getFullYear().toString() + " at " + addZero(t.getHours()) + ":" + addZero(t.getMinutes());
    }
    return str;
}

function addZero(i) {
    if (i < 10) {i = "0" + i}
    return i;
}