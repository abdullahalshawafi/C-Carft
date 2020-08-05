const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CourseSchema = new Schema({
    Name: {
        type: String,
        required: true
    },
    classroom: {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    instructors: {
        type: Array,
        required: true
    },
    SessionNumber: {
        type: Number,
        required: true
    },
    AssignmentNumber: {
        type: Number,
        required: true
    },
    ProjectNumber: {
        type: Number,
        required: true
    },
    StartDate: {
        type: String,
        required: true
    },
    EndDate: {
        type: String,
        required: true
    },
    Schedule: {
        type: String,
        required: true
    },
    Syllabus: {
        type: Array,
        required: true
    }
});

module.exports = mongoose.model('Course', CourseSchema, 'Courses');