///<reference path=".d.ts"/>

"use strict";

import util = require("util");
import Future = require("fibers/future");
import cookielib = require("cookie");
import progress = require('progress-stream');
import filesize = require('filesize');
import Url = require("url");
import helpers = require("./helpers");
import zlib = require("zlib");

export class ServiceProxy implements Server.IServiceProxy {
	private latestVersion: string = null;
	private shouldAuthenticate: boolean = true;
	private solutionSpaceName: string;

	constructor(private $httpClient: Server.IHttpClient,
		private $userDataStore: IUserDataStore,
		private $logger: ILogger,
		private $config: IConfiguration,
		private $errors: IErrors) {
	}

	public call<Т>(name: string, method: string, path: string, accept: string, bodyValues: Server.IRequestBodyElement[], resultStream: WritableStream): IFuture<Т> {
		return <any> (() => {
			this.ensureUpToDate().wait();

			var headers: any = {
				"X-Icenium-SolutionSpace": this.solutionSpaceName || this.$config.SOLUTION_SPACE_NAME
			};

			if (this.shouldAuthenticate) {
				var cookies = this.$userDataStore.getCookies().wait();
				if (cookies) {
					var cookieValues = _.map(_.pairs(cookies), pair => util.format("%s=%s", pair[0], pair[1]));
					headers.Cookie = cookieValues.join("; ");
				}
			}

			if (accept) {
				headers.Accept = accept;
			}

			var requestOpts: any = {
				proto: this.$config.AB_SERVER_PROTO,
				host: this.$config.AB_SERVER,
				path: "/api" + path,
				method: method,
				headers: headers,
				pipeTo: resultStream
			};

			if (bodyValues) {
				if (bodyValues.length > 1) {
					throw new Error("TODO: CustomFormData not implemented");
				}

				var theBody = bodyValues[0];
				requestOpts.body = theBody.value;
				requestOpts.headers["Content-Type"] = theBody.contentType;
			}

			try {
				var response = this.$httpClient.httpRequest(requestOpts).wait();
			} catch (err) {
				if (err.response && err.response.statusCode === 401) {
					this.$userDataStore.clearLoginData().wait();
				}
				throw err;
			}

			this.$logger.debug("%s (%s %s) returned %d", name, method, path, response.response.statusCode);
			var newCookies = response.headers["set-cookie"];

			if (newCookies) {
				cookies = cookies || {};
				newCookies.forEach((cookieStr: string) => {
					var parsed = cookielib.parse(cookieStr);
					Object.keys(parsed).forEach((key) => {
						this.$logger.debug("Stored cookie %s=%s", key, parsed[key]);
						cookies[key] = parsed[key];
					});
				});
				this.$userDataStore.setCookies(cookies).wait();
			}

			var resultValue = accept === "application/json" ? JSON.parse(response.body) : response.body;
			return resultValue;
		}).future()();
	}

	public setShouldAuthenticate(shouldAuthenticate: boolean): void {
		this.shouldAuthenticate = shouldAuthenticate;
	}

	public setSolutionSpaceName(solutionSpaceName: string): void {
		this.solutionSpaceName = solutionSpaceName;
	}

	private ensureUpToDate(): IFuture<void> {
		return (() => {
			try {
				if (!this.latestVersion) {
					this.latestVersion = JSON.parse(this.$httpClient.httpRequest("http://registry.npmjs.org/appbuilder").wait().body)["dist-tags"].latest;
				}
			}
			catch (error) {
				this.$logger.debug("Failed to retrieve version from npm");
				this.latestVersion = "0.0.0";
			}

			if (helpers.versionCompare(this.latestVersion, this.$config.version) > 0) {
				this.$errors.fail({ formatStr: "You are running an outdated version of the Telerik AppBuilder CLI. To run this command, you need to update to the latest version of the Telerik AppBuilder CLI. To update now, run 'npm update -g appbuilder'.", suppressCommandHelp: true });
			}
		}).future<void>()();
	}
}
$injector.register("serviceProxy", ServiceProxy);

function quote(s: string): string {
	return "'" + s + "'";
}

function escapeKeyword(s: string): string {
	switch (s) {
		case "package":
			return s + "_";
		default:
			return s;
	}
}

function toClassName(contractName: string): string {
	return contractName.replace(/I(\w+)Contract/, "$1");
}

