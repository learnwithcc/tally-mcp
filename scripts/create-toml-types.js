const fs = require('fs');
const path = require('path');

const typesDir = path.resolve(__dirname, '..', 'node_modules', '@types');
const tomlTypesDir = path.resolve(typesDir, 'toml');
const tomlDts = path.resolve(tomlTypesDir, 'index.d.ts');

const tomlTypeContent = `declare module 'toml' {
  export function parse(tomlString: string): any;
}
`;

if (!fs.existsSync(typesDir)) {
  fs.mkdirSync(typesDir);
}

if (!fs.existsSync(tomlTypesDir)) {
  fs.mkdirSync(tomlTypesDir);
}

fs.writeFileSync(tomlDts, tomlTypeContent);

console.log('Created toml type declaration file.'); 