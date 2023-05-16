//Setup database with initial test data.
// Include an admin user.
// Script should take admin credentials as arguments as described in the requirements doc.
// mongodb://127.0.0.1:27017/fake_so
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
let mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
// mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

function createUser(email, user, password, reputation, accType) {
    user = {
        email: email,
        user: user,
        password: password,
    }
    if (reputation != false) user.reputation = reputation;
    if (accType != false) user.accType = accType;
    let u = new User(user);
    return u.save();
}

const init = async () => {
    let u1 = await createUser('admin@gmail.com', 'Bob', '12345678', false, 'Admin');
    let u2 = await createUser('t1@gmail.com', 't1', '12345678', 0, false);
    let u3 = await createUser('t2@gmail.com', 't2', '12345678', 50, false);
    let u4 = await createUser('t3@gmail.com', 't3', '12345678', 25, false);
    let u5 = await createUser('t4@gmail.com', 't4', '12345678', false, 'User');
    if(db) db.close();
    console.log('done');
}

init()
    .catch((err) => {
        console.log('ERROR ' + err);
        if(db) db.close();
    })

console.log('processing ...');