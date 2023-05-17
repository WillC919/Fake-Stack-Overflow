import '../stylesheets/tagPage.css'
import TagSet from './tagSet.js';

export default function Tags({userData, setPageIndex, questsData, setQuestHeader, tagsData, setTagId}) {
    
    return (
        <div>
            <table className="right" id="rightTags" width="100%">
                <tbody>
                    <tr height="100px">
                        <td width="25%"><p id="numOfTags">{tagsData.length + ' Tags'}</p></td>
                        <td width="50%"><p id="tagsHeader"> All Tags </p></td>
                        <td id="showAskQuestionBtn"><button className="askQuestion" id="askQuestion" onClick={() => {userData.accType !== 'Guest' ? setPageIndex(2):alert('Please sign in')}}>Ask Question</button></td>
                    </tr>
                </tbody>
            </table>

            <TagSet setPageIndex = {setPageIndex} questsData = {questsData} setQuestHeader = {setQuestHeader} tagsData = {tagsData} setTagId = {setTagId}/>
        </div>
    );
}
