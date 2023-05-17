import { useEffect, useState } from 'react';
import '../stylesheets/answerRows.css';
import axios from 'axios';

export default function CreateAnswerRows({userData, a, fromProfile, setFromProfile, setPageIndex, setAnsId}) {
    const [ansData, setAnsData] = useState(a);
    const [votes, setVotes] = useState(0);
    const [up, setUp] = useState(false);
    const [down, setDown] = useState(false);

    useEffect(() => {
        async function fetchAnswerData(){
            const ans = await axios.get(`http://localhost:8000/answer/:${a._id}`);
            setAnsData(ans);
            
            setVotes(ans.data.upvotes.length - ans.data.downvotes.length);
        }

        fetchAnswerData();
    })

    function upvote() {
        axios.post('http://localhost:8000/answer/upvote', {
            id: a._id,
            userId: userData._id,
        }).then(res => {
            if (res.data === 'error'){
                alert('You need to have a reputation of 50 or above to vote!');
            }else {
                if(ansData.upvotes.indexOf(userData._id) < 0 && !up){
                    setVotes(v => v + 1);
                    setUp(true);
                    setDown(false);
                }
            }
        }).catch(err => { console.log(err); });
    } 

    function downvote() {
        axios.post('http://localhost:8000/answer/downvote', {
            id: a._id,
            userId: userData._id,
        }).then(res => {
            if (res.data === 'error'){
                alert('You need to have a reputation of 50 or above to vote!')
            }else{
                if(ansData.downvotes.indexOf(userData._id) < 0 && !down){
                    setVotes(v => v - 1);
                    setDown(true);
                    setUp(false);
                }
            }
        }).catch(err => { console.log(err); })
    } 
    return (
        <tr key={a._id}>
            <td className="answerVote answerTd" width="10%">
                {userData.accType !== "Guest" && 
                    <button className = "voteBtn" onClick={upvote}>&#8593;</button>}
                <p>{votes + ' Votes'}</p>
                {userData.accType !== "Guest" && 
                    <button className = "voteBtn" onClick={downvote}>&#8595;</button>} 
                {fromProfile && (userData.answers.includes(a._id) || userData.accType === 'Admin')&&
                    <button className = 'edit' onClick={()=>{setFromProfile(false); setAnsId(a._id); setPageIndex(11)}}>Edit/Delete Answer</button>}
            </td>
            <td className='answerText' width="75%"><Format text={a.text}/></td>
            <td className='answeredBy'><p>{a.ans_by}</p>{' answered ' + calcTime(new Date(a.ans_date_time))}</td>
        </tr>
    )
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

        if (c ==='[')  { hyperStateName = true; }
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
                    
                    temp2.push(<a href={link} target='_blank' rel='noreferrer' key={'hyperlink' + j}>{name}</a>);
                    
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