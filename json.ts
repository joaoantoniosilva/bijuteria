{
 "compilerOptions": {
    "target": "es6",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true
 },
 "include": ["src/**/*.ts"],
 "exclude": ["node_modules"]
}
"scripts": {
 "start": "ts-node src/index.ts",
 "build": "tsc",
 "serve": "node dist/index.js"
}