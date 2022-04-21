import copy from 'rollup-plugin-copy';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import glob from 'glob';

const outputApp = 'dist/app';
const outputDist = 'dist';
const configs = [];


// read the directories for scripts -> output them in the dist/www
const createConfigs = () => {
  // server 
  let files = glob.sync('app/server/*.js');
  let file = '';
  // for (file of files) {
  //   configs.push(createConfig({
  //     inputFile: file,
  //     outputFile: `${outputDist}/${file.replace('app/server/','')}`,
  //     moduleFormat: 'cjs'
  //   }));
  // }

  // scripts/train
  files = glob.sync('app/train/*.js');
  for (file of files) {
    configs.push(createConfig({
      inputFile: file,
      outputFile: `${outputDist}/${file.replace('app/train/', 'app/')}`
    }));
  }
};
// esm, cjs, 
const createConfig = ({inputFile, outputFile, moduleFormat = 'esm', minificationLevel = 'WHITESPACE_ONLY'}) => {
  const plugins = [
    nodeResolve(),
    commonjs(),
    json()
  ];

  if (!configs.length) {
    plugins.push(
      copy({
        targets: [
          {src: 'app/assets/**/*', dest: outputApp + '/assets'},
          {src: 'app/train/*.html', dest: outputApp},
          {src: 'app/train/*.css', dest: outputApp},
          {src: 'package.json', dest: outputDist},
          {src: 'app/server/*.js', dest: outputDist}
        ]
      })
    );
  }

  return {
    plugins,
    input: inputFile,
    output: {
      file: outputFile,
      format: moduleFormat
    }
  }
};

createConfigs();

export default configs;