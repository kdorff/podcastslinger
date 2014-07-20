var fs = require('fs');
var jade = require('jade');
var id3 = require('./id3');
var  Q  = require('q');

var program = require('commander');
var port, data, host, publicport, image;
program
  .version('0.0.1')
  .option('-d, --data [value]', 'base path to files')
  .option('-p, --port [value]', 'port')
  .option('-h, --host [value]', 'public hostname')
  .option('-l, --publicport [value]', 'public port')
  .option('-t, --title [value]', 'public port')
  .option('-z, --description [value]', 'public port')
  .option('-i, --image [value]', 'icon for feed')

  .parse(process.argv);


var rssTemplate = fs.readFileSync('./rss.jade').toString();
var express    = require('express');    // call express
var app        = express();         // define our app using express
//var publicport = 32191;
var router = express.Router();        // get an instance of the express Router
//"yellowtail.asuscomm.com"
var basepath =  program.data || "media";
var server = program.host+":"+program.publicport;
var options = {
  feed: {
    title: program.title,
    description: program.description,
    link: 'http://'+server+"/rss",
    language: 'en-us',
    image: program.image
  },
  posts: [{
    title: '',
    description: '',
    canonicalUrl: '',
    pubDate: (new Date()).toGMTString()
  }]
};

function createPost(file){
  var deferred = Q.defer();
  id3({ file: basepath+'/'+file, type: id3.OPEN_LOCAL }, function(err, tags) {
    var newFile= {
      title: file,
      description: 'post1 summary',
      canonicalUrl: 'http://'+server+'/'+basepath+"/"+encodeURIComponent(file),
      pubDate: (new Date()).toGMTString(),
      length: 1
    };
    if (!err){
      newFile.description  = tags.year + " " + tags.title;
      newFile.length= tags.size || 1
    } else {
       newFile.description  = "";
    }
    deferred.resolve(newFile)
  });
  return deferred.promise;
}

function preparePosts(files){
  var posts=[];
  files.forEach(function(file){
    posts.push(createPost(file));
  });
  return  Q.all(posts);
}
function render(options){
 var deferred = Q.defer();
 jade.render(rssTemplate, options, function (err, xml) {

  if (err) {
    throw err;
  }
  deferred.resolve(xml);
});
return deferred.promise;
}

router.get('/rss', function(req, res) {
  var files = fs.readdirSync(basepath);
  var posts = preparePosts(files);
  posts.then(function(result){
    options.posts = result;
    return render(options);
  }).then(function(xml){
    res.setHeader('content-type', 'application/xml');
    return res.send(xml);
  }).done();
});

 app.use('/', router);
 app.use('/media', express.static(basepath));
 app.listen(program.port);
 console.log('Magic happens on port ' + program.port);