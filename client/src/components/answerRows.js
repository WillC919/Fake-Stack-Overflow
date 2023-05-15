import '../stylesheets/answerRows.css';
import CreateCommentRows from './commentRows';

export default function CreateAnswerRows({userData, listOfAnswers, answerIndex}) {
    return (listOfAnswers ?
        <table id='answerRows' width="100%">
            <tbody>
                {listOfAnswers.slice(answerIndex*5, answerIndex*5+5).map((a) => <>
                    <tr className='answerRow' key={a._id}>
                        <td className='answerText'><Format text={a.text}/></td>
                        <td className='answeredBy'><p>{a.ans_by}</p>{' answered ' + calcTime(new Date(a.ans_date_time))}</td>
                    </tr>
                    <tr>
                        <td colSpan={2}><CreateCommentRows userData = {userData} listOfCommentIds={a.comments} AttachmentId = {a._id}/></td>
                    </tr>
                </>)}
            </tbody>
        </table> :
        <table id='answerRows' width="100%">
            <tbody>
                <tr className='answerRow'>
                    <td className='answerText'>loading answers...</td>
                </tr>
            </tbody>
        </table>
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