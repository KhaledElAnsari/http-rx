import buble from "rollup-plugin-buble";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import cleanup from "rollup-plugin-cleanup";
import butternut from "rollup-plugin-butternut";


const ENV = process.env.npm_lifecycle_event;
const isMin = ENV === "build:min";

let rollupConfig = {
  entry: "./src/index.js",
  format: "cjs",
  dest: "./dist/index.js",
  plugins: [
    buble(),
    resolve(),
    commonjs(),
    cleanup()
  ]
};

if(isMin) {
  rollupConfig.plugins.push(butternut());
  rollupConfig.dest = "./dist/index.min.js";
}

export default rollupConfig;