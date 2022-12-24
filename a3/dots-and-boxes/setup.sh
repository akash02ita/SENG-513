echo "remove build folder to be safe" && pwd && sleep 3
set +x
cd client
rm -r build
cd ..
set -x

echo "install packages frontend and build" && pwd && sleep 3
set +x
cd client && npm install && npm run build && cd .. # install packages frontend and build
set -x

set +x
echo "install packages backend" && pwd && sleep 3
cd server && npm install && cd .. # install packages backend
set -x

