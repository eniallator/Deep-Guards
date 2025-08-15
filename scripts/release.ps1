yarn prepublish
yarn publish

$VERSION=$(cat package.json | jq -r '.version')

echo $VERSION