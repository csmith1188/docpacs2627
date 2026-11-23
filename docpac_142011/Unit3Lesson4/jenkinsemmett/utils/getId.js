function getId(req, res, next) {
  res.locals.userId = req.session.userId
  next()
}
module.exports = getId;