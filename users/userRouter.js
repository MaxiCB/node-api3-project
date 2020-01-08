const express = require("express");

const router = express.Router();

const Users = require("./userDb");
const Posts = require("../posts/postDb");

router.use(express.json());

router.post("/", validateUser, (req, res) => {
  Users.insert(req.body)
  .then(user => {
    res.status(201).json(user)
  })
  .catch(err => res.status(500).json({errorMessage: "Error adding this user"}))
});

router.post("/:id/posts", validatePost, (req, res) => {

  const newPost = { ...req.body, userId: req.params.id}
  Posts.insert(newPost)
    .then(post => {
      res.status(201).json(post)
    })
    .catch(err => res.status(500).json({errorMessage: "Error adding this post"}))
});

router.get("/", (req, res) => {

  Users.get(req.query)
    .then(user => res.status(200).json(user))
    .catch(err => res.status(500).json({errorMessage: "Error fetching users"}))
});

router.get("/:id", validateUserId, (req, res) => {
  
  Users.getById(req.params.id)
    .then(user => {
      if(user){
        res.status(200).json(user)
      } else {
        res.status(400).json({errorMessage: "Invalid user id"})
      }      
    })
    .catch(err => res.status(500).json({errorMessage: "Error fetching user"}))
});

router.get("/:id/posts", validateUserId, (req, res) => {
  Users.getUserPosts(req.params.id)
    .then(posts => {
      if(posts){
        res.status(200).json(posts)
      } else {
        res.status(400).json({errorMessage: "Invalid user id"})
      }
    })
    .catch(err => res.status(500).json({errorMessage: "Error fetching user posts"}))
});

router.delete("/:id", validateUserId, (req, res) => {
  Users.remove(req.params.id)
  .then(user => {
    if(user > 0){
      res.status(200).json({message: "User deleted"})
    } else {
      res.status(400).json({errorMessage: "User could not be deleted"})
    }
  })
  .catch(err => res.status(500).json({errorMessage: "Error deleting user"}))
});

router.put("/:id", validateUserId, (req, res) => {
  const id = req.params.id;
  const { name } = req.body;

  if(!name){
    res.status(400).json({errorMessage: "Name field is required"})
  }

  Users.update(id, req.body)
  .then(user => {
    if(user){
      res.status(200).json({message: "User updated sucessfully"});
    } else {
      res.status(404).json({errorMessage: "No user with that id exists"})
    }
  })
  .catch(err => {
    res.status(500).json({errorMessage: "Error updating user"})
    console.log(err)
  })
});

//custom middleware

function validateUserId(req, res, next) {
  const { id } = req.params;

  Users.getById(id)
    .then(userId => {
      if (userId) {
        userId = req.user;
        next();
      } else {
        res.status(400).json({ errorMessage: "Invalid user id." });
      }
    })
    .catch(err => {
      console.log(
        res
          .status(500)
          .json({ error: "There was a error validating the user id" })
      );
    });
}

function validateUser(req, res, next) {
  const user = req.body;
  if (!user) {
    res.status(400).json({ message: "Missing user data" });
  } else if (!user.name) {
    res.status(400).json({ message: "Missing required name field" });
  } else {
    next();
  }
}

function validatePost(req, res, next) {
  const post = req.body;
  if (!post) {
    res.status(400).json({ message: "Missing post data" });
  } else if (!post.text) {
    res.status(400).json({ message: "Missing required text field" });
  } else {
    next();
  }
}

module.exports = router;
