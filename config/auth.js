module.exports = (req, res, next) => {
    if (req.isAuthenticated())
        next();
    else {
        let url = req.originalUrl.split('/');
        if (url.indexOf('profile') !== -1)
            req.session.returnTo = '/';
        else
            req.session.returnTo = req.originalUrl;
        req.flash('danger', 'You must login');
        res.redirect('/user/login');
    }
}