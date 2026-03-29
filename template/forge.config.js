module.exports = {
  packagerConfig: {
    icon: "icon",
    ignore: [
      /\.git/,
      /\.gitignore$/,
      /\.gitattributes/,
      /\.Rproj$/,
      /\.Rproj\.user/,
      /\.RData$/,
      /\.Rhistory$/,
      /\.Rprofile$/
    ]
  },
  makers: [
    {
      name: "@electron-forge/maker-zip"
    },
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        setupIcon: "assets/icon.ico"
      }
    }
  ]
};