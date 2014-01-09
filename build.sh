#!/bin/bash
if [ $# -eq 0 ]; then
    echo "Usage   'build.sh <VERSION> <pem_path>" >&2
    echo "Parm:" >&2
    echo "       <VERSION>  : app build version: 'x.x.x'" >&2
    echo "       <pem_path> : path to pem file for chrome crx app" >&2
    exit $E_NOARGS
fi
version=$1
pem_path=$2
echo $version $pem_path
if [[ "$version" ==  [0-9]*\.[0-9]\.[0-9] ]]; then
    echo "App Build Version: $version"
else
    echo "Unvalid App Build Version, version sould as X.X.X format" >&2
    exit
fi
[ -e ~/jukax-$version ] && rm -r ~/jukax-$version ## delete old build folder
mkdir ~/jukax-$version  ## working dir
# build folder arch
# ./
#  | src/                     ## clone of app dev dir
#  | app/                     ## more clean app (only needed files to run)
#       | js/
#       | css/
#       | img/
#       | index.html
#  | website/                 ## app website
#           | app/            ## copy public available app package here
#  | chrome-packaged-app/     ## chrome packaged app source
#  | firefox-packaged-app/    ## firefox packaged app source
#  | online-app/              ## online app version here
#  | manifest.json            ## chrome packaged app manifest file
#  | manifest.webapp          ## firefoc packaged app manifest file
#  | chrome-updates.xml       ## chrome app packaged app updates file
#  | background.js            ## chrome packaged app background.js
#  | package.manifest         ## firefox packaged app manifest
#  | manifest.appcache        ## app cache for online version
#  | browserconfig.xml        ## win8 integration
#  | jukax.crx                ## chrome packaged app
#  | jukax.zip                ## firefox packaged app
#  | make-crx-package.sh      ## script to create chrome packaged app
cp LICENSE ~/jukax-$version
cp -r ./src ~/jukax-$version
cp -r ./website ~/jukax-$version
cp ./make-crx-package.sh ~/jukax-$version
cd ~/jukax-$version
mkdir app
cp LICENSE app
cp -r src/css app
cp -r src/js app
cp -r src/img app
cp src/background.js .
sed 's/src="js\/jquery\.js"/src="js\/jquery\.min.js"/' src/index.html|sed 's/src="js\/jquery\.mobile\.js"/src="js\/jquery\.mobile\.min\.js"/'|sed 's/href="css\/jquery\.mobile\.css"/href="css\/jquery\.mobile\.min\.css"/'| sed "s/<meta itemprop=\"softwareVersion\" content=\"trunk\"/<meta itemprop=\"softwareVersion\" content=\"${version}\"/"|sed 's/<\!--.*-->//g'| grep "[^ ]" > app/index.html  ## use min versions of scripts and delete empty lines
sed "s/updatecheck codebase.*$/updatecheck codebase='http:\/\/lejenome.github.io\/jukax-about-app\/jukax-${version}.crx' version='$version' \/>/" src/chrome-updates.xml > chrome-updates.xml  ## update version
sed "s/version\": \"[^\"]*\"/version\": \"$version\"/" src/manifest.json |grep "[^ ]" > manifest.json  ## update version
sed "s/version\": \"[^\"]*\"/version\": \"$version\"/" src/manifest.webapp |grep "[^ ]" > manifest.webapp  ##update version
cp src/browserconfig.xml .
sed "s/<\!--version-->.*<\!--\/version-->/$version/g" website/index.html |grep "[^ ]" > website/index.html.new  ##update version
mv website/index.html.new website/index.html
cat <<EOF > manifest.appcache
CACHE MANIFEST
# $(date "+%Y-%m-%d:%H:%M"):v$version

CACHE:
EOF
cd app
find css/*/  img -type f  >> ../manifest.appcache
cd ..
cat <<EOF >> manifest.appcache
js/jquery.min.js
js/jquery.mobile.min.js
js/jquery.nicescroll.min.js
js/jukax.js
js/localForage.js
js/main.js
css/jquery.mobile.min.css
css/main.css

NETWORK:
https://api.kii.com/api
https://api-jp.kii.com/api
https://api-cn2.kii.com/api
js/KiiSDK.js
EOF
## create firefox-packaged-app
cp -r app firefox-packaged-app
cp manifest.webapp firefox-packaged-app
cd firefox-packaged-app && zip -r ../jukax.zip . > /dev/null && cd ..
head -$(($(cat manifest.webapp|wc -l)-1)) manifest.webapp > package.manifest
cat << EOF >>package.manifest
  "package_path": "http://lejenome.github.io/jukax-about/app/jukax.zip",
  "size": $(stat -c "%s" jukax.zip),
  release_notes": "First release"
}
EOF
cp jukax.zip website/app/
## create chrome packaged app
cp -r app chrome-packaged-app
cp manifest.json background.js chrome-packaged-app
bash make-crx-package.sh chrome-packaged-app "$pem_path"  ## create crx package
mv chrome-packaged-app.crx jukax.crx
cp jukax.crx website/app
cp jukax.crx website/app/jukax-${version}.crx
## create online app
cp -r app online-app
cp manifest.json manifest.appcache package.manifest background.js chrome-updates.xml browserconfig.xml online-app
sed 's/": "\/i/": "\/jukax\/i/' manifest.webapp > online-app/manifest.webapp ## needed to runs on lejenome.github.io/jukax
sed 's/<html/<html manifest="manifest.appcache"/' app/index.html > online-app/index.html
## DONE
echo "Don't miss to update the web site and its app folder"
