/* 对文件路径进行判断
 *
 *  文件夹：显示文件夹下所有文件
 *  文件：显示文件内容
 **/

const fs = require('fs');

// 流程化异步操作
const { promisify } = require('util');

const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

module.exports = async function route(req, res, filePath) {
  try {
    // 判断路径是否存在,不存在捕获异常
    const stats = await stat(filePath);
    if (stats.isFile()) {
      // 读文件
      res.statuscode = 200;
      res.setHeader('Content-Type', 'text/plain');
      const rs = fs.createReadStream(filePath);
      rs.pipe(res);
    } else if (stats.isDirectory()) {
      // 显示文件夹
      const files = await readdir(filePath);
      res.statuscode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end(files.join(','));
    }
  } catch (ex) {
    // 不存在
    res.statuscode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end(`NOT FOUND.Path ${filePath} is not exists.`);
  }
};
