import Left from './fsoLeft.js'
import Right from './fsoRight.js'
import '../stylesheets/fsoMain.css'

export default function Main({pageIndex, setPageIndex, questsData, setQuestsData, tagsData, setTagsData}) {
    return (
        <div id="main">
            <Left  pageIndex = {pageIndex} setPageIndex = {setPageIndex} setQuestsData = {setQuestsData}/>
            <Right pageIndex = {pageIndex} setPageIndex = {setPageIndex} questsData = {questsData} setQuestsData = {setQuestsData} questIndex={questIndex} setQuestIndex={setQuestIndex} tagsData = {tagsData} setTagsData = {setTagsData}/>
        </div>
    );
}