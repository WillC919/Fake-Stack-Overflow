// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
const express = require('express');
const app = express();
var cors = require('cors');
const port = 8000;
const session = require("express-session")
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

app.listen(port, () => {
  console.log('Fake StackOverflow is now running');
})

let Tag = require('./models/tags');
let Answer = require('./models/answers');
let Question = require('./models/questions');
let User = require('./models/users');
let Comment = require('./models/comments');

let mongoose = require('mongoose');
const { after } = require('node:test');
let mongoDB = "mongodb://127.0.0.1:27017/fake_so";
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.on('connected', function() { console.log('Connected to database'); });

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  session({
    // For simplicity the secret is hard-coded. Ideally should be read from environment variables.
    secret: "secret to sign session cookie",
    cookie: { secure: false },
    resave: false,
    saveUninitialized: false
  })
)

app.get('/cookie', async function (req, res) {
  if (req.session.isAuthenticated) {
    try {
      //console.log(req.session.userId);
      const result = await User.findOne({email: req.session.userId}).lean();
      res.send(result);
    } catch (error) { res.send([]); }
  } else if (req.session.userId === 'Guest') {
    // res.send([{email: 'Guest', username: 'Anonymous', password: null, reputation: null}]);
    res.send({user: 'Anonymous', accType: 'Guest'});
  } else { res.send([]); }
});

app.get('/users', async function (req, res) {
  const users = await User.find().lean();
  res.send(users);
});
app.get('/user/:email', async function (req, res) {
  try {
    // The .substring(1) in req.params.qid is requried because it reads the ":" as part of the id
    const result = await User.findOne({email: req.params.email.toLowerCase().substring(1)}).lean();
    if (result) res.send(true);
    else res.send(false);
  } catch (error) { console.log('Was unable to find the email'); }
});
app.get('/userId/:uid', async function (req, res) {
  try{
    const result = await User.findById(req.params.uid.substring(1));
    res.send(result);
  }catch (err) {
    console.log(err)
  }
});


app.get('/questions', async function (req, res) {
  const questions = await Question.find().sort({ask_date_time:-1});
  res.send(questions);
});
app.get('/question/:qid', async function (req, res) {
  try {
    // The .substring(1) in req.params.qid is requried because it reads the ":" as part of the id
    const result = await Question.findByIdAndUpdate(req.params.qid.substring(1), {$inc: {views: 1}}).lean();
    result.views += 1;
    res.send(result);
  } catch (error) { console.log('Was unable to find the Question'); }
});
app.post('/question/:qid/upvote', async function (req, res) {
  try {
    // The .substring(1) in req.params.qid is requried because it reads the ":" as part of the id
    const qid = req.params.qid.substring(1);
    const question = await Question.findByIdAndUpdate(qid, {$inc: {votes: 1}});
    const rep = question.votes * 5;
    const user = await User.findOneAndUpdate({questions:{$elemMatch:{$in:[qid]}}}, {reputation: rep})
    await user.save();
  } catch (error) { console.log(error); }
});
app.post('/question/:qid/downvote', async function (req, res) {
  try {
    // The .substring(1) in req.params.qid is requried because it reads the ":" as part of the id
    const qid = req.params.qid.substring(1);
    const question = await Question.findByIdAndUpdate(qid, {$inc: {votes: -1}});
    const rep = question.votes * 5;
    const user = await User.findOneAndUpdate({questions:{$elemMatch:{$in:[qid]}}}, {reputation: rep})
    await user.save();
  } catch (error) { console.log(error); }
});



app.get('/answers', async function (req, res) {
  const answers = await Answer.find().lean();
  res.json(answers);
});
app.get('/answer/:aid', async function (req, res) {
  try {
    // The .substring(1) in req.params.aid is requried because it reads the ":" as part of the id    
    const result = await Answer.findById(req.params.aid.substring(1)).lean();
    res.send(result);
  } catch (error) { console.log('Was unable to find the Answer'); }
});



