📱 Running the React Native App (Android)

Follow these steps to run the project on your local machine.

1. Prerequisites

Make sure you have the following installed:

- Node.js (v16 or higher)
- npm or yarn
- Android Studio with Android SDK
- Java JDK
- Android device with Developer Options enabled

2. Clone the Repository

git clone <repository-url>
cd <project-folder>

3. Install Dependencies

npm install

or

yarn install

4. Start Metro Bundler

Start the React Native development server:

npx react-native start --port 8089

Keep this terminal running.

5. Connect Android Device

1. Enable Developer Options on your Android phone.
2. Turn on USB Debugging.
3. Connect the device to your computer using a USB cable.
4. Verify the device connection:

adb devices

You should see your device listed.

6. Forward the Metro Port (for USB connection)

adb reverse tcp:8089 tcp:8089

7. Install the Debug APK

Install the debug build on your device:

adb install android/app/build/outputs/apk/debug/app-debug.apk

Alternatively, you can build and install automatically:

npx react-native run-android --port 8089

8. Run the Application

Open the app on your device.

If the app does not connect to the Metro server:

1. Shake the device to open the Developer Menu
2. Go to Dev Settings
3. Select Debug server host & port for device
4. Enter your computer's IP address and port:

<your-computer-ip>:8089

Example:

192.168.43.220:8089

9. Reload the App

Shake the device and press Reload to refresh the app.

---

⚠️ Troubleshooting

"Unable to load script" error

Ensure:

- Phone and computer are on the same Wi-Fi network, or
- "adb reverse tcp:8089 tcp:8089" is executed for USB connection.

Device not detected

Run:

adb kill-server
adb start-server
adb devices

Make sure USB debugging is enabled and the device authorization popup is accepted.

---

🔧 Development Tips

- Use USB connection with "adb reverse" for a more stable development experience.
- Ensure the Metro server port matches the port configured in the app (default: 8089).
