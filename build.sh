rollup -c
mv dist/src/index.d.ts dist/index.d.ts
sed -i '' 's/.\/components/.\/src\/components/g' dist/index.d.ts
sed -i '' 's/.\/lib/.\/src\/lib/g' dist/index.d.ts