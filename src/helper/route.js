/* 对文件路径进行判断
 *
 *  文件夹：显示文件夹下所有文件
 *  文件：显示文件内容
 * */

const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const { promisify } = require('util');
const conf = require('../myConfig/myDefaultConfig');
// 流程化异步操作
const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

// xxx/src/helper/../template/dir.tpl  等价于xxx/src/template/dir.tpl
const tplPath = path.join(__dirname, '../template/dir.tpl');
// 读模板文件。除了require，其余时候尽量使用绝对路径
const source = fs.readFileSync(tplPath);
const template = Handlebars.compile(source.toString());


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
      res.setHeader('Content-Type', 'text/html');
      const dir = path.relative(conf.root, filePath);
      const data = {
        // 标题
        title: path.basename(filePath),
        // 文件夹相对路径
        dir: dir ? `/${dir}` : '',
        files,
      };
      res.end(template(data));
    }
  } catch (ex) {
    // 不存在
    res.statuscode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end(`NOT FOUND.Path ${filePath} is not exists.`);
  }
};