app.get('/tags', async function (req, res) {
  const tags = await Tag.find().lean();
  res.json(tags);
});
app.get('/tag/:tid', async function (req, res) {
  try {
    // The .substring(1) in req.params.tid is requried because it reads the ":" as part of the id
    // Here it returns the questions that has the tag instead of the tag detail itself    
    const tid = req.params.tid.substring(1);
    const questions = await Question.find({tags:{$elemMatch:{$in:[tid]}}});
    res.send(questions);
  } catch (error) { console.log('Was unable to find the tag'); }
});
app.get('/tag/tid/:tid', async function (req, res) {
  try {
    // The .substring(1) in req.params.tid is requried because it reads the ":" as part of the id
    // Here it returns the questions that has the tag instead of the tag detail itself    
    const tid = req.params.tid.substring(1);
    const tag = await Tag.findById(tid);
    res.send(tag);
  } catch (error) { console.log('Was unable to find the tag'); }
});




app.get('/comments', async function (req, res) {
  const comments = await Comment.find().lean();
  res.json(comments);
});
app.get('/comment/:cid', async function (req, res) {
  try {
    // The .substring(1) in req.params.aid is requried because it reads the ":" as part of the id    
    const result = await Comment.findById(req.params.cid.substring(1)).lean();
    console.log(result);
    res.send(result);
  } catch (error) { console.log('Was unable to find the Comment'); }
});
app.post('/comment/:cid/upvote', async function (req, res) {
  try {
    // The .substring(1) in req.params.qid is requried because it reads the ":" as part of the id
    const cid = req.params.cid.substring(1);
    const comment = await Comment.findByIdAndUpdate(cid, {$inc: {votes: 1}});
    const rep = comment.votes * 5;
    const user = await User.findOneAndUpdate({questions:{$elemMatch:{$in:[cid]}}}, {reputation: rep})
    await user.save();
  } catch (error) { console.log(error); }
});
app.post('/comment/:cid/downvote', async function (req, res) {
  try {
    // The .substring(1) in req.params.qid is requried because it reads the ":" as part of the id
    const cid = req.params.cid.substring(1);
    const comment = await Comment.findByIdAndUpdate(cid, {$inc: {votes: -1}});
    const rep = comment.votes * 5;
    const user = await User.findOneAndUpdate({questions:{$elemMatch:{$in:[cid]}}}, {reputation: rep})
    await user.save();
  } catch (error) { console.log(error); }
});






app.post('/find', async (req, res) => { 
  let keywords = await req.body.wordKeys;
  let keytags = await req.body.tagKeys;
  const keytagIds = [];

  keywords = keywords.map((str) => new RegExp(`\\b${str}\\b`, 'i'));
  keytags = keytags.map((str) => new RegExp(`\\b${str.substring(1, str.length-1)}\\b`, 'i'));

  for (let i = 0; i < keytags.length; i++) {
    try {
      let tagRaw = await Tag.findOne({name: keytags[i]});
      keytagIds.push(tagRaw._id);
    } catch (error) { console.log(error); }
  }

  let questData = [];
  try {
    questData = await Question.find({$or: [
      {title: {$in: keywords}}, 
      {text: {$in: keywords}}, 
      {tags: {$in: keytagIds}}
    ]}).lean();
  } catch (error) { console.log(error); } 
  questData.sort((a, b) => {
    return b.ask_date_time - a.ask_date_time;
  });
  res.send(questData);
});



app.post('/verify', async function (req, res) {
  try {
    const result = await User.findOne({email: req.body.email, password: req.body.password});
    if (result) res.send(true);
    else res.send(false);
  } catch (error) {
    res.send(false);
  }
});
app.post('/login', async function (req, res) {
  try {
    req.session.userId = (req.body.loginEmail).toLowerCase();
    req.session.isAuthenticated = true;
    res.redirect('http://localhost:3000/');
    // res.send(req.session);
  } catch (error) {
    res.send(`<h1>Something went wrong. Please Try Again.</h1>`);
  }
});
app.post('/addUser', async function (req, res) {
  try {
    let userDetail = {
      email: (req.body.signUpEmail).toLowerCase(),
      user: req.body.signUpUsername,
      password: req.body.signUpPassword,
      member_since: new Date(),
    };
  
    let acc = new User(userDetail);
    await acc.save();
    req.session.userId = (req.body.signUpEmail).toLowerCase();
    req.session.isAuthenticated = true;
    res.redirect('http://localhost:3000/');
  } catch (error) {
    res.send(`<h1>Something went wrong. Please Try Again.</h1>`);
  }
});
app.post("/guest", (req, res) => {
  try {
    req.session.userId = "Guest";
    req.session.isAuthenticated = false;
    res.redirect('http://localhost:3000/');
  } catch (error) {
    res.send(`<h1>Something went wrong. Please Try Again.</h1>`);
  }
})
app.post("/logout", (req, res) => {
  if (req.session){
    req.session.destroy(err => { 
      if (err) {
        res.status(400).send('Unable to log out')
      } else {
        res.redirect('http://localhost:3000/')
      }
    });
  }
})

