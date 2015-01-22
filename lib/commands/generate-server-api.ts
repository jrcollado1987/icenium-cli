///<reference path="../.d.ts"/>
"use strict";

import path = require("path");

export class GenerateServerApiCommand implements ICommand {
	constructor(private $serviceContractGenerator: Server.IServiceContractGenerator,
				private $fs: IFileSystem) {
	}

<<<<<<< HEAD
	execute(args: string[]): IFuture<void> {
		return (() => {
			var result = this.$serviceContractGenerator.generate();
			this.$fs.writeFile(path.join(__dirname, "../server-api.d.ts"), result.interfaceFile).wait();
			this.$fs.writeFile(path.join(__dirname, "../server-api.ts"), result.implementationFile).wait();
		}).future<void>()();
=======
	execute(args: string[]):void {
		var result = this.$serviceContractGenerator.generate();
		fs.writeFileSync(path.join(__dirname, "../../server-api2.d.ts"), result.interfaceFile);
		fs.writeFileSync(path.join(__dirname, "../../server-api2.ts"), result.implementationFile);
>>>>>>> origin/experiments/swagger
	}
}
$injector.registerCommand("dev-generate-api", GenerateServerApiCommand);