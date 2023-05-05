import '../stylesheets/fsoLeft.css';
import axios from 'axios';

export default function Left({pageIndex, setPageIndex, setQuestsData}) {
    function reloadQuestions() {
        axios.get('http://localhost:8000/questions')
        .then(res => { setQuestsData(res.data); });
    }

    if (pageIndex === 0) {
        return (
            <div id="left">
                <button className="leftnav" id="questions" onClick={() => {setPageIndex(0); reloadQuestions();}} style={{backgroundColor: '#b6b6b6'}}>Questions</button>
                <button className="leftnav" id="tags" onClick={() => {setPageIndex(1)}} >Tags</button>
            </div>
        );
    } else if (pageIndex === 1) {
        return (
            <div id="left">
                <button className="leftnav" id="questions" onClick={() => {setPageIndex(0); reloadQuestions();}} >Questions</button>
                <button className="leftnav" id="tags" onClick={() => {setPageIndex(1)}} style={{backgroundColor: '#b6b6b6'}}>Tags</button>
            </div>
        );
    } else {
        return (
            <div id="left">
                <button className="leftnav" id="questions" onClick={() => {setPageIndex(0); reloadQuestions();}}>Questions</button>
                <button className="leftnav" id="tags" onClick={() => {setPageIndex(1); reloadQuestions();}}>Tags</button>
            </div>
        );
    }
}
