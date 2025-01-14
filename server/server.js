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
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.listen(port, () => {
  console.log('Fake StackOverflow is now running');
})

let Tag = require('./models/tags');
let Answer = require('./models/answers');
let Question = require('./models/questions');
let User = require('./models/users');
let Comment = require('./models/comments');

let mongoose = require('mongoose');
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
  try {
    const result = await User.findById(req.params.uid.substring(1));
    res.send(result);
  } catch (err) {
    console.log("Unable to find user");
  }
});
app.post('/user/delete', async function (req, res) {
  try {
    const admin = await User.findById(req.body.id);
    if (admin.accType === "Admin") {
      const userData = await User.findById(req.body.userId);
      
      let questList = userData.questions;
      let ansList = userData.answers;
      let comList = userData.comments;

      //Quest and Answers relations with Deleted User update
      await Question.updateMany({ answers: { $in: ansList } }, { $pull: { answers: { $in: ansList } } });
      await Question.updateMany({ comments: { $in: comList } }, { $pull: { comments: { $in: comList } } });
      await Answer.updateMany({ comments: { $in: comList } }, { $pull: { comments: { $in: comList } } });

      // Finding all questions from deleted user 
      const questionsFromUser = await Question.find({ _id: { $in: questList } });

      // Get all answers under deleted questions and marking the answers for deletion
      let ansListFromQuest = [];
      questionsFromUser.forEach(q => { ansListFromQuest = ansListFromQuest.concat(q.answers); });
      ansList = [...ansList, ...ansListFromQuest];

      // All answers marked for deletion
      const answersBeingDeleted = await Answer.find({ _id: { $in: ansList } });
      
      // Get all comments from marked answers and marked questions
      let comListFromQuestAndAnswer = [];
      questionsFromUser.forEach(q => { comListFromQuestAndAnswer = comListFromQuestAndAnswer.concat(q.comments); });
      answersBeingDeleted.forEach(a => { comListFromQuestAndAnswer = comListFromQuestAndAnswer.concat(a.comments); });
      comList = [...comList, ...comListFromQuestAndAnswer];

      //User relations with Deleted User update
      await User.updateMany(
        { answers: { $in: ansList } },
        { $pull: { answers: { $in: ansList } } }
      );
      await User.updateMany(
        { comments: { $in: comList } },
        { $pull: { comments: { $in: comList } } }
      );
      
      // Record Earse
      await Answer.deleteMany({ _id: { $in: ansList } });
      await Question.deleteMany({ _id: { $in: questList } });
      await Comment.deleteMany({ _id: { $in: comList } });
      await User.deleteOne({ _id: req.body.userId });

      res.send("User has been removed");
    } else {
      res.send("User was not removed");
    }
  } catch (err) {
    console.log(err);
    res.status(500).send("An error occurred");
  }
});



app.get('/questions', async function (req, res) {
  const questions = await Question.find().sort({ask_date_time:-1});
  res.send(questions);
});
app.get('/question/:qid', async function (req, res) {
  try {
    // The .substring(1) in req.params.qid is requried because it reads the ":" as part of the id
    const result = await Question.findById(req.params.qid.substring(1)).lean();
    res.send(result);
  } catch (error) { console.log('Was unable to find the Question'); }
});
app.get('/question/:qid/view', async function (req, res) {
  try {
    // The .substring(1) in req.params.qid is requried because it reads the ":" as part of the id
    const result = await Question.findByIdAndUpdate(req.params.qid.substring(1), {$inc: {views: 1}}).lean();
    result.views += 1;
    res.send(result);
  } catch (error) { console.log('Was unable to increase the views'); }
});
app.post('/question/upvote', async function (req, res) {
  try {
    const question = await Question.findById(req.body.id);
    const user = await User.findById(req.body.userId);
    if (user.reputation >= 50 || user.accType === 'Admin'){
      if (question.downvotes.indexOf(req.body.userId) >= 0) {
        await Question.findByIdAndUpdate(req.body.id, {$pull: {downvotes: req.body.userId}});
        // await User.findByIdAndUpdate(req.body.userId, {$inc: {reputation: 5}});
      }
      if (question.upvotes.indexOf(req.body.userId) < 0) {
        await Question.findByIdAndUpdate(req.body.id, {$push: {upvotes: req.body.userId}});
        await User.findOneAndUpdate({questions: {$in: [req.body.id]}}, {$inc: {reputation: 5}});
      }
      res.send('success');
    }else{
      res.send('error');
    }
  } catch (error) { console.log(error); }
});
app.post('/question/downvote', async function (req, res) {
  try {
    const question = await Question.findById(req.body.id);
    const user = await User.findById(req.body.userId);
    if(user.reputation >= 50 || user.accType === 'Admin'){
      if (question.upvotes.indexOf(req.body.userId) >= 0) {
      await Question.findByIdAndUpdate(req.body.id, {$pull: {upvotes: req.body.userId}});
      // await User.findByIdAndUpdate(req.body.userId, {$inc: {reputation: -10}});
      }
      if (question.downvotes.indexOf(req.body.userId) < 0) {
        await Question.findByIdAndUpdate(req.body.id, {$push: {downvotes: req.body.userId}});
        await User.findOneAndUpdate({questions: {$in: [req.body.id]}}, {$inc: {reputation: -10}});
      }
      res.send('success');
    } else {
      res.send('error');
    }
  } catch (error) { console.log(error); }
});



