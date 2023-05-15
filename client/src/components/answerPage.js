import '../stylesheets/answerPage.css'
import '../stylesheets/questionPost.css'
import CreateAnswerRows from './answerRows';
import CreateCommentRows from './commentRows';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Answers({userData, setPageIndex, questionId}) {
    const [question, setQuestion] = useState(null);
    const [answerList, setAnswerList] = useState([]);
    const [answerIndex, setAnswerIndex] = useState(0);
    const [votes, setVotes] = useState(null);

    useEffect(() => {
        async function fetchAnswerData(answerId){
            try {
                const response = await axios.get(`http://localhost:8000/answer/:${answerId}`);
                return response.data;
            } catch (error) {
                console.log('Error in fetching answer');
                return null;
            }
        }

        async function fetchQuestionData() {
            try {
                const response = await axios.get(`http://localhost:8000/question/:${questionId}`);
                const answerIds = response.data.answers;
                const answerPromises = answerIds.map(fetchAnswerData);
                const answers = await Promise.all(answerPromises);
                answers.sort(function(a,b){return new Date(b.ans_date_time).getTime() - new Date(a.ans_date_time).getTime()});
                setQuestion(response.data);
                setAnswerList(answers);
                setVotes(response.data.upvotes.length - response.data.downvotes.length);
            } catch (error) {
                console.log('Something went wrong');
                setQuestion(false);
            }
        }
        fetchQuestionData();
    }, [questionId]);

    function upvote() {
        axios.post('http://localhost:8000/question/upvote', {
            id: questionId,
            userId: userData._id,
        }).then(res => {
            setVotes(res);
        }).catch(err => { console.log(err); });
    } 

    function downvote() {
        axios.post('http://localhost:8000/question/downvote', {
            id: questionId,
            userId: userData._id,
        }).then(res => {
            setVotes(res);
        }).catch(err => { console.log(err); })
    } 

    return (question ? 
        <div>
            <table className="right" id="answersTable" width="100%">
                <tbody>
                    <tr>
                        <td rowSpan={2} width="10%" id="voteBtns">
                            {userData.accType !== "Guest" && 
                                <button className = "voteBtn" onClick={upvote}>&#8593;</button>}
                            <p>{votes + ' votes'}</p>
                            {userData.accType !== "Guest" && 
                                <button className = "voteBtn" onClick={downvote}>&#8595;</button>} 
                        </td>
                        <td id='numOfAns' width="15%">{question.answers.length + ' answers'}</td>
                        <td id='questTitle' width="50%">{question.title}</td>
                        <td><button className="askQuestion" id='askQuestion' onClick={() => {userData.accType !== 'Guest' ? setPageIndex(2):alert('Please sign in')}}>Ask Question</button></td>
                    </tr>
                    <tr id="questHeaderBottom">
                        <td id='numOfViews'>{question.views + ' views'}</td>
                        <td id='questText'><Format text={question.text}/></td>
                        <td id='askedBy'><p>{question.asked_by}</p>{' asked ' + calcTime(new Date(question.ask_date_time))}</td>
                    </tr>
                    <tr>
                        <td colSpan={4}><CreateCommentRows userData={userData} listOfCommentIds={question.comments} AttachmentId = {question._id}/></td>
                    </tr>
                </tbody>
            </table>
            <CreateAnswerRows userData = {userData} setPageIndex = {setPageIndex} listOfAnswers = {answerList} answerIndex = {answerIndex}/>
            <div className="viewBtn">
                <div><button className="curr">Page {answerIndex+1}</button></div>
                
                {answerIndex !== 0 && 
                    <div><button className="prev" onClick={() => setAnswerIndex(answerIndex-1)}>Prev</button></div>}
                {answerIndex < Math.floor((answerList.length-1)/5) && 
                    <div><button className="next" onClick={() => setAnswerIndex(answerIndex+1)}>Next</button></div>}

                <button id='answerQuestion' onClick={() => {userData.accType !== 'Guest' ? setPageIndex(4):alert('Please sign in')}}>Answer Question</button>
            </div>
        </div> : 
        <div>
            {/* This is to rendering loading page */ }
            <table className="right" id="answersTable" width="100%">
                <tbody>
                    <tr>
                        <td id='numOfAns' width="20%">{question !== null ? 'Something went wrong. Please try again.' : 'Loading Forum ...'}</td>
                        <td id='questTitle' width="55%"></td>
                        <td><button className="askQuestion" id='askQuestion' onClick={() => {userData.accType !== 'Guest' ? setPageIndex(2):alert('Please sign in')}}>Ask Question</button></td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

function Format({text}) {
    let hyperStateName = false;
    let hyperStateLink = false;
    let name = ""
    let link = "";
    
    const re = /\[[^\]]+\]\([^)]+\)/;
    let temp = text.split(re);
    temp = temp.map((s, i) => {
        return (<span key={'links' + i}>{s}</span>);
    })
    let temp2 = [];
    
    for (let i = 0; i < text.length; i++) {
        let c = text.charAt(i);

        if (c === '[')  { hyperStateName = true; }
        else if (hyperStateName) {
            for (let j = i; j < text.length; j++) {
                let c = text.charAt(j);
                if (c === '[') { 
                    name = "";
                    hyperStateName = false;
                    break;
                } else if (c === ']') { 
                    hyperStateName = false;
                    hyperStateLink = true;
                    i = j;
                    break;
                } else { name += c; }
            } 
        } else if (hyperStateLink) { 
            for (let j = i; j < text.length; j++) {
                let c = text.charAt(j);
                if (c === '(') {
                    const endBrac = text.indexOf(')', i);
                    link = text.substring(j+1, endBrac);
                    
                    temp2.push(<a href={link} target='_blank' rel="noreferrer" key={'hyperlink' + j}>{name}</a>);
                    
                    i = endBrac;
                    hyperStateLink = false;
                    name = "";
                    link = "";
                    break;
                } else { 
                    hyperStateName = false;
                    hyperStateLink = false; 
                    break;
                }
            } 
        }
    }
    var fin = temp.map(function(v,i) { return [v, temp2[i]]; }).reduce(function(a,b) { return a.concat(b); });
    return (<div>{fin}</div>);
}

function calcTime(t) {
    let now = new Date().getTime();
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
    if (i < 10) { i = "0" + i; }
    return i;
}

