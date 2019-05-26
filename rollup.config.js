import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  input: 'index.js',
  plugins: [
    nodeResolve()
  ],
  output: {
    file: 'build/realestate-360.js',
    format: 'umd'
  }
}
