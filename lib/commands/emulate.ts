///<reference path="../.d.ts"/>
"use strict";

import path = require("path");
import Future = require("fibers/future");
import minimatch = require("minimatch");
var iconv = require("iconv-lite");
import helpers = require("../helpers");
import MobileHelper = require("../mobile/mobile-helper");

//	Name: Toshe
//	Device: Nexus 4 (Google)
//	Path: /Users/totev/.android/avd/Toshe.avd
//	Target: Android 4.4.2 (API level 19)
//	Tag/ABI: default/x86
//	Skin: WXGA800-7in
//	Sdcard: 128M

interface IAvdInfo {
	target: string;
	targetNum: number;
	path: string;
	device?: string;
	name?: string;
	abi?: string;
	skin?: string;
	sdcard?: string;
}

export class EmulateCommand {
	constructor(private $logger: ILogger
				,private $errors: IErrors
				,private $fs: IFileSystem
				,private $project: Project.IProject
				,private $projectTypes: IProjectTypes
				,private $loginManager: ILoginManager
				,private $childProcess: IChildProcess) {
		this.$project.ensureProject();
		this.$loginManager.ensureLoggedIn().wait();
		iconv.extendNodeEncodings();
	}

	public list(args: string[]): IFuture<void> {
		return (() => {

			var emulators = [];

			if (!args.length || args[0].toLowerCase() === 'android') {
				var avds = _.map(this.getAvds().wait(), avd => this.getInfoFromAvd(avd).wait());
				emulators = Array.prototype.concat(emulators, avds);
			} else if (!args.length || args[0].toLowerCase() === 'ios') {

			} else if (!args.length || args[0].toLowerCase() === 'wp8') {

			}

			_.each(emulators, avd => this.$logger.out(avd));

		}).future<void>()();
	}

	public start(args: string[]): IFuture<void> {
		return (() => {

			if (args.length < 1 || args.length > 2) {
				this.$errors.fail("Please specify which emulator to start.");
			}

			if (args[0].toLowerCase() === 'android') {
				if (!_.contains(this.$project.projectTargets.wait(), "android")) {
					this.$errors.fail("The current project does not target android and cannot be run in the Android emulator.");
				}

				var image: string = args[1] || this.getBestFit().wait();
				if (image) {
					this.runAndroidEmulator(image).wait();
				} else {
					this.$errors.fail("Could not find an emulator image to run your project.");
				}
			} else if (!args.length || args[0].toLowerCase() === 'ios') {

			} else if (!args.length || args[0].toLowerCase() === 'wp8') {

			}

		}).future<void>()();
	}

	private static CORDOVA_REQURED_ANDROID_APILEVEL = 10; // 2.3 Gingerbread
	private static NATIVESCRIPT_REQURED_ANDROID_APILEVEL = 17; // 4.2 JellyBean

	private getBestFit(): IFuture<string> {
		return (() => {
			var minVersion = (this.$project.projectType === this.$projectTypes.Cordova)
				? EmulateCommand.CORDOVA_REQURED_ANDROID_APILEVEL
				: EmulateCommand.NATIVESCRIPT_REQURED_ANDROID_APILEVEL;

			var best =_.chain(this.getAvds().wait())
					 .map(avd => this.getInfoFromAvd(avd).wait())
					 .max(avd => avd.targetNum)
					.value();

			return (best.targetNum >= minVersion) ? best.name : null;
		}).future<string>()();
	}

	private getInfoFromAvd(avdName: string): IFuture<IAvdInfo> {
		return (() => {
			var iniFile = path.join(this.avdDir, avdName + ".ini");
			var avdInfo: IAvdInfo = this.parseAvdFile(avdName, iniFile).wait();
			if (avdInfo.path && this.$fs.exists(avdInfo.path).wait()) {
				iniFile = path.join(avdInfo.path, "config.ini");
				avdInfo = this.parseAvdFile(avdName, iniFile, avdInfo).wait();
			}
			return avdInfo;
		}).future<IAvdInfo>()();
	}

	private parseAvdFile(avdName: string, avdFileName: string, avdInfo: IAvdInfo = null): IFuture<IAvdInfo> {
		return (() => {
			// avd files can have different encoding, defined on the first line.
			// find which one it is (if any) and use it to correctly read the file contents
			var encoding = this.getAvdEncoding(avdFileName).wait();
			var contents = this.$fs.readText(avdFileName, encoding).wait().split("\n");

			avdInfo = _.reduce(contents, (result: IAvdInfo, line) => {
				var parsedLine = line.split("=");
				var key = parsedLine[0];
				switch(key) {
					case "target":
						result.target = parsedLine[1];
						result.targetNum = +result.target.replace('android-', '');
						break;
					case "path": result.path = parsedLine[1]; break;
					case "hw.device.name": result.device = parsedLine[1]; break;
					case "abi.type": result.abi = parsedLine[1]; break;
					case "skin.name": result.skin = parsedLine[1]; break;
					case "sdcard.size": result.sdcard = parsedLine[1]; break;
				}
				return result;
			},
			avdInfo  || <IAvdInfo>Object.create(null));
			avdInfo.name = avdName;

			return avdInfo;
		}).future<IAvdInfo>()();
	}

	private getAvdEncoding(avdName: string): IFuture<any> {
		return (() => {
			// avd files can have different encoding, defined on te first line.
			// find which one it is (if any) and use it to correctly read the file contents
			var encoding = "utf8";
			var contents = this.$fs.readText(avdName, "ascii").wait();
			if (contents.length > 0) {
				contents = contents.split("\n", 1)[0];
				if (contents.length > 0) {
					var matches = contents.match(EmulateCommand.ENCODING_MASK);
					if(matches) {
						encoding = matches[1];
					}
				}
			}
			return encoding;
		}).future<any>()();
	}

	private runAndroidEmulator(avd: string): IFuture<void> {
		return (() => {
			this.$logger.info("Starting emulator...");
			var childProcess = this.$childProcess.spawn('emulator', ['-avd', avd],
				{ stdio:  ["ignore", "ignore", "ignore"], detached: true });
			childProcess.unref();
		}).future<void>()();
	}

	private static ANDROID_DIR_NAME = ".android";
	private static AVD_DIR_NAME = "avd";
	private static INI_FILES_MASK = /^(.*)\.ini$/i;
	private static ENCODING_MASK = /^avd\.ini\.encoding=(.*)$/;

	private get userHome(): string {
		return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE; // works on mac/win. not tested on linux
	}

	private get androidHomeDir(): string {
		return path.join(this.userHome, EmulateCommand.ANDROID_DIR_NAME);
	}

	private get avdDir(): string {
		return path.join(this.androidHomeDir, EmulateCommand.AVD_DIR_NAME);
	}

	private getAvds(): IFuture<string[]> {
		return (() => {
			var result = [];
			if (this.$fs.exists(this.avdDir).wait()) {
				var entries = this.$fs.readDirectory(this.avdDir).wait();
				result = _.select(entries, (e: string) => e.match(EmulateCommand.INI_FILES_MASK) !== null)
						.map((e) => e.match(EmulateCommand.INI_FILES_MASK)[1]);
			}

			return result;
		}).future<string[]>()();
	}
}

$injector.register("emulate", EmulateCommand);
helpers.registerCommand("emulate", "emulate|list", (project, args) => project.list(args));
helpers.registerCommand("emulate", "emulate|start", (project, args) => project.start(args));
