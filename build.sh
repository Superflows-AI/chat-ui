sed_command="sed -i"

if [ "$(uname)" == "Darwin" ]; then
    # macOS
    sed_command="sed -i ''"
fi

rollup -c
mv dist/src/index.d.ts dist/index.d.ts
$sed_command 's/.\/components/.\/src\/components/g' dist/index.d.ts
$sed_command 's/.\/lib/.\/src\/lib/g' dist/index.d.ts