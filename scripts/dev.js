// minist 用来解析命令行参数的
const args = require('minimist')(process.argv.slice(2))
const {resolve} = require('path')
const {build} = require('esbuild')

const target = args._[0] || 'reactivity'
const format = args.f || 'global'

// 开发的时候只打包某个包
// iife 立即执行函数 (function(){})()   
// cjs node 的模块 module.exports
// esm 浏览器中的 esModule 模块 import
const pkg = require(resolve(__dirname, `../packages/${target}/package.json`))
const outputFormat = format.startsWith('global') ? 'iife' : format === 'cjs' ? 'cjs' : 'esm'
const outfile = resolve(__dirname, `../packages/${target}/dist/${target}.${format}.js`)

// 直接支持 ts
build({
    entryPoints: [resolve(__dirname, `../packages/${target}/src/index.ts`)],    // 入口
    outfile,    // 输出文件
    bundle: true,   // 把所有的包打在一起？
    sourcemap: true,    // 是否生成 source map
    format: outputFormat,   // 输出的格式
    globalName: pkg.buildOptions?.name,     // 全局名字
    platform: format === 'cjs' ? 'node' : 'browser',    // 平台
    watch: {    // 监控文件变化
        onRebuild(error) {
            if (!error) console.log('rebuild...')
        }
    }
}).then(() => {
    console.log('watching...')
})