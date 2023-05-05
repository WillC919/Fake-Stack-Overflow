import '../stylesheets/tagSet.css';

export default function TagSet({setPageIndex, questsData, setQuestHeader, tagsData, setTagId}) {
    
    return (
        <section>  
            {tagsData.map((t) =>
                <div key={t._id} className="tag-blocks">
                    <button className='tags' id={t._id} onClick={() => filterByTag(t.name, t._id, setPageIndex, setQuestHeader, setTagId)}>{t.name}</button>
                    <p>{countTag(t._id, questsData) + ' Questions'}</p>
                </div>
            )}
        </section>
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