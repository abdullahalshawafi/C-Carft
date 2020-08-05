const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require('bcryptjs');

module.exports = passport => {
    passport.use(new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
        User.findOne({ Email: email }, (err, user) => {
            if (err) { return done(err); }
            if (!user) { return done(null, false, { message: 'Wrong email or password' }); }
            if (!user.isVerified) { return done(null, false, { message: 'Your email is not verified' }); }
            bcrypt.compare(password, user.Password, (err, isMatch) => {
                if (err) { return done(err); }
                if (!isMatch) { return done(null, false, { message: 'Wrong email or password' }); }
                return done(null, user);
            });
        });
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
}