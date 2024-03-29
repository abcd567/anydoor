module.exports = (req, res, totalSize) => {
  const { range } = req.headers;
  if (!range) {
    return { code: 200 };
  }
  const sizes = range.match(/bytes=(\d*)-(\d*)/);
  const end = sizes[2] || totalSize - 1;
  const start = sizes[1] || totalSize - end;

  if (start > end || start < 0 || end >= totalSize) {
    return { code: 200 };
  }

  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Content-Range', `bytes ${start}-${end}/${totalSize}`);
  res.setHeader('Content-Lentgh', end - start);
  return {
    code: 206,
    start: parseInt(start, 10),
    end: parseInt(end, 10),
  };
};
