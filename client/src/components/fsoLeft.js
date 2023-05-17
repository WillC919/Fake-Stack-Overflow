import '../stylesheets/fsoLeft.css';
import axios from 'axios';

export default function Left({userData, setUserData, pageIndex, setPageIndex, setQuestsData, setSortBy}) {
    async function reloadQuestions(setSortBy) {
        setSortBy(0);
        await axios.get('http://localhost:8000/questions')
        .then(res => { setQuestsData(res.data); });
    }
    
    return (
        <div id="left">
            { pageIndex === 7 ?     
                <button className="leftnav" id="profileNav" onClick={() => { setPageIndex(7); setSortBy(0); }} style={{backgroundColor: '#b6b6b6'}}>Welcome, {userData.user}</button> :
                <button className="leftnav" id="profileNav" onClick={() => { setPageIndex(7); setSortBy(0); }}>Welcome, {userData.user}</button>
            }
            { pageIndex === 0 ? 
                <button className="leftnav" id="questions" onClick={() => { setPageIndex(0); reloadQuestions(setSortBy); }} style ={{backgroundColor: '#b6b6b6'}}>Questions</button> : 
                <button className="leftnav" id="questions" onClick={() => { setPageIndex(0); reloadQuestions(setSortBy); }} >Questions</button>
            }
            { pageIndex === 1 ?     
                <button className="leftnav" id="tags" onClick={() => { setPageIndex(1); setSortBy(0); }} style={{backgroundColor: '#b6b6b6'}}>Tags</button> :
                <button className="leftnav" id="tags" onClick={() => { setPageIndex(1); setSortBy(0); }} >Tags</button> 
            }
            { userData.accType !== 'Guest' ? 
                <form action="http://localhost:8000/logout" method="post" onSubmit={(e) => {e.preventDefault(); setUserData([]); e.target.submit();}}><button className="leftnav" id="logInOut" type="Submit">Logout</button></form> : 
                <button className="leftnav" id="logInOut" onClick={() => {setUserData([])}}>Sign in/up</button>
            }
        </div>
    );
}