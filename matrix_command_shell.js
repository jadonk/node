var sys = require('sys'); 
var http = require('http');
var fs = require('fs');
var url = require('url');
var child_process = require('child_process');

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
http.createServer(
 function (req, res) {
  var uri = url.parse(req.url).pathname;
  if(uri == '/') {
   res.writeHead(200, {'Content-Type': 'text/plain'});
   res.write(matrix_data);
   res.close();
  } else {
   res.writeHead(404, {'Content-Type': 'text/plain'});
   res.write('File not found');
   res.close();
  }
 }
).listen(8000);
sys.puts('Server running at http://127.0.0.1:8000/');
