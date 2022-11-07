# only youtube.com not allowed. Otherwise --recursive and --span-hosts will not stop and goes all the way to google.com
wget \
     --recursive \
     --level 5 \
     --no-clobber \
     --page-requisites \
     --adjust-extension \
     --span-hosts \
     --convert-links \
     --restrict-file-names=windows \
     --exclude-domains=youtube.com \
     --no-parent \
         https://pages.cpsc.ucalgary.ca/~akashdeep.singh4/seng513/a1/
