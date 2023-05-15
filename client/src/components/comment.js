import '../stylesheets/commentRows.css';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function CreateComment({c, userData}) {
    const [votes, setVotes] = useState(0);    

    useEffect(() => {
        async function fetchData() {
            let comment = await axios.get(`http://localhost:8000/comment/:${c._id}`);
            let v = comment.data.upvotes.length - comment.data.downvotes.length;
            setVotes(v);
        }

        fetchData()

    })

    async function upvote(comment){
        let c = await axios.get(`http://localhost:8000/comment/:${comment._id}`)
        if (c.data.upvotes.indexOf(userData._id) === -1){
            setVotes(v => v + 1);
            axios.post(`http://localhost:8000/comment/:${comment._id}/upvote/:${userData._id}`);
        }
    } 
    async function downvote(comment){
        let c = await axios.get(`http://localhost:8000/comment/:${comment._id}`)
        if (c.data.downvotes.indexOf(userData._id) === -1){
            setVotes(v => v - 1);
            axios.post(`http://localhost:8000/comment/:${comment._id}/downvote/:${userData._id}`);
        }
    } 
    

    return (
        <tr className='commentRow' key={c._id}>
            <td width="15%"></td>
            <td className="commentVote commentTd" width="10%">
                    {userData.accType !== "Guest" && 
                        <button className = "voteBtn" onClick={()=> {upvote(c)}}>&#8593;</button>}
                    <span>{votes + ' votes'}</span>
                    {userData.accType !== "Guest" && 
                        <button className = "voteBtn" onClick={()=> {downvote(c)}}>&#8595;</button>} 
            </td>
            <td className="commentText commentTd" width="70%"><Format text = {c.text} commentBy = {c.commented_by} commentDate = {c.commented_date}/></td>
            <td className="commentTd"></td>
        </tr>
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

function Format({text, commentBy, commentDate}) {
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
    return (<><div>{fin} - <span>{commentBy}</span>{' ' + calcTime(new Date(commentDate))}</div></>);
}