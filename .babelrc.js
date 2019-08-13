console.log("Load babel config");

module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        loose:true,
        modules: false
      }
    ]
  ]
};