app.get('/answers', async function (req, res) {
  const answers = await Answer.find().lean();
  res.json(answers);
});
app.get('/answer/:aid', async function (req, res) {
  try {
    // The .substring(1) in req.params.aid is requried because it reads the ":" as part of the id    
    const result = await Answer.findById(req.params.aid.substring(1));
    res.send(result);
  } catch (error) { console.log('Was unable to find the Answer'); }
});
app.get('/answer/:aid/question', async function (req, res) {
  try {
    // The .substring(1) in req.params.aid is requried because it reads the ":" as part of the id    
    const result = await Question.findOne({answers: {$in: [req.params.aid.substring(1)]}});
    res.send(result);
  } catch (error) { console.log('Was unable to find the Answer'); }
});
app.post('/answer/upvote', async function (req, res) {
  try {
    const answer = await Answer.findById(req.body.id);
    const user = await User.findById(req.body.userId);
    if(user.reputation >= 50 || user.accType === 'Admin'){
      if (answer.downvotes.indexOf(req.body.userId) >= 0) {
        await Answer.findByIdAndUpdate(req.body.id, {$pull: {downvotes: req.body.userId}});
        // await User.findByIdAndUpdate(req.body.userId, {$inc: {reputation: 5}});
      }
      if (answer.upvotes.indexOf(req.body.userId) < 0) {
        await Answer.findByIdAndUpdate(req.body.id, {$push: {upvotes: req.body.userId}});
        await User.findOneAndUpdate({answers: {$in: [req.body.id]}}, {$inc: {reputation: 5}});
      }
      res.send('success');
    } else {
      res.send('error')
    }
  } catch (error) { console.log(error); }
});
app.post('/answer/downvote', async function (req, res) {
  try {
    const answer = await Answer.findById(req.body.id);
    const user = await User.findById(req.body.userId);
    if(user.reputation >= 50 || user.accType === 'Admin'){
      if (answer.upvotes.indexOf(req.body.userId) >= 0) {
        await Answer.findByIdAndUpdate(req.body.id, {$pull: {upvotes: req.body.userId}});
        // await User.findByIdAndUpdate(req.body.userId, {$inc: {reputation: -10}});
      }
      if (answer.downvotes.indexOf(req.body.userId) < 0) {
        await Answer.findByIdAndUpdate(req.body.id, {$push: {downvotes: req.body.userId}});
        await User.findOneAndUpdate({answers: {$in: [req.body.id]}}, {$inc: {reputation: -10}});
      }
      res.send('success');
    } else {
      res.send('error')
    }
  } catch (error) { console.log(error); }
});




