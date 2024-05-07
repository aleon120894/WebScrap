module.exports = {
    configurations: {
      ios: {
        type: 'ios.simulator',
        binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/WebScrap.app',
        build:
          'xcodebuild -project ios/WebScrap.xcodeproj -scheme WebScrap -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
      },
      android: {
        type: 'android.emulator',
        binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      },
    },
  };
  