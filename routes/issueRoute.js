const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Project = mongoose.model('Project');
const Issue = mongoose.model('Issue');

const passport = require('passport');
const requireAuth = passport.authenticate('jwt', { session: false });

router.get('/', requireAuth, async(req, res, next) => {
    try {
        const issues = await Issue.find({ assignee: req.user._id });
        res.json(issues);
    } catch(err){
        res.send(err);
    }
})

//Get All Issues under specific Project
router.get('/getIssues/:projectId', requireAuth, async (req, res, next) => {
    const { projectId } = req.params;
    try {
        const issue = await Issue.find({ project: projectId });
        res.json(issue);
    } catch(err){
        res.status(204).send({ error: 'No issues found for this project.' });
    }
})

router.get('/getUserIssues/:userId', requireAuth, async (req, res, next) => {
    const { userId } = req.params;
    try {
        const issue = await Issue.find({ assignee: userId });
        res.json(issue);
    } catch(err){
        res.status(204).send({ error: 'No issues found for this project.' });
    }
})

router.get('/getIssue/:issueId', requireAuth, async (req, res, next) => {
    const { issueId } = req.params;
    try {
        const issue = await Issue.findById(issueId);
        res.status(200).send(issue);
    } catch(err){
        res.status(204).send({ error: `No issues found with ID: ${issueId}` });
    }
})

//Create issue under specific Project
router.post('/createIssue/:projectId', requireAuth, async (req, res, next) => {
    const { issueType, summary, description, priority, assignee } = req.body;
    const reporter = req.user._id;
    const { projectId } = req.params;

    const newIssue = new Issue({ issueType, summary, description, priority, assignee, reporter, project: projectId });

    if(!issueType || !summary || !description || !priority || !assignee || !reporter){
        res.status(422).send({ error: 'You must fill in all required fields!' });
    }

    try {
        const saved = await newIssue.save();
        console.log(saved);
        res.send(saved);
    } catch (err) {
        res.send(err);
    }

});

//Edit Issue
router.put('/editIssue/:issueId', async (req, res, next) => {
    const { issueId } = req.params;
    const { issueType, summary, description, priority, assignee } = req.body;

    try {
        const issue = await Issue.findById(issueId);
        issue.issueType = issueType;
        issue.summary = summary;
        issue.description = description;
        issue.priority = priority;
        issue.assignee = assignee;

        const saved = await issue.save();
        res.status(200).send(saved);
    } catch(err){
        res.status(500).send(err);
    }
})

//Delete Issue
router.delete('/deleteIssue/:issueId', async (req, res, next) => {
    const { issueId } = req.params;
    
    try {
        const issue = await Issue.remove({ _id: issueId });
        res.status(200).send(issue);
    } catch(err){
        res.status(404).send(err);
    }
})

module.exports = router;