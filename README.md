Command-Line Interface for Telerik AppBuilder
===========

*Build and publish iOS and Android hybrid apps using a single pure HTML5, CSS, and JavaScript code base*

[![Telerik AppBuilder](https://raw.github.com/Icenium/icenium-cli/release/ab-logo.png "Telerik AppBuilder")](http://www.telerik.com/appbuilder "The Telerik AppBuilder web site")

**Leverage the cloud capabilities of the Telerik Platform and Telerik AppBuilder from the command line**

The Telerik AppBuilder CLI lets you build, test, deploy, and publish hybrid mobile apps for iOS, Android, and Windows Phone 8 from your favorite IDE or code editor. You can develop your projects locally from the convenience of your favorite code editor and run the command-line to test, build, deploy in the simulator or on devices, and publish your applications to the App Store or Google Play.

* [Installation](#installation "How to install the Telerik AppBuilder CLI")
* [Quick Start](#quick-start "Get started with the Telerik AppBuilder CLI")
* [Features](#features "What are the features of the Telerik AppBuilder CLI")
* [How to Contribute](#contribution "How to contribute to the Telerik AppBuilder CLI")
* [More Telerik AppBuilder Tools and Resources](#more-telerik-appbuilder-tools-and-resources "Get the other Telerik AppBuilder clients and tools")
* [License](#license "Licensing information about the Telerik AppBuilder CLI")

Installation
===

Latest version: Telerik AppBuilder 2.3  
Release date: 2014, July 1 

> For a complete list of the features available in Telerik AppBuilder 2.3, see <a href="http://docs.telerik.com/platform/appbuilder/release-notes/v2-3" target="_blank">Telerik AppBuilder 2.3 Release Notes</a>.

### System Requirements

Before installing the Telerik AppBuilder CLI, verify that your system meets the following requirements.

#### Windows Systems

**Minimum Software Requirements**

* Windows 7 or later
* Node.js 0.10.22 or later (32-bit)

> You can download and install Node.js from the <a href="http://nodejs.org/download/" target="_blank">Node.js web site</a>.

**Additional Software Requirements for iOS On-Device Deployment**

* iTunes

**Additional Software Requirements for Android On-Device Deployment**

* Device drivers required by your system to recognize the connected Android device

**Additional Software Requirements for Windows Phone 8 On-Device Deployment**

> In this version of the Telerik AppBuilder CLI, you cannot deploy and LiveSync to connected Windows Phone 8 devices from the command line.

#### OS X Systems

**Minimum Software Requirements**

* OS X Mavericks
* Node.js 0.10.22 or later (32-bit)

> You can install and maintain Node.js with Node Version Manager. For more information, see <a href="https://github.com/creationix/nvm" target="_blank">Node Version Manager in GitHub</a>. 

**Additional Software Requirements for iOS On-Device Deployment**

* iTunes

**Additional Software Requirements for Android On-Device Deployment**

* Device drivers required by your system to recognize the connected Android device

**Additional Software Requirements for Windows Phone 8 On-Device Deployment**

> In this version of the Telerik AppBuilder CLI, you cannot deploy and LiveSync to connected Windows Phone 8 devices from the command line.

### Install the Telerik AppBuilder CLI

The Telerik AppBuilder CLI is available for installing as an npm package.

In the command prompt, run the following command.

```bash
$ npm install appbuilder -g
```

[Back to Top][1]

Quick Start
===

1. [Log In](#login "Log in the Telerik Platform")
1. [Create Project](#create "Create a local project")
1. [Run in Simulator](#simulator "Run in the device simulator")
1. [Run on Device](#device "Run on device")
1. [Modify Your Code](#code "Modify your code")
1. [Get Code Changes in the Simulator and on Device](#livesync "LiveSync changes from your code to your app in the simulator or on device")
1. [Get Help](#help "List the available commands and options")

<a name="login"><b>1. Log in the Telerik Platform</b></a>

To connect to your Telerik Platform account, run the following command.

```bash
$ appbuilder login
```

A new tab opens in your default browser. Provide your login credentials, confirm the sign in, verify that the following message is present in the command line: `Login completed`, and close the browser tab after the confirmation.

<a name="create"><b>2. Create project</b></a>

To create a new hybrid project from the default template, navigate to an empty directory and run the following command. 

```bash
$ appbuilder create hybrid MyApp
```

The Telerik AppBuilder CLI creates a new subdirectory MyApp in the current directory and places the project files inside it. The project is based on the Kendo UI Mobile template.

To initialize an existing project for development from the command line, navigate to the local directory that contains the project files and run the following command. 

```bash
$ appbuilder init hybrid
```

The Telerik AppBuilder CLI creates the `.abproject` file required for working from the command-line. 

<a name="simulator"><b>3. Run in simulator</b></a>

To load your newly created project in the simulator, navigate to the folder containing your project files and run the following command.

```bash
$ appbuilder simulate
```

The Telerik AppBuilder CLI launches the device simulator. In the device simulator, you can change the target device form factor, mobile platform and version, and orientation. You can adjust the geolocation details, network connection configuration, file storage configuration, and the default contacts. You can debug your code using the built-in debug tools.

For more information about the Telerik AppBuilder device simulator, see <a href="http://docs.telerik.com/platform/appbuilder/testing-your-app/running-apps-in-simulator/device-simulator" target="_blank">Running Apps in the Device Simulator</a>.

<a name="device"><b>4. Run on device</b></a>

To run your app on an Android device, install a QR code reader on the device, install the Telerik AppBuilder companion app, navigate to the folder containing your project files and run the following command in the command line. 

```bash
$ appbuilder build android --companion
```

After the operation completes, the Telerik AppBuilder CLI opens a new tab in your browser and shows a QR code for deployment in the companion app. Scan the produced QR code on your device and tap the URL to load your project in the AppBuilder companion app.

With the Telerik AppBuilder companion app, you can deploy and test your Android apps without the need to configure any device drivers on your system, to configure your device for deployment, and to build an application package. You can get the Telerik AppBuilder companion app from <a href="https://play.google.com/store/apps/details?id=com.telerik.AppBuilder" target="_blank">Google Play</a>.

To run your app on an iOS device, install the Telerik AppBuilder companion app on the device, run it, and navigate to the folder containing your project files and run the following command in the command line. 

```bash
$ appbuilder build ios --companion
```

After the operation completes, the Telerik AppBuilder CLI opens a new tab in your browser and shows a QR code for deployment in the companion app. On the device, use the built-in QR code scanner in the companion app to scan the QR code and load the project. 

With the Telerik AppBuilder companion app, you can deploy and test your iOS apps without the need to provision them first. You can get the Telerik AppBuilder companion app from the <a href="https://itunes.apple.com/bg/app/telerik-appbuilder/id527547398?mt=8" target="_blank">App Store</a>. 

To run your app on a Windows Phone 8 device, install a QR code reader on the device, navigate to the folder containing your project files and run the following command in the command line. 

```bash
$ appbuilder build wp8
```

The Telerik AppBuilder CLI opens a new tab in your browser and shows a QR code for deployment. On your device, scan the QR code for the Telerik Application Enrollment Token (Telerik AET) and install it on your device. Next, scan the QR code for your app and install the app on your device.

<a name="code"><b>5. Modify your code</b></a>

Edit your code in your preferred IDE or code editor. Save your changes.

> In Sublime Text 2 and Sublime Text 3, you can install the Telerik AppBuilder package which provides integration with the Telerik AppBuilder CLI. For more information, click <a href="https://sublime.wbond.net/packages/Telerik%20AppBuilder" target="_blank">here</a>. 

<a name="livesync"><b>6. Get code changes in the simulator and on device</b></a>

In the running device simulator, your app refreshes automatically on save.

To get changes inside your running app, navigate to the folder containing your project files and run the following command. 

```bash
$ appbuilder livesync cloud
```

On the device, in the running app, tap and hold with three fingers until the download pop-up appears. After the download completes, the app refreshes automatically.

<a name="help"><b>7. List the available commands</b></a>

To list the available commands, run the following command.

```bash
$ appbuilder help
```

To learn more about a command, run the command with the `--help` option. For example, to show more information about `create`, run the following command.

```bash
$ appbuilder create --help
```

[Back to Top][1]

Features
===

Latest version: Telerik AppBuilder 2.3  
Release date: 2014, July 1

> For a complete list of the features available in Telerik AppBuilder 2.3, see <a href="http://docs.telerik.com/platform/appbuilder/release-notes/v2-3" target="_blank">Telerik AppBuilder 2.3 Release Notes</a>.

#### What you can do with this version of the Telerik AppBuilder CLI

To see a complete list of the available commands, click <a href="https://github.com/Icenium/icenium-cli/blob/release/resources/help.txt" target="_blank">here</a> or run `$ appbuilder help` in the command prompt.

* You can develop your hybrid mobile locally and with limited Internet connectivity. 
* You can benefit from the code editing, code analysis, and version control capabilities provided by your favorite development tools on Windows or OS X.
* You can use the Telerik AppBuilder CLI with the Telerik AppBuilder package for Sublime Text 2 or Sublime Text 3 to build and deploy apps straight from Sublime Text.
* You can log in and log out of the Telerik Platform. 
* You can view your current login and subscription information.
* You can create new projects from the *Blank (JavaScript)*, *Blank (TypeScript)* *jQuery Mobile*, *Telerik Friends*, *Kendo UI mobile app*, and *Kendo UI mobile app with data visualization* templates.
* You can create new projects by initializing any existing projects stored locally on your system. For example, you can initialize local copies of projects created with the AppBuilder clients or third-party tools.
* You can export your existing projects from your {{tp}} account and automatically initialize them for development.
* You can clone the Telerik AppBuilder sample apps. 
* You can target Apache Cordova 3.0.0, Apache Cordova 3.2.0, or Apache Cordova 3.5.0.
* You can migrate between the supported Apache Cordova versions.
* You can enable and disable the Apache Cordova core and integrated plugins.
* You can fetch Apache Cordova custom plugins from the Apache Cordova Plugin Registry and import them into your projects.
* You can list connected iOS and Android devices.
* You can view the device log for connected devices.
* You can build applications for iOS, Android, and Windows Phone 8 and deploy them via QR code.
* You can build applications for iOS, Android, and Windows Phone 8 and download the application package. You can manually deploy the application package on devices. 
* You can build applications for iOS and Android and deploy them via cable connection on connected devices. 
* You can load iOS and Android applications in the AppBuilder companion app.
* You can LiveSync changes wirelessly to remote devices with the three-finger refresh gesture.
* You can push changes via cable connection to connected devices.
* You can build applications for distribution in the Apple App Store, Google Play, and Windows Phone Store. 
* You can upload your iOS application packages to iTunes Connect.
* You can run your apps in the device simulator on Windows systems.
* You can run your apps in the device simulator on OS X systems.
* You can debug your code with the built-in debug tools in the device simulator on Windows systems.
* You can debug your code with the built-in debug tools in the device simulator on OS X systems.
* You can debug your iOS and Android apps while running on connected iOS and Android devices on Windows systems.
* You can manage certificates and provisioning profiles for code signing iOS apps.
* You can manage certificates for code signing Android apps.
* You can configure the project properties for your project.
* You can open the `AndroidManifest.xml`, `Info.plist`, `WMAppManifest.xml` and `config.xml` files for editing.
* You can edit the `.abignore` file to exclude files and folders from the build process. You need to manually add `.abignore` to your project.

#### What you cannot do with this version of the Telerik AppBuilder CLI

The following Telerik AppBuilder features are not available in the current release of the Telerik AppBuilder CLI but might become available in a future release.

* You cannot switch your Telerik Platform account.
* You cannot deploy your apps on connected Windows Phone 8 devices.
* You cannot load your Windows Phone 8 apps in the companion app.
* You cannot debug your Android and iOS apps while running on a connected device on OS X systems.
* You cannot use the AppBuilder UI Designer tool to design the user interface of your Kendo UI Mobile or Kendo UI DataViz apps.

The following Telerik AppBuilder features are not applicable to the Telerik AppBuilder CLI and will not become available in a future release.

* You cannot use the Data Navigator to review your Telerik Backend Services projects and their resources.
* You cannot use the AppBuilder version control and storage cloud services.

[Back to Top][1]

Contribution
===

To learn how to log a bug that you just discovered, click [here](CONTRIBUTING.md#report-an-issue).

To learn how to suggest a new feature or improvement, click [here](CONTRIBUTING.md#request-a-feature).

To learn how to contribute to the code base, click [here](CONTRIBUTING.md#contribute-to-the-code-base).

[Back to Top][1]

More Telerik AppBuilder Tools and Resources
===

* [Telerik AppBuilder Windows client](http://www.telerik.com/appbuilder/windows-client "The AppBuilder Windows Client"): Lightweight Windows IDE.
* [Telerik AppBuilder in-browser client](http://www.telerik.com/appbuilder/in-browser-client "The AppBuilder In-Browser Client"): Browser-based IDE that is compatible with most modern web and mobile browsers.
* [Telerik AppBuilder extension for Visual Studio](http://www.telerik.com/appbuilder/visual-studio-extension "The AppBuilder Extension for Visual Studio"): Extension for the popular Microsoft IDE.
* [Telerik AppBuilder package for Sublime Text](http://www.telerik.com/appbuilder/sublime-text-package "The AppBuilder package for Sublime Text"): A package for the popular text editor.
* [Telerik AppBuilder companion app](http://www.telerik.com/appbuilder/companion-app "The AppBuilder Companion App"): iOS testing utility <a href="https://itunes.apple.com/bg/app/icenium-ion/id527547398" target="_blank">available for free on the App Store</a>.
* [Telerik AppBuilder documentation](http://docs.telerik.com/platform/appbuilder "The documentation resources for Telerik AppBuilder"): Learn more about what you can do with Telerik AppBuilder.
* [Telerik AppBuilder web page](http://www.telerik.com/appbuilder "The Telerik AppBuilder web page"): Visit the Telerik AppBuilder web site.

[Back to Top][1]

License
===

This software is licensed under the Apache 2.0 license, quoted <a href="LICENSE" target="_blank">here</a>.

[Back to Top][1]

[1]: #command-line-interface-for-telerik-appbuilder
