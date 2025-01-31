import { useEffect, useState } from "react";
import axios from "axios";
export default function User({userData, setPageIndex, setQuestionId, setFromProfile, setSubUser, isSubuser}) {
    const [questions, setQuestions] = useState([]);
    const [ansQuestions, setAnsQuestions] = useState([]);
    const [user, setUser] = useState(userData);

    useEffect(() => {
        async function fetchData(){
            try {
            const u = await axios.get(`http://localhost:8000/userId/:${userData._id}`);
            setUser(u.data);
            const questionIds = await u.data.questions;
            const questionPromises = questionIds.map(q => fetchQuestionData(q));
            const questions = await Promise.all(questionPromises);
            questions.sort(function(a,b){return new Date(b.ask_date_time).getTime() - new Date(a.ask_date_time).getTime()});
            setQuestions(questions);

            const answerIds = await u.data.answers;
            const ansPromises = answerIds.map(a => fetchAnsQuestData(a));
            let answeredQ = await Promise.all(ansPromises);
            answeredQ = answeredQ.filter((q, index, self) => index === self.findIndex((obj) => (obj._id === q._id)))
            setAnsQuestions(answeredQ);
            

            } catch (err) {
                console.log(err)
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

        async function fetchAnsQuestData(aid){
            try {
                const response = await axios.get(`http://localhost:8000/answer/:${aid}/question`);
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
                <div className="profileBasics">
                    <table width="100%">
                        <tbody>
                            <tr className="profileBasicsA">
                                <td width="33%"><p>Username:</p>{user.user}</td>
                                <td width="33%"><p>Email:</p>{user.email}</td>
                                <td><p>Account Type:</p>{user.accType}</td>
                            </tr>
                            <tr className="profileBasicsB">
                                <td width="33%"><p>Member Since:</p>{calcTime(new Date(user.member_since))}</td>
                                <td width="33%"><p>Reputation:</p>{user.reputation}</td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="profileBasics">
                    <div className="profileLists userSide">
                        <h4>Questions Posted:</h4>
                        {questions === null 
                        ? <div><h3>Unable to load questions!</h3></div> 
                            : questions.length > 0 
                                ? <><ol id="profileQuestion">
                                {questions.map((q) => 
                                    (<li key={q._id}>
                                        <button className='links' id={q._id} onClick={()=>{handleClick(q._id, setPageIndex, setQuestionId)}}>{q.title}</button>
                                    </li>)
                                )} 
                                </ol></>
                                :<div>0 questions, go ask questions!</div>
                        }
                    </div>
                    <div className="profileLists userSide">
                        <h4>Questions Answered:</h4>
                        {ansQuestions === null 
                        ? <div><h3>Unable to load questions!</h3></div> 
                            : ansQuestions.length > 0 
                                ? <><ol id="answeredQ">
                                {ansQuestions.map((q) => 
                                    (<li key={q._id}>
                                        <button className='links' id={q._id} onClick={()=>{handleClick2(q._id, setPageIndex, setQuestionId, setFromProfile)}}>{q.title}</button>
                                    </li>)
                                )} 
                                </ol></>
                                : <div className="nothingFound">0 answers, go answer questions!</div>
                        }
                    </div>
                </div>

                <button className='links' id='editTagsLink' onClick={()=>{goToTags(setPageIndex)}}>View all tags created by you</button>
                {isSubuser && <button id='goBack' onClick={()=>{setSubUser(null)}}>Back to admin</button>}

        </div>
    );
}

function handleClick(qid, setPageIndex, setQuestionId){
    setQuestionId(qid);
    setPageIndex(8);
}

function handleClick2(qid, setPageIndex, setQuestionId, setFromProfile){
    setFromProfile(true);
    setQuestionId(qid);
    setPageIndex(3);
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