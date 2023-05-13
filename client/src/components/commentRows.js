import '../stylesheets/commentRows.css';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function CreateCommentRows({userData, setPageIndex, listOfCommentIds, AttachmentId}) {
    const [commentIndex, setCommentIndex] = useState(0);
    const [listOfComments, setListOfComments] = useState(null);
    
    useEffect(() => {
        async function fetchCommentData(commentId) {
            try {
                const response = await axios.get(`http://localhost:8000/comment/:${commentId}`);
                return response.data;
            } catch (error) {
                console.log('Error in fetching answer');
                return null;
            }
        }
        async function setCommentData() {
            const result = listOfCommentIds.map(fetchCommentData);
            const comments = await Promise.all(result);
            comments.sort(function(a,b){return new Date(b.ans_date_time).getTime() - new Date(a.ans_date_time).getTime()});
            setListOfComments(comments);
        }

        setCommentData();
    }, [listOfCommentIds]);

    return <Comments userData = {userData} setPageIndex = {setPageIndex} listOfComments = {listOfComments} attachmentId = {AttachmentId} commentIndex = {commentIndex} setCommentIndex = {setCommentIndex}/>;
}
function Comments({userData, setPageIndex, listOfComments, attachmentId, commentIndex, setCommentIndex}) {
    return (listOfComments ?
        <table id='commentRows' width="100%">
            <tbody>
                {listOfComments.slice(commentIndex*3, commentIndex*3+3).map((c) =>
                    <tr className='commentRow' key={c._id}>
                        <td width="15%"></td>
                        <td width="15%"></td>
                        <td className='commentText' width="55%">{c.text}</td>
                        <td className='commentBy'><p>{c.commented_by}</p>{' commented ' + calcTime(new Date(c.commented_date))}</td>
                    </tr>
                )}
                {userData.accType !== "Guest" && <tr>
                    <td width="20%"></td>
                    <td width="75%">
                        <form id='commentPost' onSubmit={(e) => handleClick(e, userData, setPageIndex, setCommentIndex, attachmentId)}>
                            <textarea id="commentText" name="commentText" placeholder="Your details..." required></textarea>
                            <p id = "invalidComment"></p>
                            <input id="commentSubmit" type="Submit" defaultValue="Post Comment"></input>
                        </form>
                    </td>
                    <td width="5%"></td>
                </tr>}
            </tbody>
        </table> :
        <table id='commentRows' width="100%">
            <tbody>
                <tr className='commentRow'>
                    <td className='commentText'>loading comments...</td>
                </tr>
            </tbody>
        </table>
    )
}
function handleClick(event, userData, setPageIndex, setCommentIndex, AttachmentId) {
    event.preventDefault();

    const text = event.target.commentText.value;
    const user = userData.user;

    let vaild = true;
    if (text.length === 0) {
        vaild = false;
        document.getElementById("invalidComment").innerText = ">> Needs a description!!";
    } else { 
        const txtErrMsg = checkForHyperlinks(text);
        if (txtErrMsg !== "") vaild = false;
        document.getElementById("invalidComment").innerText = txtErrMsg; 
    }

    if (vaild) {
        axios.post('http://localhost:8000/postComment', {
            text: text,
            com_by: user,
            id: AttachmentId,
            user_id: userData._id,
        }).then(res => {
            console.log(res);
            //setPageIndex(3);
            setCommentIndex(0);
        }).catch(err => { console.log(err); })
    }
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

function checkForHyperlinks(text) {
    let hyperName = false, hyperLink = false;
    for (let i = 0; i < text.length; i++) {
        let c = text.charAt(i);
        
        // Checks the vaildity of the hyperlink's Link
        if (hyperLink) {
            if (c === ' ') continue;
            else if (c === '(') {
                if (text.indexOf('http://', i) !== i+1 && text.indexOf('https://', i) !== i+1) return ">> Link must follow standard http naming";
                i = text.indexOf(')', i);
                if (i === -1) return ">> Needs closing paratheses )!!"
            }
            else hyperLink = false; 
        }

        // Checks the vaildity of the hyperlink's name
        if (c === '[') hyperName = true;
        if (hyperName && c === ']') { 
            hyperLink = true; 
            hyperName = false; 
        }
    }
    return "";
}