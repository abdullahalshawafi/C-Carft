const router = require('express').Router();
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const loggedIn = require('../config/auth');

// GET user profile page
router.get('/:user_slug', loggedIn, async (req, res) => {
    try {
        const user = await User.findOne({ Slug: req.params.user_slug }).populate('Courses');
        if (!user) return res.redirect('/');
        res.render('user-profile', {
            title: user.Name,
            user: user,
            canEdit: req.user.Slug === req.params.user_slug
        });
    } catch (err) {
        return console.log(err);
    }
});

// GET user profile edit page
router.get('/:user_slug/edit-profile', loggedIn, async (req, res) => {
    try {
        const user = await User.findOne({ Slug: req.params.user_slug }).populate('Courses');
        if (!user || req.user.Slug !== req.params.user_slug) return res.redirect('/');

        res.render('edit-profile', {
            title: user.Name,
            user: user
        });
    } catch (err) {
        return console.log(err);
    }
});

// POST user profile edit page
router.post('/:user_slug/edit-profile', [
    body('Name', 'You must enter a name').notEmpty()
], loggedIn, async (req, res) => {
    const errors = validationResult(req).errors;
    let imageName = (req.files !== null) ? req.files.image.name : req.user.Image;

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
        let user = await User.findOne({ Slug: req.params.user_slug });

        const imagePath = `public/images/profile pictures/${user._id}/${imageName}`;
        const prevImagePath = `public/images/profile pictures/${user._id}/${user.Image}`;
        if (user.Image && user.Image !== imageName) {
            fs.unlink(prevImagePath, () => {
                req.files.image.mv(imagePath);
            });
        } else {
            req.files.image.mv(imagePath);
        }

        user = await User.findOneAndUpdate(
            { Slug: req.params.user_slug },
            {
                Name: req.body.Name,
                Slug: (req.body.Name).toLowerCase().replace(/ /g, '-'),
                Bio: req.body.Bio,
                Image: imageName,
                Gender: req.body.Gender
            },
            { returnOriginal: false }
        );

        res.redirect(`/profile/${user.Slug}`);
    } catch (err) {
        return console.log(err);
    }
});

module.exports = router;