const http = require('http');
const chalk = require('chalk');
const path = require('path');
const conf = require('./myConfig/myDefaultConfig');
const route = require('./helper/route');


// 创建服务
const server = http.createServer((req, res) => {
  const fileParh = path.join(conf.root, req.url);
  route(req, res, fileParh);
});

// 服务的监听端口
server.listen(conf.port, conf.hostname, () => {
  // 要想${}语法生效，必须使用反引号 ``
  const addr = `http://${conf.hostname}:${conf.port}`;
  console.info(`Server start at ${chalk.green(addr)}`);
});
