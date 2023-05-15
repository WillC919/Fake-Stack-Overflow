import { useEffect, useState } from 'react';
import '../../stylesheets/questionPost.css';
import axios from 'axios';

export default function QuestionEdit({userData, setPageIndex, questsData, setQuestsData, questionId}) {
    const [question, setQuestion] = useState(null);
    const [tagNames, setTagNames] = useState([]);
    const [submitType, setSubmitType] = useState('');
    
    useEffect(() => {
        async function fetchQuestionData(){
            try {
                const response = await axios.get(`http://localhost:8000/question/:${questionId}`);
                setQuestion(response.data);
                let tagPromises = await response.data.tags.map(t => fetchTagData(t));
                let tagNames = await Promise.all(tagPromises);
                setTagNames(tagNames.join(' '));
                return true;
            } catch (error) {
                console.log('Error in fetching question');
                return null;
            }
        }
        async function fetchTagData(tagId){
            try {
                const response = await axios.get(`http://localhost:8000/tag/tid/:${tagId}`);
                return response.data.name;
            } catch (error) {
                console.log('Error in fetching question');
                return null;
            }
        }

        
        fetchQuestionData();
    }, [questionId])
    return (question !== null && tagNames !== null?
        <form id='askQuestionForum' name="askQuestionForum" onSubmit={(e) => handleClick(e, userData, setPageIndex, questionId, questsData, setQuestsData, submitType)}> 
            <div className="row">
                <div className="askQuestCaptions">
                    <label htmlFor="askQuestTitle">Question Title*</label>
                    <p>Limit the title to 50 characters or less</p>
                </div>
                <div className="askQuestResponse">
                    <input type="text" id="askQuestTitle" name="askQuestTitle" defaultValue={question.title} required></input>
                </div>
                <p className="invalidText" id="questTitleError"></p>
            </div>

            <div className="row">
                <div className="askQuestCaptions">
                    <label htmlFor="askQuestSum">Question Summary*</label>
                    <p>Limit the title to 140 characters or less</p>
                </div>
                <div className="askQuestResponse">
                    <textarea id="askQuestSum" name="askQuestSum" defaultValue={question.summary} required></textarea>
                </div>
                <p className="invalidText" id="questSumError"></p>
            </div>

            <div className="row">
                <div className="askQuestCaptions">
                    <label htmlFor="askQuestText">Question Text*</label>
                    <p>add details</p>
                </div>
                <div className="askQuestResponse">
                    <textarea id="askQuestText" name="askQuestText" defaultValue={question.text} required></textarea>
                </div>
                <p className="invalidText" id="questTextError"></p>
            </div>

            <div className="row">
                <div className="askQuestCaptions">
                    <label htmlFor="askQuestTags">Tags*</label>
                    <p>Add keywords separeted by whitespace</p>
                </div>
                <div className="askQuestResponse">
                    <input type="text" id="askQuestTags" name="askQuestTags" defaultValue={tagNames} required></input>
                </div>
                <p className="invalidText" id="questTagsError"></p>
            </div>
            
            <br/>
            
            <div className="row" id="lastRow">
                <input id="askQuestSubmit" type="Submit" defaultValue="Edit Question" onClick={() => setSubmitType('edit')}></input>
                <input id="delQuestSubmit" type="Submit" defaultValue="Delete Question" onClick={() => setSubmitType('delete')}></input>
                <p style={{color: 'red'}}>*Indicates mandatory fields</p>
            </div>
        </form>
        :
        <form><p>Loading form.. plaese reload</p></form>
    );
}


function handleClick(event, userData, setPageIndex, questionId, questsData, setQuestsData, submitType) {
    event.preventDefault();
    if (submitType === 'delete') {
        axios.post(`http://localhost:8000/deletequestion/:${questionId}`).then(res => {
            setQuestsData(questsData.filter(q => q !== questionId))
            setPageIndex(0);
        })
        .catch(err => { console.log(err); })
    } else {
        const title = event.target.askQuestTitle.value;
        const summary = event.target.askQuestSum.value;
        const text = event.target.askQuestText.value;
        let tags = event.target.askQuestTags.value.toLowerCase();

        let vaild = true;
        if (title.length > 50) {
            vaild = false;
            document.getElementById("questTitleError").innerText = ">> Title excceeds 100 character limit!!";
        } else if (title.length === 0) {
            vaild = false;
            document.getElementById("questTitleError").innerText = ">> Needs a title!!";
        } else { document.getElementById("questTitleError").innerText = ""; }

        if (summary.length > 140) {
            vaild = false;
            document.getElementById("questSumError").innerText = ">> Summary excceeds 140 character limit!!";
        } else if (summary.length === 0) {
            vaild = false;
            document.getElementById("questSumError").innerText = ">> Needs a summary!!";
        } else { document.getElementById("questSumError").innerText = ""; }

        if (text.length === 0) {
            vaild = false;
            document.getElementById("questTextError").innerText = ">> Needs a description!!";
        } else { 
            const txtErrMsg = checkForHyperlinks(text);
            if (txtErrMsg !== "") vaild = false;
            document.getElementById("questTextError").innerText = txtErrMsg; 
        }

        if (tags.length === 0) {
            vaild = false;
            document.getElementById("questTagsError").innerText = ">> Needs tags!!";
        } else {
            tags = tags.split(" ");
            tags = tags.filter((value) => value !== "");
            tags = tags.filter((item, index) => tags.indexOf(item) === index);

            if (tags.length > 5) {
                vaild = false;
                document.getElementById("questTagsError").innerText = ">> Excceded the 5 tags limit!!";
            } else {
                for (const tag of tags) { 
                    if (tag.length > 10) { 
                        vaild = false;
                        document.getElementById("questTagsError").innerText = ">> All tags must not be longer than 10 characters!!";
                        break;
                    }
                }
                if (vaild) { document.getElementById("questTagsError").innerText = ""; }
            }
        }

        if (vaild) {
            axios.post(`http://localhost:8000/editquestion/:${questionId}`, {
                title: title,
                summary: summary,
                text: text,
                tags: tags,
                user_id: userData._id
            }).then(res => {
                setQuestsData(questsData.map(q => {
                    if (q._id === questionId){
                        return res.data
                    }
                    return q;
                }))
                setPageIndex(0);
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
            // if (i - (text.lastIndexOf('[', i)) <= 1) return ">> Name in hyperlink [] cannot be empty!!";
        }
    }
    return "";
}
