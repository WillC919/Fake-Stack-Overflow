import { useState, useEffect } from 'react';
import '../../stylesheets/answerPost.css'
import axios from 'axios';

export default function EditAnswer({userData, setPageIndex, questionId, ansId}) {
    const [ans, setAns] = useState(ansId);
    const [submitType, setSubmitType] = useState('');
    useEffect(() => {
        async function fetchData(){
            try {
                const response = await axios.get(`http://localhost:8000/answer/:${ansId}`);
                setAns(response.data);
            } catch (error) {
                console.log('Error in fetching answer');
                return null;
            }
        }
        fetchData();
    })

    return (
        <form id='ansQuestionForum' name="answerQuestionForum" onSubmit={(e) => handleClick(e, userData, setPageIndex, questionId, ansId, submitType)}>                 
            <div className="row">
                <div className="ansQuestCaptions">
                    <label htmlFor="ansQuestText">Edit Your Answer*</label>
                    <p>edit details</p>
                </div>
                <div className="ansQuestResponse">
                    <textarea id="ansQuestText" name="ansQuestText" defaultValue={ans.text} required></textarea>
                </div>
                <p className="invalidText" id="ansQuestTextError"></p>
            </div>

            <br/>
            
            <div className="row" id="lastRow">
                <input id="ansQuestSubmit" type="Submit" defaultValue="Edit Answer" onClick={() => setSubmitType('edit')}></input>
                <input id="delQuestSubmit" type="Submit" defaultValue="Delete Answer" onClick={() => setSubmitType('delete')}></input> 
                <p style={{color: 'red'}}>*Indicates mandatory fields</p>
            </div>
        </form>
    );

}
function handleClick(event, userData, setPageIndex, questionId, ansId, submitType) {
    event.preventDefault();

    if (submitType === 'delete') {
        axios.post(`http://localhost:8000/deleteanswer/:${ansId}`).then(res => {
            // setQuestsData(questsData.filter(q => q !== questionId))
            setPageIndex(3);
        })
        .catch(err => { console.log(err); })
    } else {

        const text = event.target.ansQuestText.value;
        const user = userData.user;

        let vaild = true;
        if (text.length === 0) {
            vaild = false;
            document.getElementById("ansQuestTextError").innerText = ">> Needs a description!!";
        } else { 
            const txtErrMsg = checkForHyperlinks(text);
            if (txtErrMsg !== "") vaild = false;
            document.getElementById("ansQuestTextError").innerText = txtErrMsg; 
        }

        if (vaild) {
            axios.post(`http://localhost:8000/editanswer/:${ansId}`, {
                text: text,
                ans_by: user,
                qid: questionId,
                user_id: userData._id,
            }).then(res => {
                console.log(res);
                setPageIndex(3);
            })
            .catch(err => { console.log(err); })
        }
    }   
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