// Copyright (C) 2010 Texas Instruments, Jason Kridner
var sys = require('sys'); 
var http = require('http');
var fs = require('fs');
var url = require('url');
var child_process = require('child_process');
var path = require('path');

// Spawn child process
child_process.spawn('mkfifo', ['matrix_pipe']);
var child = child_process.spawn('cat', ['matrix_pipe']);
var matrix_data = '';
child.stdout.addListener(
 'data',
 function (data) {
  sys.puts(data);
  matrix_data += data;
 }
);

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
    "text",
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
http.createServer(
 function (req, res) {
  var uri = url.parse(req.url).pathname;
  if(uri == '/') {
   loadHTMLFile('/index.html', res);
  } else if(uri == '/data') {
   res.writeHead(200, {'Content-Type': 'text/plain'});
   res.write(matrix_data);
   res.close();
  } else {
   loadHTMLFile(uri, res);
  }
 }
).listen(3000);
sys.puts('Server running at http://127.0.0.1:3000/');
