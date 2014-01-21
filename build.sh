#!/bin/bash
if [ $# -eq 0 ]; then
    echo "Usage   'build.sh --version=<VERSION> [--build_path==<build_path>] [--pem=<pem_path>] [--website=<website_address>] [--app_root=<app_root_address>] [--about_root=<about_root_address>]" >&2
    echo "Parm:" >&2
    echo "       --version=<VERSION>                 : app build version: 'x.x.x'" >&2
    echo "       --build_path==<build_path>          : build path. default: ~/jukax-\${version}" >&2
    echo "        --pem=<pem_path>                   : path to pem file for chrome crx app" >&2
    echo "        --website=<website_address>        : website address" >&2
    echo "        --app_root=<app_root_address>      : application root address" >&2
    echo "        --about_root=<about_root_address>  : about application page root address" >&2
    exit $E_NOARGS
fi
website="http://lejenome.github.io"
app_root="/jukax"
about_root="/jukax-about"
pem_path=
build_path=
for arg in "$@"; do
    case "$arg" in
        \-\-version=*)
            version="$(echo "$arg"| sed 's/--version=//')"
            ;;
        \-\-build_path=*)
            build_path="$(echo "$arg"| sed 's/--build_path=//')"
            ;;
        \-\-pem=*)
            pem_path="$(echo "$arg"| sed 's/--pem=//')"
            ;;
        \-\-website=*)
            version="$(echo "$arg"| sed 's/--website=//')"
            ;;
        \-\-app_root=*)
            app_root="$(echo "$arg"| sed 's/--app_root=//')"
            ;;
        \-\-about_root=*)
            about_root="$(echo "$arg"| sed 's/--about_root=//')"
            ;;
        *)
            echo "UNKNOWN ARGUMENT $arg"
            exit
            ;;
    esac
done
if [[ "$version" ==  [0-9]*\.[0-9]\.[0-9] ]]; then
    echo "App Build Version: $version"
else
    echo "Unvalid App Build Version, version sould as X.X.X format" >&2
    exit
fi
if [ "$build_path" == "" ]; then
    build_path=~/jukax-$version
fi
[ -e "$build_path" ] && rm -r "$build_path" ## delete old build folder
mkdir "$build_path"  ## working dir
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
cp LICENSE "$build_path"
cp -r ./src "$build_path"
cp -r ./website "$build_path"
cp ./make-crx-package.sh "$build_path"
cp ./compiler.jar "$build_path"
cd "$build_path"
mkdir app
cp LICENSE app
cp -r src/css app
cp -r src/js app
cp -r src/img app
cp src/background.js .
#sed 's/src="js\/jquery\.js"/src="js\/jquery\.min.js"/' src/index.html|sed 's/src="js\/jquery\.mobile\.js"/src="js\/jquery\.mobile\.min\.js"/'|sed 's/src="js\/main\.js"/src="js\/main\.min\.js"/'|sed 's/src="js\/jukax\.js"/src="js\/jukax\.min\.js"/'|sed 's/src="js\/KiiSDK\.js"/src="js\/KiiSDK\.min\.js"/'|sed 's/src="js\/localForage\.js"/src="js\/localForage\.min\.js"/'|sed 's/href="css\/jquery\.mobile\.css"/href="css\/jquery\.mobile\.min\.css"/'| sed "s/<meta itemprop=\"softwareVersion\" content=\"trunk\"/<meta itemprop=\"softwareVersion\" content=\"${version}\"/"|sed 's/<\!--.*-->//g'| grep "[^ ]" > app/index.html  ## use min versions of scripts and delete empty lines
sed 's|src="js/jquery\.js"|src="js/jquery.min.js"|' src/index.html | sed 's|src="js/jquery\.mobile\.js"|src="js/jquery.mobile.min.js"|' | sed 's|src="js/main\.js"|src="js/main.min\.js"|' | sed 's|^.*src="js/jukax\.js".*$||' | sed 's|^.*src="js/KiiSDK\.js".*$||' | sed 's|^.*src="js/localForage\.js".*$||' | sed 's|href="css/jquery\.mobile\.css"|href="css/jquery.mobile.min.css"|'| sed 's/<meta itemprop="softwareVersion" content="trunk"/<meta itemprop="softwareVersion" content='"${version}"'/' | sed 's/<!--.*-->//g' | grep "[^ ]" > app/index.html  ## use min versions of scripts and delete empty lines
sed 's,updatecheck codebase.*$,updatecheck codebase="'"${website}${about_root}"'/app/jukax-'"$version"'.crx version='"$version"' />,' src/chrome-updates.xml > chrome-updates.xml  ## update version
sed 's/version": "[^"]*"/version": "'"$version"'"/' src/manifest.json | grep "[^ ]" > manifest.json  ## update version
sed 's/version": "[^"]*"/version": "'"$version"'"/' src/manifest.webapp | grep "[^ ]" > manifest.webapp  ##update version
cp src/browserconfig.xml .
sed 's|<!--version-->.*<!--/version-->|'"$version"'|g' website/index.html | sed 's|/jukax-about/|'"$about_root"'/|' | sed 's|/jukax/|'"$app_root"'/|' | grep "[^ ]" > website/index.html.new  ##update version
mv website/index.html.new website/index.html
cat <<EOF > manifest.appcache
CACHE MANIFEST
# $(date "+%Y-%m-%d:%H:%M"):v$version
CACHE:
EOF
#cd app
#find img -type f  >> ../manifest.appcache
#cd ..
cat <<EOF >> manifest.appcache
js/jquery.min.js
js/jquery.mobile.min.js
#js/jquery.nicescroll.min.js
#js/jukax.min.js
#js/localForage.min.js
js/main.min.js
css/jquery.mobile.min.css
css/main.css
css/images/ajax-loader.gif
img/jukax-16x16.png
img/jukax-32x32.png
img/jukax-96x96.png
img/jukax-160x160.png
img/jukax-196x196.png

NETWORK:
https://api.kii.com/api
https://api-jp.kii.com/api
https://api-cn2.kii.com/api
js/KiiSDK.min.js
manifest.appcache
EOF
## minify some code
cd app/js/
#uglifyjs jquery.js --source-map jquery.js.map --source-map-root . -o jquery.min.js -c
#uglifyjs jquery.mobile.js --source-map jquery.mobile.js.map --source-map-root . -o jquery.mobile.min.js -c
uglifyjs KiiSDK.js localForage.js jukax.js main.js --source-map main.js.map --source-map-root . -o main.min.js -c
#sed -i '1i//# sourceMappingURL=main.min.js.map' main.min.js
cd ../..
## create firefox-packaged-app
cp -r app firefox-packaged-app
cp manifest.webapp firefox-packaged-app
cd firefox-packaged-app && zip -r ../jukax.zip . > /dev/null && cd ..
head -$(($(cat manifest.webapp|wc -l)-1)) manifest.webapp > package.manifest
cat << EOF >>package.manifest
  ,
  "package_path": "${website}${about_root}/app/jukax.zip",
  "size": $(stat -c "%s" jukax.zip),
  "release_notes": "Stable release"
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
cp manifest.json manifest.appcache background.js chrome-updates.xml browserconfig.xml package.manifest online-app
sed 's,": "/,": "'"$app_root"'/,' manifest.webapp  > online-app/manifest.webapp ## needed to runs on lejenome.github.io/jukax
sed 's/<html/<html manifest="manifest.appcache"/' app/index.html | sed 's|/jukax-about/|'"$about_root"'/|' | sed 's|/jukax/|'"$app_root"'/|' > online-app/index.html
## DONE
echo "Don't miss to update the web site and its app folder"
