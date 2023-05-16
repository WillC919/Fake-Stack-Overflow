import Left from './fsoLeft.js'
import Right from './fsoRight.js'
import '../stylesheets/fsoMain.css'

export default function Main({userData, setUserData, pageIndex, setPageIndex, questsData, setQuestsData, questIndex, setQuestIndex, tagsData, setTagsData, sortBy, setSortBy}) {
    return (
        <div id="main">
            <Left  
                userData = {userData} setUserData = {setUserData} 
                pageIndex = {pageIndex} setPageIndex = {setPageIndex} 
                setQuestsData = {setQuestsData}
            />
            <Right 
                userData = {userData} 
                pageIndex = {pageIndex} setPageIndex = {setPageIndex} 
                questsData = {questsData} setQuestsData = {setQuestsData} 
                questIndex={questIndex} setQuestIndex={setQuestIndex} 
                tagsData = {tagsData} setTagsData = {setTagsData} 
                sortBy = {sortBy} setSortBy = {setSortBy}
            />
        </div>
    );
}