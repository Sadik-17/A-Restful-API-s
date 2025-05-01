var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const users = require('./MOCK_DATA.json');
const fs = require('fs');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const { log } = require('console');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//Routes
app.use (express.urlencoded({ extended: false}));

app.get('/users', (req, res)=> {
  const html = `
  <ul>
      ${users.map ((user) => '<li>${user.first_name}</li>').join("")}
  </ul>`;
});

app.route('/api/users/:id') //get route
.get((req, res)=> {
  const id = Number(req.params.id);
  const user = users.find((user) => user.id === id);
  return res.json(user);
})
.patch((req, res)=> {   //patch route
  const id = Number(req.params.id);
  const user = users.find((user) => user.id === id);
  const body = req.body;
  const updatedUser = {...user, ...body};
  const index = users.indexOf(user);
  users[index] = updatedUser;
  fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err, data) => {
    return res.json({ status: 'success', id: users.length});      
  });
})
.delete((req, res)=> {  //delete route
  const id = Number(req.params.id);
  const user = users.find((user) => user.id === id);
  const index = users.indexOf(user);
  users.splice(index, 1);
  fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err, data) => {
    return res.json({ status: 'success', id: users.length});      
  });
});


app.get('/api/users', (req, res)=> {
  return res.json(users);
});

app.post ('/api/users', (req, res)=> {    //post route
  const body = req.body;
  users.push ({...body, id : users.length + 1});
  fs.writeFile('./MOCK_DATA.json', JSON.stringify(users), (err, data) => {
    return res.json({ status: 'success', id: users.length});      
  });
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
