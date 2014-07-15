var fs = require('fs');
var id3 = require('id3js');
var  Q  = require('q');
var file = "media/melwaters1997.mp3";
id3({ file: file, type: id3.OPEN_LOCAL }, function(err, tags) {
    var newFile= {
        title: file,
        description: 'post1 summary',
        canonicalUrl: 'http://',
        pubDate: (new Date()).toGMTString(),
        length: 1
    };
    if (!err){
      newFile.description = tags.year + " " + tags.title;
    } else {
      console.log(err);
    }
    console.log(newFile);
 //   deferred.resolve(newFile)
  });