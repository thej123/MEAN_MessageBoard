var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var mongoose = require('mongoose');
var errorArr = [];

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, './static')));

app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

mongoose.connect('mongodb://localhost/messageboard');
// define Schema variable
var Schema = mongoose.Schema;
// define Post Schema
var PostSchema = new mongoose.Schema({
    name: {type: String, required: true, minlength: 4},
    message: {type: String, required: true }, 
    comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
}, {timestamps: true });
// define Comment Schema
var CommentSchema = new mongoose.Schema({
    name: {type: String, required: true, minlength: 4},
    _post: {type: Schema.Types.ObjectId, ref: 'Post'},
    comment: {type: String, required: true }
}, {timestamps: true });
// set our models by passing them their respective Schemas
mongoose.model('Post', PostSchema);
mongoose.model('Comment', CommentSchema);
// store our models in variables
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
// route for getting a particular post and comments
app.get('/posts/:id', function (req, res){
 Post.findOne({_id: req.params.id})
 .populate('comments')
 .exec(function(err, post) {
      res.render('post', {post: post});
        });
});
// route for creating one comment with the parent post id
app.post('/newcomment/:id', function (req, res){
    console.log("inside newpost - post")
  Post.findOne({_id: req.params.id}, function(err, post){
         var comment = new Comment(req.body);
         comment._post = post._id;
         post.comments.push(comment);
         comment.save(function(err){
             if (err) {
                 console.log('error when trying to save comment')
                 errorArr = comment.errors;
                 res.redirect('/')
             } else {
                console.log('comment saved')
                post.save(function(err){
                    if(err) { console.log('Error'); } 
                    else { 
                        console.log("saved comment")
                        res.redirect('/'); 
                     }
              });
             }
                 
         });
   });
 });

app.get('/', function(req, res) {
    Post.find({})
    .populate('comments')
    .exec(function(err, post) {
        if (err) {
            console.log("i got error");
            console.log(err);
            res.render('index', {errors: err});
        } else {
            console.log("i got stuff");
            console.log(post);
            console.log(errorArr)
            res.render('index', {posts: post, errors: errorArr});
            errorArr = [];
        }
    });
});

app.post('/newmessage', function(req, res) {
    console.log("inside /newmessage - post")
    console.log(req.body)
    var post = new Post(req.body)
    post.save(function(err) {
        if(err) {
            console.log("error when saving new message")
            errorArr = post.errors;
            res.redirect('/')
        } else {
            console.log("successfully saved new message")
            res.redirect('/')
        }
    })
})




app.listen(8000, function() {
    console.log("listening on port 8000");
})