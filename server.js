var fs = require('fs');
var jade = require('jade');
var id3 = require('id3js');
var  Q  = require('q');

var rssTemplate = fs.readFileSync('./jade/rss.jade').toString();
var express    = require('express');    // call express
var app        = express();         // define our app using express
var port = process.env.PORT || 8000;    // set our port
var router = express.Router();        // get an instance of the express Router

var basepath =  "media";
var server = "localhost:3000/"
var options = {
  feed: {
    title: 'feed title',
    description: 'feed description',
    link: 'http://example.org/rss.xml',
    language: 'en'
  },
  posts: [{
    title: 'post1 title',
    description: 'post1 summary',
    canonicalUrl: 'http://example.org/post1',
    pubDate: (new Date()).toGMTString()
  }]
};

// function createPost(file){
//   var deferred = Q.defer();
//   id3({ file: file, type: id3.OPEN_LOCAL }, function(err, tags) {
//     var newFile= {
//         title: file,
//         description: 'post1 summary',
//         canonicalUrl: 'http://'+server+file,
//         pubDate: (new Date()).toGMTString()
//     };
//     if (!err){
//       newFile.description = tags.year + " " + tags.title;
//     }
//     //console.log(newFile);
//     deferred.resolve(newFile)
//   });
// return deferred.promise;
// }
function createPost(file){
  // var deferred = Q.defer();
  // id3({ file: file, type: id3.OPEN_LOCAL }, function(err, tags) {
    var newFile= {
        title: file,
        description: 'post1 summary',
        canonicalUrl: 'http://'+server+basepath+"/"+encodeURIComponent(file),
        pubDate: (new Date()).toGMTString()
    };
  //   if (!err){
  //     newFile.description = tags.year + " " + tags.title;
  //   }
  //   //console.log(newFile);
  //   deferred.resolve(newFile)
  // });
return  newFile;
}
function preparePosts(files){
  var posts=[];
    files.forEach(function(file){
    //  var deferred = Q.defer();
    posts.push(createPost(file));
  });
  return  posts;
}

router.get('/', function(req, res) {
  var files = fs.readdirSync(basepath);
  options.posts = preparePosts(files);
//   options.posts.then(function(){
    // options.posts.forEach(function(post){
    //   console.log(post)
    // });
    jade.render(rssTemplate, options, function (err, xml) {
        if (err) {
        throw err;
      }
      res.send(xml);
      });
 // });
});

app.use('/rss', router);
app.use('/media', express.static(basepath));
app.listen(port);
console.log('Magic happens on port ' + port);