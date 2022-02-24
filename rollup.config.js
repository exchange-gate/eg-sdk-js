import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import pkg from './package.json';


export default [
    // browser-friendly UMD build
    {
        input: 'src/index.ts',
        output: {
            name: 'eg-sdk',
            file: pkg.browser,
            format: 'umd',
            globals: {
                'socketcluster-client': 'socketCluster',
                'async-stream-emitter': 'AsyncStreamEmitter',
                'axios': 'axios'
            }
        },
        plugins: [
            json(),
            resolve(),
            commonjs(),
            typescript({ tsconfig: './tsconfig.json' })
        ],
        external: ['socketcluster-client', 'async-stream-emitter', 'axios']
    },

    // CommonJS (for Node) and ES module (for bundlers) build.
    // (We could have three entries in the configuration array
    // instead of two, but it's quicker to generate multiple
    // builds from a single configuration where possible, using
    // an array for the `output` option, where we can specify
    // `file` and `format` for each target)
    {
        input: 'src/index.ts',
        output: [
            {
                file: pkg.main,
                format: 'cjs',
                globals: {
                    'socketcluster-client': 'socketCluster',
                    'async-stream-emitter': 'AsyncStreamEmitter',
                    'axios': 'axios'
                }
            },
            {
                file: pkg.module,
                format: 'es',
                globals: {
                    'socketcluster-client': 'socketCluster',
                    'async-stream-emitter': 'AsyncStreamEmitter',
                    'axios': 'axios'
                }
            }
        ],
        plugins: [json(), typescript({ tsconfig: './tsconfig.json' })],
        external: ['socketcluster-client', 'async-stream-emitter', 'axios']
    }
];
