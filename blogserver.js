var express = require("express");
var bodyparser = require("body-parser");
var app = express();
var port = process.env.PORT || 8000;
var mongoose = require("mongoose");

app.use(bodyparser.urlencoded({extended: true}));
app.use(bodyparser.json());

mongoose.connect("mongodb://localhost/blogapp");
var db = mongoose.connection;

db.on("error", console.error.bind(console, "Connection error:"));

db.once("open", function () {
   console.log("Connected.");
})

var Schema = mongoose.Schema;

var Comment =  new Schema({
   user: String,
   title: String,
   body: String,
   date: Date
});

var BlogPost = new Schema({
   _postid:Schema.ObjectId,
   author: String,
   title: String,
   body: String,
   date: Date,
   comments: [Comment],
   meta: { votes : Number,
           favs : Number }
});

// Get all posts
app.get("/posts", function(req, res) {
   BlogPost.find(function(err, posts) {
      if(err)
         res.json(err);

      res.json(posts);
      res.json({message: "Retrieving " + BlogPost.count() + " blog posts."});
      });
});

// Get a specific post
app.get("/posts/:blogpost_id", function(req, res) {
   BlogPost.findbyId(req.params.blogpost_id, function(err, post) {
      if(err)
         res.json(err);

      res.json(post);
      res.json({message: "Retrieving blog post: " + post.title +
      " by " + post.author});
      });
});

// Create new post
app.post("/posts", function(req, res) {
   var blog_post = new BlogPost();
   blog_post.author = req.body.author;
   blog_post.title = req.body.title;
   blog_post.body = req.body.body;
   blog_post.date = req.body.date;
   blog_post.comments = [];
   blog_post.meta.votes = 0;
   blog_post.meta.favs = 0;

   blog_post.save(function(err){
      if(err)
         res.json(err);

      res.json({message: "Created new blog post: " + req.body.title
      + " by " + req.body.author + "."});
      });
});

// Update a specific post
app.put("/posts/:blogpost_id", function(req, res) {
   BlogPost.findById(req.params.blogpost_id, function (err, blog_post) {
      if(err)
         res.json(err);

      blog_post.author = req.body.author;
      blog_post.title = req.body.title;
      blog_post.body = req.body.body;
      blog_post.date = req.body.date;
      blog_post.comments = req.body.comments;
      blog_post.meta = req.body.meta;

      blog_post.save(function(err) {
         if(err)
            res.json(err);

         res.json({message: "Updated blog post: " + req.body.title
         + " by " + req.body.author + "."});
      });
   });
});

// Delete a specific post
app.delete("/posts/:blogpost_id", function(req, res) {
   BlogPost.remove({_postid: req.params.blogpost_id}, function (err, blog_post) {
      if(err)
         res.json(err);

      res.json({message: "Deleted blog post."});
      });
});

// Create new comment for specific post
app.post("/posts/:blogpost_id/comments", function(req, res) {
   BlogPost.findByIdAndUpdate(
      {_postid : req.params.blogpost_id},
      {$push: {comments: req.body.comment}},
      {safe: true, upsert: true},
      function(err, ihavenoideawhatimdoing) {
        res.json({message: "Created comment on blog post."});
      });
});

// Get all comments for a specific post
app.get("/posts/:blogpost_id/comments", function(req, res) {
   BlogPost.findById(req.params.blogpost_id, function(err, blog_post) {
      if(err)
         res.json(err);

      res.json(blog_post.comments);
      res.json({comment : "Retrived comments for blog post: " + req.body.title
         + " by " + req.body.author + "."});
      });
});

// Delete a specific comment
app.delete("/posts/:blogpost_id/comments/:comment_id", function(req, res) {
   BlogPost.findByIdAndUpdate(
      {_postid: req.params.blogpost_id},
      {$pull: {comments: {_id: req.params.comment_id}}},
      function(err, ihavenoideawhatimdoing) {
        res.json({message: "Deleted comment on blog post."});
      });
});

//Updates a specific comment
app.put("/posts/:blogpost_id/comments/:comment_id", function(req, res) {
   var comm = {};
   comm.user = req.body.user;
   comm.title = req.body.title;
   comm.body = req.body.body;
   comm.date = req.body.date;
   BlogPost.update(
   {_postid: req.params.blogpost_id, _id:req.params.comment_id}, comm,
   function(err, wowihopethisworks) {
      if(err)
         res.json(err);

      res.json({comment: "Updated comment on blog post."});
   });
});

// Gets a specific comment
app.put("/posts/:blogpost_id/comments/:comment_id", function(req, res) {
   BlogPost.findById(
   {_postid: req.params.blogpost_id, _id:req.params.comment_id},
   function(err, comm) {
      if(err)
         res.json(err);

      res.json(comm);
      res.json({comment: "Updated comment on blog post."});
   });
});

app.listen(port);
console.log("Using port number " + port);

