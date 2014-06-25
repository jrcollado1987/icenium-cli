///<reference path="../../.d.ts"/>

import path = require("path");
import helpers = require("../../helpers");
import shell = require("shelljs");

export class CreateAndroidProjectCommand implements ICommand  {

	private ROOT = path.join(__dirname, '..', '..');

	constructor(private $logger: ILogger,
		private $fs: IFileSystem,
		private $childProcess: IChildProcess) {
		this.ROOT = path.join(this.ROOT, "nativescript-cli");
	}

	execute(args: string[]): IFuture<void> {
		return (() => {
			this.createProject(args[0], args[1], args[2], args[3], !!args[4]).wait();
		}).future<void>()();
	}

	private createProject(projectPath: string, packageName: string, projectName: string, projectTemplateDir: string, isShared: boolean): IFuture<void> {
		return (() => {
			projectPath = projectPath || "NativescriptExample";
			projectPath = path.relative(process.cwd(), projectPath);

			packageName = packageName || "my.nativescript.project";
			projectName = projectName || "NativescriptExample";
			projectTemplateDir = projectTemplateDir || path.join(this.ROOT, "templates");

			var safeActivityName = projectName.replace(/\W/g, '');
			var packageAsPath = packageName.replace(/\./g, path.sep);

			var activityDir = path.join(projectPath, 'src', packageAsPath);
			var activityPath = path.join(activityDir, safeActivityName, ".java");

			var manifestPath = path.join(projectPath, "AndroidManifest.xml");

			this.$logger.out("Creating Nativescript project for Android platform");
			this.$logger.out("\tPath: " + projectPath);
			this.$logger.out("\tPackage: " + packageName);
			this.$logger.out("\tName: " + projectName);
			//		this.$logger.out("\tAndroid target: " + targetApi);

			this.$logger.out("Copying template files...");

			// Copy project template
			shell.cp("-r", path.join(projectTemplateDir, "assets"), projectPath);
			shell.cp("-r", path.join(projectTemplateDir, "gen"), projectPath);
			shell.cp("-r", path.join(projectTemplateDir, "libs"), projectPath);
			shell.cp("-r", path.join(projectTemplateDir, "res"), projectPath);

			shell.cp("-f", path.join(projectTemplateDir, ".project"), path.join(projectPath, ".project"));
			shell.cp("-f", path.join(projectTemplateDir, "AndroidManifest.xml"), path.join(projectPath, "AndroidManifest.xml"));

			// Add in the proper eclipse project file.
			//shell.cp("-f", path.join(projectTemplateDir, "eclipse-project"), path.join(projectPath, '.project'));

			//this.copyJsAndLibrary(projectPath, safeActivityName, isShared).wait();

			// interpolate the activity name and package
			this.$fs.createDirectory(activityDir).wait();
			shell.sed('-i', /__NAME__/, projectName, path.join(projectPath, 'res', 'values', 'strings.xml'));
			shell.sed('-i', /__TITLE_ACTIVITY__/, projectName, path.join(projectPath, 'res', 'values', 'strings.xml'));

			shell.sed('-i', /__NAME__/, projectName, path.join(projectPath, '.project'));
			//shell.sed('-i', /__ID__/, packageName, activityPath);

			shell.cp('-f', path.join(projectTemplateDir, 'AndroidManifest.xml'), manifestPath);
			//shell.sed('-i', /__ACTIVITY__/, safeActivityName, manifestPath);
			shell.sed('-i', /__PACKAGE__/, packageName, manifestPath);
			//shell.sed('-i', /__APILEVEL__/, "android-19", manifestPath);

			// Link it to local android install.
			this.runAndroidUpdate(projectPath, isShared).wait();

		}).future<void>()();
	}

	private copyJsAndLibrary(projectPath: string, projectName: string, isShared: boolean): IFuture<void> {
		return (() => {
			var nestedNativescriptLibsPath = this.getFrameworkDir(projectPath, false);

			shell.cp("-f", path.join(this.ROOT, "framework", "assets", "app", "bootstrap.js"), path.join(projectPath, "assets", "app", "bootstrap.js"));

			// Remove old jar files
			this.removeJarFiles(path.join(projectPath, "libs")).wait();

			if (isShared) {
				this.$fs.deleteDirectory(nestedNativescriptLibsPath).wait();
			} else {
				// Delete only the src, since eclipse can't handle its .project file being deleted.
				this.$fs.deleteDirectory(path.join(nestedNativescriptLibsPath, "src")).wait();
			}

			if (!isShared) {
				this.$fs.createDirectory(nestedNativescriptLibsPath).wait();
				shell.cp("-f", path.join(this.ROOT, 'framework', 'AndroidManifest.xml'), nestedNativescriptLibsPath);
				shell.cp("-f", path.join(this.ROOT, 'framework', 'project.properties'), nestedNativescriptLibsPath);
				shell.cp("-r", path.join(this.ROOT, 'framework', 'src'), nestedNativescriptLibsPath);

				this.createEclipseProject(nestedNativescriptLibsPath, projectName).wait();
			}
		}).future<void>()();
	}

	private getFrameworkDir(projectPath: string, shared: boolean): string {
		return shared ? path.join(this.ROOT, 'framework') : path.join(projectPath, 'NativescriptLib');
	}

	private removeJarFiles(directoryPath: string): IFuture<void> {
		return (() => {
			var allFiles = helpers.enumerateFilesInDirectorySync(directoryPath);
			_.each(allFiles, file => {
				var extension = path.extname(file);
				if (extension === ".jar" && file.startsWith("nativescript")) {
					this.$logger.out("Deleting " + file);
					this.$fs.deleteFile(file).wait();
				}
			});
		}).future<void>()();
	}

	private createEclipseProject(directoryPath: string, projectName: string): IFuture<void> {
		// Create an eclipse project file and set the name of it to something unique.
		// Without this, you can't import multiple CordovaLib projects into the same workspace.

		return (() => {
			var eclipseProjectFilePath = path.join(directoryPath, '.project');

			if (!this.$fs.exists(eclipseProjectFilePath).wait()) {
				var data = '<?xml version="1.0" encoding="UTF-8"?><projectDescription><name>' + projectName + '-' + 'NativescriptLib</name></projectDescription>';
				this.$fs.writeFile(eclipseProjectFilePath, data, "utf8").wait();
			}
		}).future<void>()();
	}

	private runAndroidUpdate(projectPath: string, isShared: boolean): IFuture<any> {
		return(() => {
			var targetFrameworkDir = this.getFrameworkDir(projectPath, isShared);
			return this.$childProcess.exec('android update project --subprojects --path "' + projectPath + '" --target ' + "android-19").wait();
		}).future<any>()();
	}
}

$injector.registerCommand("nativescript|create", CreateAndroidProjectCommand);