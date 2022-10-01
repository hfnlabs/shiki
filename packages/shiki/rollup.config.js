//@ts-check
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import copy from 'rollup-plugin-copy'
import { terser } from 'rollup-plugin-terser'
import { version } from './package.json'
import rollupReplace from '@rollup/plugin-replace'
import { defineConfig } from 'rollup'

const replace = opts => {
  return rollupReplace({
    ...opts,
    preventAssignment: true
  })
}

const external = ['vscode-oniguruma', 'vscode-textmate', 'jsonc-parser']
const globals = {
  'vscode-oniguruma': 'vscode-oniguruma',
  'vscode-textmate': 'vscode-textmate'
}

export default defineConfig([
  {
    input: 'src/index.ts',
    external,
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs'
      }
    ],
    plugins: [
      replace({
        __CDN_ROOT__: '',
        __BROWSER__: JSON.stringify(false)
      }),
      esbuild(),
      nodeResolve(),
      commonjs()
    ]
  },
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.d.ts',
        format: 'es'
      }
    ],
    plugins: [
      dts(),
      copy({
        targets: [{ src: require.resolve('vscode-oniguruma/release/onig.wasm'), dest: 'dist' }]
      })
    ],
    onwarn: (warning, warn) => {
      if (!/Circular/.test(warning.message)) {
        warn(warning)
      }
    }
  }
])
