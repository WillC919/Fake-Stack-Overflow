import '../stylesheets/questionPost.css';
import axios from 'axios';
import { useState, useEffect } from 'react';

export default function PostQuestion({userData, setPageIndex, questsData, setQuestsData, tagsData}) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        async function fetchUserData() {
            try{
                const response = await axios.get(`http://localhost:8000/userId/:${userData._id}`);
                setUser(response.data);
            } catch (error) {
                console.log(error)
            }
        }
        fetchUserData();
    })
    
    return ( user !== null ?
        <form id='askQuestionForum' name="askQuestionForum" onSubmit={(e) => handleClick(e, user, setPageIndex, questsData, setQuestsData, tagsData)}> 
            <div className="row">
                <div className="askQuestCaptions">
                    <label htmlFor="askQuestTitle">Question Title*</label>
                    <p>Limit the title to 50 characters or less</p>
                </div>
                <div className="askQuestResponse">
                    <input type="text" id="askQuestTitle" name="askQuestTitle" placeholder="Your question..." required></input>
                </div>
                <p className="invalidText" id="questTitleError"></p>
            </div>

            <div className="row">
                <div className="askQuestCaptions">
                    <label htmlFor="askQuestSum">Question Summary*</label>
                    <p>Limit the summary to 140 characters or less</p>
                </div>
                <div className="askQuestResponse">
                    <textarea id="askQuestSum" name="askQuestSum" placeholder="Question summary..." required></textarea>
                </div>
                <p className="invalidText" id="questSumError"></p>
            </div>

            <div className="row">
                <div className="askQuestCaptions">
                    <label htmlFor="askQuestText">Question Text*</label>
                    <p>add details</p>
                </div>
                <div className="askQuestResponse">
                    <textarea id="askQuestText" name="askQuestText" placeholder="Your details..." required></textarea>
                </div>
                <p className="invalidText" id="questTextError"></p>
            </div>

            <div className="row">
                <div className="askQuestCaptions">
                    <label htmlFor="askQuestTags">Tags*</label>
                    <p>Add keywords separeted by whitespace</p>
                </div>
                <div className="askQuestResponse">
                    <input type="text" id="askQuestTags" name="askQuestTags" placeholder="Add tags..."></input>
                </div>
                <p className="invalidText" id="questTagsError"></p>
            </div>
            
            <br/>
            
            <div className="row" id="lastRow">
                <input id="askQuestSubmit" type="Submit" defaultValue="Post Question"></input>
                <p style={{color: 'red'}}>*Indicates mandatory fields</p>
            </div>
        </form>
        :
        <div><h1>fetching user data please refresh</h1></div>
    );
}


function handleClick(event, userData, setPageIndex, questsData, setQuestsData, tagsData) {
    event.preventDefault();

    const title = event.target.askQuestTitle.value;
    const summary = event.target.askQuestSum.value;
    const text = event.target.askQuestText.value;
    let tags = event.target.askQuestTags.value.toLowerCase();
    const user = userData.user;

    let vaild = true;
    if (title.length > 50) {
        vaild = false;
        document.getElementById("questTitleError").innerText = ">> Title excceeds 50 character limit!!";
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
        document.getElementById("questTagsError").innerText = ">> Need a tag!!";
    } else {
        tags = tags.split(" ");
        tags = tags.filter((value) => value !== "");
        tags = tags.filter((item, index) => tags.indexOf(item) === index);
        
        if (tags.length > 5) {
            vaild = false;
            document.getElementById("questTagsError").innerText = ">> Excceded the 5 tags limit!!";
        } else {
            let tagNames = tagsData.map(t => t.name);
            for (const tag of tags) { 
                if (tag.length > 10) { 
                    vaild = false;
                    document.getElementById("questTagsError").innerText = ">> All tags must not be longer than 10 characters!!";
                    break;
                } else if (userData.reputation < 50 && tagNames.indexOf(tag) < 0 && userData.accType !== "Admin") {
                    vaild = false;
                    document.getElementById("questTagsError").innerText = ">> You need above 50pt reputation to create tags!!";
                }
            }

            if (vaild) { document.getElementById("questTagsError").innerText = ""; }
        }
    }

    if (vaild) {
        axios.post('http://localhost:8000/postQuestion', {
            title: title,
            summary: summary,
            text: text,
            tags: tags,
            asked_by: user,
            user_id: userData._id
        }).then(res => {
            setQuestsData([res.data, ...questsData]);
            setPageIndex(0);
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
            // if (i - (text.lastIndexOf('[', i)) <= 1) return ">> Name in hyperlink [] cannot be empty!!";
        }
    }
    return "";
}
