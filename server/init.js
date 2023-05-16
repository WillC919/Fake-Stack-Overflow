//Setup database with initial test data.
// Include an admin user.
// Script should take admin credentials as arguments as described in the requirements doc.
// mongodb://127.0.0.1:27017/fake_so
// Do NOT USE mongodb://localhost:27017/fake_so

let userArgs = process.argv.slice(2);

if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

let Comment = require('./models/comments')
let Tag = require('./models/tags')
let Answer = require('./models/answers')
let Question = require('./models/questions')
let User = require('./models/users')

let mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

let mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

function tagCreate(names) {
  let tag = new Tag({name: names});
  return tag.save();
}

function answerCreate(text, ans_by, ans_date_time) {
  answerdetail = {text:text};

  if (ans_by != false) answerdetail.ans_by = ans_by;
  if (ans_date_time != false) answerdetail.ans_date_time = ans_date_time;

  let answer = new Answer(answerdetail);
  return answer.save();
}

async function questionCreate(title, summary, text, tagIds, answerIds, asked_by, ask_date_time, views) {
    qstndetail = {
      title: title,
      summary: summary,
      text: text,
      tags: tagIds,
      asked_by: asked_by
    }
    if (answerIds != false) qstndetail.answers = answerIds;
    if (ask_date_time != false) qstndetail.ask_date_time = ask_date_time;
    if (views != false) qstndetail.views = views;
    let qstn = new Question(qstndetail);
    return qstn.save();
}

async function createUser(email, user, password, reputation, accType, questionIds, answerIds) {
  try {
    const hash = bcrypt.hashSync(password, saltRounds);
    let users = {
        email: email,
        user: user,
        password: hash,
    };

    if (reputation != false) users.reputation = reputation;
    if (accType != false) users.accType = accType;

    if (questionIds) users.questions = questionIds;
    if (answerIds) users.answers =answerIds;
    
    let u = new User(users);
    return u.save()
    .then(() => {console.log('User created successfully');})
    .catch((error) => {console.log('Unable to create user:');});

  } catch (err) {
    console.log('Unable to create user');
  }
}

const init = async () => {
    let t1 = await tagCreate('react');
    let t2 = await tagCreate('javascript');
    let t3 = await tagCreate('android');
    let t4 = await tagCreate('shared');
    let t5 = await tagCreate('delete');

    //Deleted Answers Testcase
    let a1 = await answerCreate('Delete this A1', 't1', false);
    let a2 = await answerCreate('Delete this A2', 't1', false);
    let a3 = await answerCreate('Delete this A3', 't1', false);
    let a4 = await answerCreate('Delete this A4', 't1', false);

    let a5 = await answerCreate('Delete this A5', 't2', false);
    let a6 = await answerCreate('Delete this A6', 't2', false);
    let a7 = await answerCreate('Delete this A7', 't2', false);
    let a8 = await answerCreate('Delete this A8', 't2', false);

    let a9 = await answerCreate('Delete this A9', 't3', false);
    let a10 = await answerCreate('Delete this A10', 't3', false);
    let a11 = await answerCreate('Delete this A11', 't3', false);
    let a12 = await answerCreate('Delete this A12', 't3', false);

    // Normal Answers Testcase
    let a13 = await answerCreate('Normal A13', 't2', false);
    let a14 = await answerCreate('Normal A14', 't3', false);
    let a15 = await answerCreate('Normal A15', 't3', false);
    let a16 = await answerCreate('Normal A16', 't3', false);
    let a17 = await answerCreate('Normal A17', 't4', false);
    let a18 = await answerCreate('Normal A18', 't4', false);
    let a19 = await answerCreate('Normal A19', 't4', false);
    let a20 = await answerCreate('Normal A20', 't4', false);

    //Deleted Questions Testcase
    let q1 = await questionCreate('Delete This Q1', 'd1', 'd1 test case', [t1, t2, t3], [a1, a5, a10], 't1', false, false);
    let q2 = await questionCreate('Delete This Q2', 'd2', 'd2 test case', [t5], [a11, a12, a6], 't1', false, false);
    let q3 = await questionCreate('Delete This Q3', 'd3', 'd3 test case', [t2, t5], [a7, a8, a9], 't1', false, false);

    // Normal Questions Testcase
    let q4 = await questionCreate('Normal Q4', 'q4', 'q4 test case', [t1, t3], [a2, a13, a14, a17, a20], 't2', false, false);
    let q5 = await questionCreate('Normal Q5', 'q5', 'q5 test case', [t4], [a3, a4, a15], 't3', false, false);
    let q6 = await questionCreate('Normal Q6', 'q6', 'q6 test case', [t2], [a16], 't4', false, false);
    let q7 = await questionCreate('Normal Q7', 'q7', 'q7 test case', [t1, t4], [], 't2', false, false);
    let q8 = await questionCreate('Normal Q8', 'q8', 'q8 test case', [t1], [a18, a19], 't2', false, false);
    let q9 = await questionCreate('Normal Q9', 'q9', 'q9 test case', [t2], [], 't3', false, false);


    let ua = await createUser('admin@gmail.com', 'Bob', '12345678', false, 'Admin', false, false);
    let u1 = await createUser('t1@gmail.com', 't1', '12345678', 0, false, [q1, q2, q3], [a1, a2, a3, a4]);
    let u2 = await createUser('t2@gmail.com', 't2', '12345678', 50, false, [q4, q7, q8], [a5, a6 ,a7, a8, a13]);
    let u3 = await createUser('t3@gmail.com', 't3', '12345678', 25, false, [q5, q9], [a9, a10, a11, a12, a14, a15, a16]);
    let u4 = await createUser('t4@gmail.com', 't4', '12345678', -5, false, [q6], [a17, a18, a19, a20]);


    if (db) db.close();
    return console.log('done');
}

init();
console.log('processing ...');
