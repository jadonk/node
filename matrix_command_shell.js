var sys = require('sys'); 
var http = require('http');
var fs = require('fs');
var child_process = require('child_process');
//sys.exec('mkfifo matrix_pipe');
child_process.spawn('mkfifo', ['matrix_pipe']);
//sys.exec('echo "#!/bin/sh" > matrix_pipe.sh');
//sys.exec('echo "cat matrix_pipe | cat > matrix_pipe.txt &" >> matrix_pipe.sh');
//fs.chmodSync('./matrix_pipe.sh', '+x');
//sys.exec('./matrix_pipe.sh');
var child = child_process.spawn('cat', ['matrix_pipe']);
//var matrix_data = fs.readFileSync('./matrix_pipe.txt');
//fs.watchFile(
// 'matrix_pipe.txt',
// function (curr, prev) {
//  matrix_data = fs.readFileSync('./matrix_pipe.txt');
// }
//);
var matrix_data = '';
child.stdout.addListener(
 'data',
 function (data) {
  sys.puts(data);
  matrix_data += data;
 }
);
if(0) {
http.createServer(
 function (req, res) {
  setTimeout(
   function () {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.write(matrix_data);
    res.close();
   },
   2000
  );
 }
).listen(8000);
}
sys.puts('Server running at http://127.0.0.1:8000/');
