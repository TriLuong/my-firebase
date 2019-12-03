cd cms && git checkout develop && git pull && yarn && yarn build

firebase target:apply hosting cms cms-my-firebase
firebase deploy --only hosting:cms