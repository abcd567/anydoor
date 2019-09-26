const http = require('http');
const chalk = require('chalk');
const path = require('path');
const conf = require('./myConfig/myDefaultConfig');
const route = require('./helper/route');
const openUrl = require('./helper/openUrl');

class Server {
  constructor(config) {
    this.conf = { ...conf, ...config };
  }

  start() {
    // 创建服务
    const server = http.createServer((req, res) => {
      const filePath = path.join(this.conf.root, req.url);
      route(req, res, filePath, this.conf);
    });

    // 服务的监听端口
    server.listen(this.conf.port, this.conf.hostname, () => {
      // 要想${}语法生效，必须使用反引号 ``
      const addr = `http://${this.conf.hostname}:${this.conf.port}`;
      console.info(`Server start at ${chalk.green(addr)}`);
      openUrl(addr);
    });
  }
}

module.exports = Server;
