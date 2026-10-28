module.exports = {
  packagerConfig: {
    icon: "assets/icon",
    ignore: [
      /^\/dev/,
      /\.git/,
      /\.github/,
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
      // For auto updates on macOS and Linux, code signing is required,
      // and autoUpdater in index.js would need to be configured to work on these platforms
    },
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        // IMPORTANT: Squirrel uses package.json's description for the Start menu shortcut
        // long descriptions corrupt the shortcut; set a shorter one here if necessary (otherwise icon does not appear)
        // description: "Shortened description for app."
        setupIcon: "assets/icon.ico",
        loadingGif: "assets/install-spinner.gif"
      }
    },
    {
      name: "@electron-forge/maker-dmg",
      config: {
        icon: "assets/icon.icns",
        overwrite: true
      }
    },
    {
      // needs mksquashfs (squashfs-tools) on the Linux build machine
      name: "@reforged/maker-appimage",
      config: {
        options: {
          icon: "assets/icon.png"
        }
      }
    }
  ],
  // turn off Electron features the app doesn't use so the app can't be used to run other code
  // given by name instead of FusesPlugin instance to persist through nhyris `build`
  // keys are @electron/fuses' FuseV1Options numbers
  plugins: [
    {
      name: "@electron-forge/plugin-fuses",
      config: {
        version: "1",
        0: false, // RunAsNode
        1: true,  // EnableCookieEncryption
        2: false, // EnableNodeOptionsEnvironmentVariable
        3: false, // EnableNodeCliInspectArguments
        7: false  // GrantFileProtocolExtraPrivileges
      }
    }
  ]
};