const express = require('express');

const router = express.Router();

const Posts = require("./postDb");

router.get('/', (req, res) => {
  Posts.get()
    .then(posts => res.status(200).json(posts))
    .catch(err => res.status(500).json({errorMessage: "Error fetching posts"}))
});

router.get('/:id', validatePostId, (req, res) => {
  Posts.getById(req.params.id)
    .then(post => res.status(400).json(post))
    .catch(err => res.status(500).json({errorMessage: "Error fetching post with id"}))
});

router.delete('/:id', validatePostId, (req, res) => {
  Posts.remove(req.params.id)
    .then(post => {
      if(post > 0){
        res.status(200).json({message: "Post deleted"})
      } else {
        res.status(400).json({errorMessage: "User could not be deleted"})
      }
    })
    .catch(err => res.status(500).json({errorMessage: "Error deleting post"}))
});

router.put('/:id', validatePostId, (req, res) => {
  const id = req.params.id;
  const { text, user_id } = req.body;
  if(!text){
    res.status(400).json({errorMessage: "Post requires text"})
  }
  if(!user_id){
    res.status(400).json({errorMessage: "Post requires a user_id"})
  }

  const post = {
    text: text,
    user_id: user_id
  }

  Posts.update(id, post)
    .then(post => {
      if(post){
        res.status(200).json({message: "Post Updated"})
      } else {
        res.status(404).json({errorMessage: "Could not update post"})
      }
    })
    .catch(err => res.status(500).json({errorMessage: "Error updating post"}))
});

// custom middleware

function validatePostId(req, res, next) {
  const { id } = req.params;

  Posts.getById(id)
    .then(post => {
      if(post){
        postId = id;
        next();
      } else {
        res.status(400).json({ errorMessage: "Invalid post id."})
      }
    })
    .catch(err => {
      console.log(err)
      res.status(500).json({errorMessage: "Error validation post id."})
    })
}

module.exports = router;
