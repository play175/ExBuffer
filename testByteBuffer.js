/**
* ExBuffer ByteBuffer结合的测试
**/
var ExBuffer = require('ExBuffer');
var ByteBuffer = require('ByteBuffer');
var net = require('net');

//server
var server = net.createServer(function(socket) {
  console.log('>> server:client connected');
  new Connection(socket);//有客户端连入时
});

server.listen(8124);
console.log('>> server start listening:');

//connection class
function Connection(socket) {
    var exBuffer = new ExBuffer();
    exBuffer.on('data',onReceivePackData);

    socket.on('data', function(data) {
        console.log('>> server receive scoket data,length:'+data.length);
        exBuffer.put(data);//只要收到数据就往ExBuffer里面put
    });

    //当服务端收到完整的包时
    function onReceivePackData(buffer){
        console.log('>> server receive packet,length:'+buffer.length);
        //unpack the packet
        var bytebuf = new ByteBuffer(buffer);
        var resArr = bytebuf.uint32().string().unpack();
        console.log('>> server unpack packet:['+resArr[0]+','+resArr[1]+']');

       //send a packet
       var sbuf = new ByteBuffer();
       var buf = sbuf.uint32(123).string('welcome,client:' + resArr[0]).pack(true);
        socket.write(buf);
    }
}

//client
var exBuffer = new ExBuffer();
var client = net.connect(8124, function() {
    console.log('>> client:connect server success!');
    //send a packet
    var sbuf = new ByteBuffer();
    var buf = sbuf.uint32(123).string('hello,I am client').pack(true);
    client.write(buf);
    console.log('>> client sent packet,length:'+buf.length);
});

client.on('data', function(data) {
   console.log('>> client receive socket data,length:'+data.length);
  exBuffer.put(data);//只要收到数据就往ExBuffer里面put
});

//当客户端收到完整的数据包时
exBuffer.on('data', function(buffer) {
    console.log('>> client receive packet,length:'+buffer.length);
    //unpack the packet
    var bytebuf = new ByteBuffer(buffer);
    var resArr = bytebuf.uint32().string().unpack();
    console.log('>> client receive packet:['+resArr[0]+','+resArr[1]+']');
    //delay to exit
     console.log('exit...');
    setTimeout(function(){process.exit(0);},2000);
});

