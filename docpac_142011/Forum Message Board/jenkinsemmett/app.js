//Server Init
const express = require('express');
const app = express();
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
const accessDb = require('./database.js');
const bcrypt = require('bcrypt');

//Session Set Up
const session = require("express-session");
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { 
      httpOnly: true,
      sameSite: true
   },
  })
);

function isAuthenticated(req, res, next){
  if (req.session.userId){
    next()
  } else {
    res.redirect('/login')
  }
}

//Routes
app.use((req, res, next) => {
  if (req.session.userId){
    let user = accessDb.uGetId(req.session.userId)
    res.locals.username = user.username;
  } else {
    res.locals.username = false
  }
  next()
})

app.get('/', (req, res) => {
  res.locals.threads = accessDb.getAllThreads();
  res.locals.title = "Home Page";
  res.status(200).render('index');
});

app.get('/register', (req, res) => {
  if (req.session.userId){
    res.redirect('/');
  } else {
    res.locals.title = "Register";
    res.locals.error = false
    res.status(200).render('register');
  }
});

app.post('/register', (req, res) => {
  res.locals.title = "Register Account"
  if (req.body.name.trim() && req.body.passW.trim() && req.body.passW2.trim()){

    if(req.body.passW.trim() == req.body.passW2.trim()){

      if(req.body.name.length >= 3 && req.body.name.length <= 20){
                  
        if(accessDb.uGetUname(req.body.name.trim())){
          res.locals.error = "Username Taken";
          res.status(200).render('register');
        } else {

          bcrypt.hash(req.body.passW.trim(), 10, function (err, hash) {
            if (err) {
              console.error(err);
              return;
            }
            if (hash){
              accessDb.uAdd(req.body.name.trim(), hash);
              let account = accessDb.uGetUname(req.body.name.trim());
              req.session.userId = account.uID;
              res.redirect('/');
            }
          });

        }

      } else {
        res.locals.error = "Improper Username Length";
        res.status(200).render('register');
      }

    } else {
      res.locals.error = "Passwords Don't Match, Please Resubmit";
      res.status(200).render('register');
    }

  } else {
    res.locals.error = "Missing Data, Make Sure A Boxes Are Filled";
    res.status(200).render('register');
  }
    
});

app.get('/login', (req, res) => {
  if (req.session.userId){
    res.redirect('/');
  } else {
    res.locals.title = "Log In";
    res.locals.error = false;
    res.status(200).render('login');
  }
});

app.post('/login', (req, res) => {
  res.locals.title = "Log In";
  if(req.body.name.trim() && req.body.passW.trim()){

    if(accessDb.uGetUname(req.body.name.trim())){

      let passGood = false
      bcrypt.compare(req.body.passW.trim(), accessDb.uGetUname(req.body.name.trim()).password_hash, function (err, result) {
        if (err) {
          console.error(err);
          return;
        }
        if (result) {
          let account = accessDb.uGetUname(req.body.name.trim());
          
          req.session.userId = account.uID;
          
          res.redirect("/");
        } else {
          res.locals.error = 'Incorrect Password';
          res.status(200).render('login');
        }

      });

    } else {
      res.locals.error = 'No Account With Username Exists';
      res.status(200).render('login');
    }

  } else {
    res.locals.error = 'Must Fill All Boxes';
    res.status(200).render('login');
  }
});

app.post('/logout', (req, res) => {
  if (req.session.userId){
    req.session.destroy();
  }
  res.redirect('/');
});

app.get('/users/:id', (req, res) => {
  const id = parseInt(req.params.id)

  if(accessDb.uGetId(id)){
    let threads = accessDb.tgetuser(id)
    let replies = accessDb.rgetuser(id)

    for(let i = 0; i < threads.length; i++){
      threads[i].type = 'thread'
    }

    for(let i = 0; i < replies.length; i++){
      replies[i].type = 'reply'
    }

    let posts = []
    posts = threads.concat(replies)

    posts.sort(function(a,b){
      return new Date(a.date) - new Date(b.date);
    });

    console.log(posts);

    res.locals.all = posts
    res.locals.time = accessDb.uGetId(id).created_at
    res.locals.title = accessDb.uGetId(id).username
    res.status(200).render('profile');

  } else {
    res.locals.title = "404 Error"
    res.status(404).render('error');
  }
})

app.get('/threads/new', isAuthenticated, (req, res) => {
  res.locals.title = "New Thread"
  res.locals.error = false;
  res.status(200).render('newThread');
})

app.post('/threads/:id/replies', isAuthenticated, (req, res) => {  
  const id = parseInt(req.params.id)
  if(accessDb.tGetId(id)){

    if(req.body.body.trim()){

      if(req.body.body.trim().length <= 300){
        accessDb.rAdd(req.session.userId, id, req.body.body.trim())
        res.redirect('/threads/' + id);

      } else {
        res.locals.error = "The Response Is Too Long";
        res.redirect('/threads/' + id);
      }

    } else {
      res.locals.error = "The Response Must Have A Body";
      res.redirect('/threads/' + id);
    }

  } else {
    res.locals.error = "The Thread You Tried To Respond To Doesn't Exist";
    res.status(200).render('newThread');
  }
})

app.get('/threads/:id', (req, res) => {  
  const id = parseInt(req.params.id)
  let display = accessDb.displayThread(id);
  let replies = accessDb.displayReplies(id);
  
  if (display){

    res.locals.title = display.title
    res.locals.all = display
    res.locals.replies = replies
    if (res.locals.error){} else {
      res.locals.error = false;
    }
    res.status(200).render('thread');
  } else {
    res.locals.title = "404 Error"
    res.status(404).render('error')
  }
})

app.post('/threads', isAuthenticated, (req, res) => {
  let ltitle = req.body.title
  let lbody = req.body.body
  
  res.locals.title = "New Thread"
  if (ltitle.trim() && lbody.trim()){

      if (ltitle.trim().length <= 50){

        if (lbody.trim().length <= 300){

          let thread = accessDb.tAdd(req.session.userId, ltitle.trim(), lbody.trim())
          res.redirect('/threads/' + thread.lastInsertRowid)

        } else {
          res.locals.error = "The Body Is Too Long";
          res.status(200).render('newThread');
        }
      } else {
        res.locals.error = "The Title Is Too Long";
        res.status(200).render('newThread');
      }
  } else {
    res.locals.error = "Both A Title And Body Are Needed To Create A Thread";
    res.status(200).render('newThread');
  }
})

app.use((req, res) => {
  res.locals.title = "404 Error"
  res.status(404).render('error');
})

var server = app.listen(200, () => {
  console.log(`Server running at http://localhost:200/`);
});