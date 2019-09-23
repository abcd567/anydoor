const http = require('http');
const chalk = require('chalk');
const conf = require('./myConfig/myDefaultConfig');


// 创建服务
const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end('<h1>Server Start Success</h1>');
});

// 服务的监听端口
server.listen(conf.port, conf.hostname, () => {
   // 要想${}语法生效，必须使用反引号 ``
   const addr = `http://${conf.hostname}:${conf.port}`;
   console.info(`Server start at ${chalk.green(addr)}`);
});

