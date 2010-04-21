#!/usr/bin/env ./node
// Copyright (C) 2010 Texas Instruments, Jason Kridner
var sys = require('sys'); 
var http = require('http');
var fs = require('fs');
var url = require('url');
var child_process = require('child_process');
var path = require('path');
var events = require('events');

// Spawn child process
var child = child_process.spawn('cat');
var matrix = {};
matrix.data = '';
matrix.emitter = new events.EventEmitter;
child.stdout.addListener(
 'data',
 function (data) {
  sys.puts('New data: ' + data);
  matrix.data += data;
  matrix.emitter.emit('data', matrix.data);
 }
);
matrix.getData = function(res) {
 var myListener = {};
 myListener = function(data) {
  sys.puts("Responding"); 
  res.writeHead(200, {"Content-Type": "text/plain"});
  res.write(matrix.data + data);
  res.close();
  matrix.emitter.removeListener('data', myListener);
 };
 matrix.emitter.addListener('data', myListener);
 setTimeout(function() {sys.puts("Timeout"); myListener('');}, 10000);
}

// Serve web page and notify user
function loadHTMLFile(uri, res) {
 var filename = path.join(process.cwd(), uri);
 path.exists(
  filename,
  function(exists) {
   if(!exists) {
    res.sendHeader(404, {"Content-Type": "text/plain"});
    res.write("404 Not Found\n");
    res.close();
    return;
   }
   fs.readFile(
    filename,
    'text',
    function(err, file) {
     if(err) {
      res.sendHeader(500, {"Content-Type": "text/plain"});
      res.write(err + "\n");
      res.close();
      return;
     }
     res.sendHeader(200, {"Content-Type": "text/html"});
     res.write(file, "text");
     res.close();
    }
   );
  }
 );
}
response = false;
var server = http.createServer(
 function(req, res) {
  var uri = url.parse(req.url).pathname;
  if(uri == '/') {
   var query = url.parse(req.url, true).query;
   if(typeof(query) != 'undefined' && 'command' in query) {
    child.stdin.write(query.command + "\n");
   }
   loadHTMLFile('/index.html', res);
  } else if(uri == '/data') {
   var respond = true;
   response = res;
   matrix.getData(res);
  } else {
   loadHTMLFile(uri, res);
  }
 }
);
if(!server.listen(3000)) {
 sys.puts('Server running at http://127.0.0.1:3000/');
} else {
 sys.puts('Server failed to connect to socket');
}
