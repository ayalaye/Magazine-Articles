const express = require('express'),
    path = require('path'),
    routers = require('./server/routes/routes.js');
const port = 3001;

const app=express();

app.use('/js', express.static(path.join(__dirname, 'client/js')));
app.use('/css', express.static(path.join(__dirname, 'client/css')));
app.use('/list', express.static(path.join(__dirname, 'client/html/index.html')));
app.use('/add_photo', express.static(path.join(__dirname, 'client/html/search_picture.html')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', routers);

const server = app.listen(port, () => {
    console.log('listening on port %s...', server.address().port);
});
