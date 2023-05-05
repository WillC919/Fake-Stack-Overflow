// Run this script to launch the server.
// The server should run on localhost port 8000.
// This is where you should start writing server-side code for this application.
const express = require('express');
const app = express();
var cors = require('cors');
const port = 8000;
const session = require("express-session")

app.listen(port, () => {
  console.log('Fake StackOverflow is now running');
})

let Tag = require('./models/tags');
let Answer = require('./models/answers');
let Question = require('./models/questions');
let User = require('./models/users');

let mongoose = require('mongoose');
let mongoDB = "mongodb://127.0.0.1:27017/fake_so";
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.on('connected', function() { console.log('Connected to database'); });

app.use(cors());
app.use(express.json());

app.use(
  session({
    // For simplicity the secret is hard-coded. Ideally should be read from environment variables.
    secret: "secret to sign session cookie",
    cookie: {},
    resave: false,
    saveUninitialized: false
  })
)





app.get('/users', async function (req, res) {
  const users = await User.find().lean();
  res.send(users);
});
app.get('/checkFor/:email', async function (req, res) {
  try {
    // The .substring(1) in req.params.qid is requried because it reads the ":" as part of the id
    const result = await User.findOne({email: req.params.email.substring(1)}).lean();
    if (result) res.send(true);
    else res.send(false);
  } catch (error) { console.log('Was unable to find the email'); }
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
    const tid = req.params.tid.substring(1);
    const questions = await Question.find({tags:{$elemMatch:{$in:[tid]}}});
    res.send(questions);
  } catch (error) { console.log('Was unable to find the tag'); }
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

app.post('/postQuestion', async function (req, res) {
  let tags = [];
  
  for (let i = 0; i < req.body.tags.length; i++){
    let existedTag = await Tag.findOne(({name: req.body.tags[i]}))
    if (existedTag === null){
      existedTag = new Tag({name: req.body.tags[i]});
      await existedTag.save()
    }
    tags.push(existedTag._id);
  }

  let questDetail = {
    title: req.body.title,
    text: req.body.text,
    tags: tags,
    asked_by: req.body.asked_by,
    ask_date_time: new Date(),
  };

  let quest = new Question(questDetail);
  await quest.save();
  res.send(quest);
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
    let result = await Question.findByIdAndUpdate(req.body.qid, {$push: {answers: ans._id}}).lean();
    res.send(result);
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