app.post('/postQuestion', async function (req, res) {
  try {
    let tags = [];
    let user = await User.findOne({_id: req.body.user_id});

    for (let i = 0; i < req.body.tags.length; i++){
      let existedTag = await Tag.findOne(({name: req.body.tags[i]}))
      if (existedTag === null){
        existedTag = new Tag({name: req.body.tags[i]});
        await existedTag.save();
        user.tags.push(existedTag._id);
      }
      tags.push(existedTag._id);
    }

    let questDetail = {
      title: req.body.title,
      summary: req.body.summary,
      text: req.body.text,
      tags: tags,
      asked_by: req.body.asked_by,
      ask_date_time: new Date(),
    };

    let quest = new Question(questDetail);
    await quest.save();

    user.questions.push(quest._id);
    await user.save();

    res.send(quest);
  } catch (err) {
    console.log('Cannot post question');
  }
});
app.post('/editquestion/:qid', async function (req, res) {
  try {
    console.log(req.body.title);
    let tags = [];
    for (let i = 0; i < req.body.tags.length; i++){
      let existedTag = await Tag.findOne(({name: req.body.tags[i]}))
      if (existedTag === null){
        existedTag = new Tag({name: req.body.tags[i]});
        await existedTag.save();
      }
      tags.push(existedTag._id);
    }

    // The .substring(1) in req.params.qid is requried because it reads the ":" as part of the id
    const result = await Question.findOneAndUpdate({ _id: req.params.qid.substring(1) },
      { 
        $set: {
          title: req.body.title,
          summary: req.body.summary,
          text: req.body.text,
          tags: tags,
        },
      },
      { new: true }
    );
    
    await result.save();
    console.log(result);
    res.send(result);
  } catch (error) { console.log(error); }
});

app.post('/postAnswer', async function (req, res) {
  let answerDetail = {
    text: req.body.text,
    ans_by: req.body.ans_by,
    ans_date_time: new Date()
  };

  let ans = new Answer(answerDetail);
  ans = await ans.save();

  try {
    //User.findByIdAndUpdate(req.body.user_id, {$push: {answers: ans._id}});
    let result = await Question.findByIdAndUpdate(req.body.qid, {$push: {answers: ans._id}}).lean();
    res.send(result);
  } catch (error) { console.log('Was unable to find the Question'); }
});

app.post('/postComment', async function (req, res) {
  let commentDetail = {
    text: req.body.text,
    commented_by: req.body.com_by,
    commented_date: new Date()
  };

  let com = new Comment(commentDetail);
  com = await com.save();

  try {
    //User.findByIdAndUpdate(req.body.user_id, {$push: {comments: com._id}});
    let result = await Question.findByIdAndUpdate(req.body.id, {$push: {comments: com._id}}).lean();
    if (result) { res.send(com); }
    else { 
      result = await Answer.findByIdAndUpdate(req.body.id, {$push: {comments: com._id}}).lean(); 
      res.send(com);
    }
  } catch (error) { console.log('Was unable to find the Question'); }
});



app.get('/sortActive', async function (req, res) {
  const result = await Question.find().populate('answers').sort({'answers.ans_date_time': -1}).exec();
  result.sort((a, b) => {
    const dateA = a.answers.length !== 0 ? a.answers[a.answers.length-1].ans_date_time : 0;
    const dateB = b.answers.length !== 0 ? b.answers[b.answers.length-1].ans_date_time : 0;
    return dateB - dateA;
  });
  res.send(result);
});

app.get('/sortUnanswered', async function (req, res) {
  try {
    const questions = await Question.find({answers: []}).sort({ask_date_time:-1});
    res.send(questions)
  } catch(error) {console.log('Unable to sort by unanswered');}
})





// close mongoose connection
process.on('SIGINT', () => {
  if (db) {
    db.close().then((result) => console.log('DB connection closed')).catch((err) => console.log(err));
  }
  console.log('Server closed. Database instance disconnected.');
  //Server closed. Database instance disconnected
});