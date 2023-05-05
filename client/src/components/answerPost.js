import '../stylesheets/answerPost.css'
import axios from 'axios';

export default function PostAnswer({setPageIndex, questionId}) {
    return (
        <form id='ansQuestionForum' name="answerQuestionForum" onSubmit={(e) => handleClick(e, setPageIndex, questionId)}>                 
            <div className="row">
                <div className="ansQuestCaptions">
                    <label htmlFor="ansQuestUsername">Username*</label>
                </div>
                <div className="ansQuestResponse">
                    <input type="text" id="ansQuestUsername" name="ansQuestUsername" placeholder="Your username..." required></input>
                </div>
                <p className="invalidText" id="ansQuestUserError"></p>
            </div>

            <div className="row">
                <div className="ansQuestCaptions">
                    <label htmlFor="ansQuestText">Question Text*</label>
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
function handleClick(event, setPageIndex, questionId) {
    event.preventDefault();

    const text = event.target.ansQuestText.value;
    const user = event.target.ansQuestUsername.value;

    let vaild = true;
    if (text.length === 0) {
        vaild = false;
        document.getElementById("ansQuestTextError").innerText = ">> Needs a description!!";
    } else { 
        const txtErrMsg = checkForHyperlinks(text);
        if (txtErrMsg !== "") vaild = false;
        document.getElementById("ansQuestTextError").innerText = txtErrMsg; 
    }
      
    if (user.length === 0) {
        vaild = false;
        document.getElementById("ansQuestUserError").innerText = ">> Needs Username!!";
    } else {
        document.getElementById("ansQuestUserError").innerText = "";
    }

    if (vaild) {
        axios.post('http://localhost:8000/postAnswer', {
            text: text,
            ans_by: user,
            qid: questionId
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