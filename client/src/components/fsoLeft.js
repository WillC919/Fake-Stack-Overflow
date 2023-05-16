import '../stylesheets/fsoLeft.css';
import axios from 'axios';

export default function Left({userData, setUserData, pageIndex, setPageIndex, setQuestsData}) {
    async function reloadQuestions() {
        await axios.get('http://localhost:8000/questions')
        .then(res => { setQuestsData(res.data); });
    }
    
    return (
        <div id="left">
            { pageIndex === 7 ?     
                <button className="leftnav" id="profileNav" onClick={() => setPageIndex(7)} style={{backgroundColor: '#b6b6b6'}}>Welcome, {userData.user}</button> :
                <button className="leftnav" id="profileNav" onClick={() => setPageIndex(7)}>Welcome, {userData.user}</button>
            }
            { pageIndex === 0 ? 
                <button className="leftnav" id="questions" onClick={() => {setPageIndex(0); reloadQuestions();}} style ={{backgroundColor: '#b6b6b6'}}>Questions</button> : 
                <button className="leftnav" id="questions" onClick={() => {setPageIndex(0); reloadQuestions();}} >Questions</button>
            }
            { pageIndex === 1 ?     
                <button className="leftnav" id="tags" onClick={() => {setPageIndex(1)}} style={{backgroundColor: '#b6b6b6'}}>Tags</button> :
                <button className="leftnav" id="tags" onClick={() => {setPageIndex(1)}} >Tags</button> 
            }
            { userData.accType !== 'Guest' ? 
                <form action="http://localhost:8000/logout" method="post" onSubmit={(e) => {e.preventDefault(); setUserData([]); e.target.submit();}}><button className="leftnav" id="logInOut" type="Submit">Logout</button></form> : 
                <button className="leftnav" id="logInOut" onClick={() => {setUserData([])}}>Sign in/up</button>
            }
        </div>
    );
}