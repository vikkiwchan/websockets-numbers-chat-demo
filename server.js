const express = require('express');
const app = express();
const path = require('path');
// has the ability to create a websocket server
const ws = require('ws');

const randomMessage = () => {
  const num = Math.round(Math.random() * 1000);
  return { num };
};

const numbers = [];

numbers.push(randomMessage());
numbers.push(randomMessage());
console.log(numbers);

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

//Standard API request
// you get the new number from the browser as an XHR request
app.post('/', (req, res) => {
  const message = randomMessage();
  numbers.push(message);
  res.send(message);
});

// for practice, add a delete route or send another message to the server

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`listening on port ${port}`));
// pass in express server
const webSocketServer = new ws.Server({ server });

let sockets = [];

// how the server manages sockets
webSocketServer.on('connection', (socket) => {
  // refresh on browser, then check terminal
  //console.log('connecting');
  // view in network/messages
  sockets.push(socket);
  console.log(sockets.length);

  // allows us to send something to client through sockets
  socket.send(JSON.stringify({ history: numbers }));

  // this socket can individually send a message
  socket.on('message', (data) => {
    //const message = JSON.parse(data);
    sockets
      .filter((s) => s !== socket)
      .forEach((s) => {
        s.send(data);
      });
  });
  // good for housekeeping to make sure every time you refresh you aren't keeping track of a another non-existent socket
  //  @39:47 Q: Why does this happen? How are sockets created with every refresh?
  socket.on('close', () => {
    //if you are not the socket that closed, i want you
    sockets = sockets.filter((s) => s !== socket);
  });
});

//Every time there is a refresh, the connection goes on, so that is how another socket is created.
