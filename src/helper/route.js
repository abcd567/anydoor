/* 对文件路径进行判断
 *
 *  文件夹：显示文件夹下所有文件
 *  文件：按文件后缀格式，显示对应文件内容。
 * */

const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const { promisify } = require('util');
const conf = require('../myConfig/myDefaultConfig');
const mime = require('./mime');
const isFresh = require('./cache');
const compress = require('./compress');
const range = require('./range');

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
      /* 读文件 */
      res.setHeader('Content-Type', mime(filePath));

      // 缓存cache
      if (isFresh(req, res, stats)) {
        /* 文件已在缓存，且缓存有效 */
        res.statusCode = 304;
        // 服务器不需返回数据，浏览器自动取缓存
        res.end();
        return;
      }
      let rs;
      // 范围range
      const { code, start, end } = range(req, res, stats.size);
      if (code === 206) {
        res.statusCode = 206;
        rs = fs.createReadStream(filePath, { start, end });
      } else {
        res.statusCode = 200;
        rs = fs.createReadStream(filePath);
      }

      // 压缩compress
      if (filePath.match(conf.compress)) {
        /* 压缩文件 */
        rs = compress(req, res, rs);
      }

      // 数据流写入response
      rs.pipe(res);
    } else if (stats.isDirectory()) {
      /* 显示文件夹 */
      const files = await readdir(filePath);
      res.statuscode = 200;
      res.setHeader('Content-Type', 'text/html');
      const dir = path.relative(conf.root, filePath);
      const data = {
        // 标题
        title: path.basename(filePath),
        // 文件夹相对路径
        dir: dir ? `/${dir}` : '',
        files: files.map((file) => ({
          file,
          icon: fs.statSync(path.join(filePath, file)).isDirectory() ? 'dir' : mime(file),
        })),
      };
      res.end(template(data));
    }
  } catch (ex) {
    /* 不存在 */
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end(`NOT FOUND.Path ${filePath} is not exists.`);
  }
};
