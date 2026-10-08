function middleware(req, res, next) {
    const timestamp = new Date().toString()
    const method = req.method;
    const url = req.originalUrl;
    next();
};

