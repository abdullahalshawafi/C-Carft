const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const mkdirp = require('mkdirp');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/User');
const Token = require('../models/Token');

// nodemailer transporter setup
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'ccraftsa@gmail.com',
        pass: 'klvjfoljhyxqzrtp'
    }
});

// GET contact us page
router.get('/contact-us', (req, res) => {
    res.render('contact-us', {
        title: 'Contact Us'
    });
});

// POST contact us page
router.post('/contact-us', [
    body('name', 'Name must be entered').notEmpty(),
    body('email', 'Email must be entered').notEmpty(),
    body('subject', 'Subject must be entered').notEmpty(),
    body('message', 'Message must be entered').notEmpty()
], async (req, res) => {
    const errors = validationResult(req).errors;
    if (errors.length) {
        return res.render('contact-us', {
            title: 'Contact Us',
            errors: errors
        });
    }

    try {
        await transporter.sendMail({
            from: `"${req.body.name}"<ccraftsa@gmail.com>`,
            to: "ccraftsa@gmail.com",
            subject: req.body.subject,
            text: `From: ${req.body.email}\nMessage:\n${req.body.message}`
        });

        req.flash('success', 'Your message has been sent!');
        res.redirect('back');
    } catch (err) {
        return console.log(err);
    }
});

// GET register page
router.get('/register', (req, res) => {
    res.render('register', {
        title: 'Register'
    });
});

// POST register page
router.post('/register', [
    body('name', 'Name must be entered').notEmpty(),
    body('name', 'Name must be at least 5 characters long').isLength({ min: 5 }),
    body('name', 'Name must be at most 255 characters long').isLength({ max: 255 }),
    body('email', 'Email must be entered').notEmpty(),
    body('email', 'Email must be at least 5 characters long').isLength({ min: 5 }),
    body('email', 'Email must be at most 255 characters long').isLength({ max: 255 }),
    body('email', 'Email not valid').isEmail(),
    body('password', 'Password must be entered').notEmpty(),
    body('name', 'Name must be at least 7 characters long').isLength({ min: 7 }),
    body('name', 'Name must be at most 255 characters long').isLength({ max: 255 }),
    body('confirmPassword', 'Passwords must be equal').not().equals('password'),
    body('gender', 'Gender must be selected').notEmpty(),
], async (req, res) => {
    const errors = validationResult(req).errors;

    if (errors.length) {
        return res.render('register', {
            title: 'Register',
            errors: errors
        })
    }

    const registeredUser = req.body;
    try {
        let user = await User.findOne({ Email: registeredUser.email });
        if (user) {
            req.flash('danger', 'Email is already registered');
            return res.redirect('back');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(registeredUser.password, salt);

        user = new User({
            Name: registeredUser.name,
            Slug: (registeredUser.name).toLowerCase().replace(/ /g, '-'),
            Email: registeredUser.email,
            Password: hashedPassword,
            Gender: registeredUser.gender
        });

        user = await user.save();

        let token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
        token = await token.save();

        const email_info = await transporter.sendMail({
            from: `"C-Craft Student Activity" <ccraftsa@gmail.com>`,
            to: user.Email,
            subject: 'Account Verification',
            html: `<h2>Hi ${user.Name},</h2><p>Please verify you account by clicking <a href="http://${req.headers.host}/user/confirmation/${token.token}">here</a>.</p>`
        });

        if (email_info.messageId) {
            req.flash('success', `A verification email has been sent to ${user.Email}!`);
            res.redirect('/user/confirmation');
        } else {
            throw new Error('Verification email not sent');
        }

    } catch (err) {
        return console.log(err);
    }
});

// GET confirmation page
router.get('/confirmation', async (req, res) => {
    res.render('confirmation', {
        title: 'Email Verification'
    });
});

// GET confirmation form page
router.get('/confirmation/:token', async (req, res) => {
    const token = await Token.findOne({ token: req.params.token });
    if (!token) {
        req.flash('danger', 'We were unable to find a valid token. Your token may have expired.');
        return res.redirect('/user/register');
    }

    const user = await User.findById(token._userId);
    if (!user) {
        req.flash('danger', 'We were unable to find a user for this token.');
        return res.redirect('/user/register');
    }

    res.render('confirmation', {
        title: 'Email Verification',
        token: token.token
    });
});

// POST confirmation page
router.post('/confirmation/:token', async (req, res) => {
    try {
        const token = await Token.findOne({ token: req.params.token });
        if (!token) {
            req.flash('danger', 'We were unable to find a valid token. Your token may have expired.');
            return res.redirect('/user/register');
        }

        let user = await User.findOne({ _id: token._userId, Email: req.body.email });
        if (!user) {
            req.flash('danger', 'We were unable to find a user for this token.');
            return res.redirect('back');
        }

        if (user.isVerified) {
            req.flash('danger', 'This user has already been verified. Please log in');
            return res.redirect('/user/login');
        }

        user.isVerified = true;
        user = await user.save();

        let imagePath = "public/images/profile pictures/" + user._id;
        await mkdirp(imagePath);

        req.flash('success', 'The account has been verified. Please log in.');
        res.redirect('/user/login');
    } catch (err) {
        return console.log(err);
    }
});

// GET resend confirmation
router.get('/resend/confirmation', async (req, res) => {
    res.render('resend-confirmation', {
        title: 'Resend Confirmation'
    })
});

// POST resend confirmation
router.post('/resend/confirmation', async (req, res) => {
    try {
        let user = await User.findOne({ Email: req.body.email });
        if (!user) {
            req.flash('danger', 'We were unable to find a user with that email.')
            return res.redirect('back');
        }
        if (user.isverified) {
            req.flash('danger', 'This account has already been verified. Please log in.')
            return res.redirect('/user/login');
        }

        let token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
        token = await token.save();

        const email_info = await transporter.sendMail({
            from: `"C-Craft Student Activity" <ccraftsa@gmail.com>`,
            to: user.Email,
            subject: 'Account Verification',
            html: `<h2>Hi ${user.Name},</h2><p>Please verify you account by clicking <a href="http://${req.headers.host}/user/confirmation/${token.token}">here</a>.</p>`
        });

        if (email_info.messageId) {
            req.flash('success', `A verification email has been sent to ${user.Email}!`);
            res.redirect('/user/confirmation');
        } else {
            throw new Error('Verification email not sent');
        }

    } catch (err) {
        return console.log(err);
    }
});

// GET log in page
router.get('/login', (req, res) => {
    res.render('login', {
        title: 'Log In'
    });
});

// POST log in page
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: req.session.returnTo || '/',
        failureRedirect: '/user/login',
        failureFlash: true
    })(req, res, next);
});

// GET log out
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/user/login');
});

module.exports = router;