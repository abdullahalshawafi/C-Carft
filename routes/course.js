const router = require('express').Router();
const fs = require('fs');
const Courses = require('../models/Course');
const User = require('../models/User');
const loggedIn = require('../config/auth');

// GET course details page
router.get('/:course_id', async (req, res) => {
    try {
        const course = await Courses.findById(req.params.course_id);
        if (!course) return res.redirect('/');

        let enrolled = false;
        if (typeof req.user !== 'undefined') {
            let user = await User.findById(req.user._id).populate('Courses');
            for (let i = 0; i < user.Courses.length; i++) {
                if (course.Name === user.Courses[i].Name) {
                    enrolled = true;
                    break;
                }
            }
        }
        res.render('course-details', {
            title: course.Name,
            course: course,
            OddSyllabus: course.Syllabus.length % 2 !== 0,
            enrolled: enrolled
        });
    } catch (err) {
        return console.log(err);
    }
});

// GET course material page
router.get('/:course_id/material', loggedIn, async (req, res) => {
    try {
        const course = await Courses.findById(req.params.course_id);
        if (!course) return res.redirect('/');

        let enrolled = false;
        if (typeof req.user !== 'undefined') {
            let user = await User.findById(req.user._id).populate('Courses');
            for (let i = 0; i < user.Courses.length; i++) {
                if (course.Name === user.Courses[i].Name) {
                    enrolled = true;
                    break;
                }
            }
        }
        if (enrolled) {
            res.render('course-materials', {
                title: `${course.Name} Material`,
                course: course
            });
        } else {
            req.flash('danger', 'You must be enrolled in this course to see its materials.');
            return res.redirect('/course/' + course._id);
        }
    } catch (err) {
        return console.log(err);
    }
});

// GET course materials page upon user selection (session - assignments - project)
router.get('/:course_id/material/:user_selection', loggedIn, async (req, res) => {
    try {
        const course = await Courses.findById(req.params.course_id);
        if (!course) return res.redirect('/');

        let enrolled = false;
        if (typeof req.user !== 'undefined') {
            let user = await User.findById(req.user._id).populate('Courses');
            for (let i = 0; i < user.Courses.length; i++) {
                if (course.Name === user.Courses[i].Name) {
                    enrolled = true;
                    break;
                }
            }
        }
        if (enrolled) {
            const user_selection = req.params.user_selection.slice(0, 1).toUpperCase() + req.params.user_selection.slice(1).toLowerCase();
            res.render('course-materials-selection', {
                title: `${course.Name} ${user_selection}`,
                selection: req.params.user_selection,
                course: course
            });
        } else {
            req.flash('danger', 'You must be enrolled in this course to see its materials.');
            return res.redirect('/course/' + course._id);
        }
    } catch (err) {
        return console.log(err);
    }
});

// GET course materials page upon user selection (session - assignments - project)
router.get('/:course_id/material/:file_type/:file', loggedIn, async (req, res) => {
    try {
        const course = await Courses.findById(req.params.course_id);
        if (!course) return res.redirect('/');

        let enrolled = false;
        if (typeof req.user !== 'undefined') {
            const user = await User.findById(req.user._id).populate('Courses');
            for (let i = 0; i < user.Courses.length; i++) {
                if (course.Name === user.Courses[i].Name) {
                    enrolled = true;
                    break;
                }
            }
        }
        if (enrolled) {
            const selectedFile = `public/${req.params.file_type}/${req.params.file}`;
            fs.readFile(selectedFile, (err, data) => {
                if (err) return console.log(err);
                res.contentType(req.params.file);
                res.send(data);
            });
        } else {
            req.flash('danger', 'You must be enrolled in this course to see its materials.');
            return res.redirect('/course/' + course._id);
        }
    } catch (err) {
        return console.log(err);
    }
});

// GET course enroll
router.get('/:course_id/enroll', loggedIn, async (req, res) => {
    try {
        const course = await Courses.findById(req.params.course_id);
        if (!course) return res.redirect('/');
        var user = await User.findById(req.user._id).populate('Courses');
        let enrolled = false;
        for (let i = 0; i < user.Courses.length; i++) {
            if (course.Name === user.Courses[i].Name) {
                enrolled = true;
                break;
            }
        }
        if (!enrolled) {
            req.user.Courses.push(course);
            user = await User.findByIdAndUpdate(req.user._id,
                { Courses: req.user.Courses },
                { returnOriginal: false }
            );
        }
        res.redirect(`/course/${course._id}`);
    } catch (err) {
        return console.log(err);
    }
});

// GET course unenroll
router.get('/:course_id/unenroll', loggedIn, async (req, res) => {
    try {
        const course = await Courses.findById(req.params.course_id);
        if (!course) return res.redirect('/');
        var user = await User.findById(req.user._id).populate('Courses');
        let enrolled = false;
        let i;
        for (i = 0; i < user.Courses.length; i++) {
            if (course.Name === user.Courses[i].Name) {
                enrolled = true;
                break;
            }
        }
        if (enrolled) {
            const userCourses = user.Courses;
            userCourses.splice(i, 1);
            user = await User.findByIdAndUpdate(req.user._id,
                { Courses: userCourses },
                { returnOriginal: false }
            );
        }
        res.redirect('back');
    } catch (err) {
        return console.log(err);
    }
});

module.exports = router;