import copy from 'rollup-plugin-copy';
import resolve from '@rollup/plugin-node-resolve';
import glob from 'glob';

// export default {
//   input: 'dist/www/main.js',
//   output: {
//     file: 'dist/wwww/bundle.js',
//     format: 'cjs'
//   }
// };
const outputWeb = 'dist/www';
const outputServer = 'dist';
const configs = [];

/**{
  input: ,
  output: {
    file: outputWeb + '/train-comm.js',
    format: 'cjs'
  } */

// [{
//   input: [
//     'app/server/server.js'
//   ] ,
//   output: {
//     file: outputServer + '/server.js',
//     format: 'cjs'
//   },
//   plugins: [
//     resolve(),
//     copy({
//       targets: [
//         {src: 'app/assets/**/*', dest: outputWeb + '/assets'},
//         {src: 'app/scripts/train/*.html', dest: outputWeb},
//         {src: 'app/scripts/train/*.css', dest: outputWeb}
//       ]
//     })
//   ]
// }];

// configs.push(createConfig({
//   inputFile: 'app/scripts/train/train-comm.js',
//   outputFile: `${outputWeb}/train-comm.js`,
//   moduleFormat: 'cjs'
// }));


// read the directories for scripts -> output them in the dist/www
const createConfigs = () => {
  // server 
  let files = glob.sync('app/sever/*.js');
  let file = '';
  for (file of files) {
    configs.push(createConfig({
      inputFile: file,
      outputFile: `${outputServer}/${file}`
    }));
  }

  // scripts/train
  files = glob.sync('app/scripts/train/*.js');
  for (file of files) {
    configs.push(createConfig({
      inputFile: file,
      outputFile: `${outputWeb}/${file}`
    }));
  }
};

const createConfig = ({inputFile, outputFile, moduleFormat = 'cjs', minificationLevel = 'WHITESPACE_ONLY'}) => {
  const plugins = [resolve()];
  if (!configs.length) {
    plugins.push(
      copy({
        targets: [
          {src: 'app/assets/**/*', dest: outputWeb + '/assets'},
          {src: 'app/scripts/train/*.html', dest: outputWeb},
          {src: 'app/scripts/train/*.css', dest: outputWeb}
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