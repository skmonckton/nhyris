module.exports = {
  packagerConfig: {
    icon: "assets/icon",
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
      // For auto updates on macOS and Linux, code signing is required.
      // Then, the following makers should be added:
      // - macOS: @electron-forge/maker-dmg
      // - linux: @electron-forge/maker-deb or @electron-forge/maker-rpm
      // Finally, autoUpdater in index.js would to be configured to work on these platforms
    },
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        setupIcon: "assets/icon.ico",
        loadingGif: "assets/install-spinner.gif"
      }
    }
  ]
};