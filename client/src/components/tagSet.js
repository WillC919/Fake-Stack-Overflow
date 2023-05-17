import axios from 'axios';
import '../stylesheets/tagSet.css';
import { useState, useEffect } from 'react';

export default function TagSet({setPageIndex, questsData, setQuestHeader, tagsData, setTagId}) {

    const [tags, setTags] = useState(tagsData);
    const [questions, setQuestions] = useState(questsData)
    
    useEffect(() => {
        async function fetchData(){
            try {
                const tags = await axios.get(`http://localhost:8000/tags`);
                setTags(tags);

                let q = await axios.get(`http://localhost:8000/questions`);
                setQuestions(q.data);
            } catch (error) {
                console.log(error);
                setTags(null);
            }
        }
        
        fetchData();
        
    }, [tags])

    return ( tags !== null?
        <section>  
            {tagsData.map((t) =>
                <div key={t._id} className="tag-blocks">
                    <button className='tags' id={t._id} onClick={() => filterByTag(t.name, t._id, setPageIndex, setQuestHeader, setTagId)}>{t.name}</button>
                    <p>{countTag(t._id, questions) + ' Questions'}</p>
                </div>
            )}
        </section>
        :
        <h1>Unable to load</h1>

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