#!/usr/bin/env sh

# https://cli.vuejs.org/guide/deployment.html#github-pages

# abort on errors
set -e

# build
npm run build

# navigate into the build output directory
cd dist

# if you are deploying to a custom domain
# echo 'www.example.com' > CNAME

echo "# v0.010 theremini-online  http://shemeshg.github.io/theremini-online" >> README.md

git init
git add -A
git commit -m 'deploy'

# if you are deploying to https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

git remote add origin https://github.com/shemeshg/theremini-online.git 
git push -u origin master --force
cd /tmp

git clone  https://github.com/shemeshg/theremini-online.git
cd theremini-online/
git branch gh-pages
git push -u origin gh-pages --force
http://shemeshg.github.io/theremini-online

# if you are deploying to https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

cd -