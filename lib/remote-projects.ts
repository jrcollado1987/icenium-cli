///<reference path=".d.ts"/>

"use strict";
import util = require("util");
import path = require("path");
import helpers = require("./helpers");
import unzip = require("unzip");
var options:any = require("./options");
var _ = <UnderscoreStatic> require("underscore");

class RemoteProjectExporter {
	constructor(private $logger: ILogger,
		private $server: Server.IServer,
		private $fs: IFileSystem,
		private $userDataStore: IUserDataStore,
		private $serviceProxy: Server.IServiceProxy,
		private $project: Project.IProject,
		private $errors: IErrors) {}

	public listProjects(): IFuture<void> {
		return (() => {
			var data = this.getProjects().wait();
			this.printProjects(data);
		}).future<void>()();
	}

	private printProjects(projects) {
		this.$logger.out("Projects:");
		projects.forEach(function (project, index) {
			this.$logger.out("#%d: '%s'", index + 1, project.name);
		});
	}

	public exportProject(projectId): IFuture<void> {
		return (() => {
			var name = this.getProjectName(projectId).wait();
			var result = this.doExportRemoteProject(name).wait();
			this.$logger.out(result);
		}).future<void>()();
	}

	private doExportRemoteProject(remoteProjectName: string): IFuture<string> {
		return (() => {
			var projectDir = path.join(this.getProjectDir(), remoteProjectName);
			var properties = this.getProjectProperties(remoteProjectName).wait();
			this.$project.createProjectFile(projectDir, remoteProjectName, properties).wait();

			var projectExtractor = unzip.Extract({ path: projectDir});
			this.makeTapServiceCall(() => this.$server.projects.getExportedSolution(remoteProjectName, projectExtractor)).wait();
			this.$fs.futureFromEvent(projectExtractor, "close").wait();
			return util.format("%s has been successfully exported to %s", remoteProjectName, projectDir);
		}).future<string>()();
	}

	private makeTapServiceCall<T>(call: () => IFuture<T>): IFuture<T> {
		return (() => {
			var user = this.$userDataStore.getUser().wait();
			var tenantId = user.tenant.id;
			this.$serviceProxy.setSolutionSpaceName(tenantId);
			try {
				return call().wait();
			} finally {
				this.$serviceProxy.setSolutionSpaceName(null);
			}
		}).future<T>()();
	}

	private getProjectName(projectId: string): IFuture<string> {
		return ((): string => {
			var data = this.getProjects().wait();

			if (_.findWhere(data, {name: projectId})) {
				return projectId;
			} else if (helpers.isNumber(projectId)) {
				var index = parseInt(projectId, 10);
				if (index < 1 || index > data.length) {
					this.$errors.fail("The project index must be between 1 and %s", data.length);
				} else {
					return data[index - 1].name;
				}
			}
			this.$errors.fail("The project '%s' was not found.", projectId);
		}).future<string>()();
	}

	private getProjects(): IFuture<any> {
		return this.makeTapServiceCall(() => this.$server.tap.getExistingClientSolutions());
	}

	private getProjectDir() {
		return options.path || process.cwd();
	}

	private getProjectProperties(projectName: string): IFuture<any> {
		return (() => {
			var solutionData = this.getSolutionData(projectName).wait();
			var properties = solutionData.Items[0].Properties;
			properties.CorePlugins = properties.CorePlugins.split(";");
			properties.DeviceOrientations = properties.DeviceOrientations.split(";");
			properties.AndroidPermissions = properties.AndroidPermissions.split(";");

			return properties;
		}).future()();
	}

	private getSolutionData(projectName: string): IFuture<any> {
		return this.makeTapServiceCall(() => this.$server.projects.getSolution(projectName, "True"));
	}
}
$injector.register("remoteProjectsExporter", RemoteProjectExporter);

helpers.registerCommand("remoteProjectsExporter", "list-projects", (exporter) => exporter.listProjects());
helpers.registerCommand("remoteProjectsExporter", "export-project", (exporter, args) => exporter.exportProject(args[0]));
