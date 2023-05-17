import { useEffect, useState } from 'react';
import '../../stylesheets/tagSet.css';
import '../../stylesheets/tagPage.css'
import axios from 'axios';

export default function TagEdit({userData, setPageIndex, questsData, setQuestHeader, setTagId, subUser, isSubuser, setIsSubuser}) {
    const [tagsData, setTagsData] = useState([]);
    const [questions, setQuestions] = useState(questsData)
    
    useEffect(() => {
        async function fetchData(){
            try {
                let user;
                if (isSubuser){
                    user = await axios.get(`http://localhost:8000/userId/:${subUser._id}`);
                    setIsSubuser(false);
                }else{
                    user = await axios.get(`http://localhost:8000/userId/:${userData._id}`)
                }
                let tagPromises = await user.data.tags.map(t => fetchTagData(t));
                let tagsData = await Promise.all(tagPromises);
                setTagsData(tagsData);

                let q = await axios.get(`http://localhost:8000/questions`);
                setQuestions(q.data);
            } catch (error) {
                console.log(error);
                return null;
            }
        }
        async function fetchTagData(tagId){
            try {
                const response = await axios.get(`http://localhost:8000/tag/tid/:${tagId}`);
                return response.data;
            } catch (error) {
                console.log('Error in fetching Tag');
                return null;
            }
        }
        fetchData();
        
    }, [userData._id])
    return (
        <div>
            <table className="right" id="rightTags" width="100%">
                <tbody>
                    <tr height="100px">
                        <td width="25%"><p id="numOfTags">{tagsData.length + ' Tags'}</p></td>
                        <td width="50%"><p id="tagsHeader"> Tags You&apos;ve Created </p></td>
                        <td id="showAskQuestionBtn"><button className="askQuestion" id="askQuestion">Ask Question</button></td>
                    </tr>
                </tbody>
            </table>
            <div>  
                {tagsData.map((t) =>
                    <div key={t._id} className="tag-blocks">
                        <button className='tags' id={t._id} onClick={() => filterByTag(t.name, t._id, setPageIndex, setQuestHeader, setTagId)}>{t.name}</button>
                        <p>{countTag(t._id, questions) + ' Questions'}</p>
                        <button onClick={() => editTag(t._id, setTagId, userData, questions, setPageIndex)}>Edit</button>
                        <button onClick={() => deleteTag(t._id, userData, questions, setPageIndex)}>Delete</button>
                    </div>                   
                )}
            </div>

        </div>
    );
}

function filterByTag(tagName, tagId, setPageIndex, setQuestHeader, setTagId) {
    setPageIndex(6);
    setTagId(tagId);
    setQuestHeader(tagName);
}

function countTag(tid, questsData) {
    let count = 0;
    for (let i = 0; i < questsData.length; i++) {
        if (questsData[i].tags.includes(tid)) {
            count++;
        }
    }
    return count;
}

function deleteTag(tid, userData, questsData, setPageIndex) {
    //checks if other users uses the tag
    for (let i = 0; i < questsData.length; i++) {
        if (questsData[i].tags.includes(tid)) {
            let qid = questsData[i]._id;
            if (!userData.questions.includes(qid)){
                alert('Cannot delete this tag when other users are using it!!');
                return;
            }
        }
    }
    try{
        axios.post(`http://localhost:8000/deletetag/:${tid}`).then( res => {
            console.log(res)
            // setTagsData()
            alert('successful');
            setPageIndex(7)
        })
        .catch(err => {console.log(err);});

    } catch (error) {
        console.log(error);
    }
}

function editTag(tid, setTagId, userData, questsData, setPageIndex){
    for (let i = 0; i < questsData.length; i++) {
        if (questsData[i].tags.includes(tid)) {
            let qid = questsData[i]._id;
            if (!userData.questions.includes(qid)){
                alert('Cannot edit this tag when other users are using it!!');
                return;
            }
        }
    }
    setTagId(tid);
    setPageIndex(10);
    
    // let tags = textValue;
    // let valid = true;
    // if (tags.length === 0) {
    //     valid = false;
    //     alert(">> Needs tag!!");
    // } else if (tags.length > 10) { 
    //     valid = false;
    //     alert(">>Tag must not be longer than 10 characters!!");
    // } else if (tags.indexOf(' ') > -1) {
    //     valid = false;
    //     alert(">>Tag must be one-word, use dash instead of space!!")
    // }
    
    // if(valid) {
    //     try{
    //         axios.post(`http://localhost:8000/edittag/:${tid}`,  {name: textValue}).then( res => {
    //             // setTagsData()
    //             alert('successful');
    //             setPageIndex(7)
    //         })
    //         .catch(err => {console.log(err);});
    
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }else{
        
    // }
}