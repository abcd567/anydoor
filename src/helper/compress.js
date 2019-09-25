const { createGzip, createDeflate } = require('zlib');

module.exports = (req, res, rs) => {
  const acceptEncoding = req.headers['accept-encoding'];
  if (!acceptEncoding || !acceptEncoding.match(/\b(gzip|deflate)\b/)) {
    // 正则\b表示单词边界（开头或结尾）
    return rs;
  }

  if (acceptEncoding.match(/\bgzip\b/)) {
    res.setHeader('Content-Encoding', 'gzip');
    return rs.pipe(createGzip());
  }
  res.setHeader('Content-Encoding', 'deflate');
  return rs.pipe(createDeflate());
};
