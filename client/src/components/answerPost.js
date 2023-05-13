import '../stylesheets/answerPost.css'
import axios from 'axios';

export default function PostAnswer({userData, setPageIndex, questionId}) {
    return (
        <form id='ansQuestionForum' name="answerQuestionForum" onSubmit={(e) => handleClick(e, userData, setPageIndex, questionId)}>                 
            <div className="row">
                <div className="ansQuestCaptions">
                    <label htmlFor="ansQuestText">Post Your Answer*</label>
                    <p>add details</p>
                </div>
                <div className="ansQuestResponse">
                    <textarea id="ansQuestText" name="ansQuestText" placeholder="Your details..." required></textarea>
                </div>
                <p className="invalidText" id="ansQuestTextError"></p>
            </div>

            <br/>
            
            <div className="row" id="lastRow">
                <input id="ansQuestSubmit" type="Submit" defaultValue="Post Answer"></input>
                <p style={{color: 'red'}}>*Indicates mandatory fields</p>
            </div>
        </form>
    );

}
function handleClick(event, userData, setPageIndex, questionId) {
    event.preventDefault();

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
        axios.post('http://localhost:8000/postAnswer', {
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