app.get('/tags', async function (req, res) {
  const tags = await Tag.find();
  res.send(tags);
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
app.post('/edittag/:tid', async function (req, res) {
  try {
    await Tag.findByIdAndUpdate(req.params.tid.substring(1), {name: req.body.name});
    res.send('Update tag success');
  } catch (error) { console.log('Was unable to update tag'); }
});
app.post('/deletetag/:tid', async function (req, res) {
  try {
    const tag = await Tag.findByIdAndRemove(req.params.tid.substring(1));
    await User.updateOne({tags: {$in: req.params.tid.substring(1)}}, {$pull: {tags: req.params.tid.substring(1)}});
    await Question.updateMany({tags: {$in: req.params.tid.substring(1)}}, {$pull: {tags: req.params.tid.substring(1)}});
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
app.post('/comment/:cid/upvote/:uid', async function (req, res) {
  try {
    // The .substring(1) in req.params.aid is requried because it reads the ":" as part of the id    
    const result = await Comment.findByIdAndUpdate(req.params.cid.substring(1), {$push: {upvotes: req.params.uid.substring(1)}}, {new:true}).lean();
    res.send(result);
  } catch (error) { console.log('Was unable to find the Comment'); }
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
    const result = await User.findOne({email: req.body.email});
    bcrypt.compare(req.body.password, result.password, (err, result) => {
      if (err) res.send(false);
      else res.send(result);
    })
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
    bcrypt.hash(req.body.signUpPassword, saltRounds, (err, hash) => {
      if (err) console.log(err);
      let acc = new User({
        email: (req.body.signUpEmail).toLowerCase(),
        user: req.body.signUpUsername,
        password: hash,
        member_since: new Date(),
      });

      acc.save();
      req.session.userId = (req.body.signUpEmail).toLowerCase();
      req.session.isAuthenticated = true;
      res.redirect('http://localhost:3000/');
    })    
  } catch (error) {
    console.log(error)
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

    // The .substring(1) in req.params.qid is requried because it reads the ":" as part of the id
    const result = await Question.findByIdAndUpdate(req.params.qid.substring(1),
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
    await user.save();
    res.send(result);
  } catch (error) { console.log(error); }
});
app.post('/deletequestion/:qid', async function (req, res) {
  try {
    // The .substring(1) in req.params.qid is requried because it reads the ":" as part of the id
    const question = await Question.findByIdAndRemove(req.params.qid.substring(1));
    await User.updateOne({questions: {$in: req.params.qid.substring(1)}}, {$pull: {questions: req.params.qid.substring(1)}})
    const answers = question.answers;
    const comments = question.comments;
    for(let i = 0; i < answers.length; i++){
      const ans = await Answer.findByIdAndRemove(answers[i]);
      for(let j = 0; j < ans.comments.length; j++){
        await Comment.findByIdAndRemove(ans.comments[i]);
      }
    }
    for(let i = 0; i < comments.length; i++){
      await Comment.findByIdAndRemove(comments[i]);
    }
    
    res.send('Removed Success');
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
  await User.findByIdAndUpdate(req.body.user_id, {$push: {answers: ans._id}})
  try {
    //User.findByIdAndUpdate(req.body.user_id, {$push: {answers: ans._id}});
    let result = await Question.findByIdAndUpdate(req.body.qid, {$push: {answers: ans._id}}).lean();
    res.send(result);
  } catch (error) { console.log('Was unable to find the Question'); }
});
app.post('/editanswer/:aid', async function (req, res) {
  const result = await Answer.findByIdAndUpdate(req.params.aid.substring(1),
    { 
      $set: {
        text: req.body.text,
      },
    },
    { new: true }
  );
  await result.save();
  try {
    res.send(result);
  } catch (error) { console.log('Was unable to edit the question'); }
});
app.post('/deleteanswer/:aid', async function (req, res) {
  const answer = await Answer.findByIdAndRemove(req.params.aid.substring(1));
  await User.updateOne({answers: {$in: req.params.aid.substring(1)}}, {$pull: {answers: req.params.aid.substring(1)}})
  await Question.updateOne({answers: {$in: req.params.aid.substring(1)}}, {$pull: {answers: req.params.aid.substring(1)}})
  const comments = answer.comments;
  for(let i = 0; i < comments.length; i++){
    await Comment.findByIdAndRemove(comments[i]);
  }
  
  res.send('Removed Success');
})



app.post('/postComment', async function (req, res) {
  let commentDetail = {
    text: req.body.text,
    commented_by: req.body.com_by,
    commented_date: new Date(),
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



app.post('/sortActive', async function (req, res) {
  //const result = await Question.find().populate('answers').sort({'answers.ans_date_time': -1}).exec();
  const questIds = (req.body.dataset).map(q => q._id);
  const result = await Question.find({_id: {$in: questIds}}).populate('answers').sort({'answers.ans_date_time': -1}).exec();
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
    db.close().then(() => console.log('DB connection closed')).catch((err) => console.log(err));
  }
  console.log('Server closed. Database instance disconnected.');
  //Server closed. Database instance disconnected
});