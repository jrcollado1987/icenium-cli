///<reference path="../../.d.ts"/>

import path = require("path");
import helpers = require("../../helpers");

export class BuildAndroidProjectCommand implements ICommand {

	private ROOT:string = path.join(__dirname, '..', '..');

	constructor(private $logger: ILogger,
		private $errors: IErrors,
		private childProcess: IChildProcess) {
		this.ROOT = process.cwd();
	}

	execute(args: string[]): IFuture<void> {
		return (() => {
			this.build(args[0]);
		}).future<void>()();
	}

	private build(buildConfiguration: string): void {
		buildConfiguration = buildConfiguration || "--debug";

		var args = this.getAntArgs("debug");
		switch(buildConfiguration) {
			case "--debug":
				break;
			case "--release":
				args[0] = "release";
				break;
			case "nobuild":
				this.$logger.out("Skipping build....");
				return;
			default:
				this.$errors.fail("Build option %s not recognized", buildConfiguration);
		}

		this.$logger.out("before spawn");
		this.$logger.out(args);

		this.spawn('ant', args);
	}

	private spawn(command: string, args: string[], options?: any): void {
		if(helpers.isWindows()) {
			args.unshift('/s', '/c', command);
			command = 'cmd';
		}

		var child = this.childProcess.spawn(command, args, {cwd: options, stdio: 'inherit'});
	}

	private getAntArgs(configuration: string): string[] {
		var args = [configuration, '-f', path.join(this.ROOT, "build.xml")];
		return args;
	}
}

$injector.registerCommand("nativescript|build", BuildAndroidProjectCommand);