function escapeDotNetClassName(name: string): string {
	return name.replace(/`/g, "_");
}

function swaggerTypeToTypescriptType(swaggerType: string): string {
	swaggerType = escapeDotNetClassName(swaggerType);

	switch (swaggerType) {
		case "int":
			return "number";
		case "List":
			return "any[]";
	}

	var listMatch = swaggerType.match(/^List\[([^\]]+)\]$/);
	if (listMatch) {
		return swaggerTypeToTypescriptType(listMatch[1]) + "[]";
	}

	var mapMatch = swaggerType.match(/^Map\[([^,]+),([^\]]+)\]$/)
	if (mapMatch) {
		return util.format("{ [key: %s]: %s }", swaggerTypeToTypescriptType(mapMatch[1]), swaggerTypeToTypescriptType(mapMatch[2]));
	}

	return swaggerType;
}

class CodePrinter {
	private indent = "";
	private lines = [];

	public pushIndent(): void {
		this.indent += "\t";
	}

	public popIndent(): void {
		this.indent = this.indent.substr(1);
	}

	public writeLine(lineFormat?: string, ...args: any[]) {
		if (!lineFormat) {
			this.lines.push("");
		} else {
			if (lineFormat.endsWith("}")) {
				this.popIndent();
				lineFormat += "\r\n";
			}

			args.unshift(lineFormat);
			this.lines.push(this.indent + util.format.apply(null, args));

			if (lineFormat.endsWith("{")) {
				this.pushIndent();
			}
		}
	}

	public toString(): string {
		return this.lines.join("\r\n");
	}
}

export class ServiceContractProvider implements Server.IServiceContractProvider {
	constructor(private $httpClient: Server.IHttpClient,
		private $config: IConfiguration) {
	}

<<<<<<< HEAD
	getApi(): Server.Contract.IService[] {
		var req:any = {
			proto: this.$config.AB_SERVER_PROTO,
			host: this.$config.AB_SERVER,
			path: "/api",
			method: "GET"
		};
=======
	getApi(): IFuture<Server.Contract.ISwaggerApiDeclaration[]> {
		return (() => {
			var apiJsonReq = {
				proto: config.AB_SERVER_PROTO,
				host: config.AB_SERVER,
				path: "/api",
				method: "GET"
			};
>>>>>>> origin/experiments/swagger

			var apiJson: Server.Contract.IService[];
			var apiJsonResponse = this.$httpClient.httpRequest(apiJsonReq).wait();
			if (apiJsonResponse.error) {
				throw apiJsonResponse.error;
			} else {
				apiJson = JSON.parse(apiJsonResponse.body);
			}

			var directoryReq:any = {
				proto: config.AB_SERVER_PROTO,
				host: config.AB_SERVER,
				path: "/api/swagger",
				method: "GET"
			};

			var directory: Server.Contract.ISwaggerResourceListing;
			var directoryResponse = this.$httpClient.httpRequest(directoryReq).wait();
			if (directoryResponse.error) {
				throw directoryResponse.error;
			} else {
				directory = JSON.parse(directoryResponse.body);
			}

			var apis = _.map(directory.apis, (value, index, list) => {
				return (() => {
					var apiReq = {
						proto: config.AB_SERVER_PROTO,
						host: config.AB_SERVER,
						path: "/api/swagger" + value.path
					};
					var apiResponse = this.$httpClient.httpRequest(apiReq).wait();
					if (apiResponse.error) {
						throw apiResponse.error;
					} else {
						var apiDecl: Server.Contract.ISwaggerApiDeclaration = JSON.parse(apiResponse.body);
						var apiJsonDesc =_.find(apiJson, (aj) => "/api/" + aj.endpoint === apiDecl.basePath);
						apiDecl.contract = apiJsonDesc.name;
						apiDecl.endpoint = apiJsonDesc.endpoint;

						Object.keys(apiDecl.models).forEach((model) => apiDecl.models[model].id = escapeDotNetClassName(apiDecl.models[model].id));

						apiDecl.apis.forEach((api) => {
							api.operations.forEach((op) => op.path = api.path);
						})
						return apiDecl;
					}
				}).future<Server.Contract.ISwaggerApiDeclaration>()();
			});
			Future.wait(apis);

			return _.map(apis, (api) => api.get());
		}).future<Server.Contract.ISwaggerApiDeclaration[]>()();
	}
}
$injector.register("serviceContractProvider", ServiceContractProvider);

export class ServiceContractGenerator implements Server.IServiceContractGenerator {
	constructor(private $serviceContractProvider: Server.IServiceContractProvider) {
	}

	public generate(): Server.IServiceContractClientCode {
		var apiDecl = this.$serviceContractProvider.getApi().wait();

		var intf = new CodePrinter();
		var impl = new CodePrinter();
		impl.writeLine("///<reference path=\".d.ts\"/>");
		impl.writeLine("//");
		impl.writeLine("// automatically generated code; do not edit manually!")
		impl.writeLine("//");
		impl.writeLine("\"use strict\";");
		impl.writeLine();
		impl.writeLine("import querystring = require('querystring');");
		impl.writeLine();

		intf.writeLine("//");
		intf.writeLine("// automatically generated code; do not edit manually!")
		intf.writeLine("//");
		intf.writeLine("declare module Server {");

<<<<<<< HEAD
		api.sort((a, b) => a.name.localeCompare(b.name));
=======
		apiDecl.sort(function(a, b) {
			return a.basePath.localeCompare(b.basePath);
		});
>>>>>>> origin/experiments/swagger

		for (var i = 0; i < apiDecl.length; ++i) {
			var models = _.map(apiDecl[i].models, (element, key, map) => element);
			models.sort((a, b) => a.id.localeCompare(b.id));

			models.forEach((model) => {

				intf.writeLine("interface %s {", model.id);

				var properties = _.map(model.properties, (element, key, map) => {
					element.name = key;
					return element;
				});
				properties.sort((a, b) => a.name.localeCompare(b.name));

				properties.forEach((property) => {
					intf.writeLine("%s: %s;", property.name, swaggerTypeToTypescriptType(property.type));
				});

				intf.writeLine("}");
			});

			var intfName = apiDecl[i].contract;
			intf.writeLine("interface %s {", intfName);
			var className = toClassName(intfName);
			impl.writeLine("export class %s implements Server.%s {", className, intfName);
			impl.writeLine("constructor(private $serviceProxy: Server.IServiceProxy) {");
			impl.writeLine("}");

<<<<<<< HEAD
			var operations = api[i].operations;
			operations.sort((a, b) => a.name.localeCompare(b.name));
=======
			var operations: Server.Contract.ISwaggerOperation[] = _.union.apply(null, _.map(apiDecl[i].apis, (api) => api.operations));
			operations.sort(function(a, b) {
				return a.nickname.localeCompare(b.nickname);
			});
>>>>>>> origin/experiments/swagger

			for (var oi = 0; oi < operations.length; ++oi) {
				var op = operations[oi];
				var paramNames = _.map(op.parameters, (p) => escapeKeyword(p.name) + (p.required ? "" : "?") + ": " +
					(p.paramType === "body" ? "any" : swaggerTypeToTypescriptType(p.dataType)));

				if (op.responseClass === "file") {
					paramNames.push("$resultStream: any");
				}

				var returnType = op.responseClass !== "file" ? swaggerTypeToTypescriptType(op.responseClass) : "void";

				var signature = util.format("%s(%s): IFuture<%s>",
					op.nickname[0].toLowerCase() + op.nickname.substr(1),
					paramNames.join(", "), returnType);
//
//				var actionPath = _.filter(
//					["/" + api[i].endpoint].concat(op.routePrefixes, [op.actionName]),
//					(part) => !!part).join("/");
//				var pathComponents = [quote(actionPath)];
//				var queryParams = [];
//
				intf.writeLine(signature + ";");
				impl.writeLine(signature + " {");

				var bodyParams = [];

				op.parameters.forEach((param) => {
					var paramName = escapeKeyword(param.name);

					switch (param.paramType) {
//						case "Route":
//							if (param.routePrefixes && param.routePrefixes.length > 0) {
//								pathComponents.push("'" + param.routePrefixes.join("/") + "'");
//							}
//							pathComponents.push(util.format("encodeURI(%s.replace(/\\\\/g, '/'))", paramName));
//							if (param.routeSuffixes && param.routeSuffixes.length > 0) {
//								pathComponents.push("'" + param.routeSuffixes.join("/") + "'");
//							}
//							break;
//
//						case "Query":
//							queryParams.push(paramName);
//							break;
//
//						case "Body":
//							var contentType = param.binding.contentType;
//							if (contentType === "application/json") {
//								paramName = util.format("JSON.stringify(%s)", paramName);
//							}
//							bodyParams.push(util.format("{name: '%s', value: %s, contentType: %s}",
//								param.name, paramName, contentType ? quote(contentType) : "null"));
//							break;
					}
				});
//
//				if (op.routeSuffixes && op.routeSuffixes.length > 0) {
//					pathComponents.push("'" + op.routeSuffixes.join("/") + "'");
//				}
//
//				var pathVar: string;
//
//				if (pathComponents.length === 1) {
//					pathVar = pathComponents[0];
//				} else {
//					pathVar = util.format("[%s].join('/')", pathComponents.join(", "));
//				}
//				if (queryParams.length > 0) {
//					pathVar += util.format(" + '?' + querystring.stringify({ %s })",
//						_.map(queryParams, (p) => util.format("'%s': %s", p, p)).join(", "));
//				}
//
//				var args = [quote(op.name), quote(op.httpMethod), pathVar];
//				args.push(op.responseType ? quote(op.responseType) : "null");
//
//				switch (bodyParams.length) {
//					case 0:
//						args.push("null");
//						break;
//					default:
//						args.push(util.format("[%s]", bodyParams.join(", ")));
//						break;
//				}
//
//				args.push(op.responseType === "application/octet-stream" ? "$resultStream" : "null");
//
//				impl.writeLine("return this.$serviceProxy.call<%s>(%s);", returnType, args.join(", "));
				impl.writeLine("}");
			}

			intf.writeLine("}");
			impl.writeLine("}");
		}

		intf.writeLine("interface IServer {");
		impl.writeLine("export class Server {");
		for (var i = 0; i < apiDecl.length; ++i) {
			intf.writeLine("%s: %s;", apiDecl[i].endpoint, apiDecl[i].contract);
			impl.writeLine("public %s = $injector.resolve(%s);", apiDecl[i].endpoint, toClassName(apiDecl[i].contract));
		}
		intf.writeLine("}");
		impl.writeLine("}");
		impl.writeLine("$injector.register('server', Server);");

		intf.writeLine("}");
//
		return {
			interfaceFile: intf.toString(),
			implementationFile: impl.toString()
		};
	}
}
$injector.register("serviceContractGenerator", ServiceContractGenerator);