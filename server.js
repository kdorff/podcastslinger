var fs = require('q-io/fs');
var pug = require('pug');
var id3 = require('./id3.js');
var Q = require('q');
var compression = require('compression');

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


var express = require('express'); // call express
var app = express(); // define our app using express
var router = express.Router(); // get an instance of the express Router
var basepath = program.data || "media";
var feed;
var server = program.host + ":" + program.publicport;
var options = {
  feed: {
    title: program.title,
    description: program.description,
    link: 'http://' + server + "/rss",
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

function createPost(file) {
  var deferred = Q.defer();
  id3({
    file: basepath + '/' + file,
    type: id3.OPEN_LOCAL
  }, function(err, tags) {
    var newFile = {
      title: file,
      description: 'post1 summary',
      canonicalUrl: 'http://' + server + '/media' + encodeURIComponent(file),
      pubDate: (new Date()).toGMTString(),
      length: 1
    };
    if (!err) {
      newFile.description = tags.year + " " + tags.title;
      newFile.length = tags.size || 1
    } else {
      newFile.description = "";
    }
    deferred.resolve(newFile)
  });
  return deferred.promise;
}

function preparePosts(files) {
  var posts = [];
  files.forEach(function(file) {
    posts.push(createPost(file));
  });
  return Q.all(posts);
}

function render(options) {
  return fs.read('./rss.jade')
    .then(function(content) {
      console.log(content);
      return pug.render(content, options, function(err, xml) {
        console.log(xml)
        if (err) {
          throw err;
        }
        return xml;
      });
    })
}

router.get('/rss', function(req, res) {
  console.log("rss requested")
  res.setHeader('content-type', 'application/xml');
  return res.send(feed);

});

function getFiles() {
  return fs.listTree(basepath).then(function(paths) {
    return paths.filter(function(path) {
      if (path.split('.').pop() == 'mp3') {
        return true;
      }
    })
  })
}

getFiles()
  .then(function(files) {
    return preparePosts(files)
  })
  .then(function(posts) {

    options.posts = posts;
    return render(options)
  })
  .then(function(xml) {
    feed = xml;
  })
  .then(function() {
    app.use(compression());
    app.use('/', router);
    app.use('/media', express.static(basepath));
    app.listen(program.port);
    console.log('Magic happens on port ' + program.port);

  }).catch(function(err) {
    console.error(err);
  })