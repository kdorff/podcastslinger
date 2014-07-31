usage:

docker build -t podcastslinger .

docker run  -v /net/tower/mnt/user/media/podcasts/:/data -p 0.0.0.0:1989:3000  -d  -e "PUBLICPORT=12345" -e "TITLE=Podcast title" -e "DESCRIPTION=A short description of the podcast" -e "HOST=my.example.com"   podcastslinger

http://my.example.com:12345/rss
http://my.example.com:12345/media/{data}