/* 缓存模块 */
const { cache } = require('../myConfig/myDefaultConfig');

function refreshRes(stats, res) {
  /* stats:文件状态，用于判断上次修改时间
     * res: 给浏览器的返回内容
     */
  const {
    maxAge, expires, cacheControl, lastModified, etag,
  } = cache;
  if (expires) {
    res.setHeader('Expires', new Date((Date.now() + maxAge * 1000)).toUTCString());
  }
  if (cacheControl) {
    res.setHeader('Cache-Control', `publish, max-age=${maxAge}`);
  }
  if (lastModified) {
    res.setHeader('Last-Modified', stats.mtime.toString());
  }
  if (etag) {
    // etag的算法多样，这里用文件大小加修改时间
    res.setHeader('ETag', `${stats.size} + ${stats.mtime}`);
  }
}

module.exports = function isFresh(req, res, stats) {
  const lastModified = req.headers['if-modified-since'];
  const etag = req.headers['if-none-match'];
  refreshRes(stats, res);
  if (!lastModified && !etag) {
    // 第一次请求
    return false;
  }
  if (lastModified && lastModified !== res.getHeader('Last-Modified')) {
    return false;
  }
  if (etag && etag !== res.getHeader('ETag')) {
    return false;
  }
  return true;
};
