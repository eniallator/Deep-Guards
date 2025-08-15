yarn prepublish
yarn publish

$VERSION=$(cat package.json | jq -r '.version')

git add .
git commit -m "Release $VERSION"
git tag -a "$VERSION" -m "Release $VERSION"
git push --no-verify
git push --tags --no-verify
