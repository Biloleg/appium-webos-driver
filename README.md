# Appium LG WebOS Driver

[![npm version](https://img.shields.io/npm/v/appium-lg-webos-driver.svg)](https://npmjs.org/package/appium-lg-webos-driver)

An Appium 2.x and Appium 3.x driver for LG WebOS apps

## Installation

### Prerequisites

1. **Node.js and npm**: Make sure you have Node.js (v14 or later) and npm installed.

2. **Appium 2.x/3.x**: Install Appium globally or in your project:
   ```bash
   npm install -g appium
   ```

3. **LG webOS TV SDK**: Download and install the SDK from the [official LG developer site](https://webostv.developer.lge.com/develop/tools/sdk-introduction)

4. **Environment Variable**: Set the `LG_WEBOS_TV_SDK_HOME` environment variable to point to your SDK installation directory:
   ```bash
   # Add to your ~/.bashrc, ~/.zshrc, or ~/.bash_profile
   export LG_WEBOS_TV_SDK_HOME="/path/to/webOS_TV_SDK"
   ```

### Driver Installation

**Install directly from GitHub:**

```bash
appium driver install --source=git https://github.com/Biloleg/appium-webos-driver.git --package appium-lg-webos-driver
```

**Or install from local source:**

```bash
appium driver install --source=local .
```

Run this from inside the cloned repository directory.

**For development:**

```bash
# Clone the repository
git clone https://github.com/Biloleg/appium-webos-driver.git
cd appium-webos-driver

# Install dependencies
npm install

# Build the driver
npm run build

# Install the driver in Appium
appium driver install --source=local .
```

### TV Setup

1. **Enable Developer Mode** on your LG TV:
   - Open the LG Content Store on your TV
   - Search for and install the "Developer Mode" app
   - Launch the app and sign in with your LG developer account
   - Turn Developer Mode "On" in the app
   - Note your TV's IP address displayed in the app

2. **Configure the TV device** using webOS CLI tools:
   ```bash
   # Add your TV device (replace with your TV's IP and choose a name)
   ares-setup-device --add myTV --host 192.168.1.100 --port 9922
   
   # Verify the connection
   ares-device -i --device myTV
   ```

3. **Verify the setup**:
   ```bash
   # List available devices
   ares-device -i
   
   # Should display your TV information including IP address, webOS version, etc.
   ```

### Emulator Setup

If you're using the webOS TV emulator instead of a physical TV:

1. **Install and launch the webOS emulator** from the [webOS TV SDK](https://webostv.developer.lge.com/develop/tools/sdk-introduction)

2. **Configure the emulator** as a device using webOS CLI tools (same as TV setup above)

3. **Important:** Add `"appium:skipRemoteControl": true` to your capabilities when using the emulator, as emulators don't support WebSocket remote control on ports 3000/3001:

```json
{
  "platformName": "LGTV",
  "appium:automationName": "webOS",
  "appium:deviceName": "myEmulator",
  "appium:deviceHost": "127.0.0.1",
  "appium:appId": "com.example.app",
  "appium:skipRemoteControl": true
}
```

With `skipRemoteControl` enabled, web automation via Chromedriver will work normally, but remote control features (button presses, etc.) will not be available.

### Chromedriver Setup

**Automatic Download (Enabled by Default)**

The driver automatically downloads the correct Chromedriver version for your TV's Chrome version. Chromedrivers are stored in `~/.appium/chromedrivers` by default.

**No additional configuration needed!** Just start Appium normally:

```bash
appium
```

The driver will:
1. Detect your TV's Chrome version when you start a session
2. Download the matching Chromedriver automatically (if not already cached)
3. Use the downloaded Chromedriver for web automation

**Optional Configuration:**

Customize the Chromedriver storage directory in your capabilities:

```json
{
  "appium:chromedriverExecutableDir": "/path/to/your/chromedrivers"
}
```

Disable automatic download (if you want to manage Chromedriver manually):

```json
{
  "appium:autodownloadEnabled": false
}
```

**Manual Chromedriver Management**

If you prefer to manage Chromedriver manually (set `autodownloadEnabled: false`):

1. Download Chromedriver 2.36 from: https://chromedriver.storage.googleapis.com/index.html?path=2.36/
2. Place it in an accessible location
3. Make it executable: `chmod +x /path/to/chromedriver`
4. Specify the path in capabilities:

```json
{
  "appium:chromedriverExecutable": "/path/to/chromedriver",
  "appium:autodownloadEnabled": false
}
```

## Additional Requirements

- You must have the [LG webOS SDK](https://webostv.developer.lge.com/develop/tools/sdk-introduction) CLI tools installed and available in your PATH
  - Install from: https://webostv.developer.lge.com/develop/tools/webos-tv-cli-installation
  - Please use v`1.12.4` or later
  - Verify installation by running: `ares-device --version`
- You must have an LG webOS TV device on the same network as your Appium host, with all ports accessible to the network
- The TV must be in [Developer Mode](https://webostv.developer.lge.com/develop/getting-started/developer-mode-app) (must have the Dev Mode app and be signed in, with Dev Mode actually turned "On" in the app)
- You must have your TV device set up and showing as available using the [`ares-setup-device`](https://webostv.developer.lge.com/develop/tools/cli-dev-guide#ares-setup-device) CLI tool
- You should be able to run `ares-device -i --device <name>` and have it show the correct details for your connected device
- The first time you run an Appium session, the driver will attempt to pair itself with the TV as a remote. A permission popup will appear that you need to interact with. You should only need to do this once. If the driver is reinstalled, its permission token cache is removed, or the TV is updated (and potentially even some other circumstances) re-pairing might be necessary.

## Capabilities

|Capability|Description|
|----------|-----------|
|`platformName`|[Required] Must be `lgtv`|
|`appium:automationName`|[Required] Must be `webos`|
|`appium:deviceName`|[Required] The name of the connected device, as it shows up in `ares-launch --device-list`|
|`appium:deviceHost`|[Required] The IP address of the connected device, as it shows up in `ares-launch --device-list`|
|`appium:appId`|[Required] The app package ID, if you want Appium to use an app already on the TV. Exclusive with `appium:app`|
|`appium:app`|[Optional] An absolute path to your `.ipk` app file, if you want Appium to install the app.|
|`appium:debuggerPort`|[Optional; default `9998`] The port on the device exposed for remote Chromium debugging.|
| `appium:newCommandTimeout` | How long (in seconds) the driver should wait for a new command from the client before assuming the client has stopped sending requests. After the timeout the session is going to be deleted. `60` seconds by default. Setting it to zero disables the timer.|
| `appium:showChromedriverLog` 	  | If set to `true` then all the output from chromedriver binary will be forwarded to the Appium server log. `false` by default. |
|`appium:chromedriverExecutable`|[Optional] Path to a specific Chromedriver executable. Use this if you want to manually specify the Chromedriver binary. For most LG TVs, Chromedriver 2.36 works best. **Note:** Set `autodownloadEnabled: false` when using this.|
| `appium:chromedriverExecutableDir` | [Optional; default `~/.appium/chromedrivers`] Full path to a folder where Chromedriver executables will be stored and auto-downloaded. The driver will automatically download the correct Chromedriver version for your TV's Chrome version. |
| `appium:autodownloadEnabled` | [Optional; default `true`] Enable or disable automatic Chromedriver download. Set to `false` if you want to manually manage Chromedriver using `chromedriverExecutable`. |
|`appium:websocketPort`|[Optional; default `3000`] The websocket port on the device exposed for remote control|
|`appium:websocketPortSecure`|[Optional; default `3001`] The secure websocket port on the device exposed for remote control|
|`appium:useSecureWebsocket`|[Optional; default `true`] Flag that enables use of `websocketPortSecure` port (wss:// instead of ws://). Modern LG TVs typically require secure WebSocket connections. The driver uses `{rejectUnauthorized: false}` to allow self-signed certificates, so no environment variable setup is needed.|
|`appium:skipRemoteControl`|[Optional; default `false`] If set to `true`, skips WebSocket remote control connection. Useful for emulators that don't support WebSocket remote control on ports 3000/3001. All web automation will still work via Chromedriver.|
|`appium:autoExtendDevMode`|**[Deprecated]** This capability is no longer functional as `ares-extend-dev` command has been removed from the webOS CLI. Developer mode must be managed manually through the [Developer Mode app](https://webostv.developer.lge.com/develop/getting-started/developer-mode-app) on the TV.|
|`appium:appLaunchParams`|[Optional; default `{}`] A key/value object of app launch param to be passed to `ares-launch`|
|`appium:appLaunchCooldown`|[Optional; default `3000`] How many ms to wait after triggering app launch to attempt to connect to it via Chromedriver.|
|`appium:fullReset`|[Optional; default `false`] If this is set to `true`, the driver will: uninstall the app before starting the session. Cannot be used with `appium:noReset`|
|`appium:noReset`|[Optional; default `false`] If this is set to `true`, the driver will: skip resetting local storage on session start. Cannot be used with `appium:fullReset`|
|`appium:remoteOnly`|[Optional; default `false`] If this is set to `true`, the driver will not attempt to start Chromedriver and communicate via the debug protocol to the application. Instead the app will be launched, and nothing else. You will only have access to remote control commands in a "fire-and-forget" fashion. Useful when dealing with non-web-based apps.|
|`appium:rcMode`|[Optional; default `js`; must be `rc` or `js`] When the value is `js`, the `webos: pressKey` command will operate with JS executed via Chromedriver. Otherwise, keys will be sent using the websocket remote control API. Note that when `appium:remoteOnly` is set to true, the value of `appium:rcMode` will always behave as if set to `rc`.|
|`appium:keyCooldown`|[Optional; default `750`] How long to wait in between remote key presses|

**Note:** The `appium:chromedriverExecutableDir` capability now has a default value of `~/.appium/chromedrivers`, so you only need to specify it if you want to use a different location. If you prefer to manually manage Chromedriver, you can use `appium:chromedriverExecutable` instead.

## Troubleshooting

### Chromedriver binary doesn't exist error

If you see an error like:
```
Error: Trying to use a chromedriver binary at the path /path/to/chromedriver, but it doesn't exist!
```

**Cause:** This typically happens when upgrading from an older version of the driver where auto-download was not enabled by default.

**Solution:**

The driver now has auto-download **enabled by default**. Simply:
1. Reinstall the driver to get the latest version
2. Make sure you don't have `"appium:autodownloadEnabled": false` in your capabilities
3. Start a new session - Chromedriver will download automatically

If you still see this error, manually download Chromedriver:
1. Download Chromedriver 2.36 from: https://chromedriver.storage.googleapis.com/index.html?path=2.36/
2. Make it executable: `chmod +x /path/to/chromedriver`
3. Add to your capabilities:
```json
{
  "appium:chromedriverExecutable": "/path/to/chromedriver",
  "appium:autodownloadEnabled": false
}
```

### WebSocket connection timeout (for emulators)

If you see WebSocket connection errors when using an emulator, add `"appium:skipRemoteControl": true` to your capabilities. See the [Emulator Setup](#emulator-setup) section for details.

## Supported Commands

These are the WebDriver (and extension) commands supported by this driver. Note that in its normal
operation, this driver acts as a Chromedriver proxy. Thus, after a session is created, *all*
typical WebDriver commands are available (find element, get page source, click element, etc...).
Some commands may not make sense in a TV context (dealing with multiple windows, for example).

|Command|Parameters|Description|
|-------|----------|-----------|
|`createSession`|`capabilities`|Start a session using capabilities from the list above. This will launch your app in debug mode and start a Chromedriver proxy to the underyling TV browser|
|`deleteSession`||Stop a session|
|`executeScript`|`script`, `args`|In the typical case, this executes JavaScript within the browser, just like the typical WebDriver method. If the script is prefixed with `webos: `, the driver will attempt to find a special "webOS command" to run with your provided args.|
|`getCurrentContext`|| Return `NATIVE_APP` context name. |

### webOS Commands

As a way to provide access to additional commands unique to the webOS platform, this driver has
extended the `executeScript` command in such a way that if you pass in a script like `webos:
scriptName`, then the driver will execute a special webOS command named `scriptName`. The following
webOS commands are available (note that in all these, the parameters list includes named parameters
that must be present in a JSON object, constituting the first argument of the `executeScript` args
list):

|webOS Command|Parameters|Description|
|-------------|----------|-----------|
|`pressKey`|`key`, `duration`|Press a remote key for `duration` milliseconds (defaults to 100). The value of `key` must be one of the values listed below|
|`listApps`| |Return the list of installed applications. The `id` key in each value is `appium:appId`. |
|`activeAppInfo`| |Return current foreground application information.|
|`activateApp`|`appPackage`, `launchParams`|Activate (launch) an installed application. `appPackage` is required (the app ID); `launchParams` is optional.|
|`getFocusedElement`| |Return information about the currently focused element, including its position, size, and text content. All elements also get a synthetic `@focused` attribute (true/false).|

Example of using a webOS command (in the WebdriverIO JS client):

```js
await driver.executeScript('webos: pressKey', [{key: 'right', duration: 200}]);
```

#### webos: pressKey

Here are the accepted values, based on the `appium:rcMode`. Casing does not matter.

##### When `appium:rcMode` is `js`:

- `enter`
- `right`
- `left`
- `up`
- `down`
- `back`
- `playPause`
- `fwd`
- `rev`

##### When `appium:rcMode` is `rc`:

- `HOME`
- `LEFT`
- `RIGHT`
- `UP`
- `DOWN`
- `ENTER`
- `BACK`
- `VOL_UP`
- `VOL_DOWN`
- `MUTE`
- `UNMUTE`
- `PLAY`
- `STOP`
- `REWIND`
- `FF`
- `CHAN_UP`
- `CHAN_DOWN`

#### webos: listApps

Response example:

```ruby
# Ruby
apps = driver.execute_script "webos: listApps"
#=> [{"networkStableTimeout"=>0,
# "checkUpdateOnLaunch"=>true,
# "requiredPermissions"=>["all"],
# "class"=>{"hidden"=>true},
# "title"=>"AirPlay",
# "allowWidget"=>false,
# "icon"=>"https://192.168.21.67:3001/resources/6a7d9dd6e94e6fb1d69163ada80efe8c6540efa8/AirPlay_Icon-77x77.png",
# "tileSize"=>"normal",
# "inAppSetting"=>false,
# "closeOnRotation"=>false,
# "nativeLifeCycleInterfaceVersion"=>2,
# "folderPath"=>"/usr/palm/applications/airplay",
# "transparent"=>false,
# "version"=>"1.0.0",
# "trustLevel"=>"trusted",
# "hasPromotion"=>false,
# "enableCBSPolicy"=>false,
# "lockable"=>true,
# "systemApp"=>true,
# "mediumLargeIcon"=>"AirPlay_Icon-115x115.png",
# "main"=>"LunaExecutable",
# ...
# ]
apps.map { |app| app["id"]}
# => ["airplay",
#  "amazon",
#  "amazon.alexa.view",
#  "amazon.alexapr",
#  "com.apple.appletv",
#  "com.disney.disneyplus-prod",
#  "com.fubotv.app",
#  ...
# ]

```

#### webos: activeAppInfo

Response example:

```ruby
# Ruby
driver.execute_script "webos: activeAppInfo"
#=> {"returnValue"=>true, "appId"=>"com.your.app", "processId"=>"", "windowId"=>""}
```

#### webos: activateApp

Launch an installed application. The `appPackage` parameter is required.

Example:

```js
// JavaScript (WebdriverIO)
await driver.executeScript('webos: activateApp', [{appPackage: 'com.webos.app.netflix'}]);
```

```ruby
# Ruby
driver.execute_script "webos: activateApp", [{appPackage: 'com.webos.app.netflix'}]
```

With optional launch parameters:

```js
await driver.executeScript('webos: activateApp', [{appPackage: 'com.webos.app.netflix', launchParams: {uri: 'netflix://deep-link'}}]);
```

#### webos: getFocusedElement

Get information about the currently focused element. All elements automatically have a synthetic `@focused` attribute (true for the focused element, false for others).

Example:

```js
// JavaScript (WebdriverIO)
const focusedInfo = await driver.executeScript('webos: getFocusedElement');
console.log(focusedInfo);
// Output: {tag: 'BUTTON', text: 'OK', x: 100, y: 200, width: 80, height: 40, bounds: '[100,200][180,240]', displayed: true, enabled: true, focused: true}
```

```ruby
# Ruby
focused = driver.execute_script "webos: getFocusedElement"
puts "Focused element: #{focused[:tag]} - #{focused[:text]}"
```

You can also query for focused elements using XPath with the synthetic `@focused` attribute:

```js
// Find the focused button
const focusedButton = await driver.findElement('xpath', "//*[@tag='BUTTON'][@focused='true']");
```

## Development

This project is developed using Node.js. To work on it, clone the repo and run `npm install` inside
it.

### Developer Scripts

| Script              | Description                           |
|---------------------|---------------------------------------|
| `npm run build`     | Transpile the code                    |
| `npm run dev`       | Same as `build` but watch for changes |
| `npm run lint`      | Check code style                      |
| `npm run clean`     | Remove all build and NPM artifacts    |
| `npm run reinstall` | `clean` plus install                  |
| `npm run test:unit` | Run unit tests                        |
| `npm run test:e2e`  | Run e2e tests                         |
| `npm run test`      | Run unit tests                        |

### E2E Tests

Currently, the E2E tests require the use of an app not bundled with the project. It can be
downloaded from [Suitest](https://suite.st) at this location:
[webos.ipk](https://file.suite.st/watchmedemo/packages/webos.ipk).

Some environment variables must be set before running `npm run test:e2e`:

- `TEST_APP`: the path on your local system to the IPK file.
- `TEST_DEVICE`: the name of the LG device as it is shown when connected via `ares-setup-device`.
- `TEST_DEVICE_HOST`: the IP address of the connected LG TV.

## release

This repository is released with regular npm command:

```
npm version patch # etc
npm publish
# push the local commit and tag to this repository
```
