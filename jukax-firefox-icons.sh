for i in 16 32; do
    j=$i
    convert -size ${j}x${j} xc:none -background \#0092d8  -gravity center -extent ${j}x${j} \
    \( +clone  -alpha extract -draw 'fill black polygon 0,0 0,8 8,0 fill white circle 8,8 8,0' \
    \( +clone -flip \) -compose Multiply -composite  \( +clone -flip \) -compose Multiply -composite \( +clone -flop \) \
    -compose Multiply -composite \( +clone -flop \) -compose Multiply -composite \)  -alpha off -compose CopyOpacity -composite \
    xc:none -size ${i}x${i} -extent ${i}x${i} -background white -gravity center -compose over -composite src/img/jukax-transparent.png \
    -resize ${i}x${i} -compose over -composite src/img/jukax-firefox-${i}x${i}.png
done
for i in  60 90 120 128 256; do
    j=$(bc <<< "$i-6")
    convert -size ${j}x${j} xc:none -background \#0092d8  -gravity center -extent ${j}x${j} \
      \( +clone  -alpha extract -draw 'fill black polygon 0,0 0,8 8,0 fill white circle 8,8 8,0' \
      \( +clone -flip \) -compose Multiply -composite  \( +clone -flip \) -compose Multiply -composite \( +clone -flop \) \
      -compose Multiply -composite \( +clone -flop \) -compose Multiply -composite \)  -alpha off -compose CopyOpacity -composite \
      xc:none -size ${i}x${i} -extent ${i}x${i} -background white -gravity center -compose over -composite src/img/jukax-transparent.png \
      -resize ${i}x${i} -compose over -composite src/img/jukax-firefox-${i}x${i}.png
done
