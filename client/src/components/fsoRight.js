import Tags from './tagPage.js'

import Questions from './questionPage.js'
import PostQuestion from './questionPost.js';

import Answers from './answerPage.js'
import PostAnswer from './answerPost.js';

import Profile from './profile/profilePage.js';

import '../stylesheets/fsoRight.css'
import { useState } from 'react';
import QuestionEdit from './profile/questionEdit.js';
import TagEdit from './profile/tagEdit.js';
import TagEdit2 from './profile/tagEdit2.js';

export default function Right({userData, pageIndex, setPageIndex, questsData, setQuestsData, questIndex, setQuestIndex, tagsData, setTagsData}) {
    const [questionId, setQuestionId] = useState('');
    const [questHeader, setQuestHeader] = useState('All Questions');
    const [tagId, setTagId] = useState('');
    const [fromProfile, setFromProfile] = useState(false);
   
    if (questHeader !== 'All Questions' && pageIndex === 0) setQuestHeader('All Questions');
    if (questHeader !== 'Search' && pageIndex === 5) setQuestHeader('Search');
    
    return (
        <div id="right">
            { (pageIndex === 0 || pageIndex === 5 || pageIndex === 6) 
                && <Questions userData = {userData} pageIndex = {pageIndex} setPageIndex = {setPageIndex} setQuestionId = {setQuestionId} questHeader = {questHeader} questsData = {questsData} setQuestsData = {setQuestsData} questIndex={questIndex} setQuestIndex={setQuestIndex} tagsData = {tagsData} setTagsData = {setTagsData} tagId = {tagId}/> } 
            
            { pageIndex === 1 && <Tags setPageIndex = {setPageIndex} questsData = {questsData} setQuestHeader = {setQuestHeader} tagsData = {tagsData} setTagId = {setTagId}/> }
                        
            { pageIndex === 2 && <PostQuestion userData = {userData} setPageIndex = {setPageIndex} questsData = {questsData} setQuestsData = {setQuestsData}/> }
            
            { pageIndex === 3 && <Answers userData = {userData} setPageIndex = {setPageIndex} questionId={questionId} fromProfile = {fromProfile} setFromProfile = {setFromProfile}/> }
            
            { pageIndex === 4 && <PostAnswer userData = {userData} setPageIndex = {setPageIndex} questionId={questionId}/> }

            { pageIndex === 7 && <Profile userData = {userData} setPageIndex = {setPageIndex} setQuestionId = {setQuestionId} setFromProfile = {setFromProfile}/>}

            { pageIndex === 8 && <QuestionEdit userData = {userData} setPageIndex = {setPageIndex} questsData = {questsData} setQuestsData = {setQuestsData} questionId = {questionId}/>}

            { pageIndex === 9 && <TagEdit userData = {userData} setPageIndex = {setPageIndex} questsData = {questsData} setQuestHeader = {setQuestHeader} setTagId = {setTagId}/>}

            { pageIndex === 10 && <TagEdit2 userData = {userData} setPageIndex = {setPageIndex} questsData = {questsData} tagId = {tagId}/>}
        </div>
    );
}
