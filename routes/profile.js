const router = require('express').Router();
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const loggedIn = require('../config/auth');

// GET user profile page
router.get('/:user_id', loggedIn, async (req, res) => {
    try {
        const user = await User.findById(req.params.user_id).populate('Courses');
        if (!user) return res.redirect('/');
        res.render('user-profile', {
            title: user.Name,
            user: user,
            canEdit: req.user._id === req.params.user_id
        });
    } catch (err) {
        return console.log(err);
    }
});

// GET user profile edit page
router.get('/:user_id/edit-profile', loggedIn, async (req, res) => {
    try {
        const user = await User.findById(req.params.user_id).populate('Courses');
        if (!user || req.user._id !== req.params.user_id) return res.redirect('/');

        res.render('edit-profile', {
            title: user.Name,
            user: user
        });
    } catch (err) {
        return console.log(err);
    }
});

// POST user profile edit page
router.post('/:user_id/edit-profile', [
    body('Name', 'You must enter a name').notEmpty()
], loggedIn, async (req, res) => {
    const errors = validationResult(req).errors;
    let imageName = (req.files !== null) ? req.files.image.name : req.user.Image;
    if (!imageName) imageName = `default=${req.user.Gender}`;

    if (req.files && !req.files.image.mimetype.includes('image/')) {
        errors.push({
            value: '',
            msg: 'You must upload an image',
            param: 'image',
            location: 'body'
        });
    }

    if (errors.length) {
        return res.render('edit-profile', {
            title: req.user.Name,
            user: req.user,
            errors: errors
        });
    }

    try {
        let user = await User.findById(req.params.user_id);

        const imagePath = `public/images/profile pictures/${user._id}/${imageName}`;
        const prevImagePath = `public/images/profile pictures/${user._id}/${user.Image}`;
        if (user.Image && user.Image !== imageName) {
            fs.unlink(prevImagePath, () => {
                req.files.image.mv(imagePath);
            });
        } else if (user.Image && user.Image !== `default=${req.user.Gender}`) {
            req.files.image.mv(imagePath);
        }

        user = await User.findByIdAndUpdate(
            req.params.user_id,
            {
                Name: req.body.Name,
                Slug: (req.body.Name).toLowerCase().replace(/ /g, '-'),
                Bio: req.body.Bio,
                Image: imageName,
                Gender: req.body.Gender
            },
            { returnOriginal: false }
        );

        res.redirect(`/profile/${user._id}`);
    } catch (err) {
        return console.log(err);
    }
});

module.exports = router;