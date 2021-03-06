///<reference path=".d.ts"/>

"use strict";

import util = require("util");
import path = require("path");
import url = require("url");
import options = require("./options");
import querystring = require("querystring");
import Future = require("fibers/future");
import helpers = require("./helpers");

export class UserDataStore implements IUserDataStore {
	private cookies: IStringDictionary;
	private user: any;

	constructor(private $fs: IFileSystem,
		private $logger: ILogger) {}

	public hasCookie(): IFuture<boolean> {
		return (() => {
			try {
				this.getCookies().wait();
				return true;
			} catch (err) {
				return false;
			}
		}).future<boolean>()();
	}

	public getCookies(): IFuture<IStringDictionary> {
		return this.readAndCache(UserDataStore.getCookieFilePath(),
			() => this.cookies,
			(value: string) => this.cookies = JSON.parse(value));
	}

	public getUser(): IFuture<any> {
		return this.readAndCache(UserDataStore.getUserStateFilePath(),
			() => this.user,
			(value: string) => this.user = JSON.parse(value));
	}

	public setCookies(cookies?: IStringDictionary): IFuture<void> {
		this.cookies = cookies;
		if (this.cookies) {
			return this.$fs.writeFile(UserDataStore.getCookieFilePath(), JSON.stringify(this.cookies));
		} else {
			return this.$fs.deleteFile(UserDataStore.getCookieFilePath());
		}
	}

	public setUser(user?: any): IFuture<void> {
		this.user = user;
		if (user) {
			return this.$fs.writeJson(UserDataStore.getUserStateFilePath(), user);
		} else {
			return this.$fs.deleteFile(UserDataStore.getUserStateFilePath());
		}
	}

	public clearLoginData(): IFuture<void> {
		return (() => {
			this.setCookies(null).wait();
			this.setUser(null).wait();
		}).future<void>()();
	}

	private checkCookieExists<T>(sourceFile: string, getter: () => T) : IFuture<boolean> {
		return (() => {
			return (getter() || this.$fs.exists(sourceFile).wait());
		}).future<boolean>()();
	}

	private readAndCache<T>(sourceFile: string, getter: () => T, setter: (value: string) => void): IFuture<T> {
		return (() => {
			if (!getter()) {
				if (!this.checkCookieExists(sourceFile, getter).wait()) {
					throw new Error("Not logged in.");
				}

				var contents = this.$fs.readText(sourceFile).wait();
				try {
					setter(contents);
				} catch (err) {
					this.$logger.debug("Error while reading user data file '%s':\n%s\n\nContents:\n%s",
						sourceFile, err.toString(), contents);
					this.clearLoginData().wait();
					throw new Error("Not logged in.");
				}
			}

			return getter();
		}).future<T>()();
	}

	private static getCookieFilePath(): string {
		return path.join(options["profile-dir"], "cookie");
	}

	private static getUserStateFilePath(): string {
		return path.join(options["profile-dir"], "user");
	}
}
$injector.register("userDataStore", UserDataStore);

export class LoginManager implements ILoginManager {
	public static DEFAULT_NONINTERACTIVE_LOGIN_TIMEOUT_MS = 15 * 60 * 1000;

	constructor(private $logger: ILogger,
		private $config: IConfiguration,
		private $fs: IFileSystem,
		private $userDataStore: IUserDataStore,
		private $opener: IOpener,
		private $server: Server.IServer,
		private $commandsService: ICommandsService,
		private $sharedUserSettingsFileService: IUserSettingsFileService,
		private $httpServer: IHttpServer) { }

	public logout(): IFuture<void> {
		return (() => {
			this.$logger.info("Logging out...");

			this.localLogout().wait();

			var logoutUrl = util.format("%s://%s/Mist/Logout", this.$config.AB_SERVER_PROTO, this.$config.AB_SERVER);
			this.$logger.debug("Logout URL is '%s'", logoutUrl);
			this.$opener.open(logoutUrl);

			this.$logger.info("Logout completed.");
		}).future<void>()();
	}

	private localLogout(): IFuture<void> {
		return (() => {
			this.$userDataStore.clearLoginData().wait();
			this.$sharedUserSettingsFileService.deleteUserSettingsFile().wait();
		}).future<void>()();
	}

	public login(): IFuture<void> {
		return (() => {
			this.localLogout().wait();
			this.doLogin().wait();
		}).future<void>()();
	}

	public isLoggedIn() : IFuture<boolean> {
		return this.$userDataStore.hasCookie();
	}

	public ensureLoggedIn(): IFuture<void> {
		return (() => {
			if (!this.isLoggedIn().wait()) {
				this.doLogin().wait();
			}
		}).future<void>()();
	}

	private doLogin(): IFuture<void> {
		return (() => {
			this.$fs.createDirectory(options["profile-dir"]).wait();

			this.loginInBrowser().wait();

			this.$logger.info("Login completed.");
			this.$commandsService.executeCommand("user", []);
		}).future<void>()();
	}

	private serveLoginFile(relPath): (request, response) => void {
		return this.$httpServer.serveFile(path.join(__dirname, "../resources/login", relPath));
	}

	private loginInBrowser(): IFuture<any> {
		return (() => {
			var authComplete = new Future<string>();

			this.$logger.info("Launching login page in browser.");

			var localhostServer = this.$httpServer.createServer({
				routes: {
					"/": (request, response) => {
						this.$logger.debug("Login complete: " + request.url);
						var parsedUrl = url.parse(request.url, true);
						var cookieData = parsedUrl.query.cookies;
						if (cookieData) {
							this.serveLoginFile("end.html")(request, response);

							localhostServer.close();

							authComplete.return(cookieData);
						} else {
							this.$httpServer.redirect(response, loginUrl);
						}
					}
				}
			});

			localhostServer.listen(0);
			this.$fs.futureFromEvent(localhostServer, "listening").wait();

			var port = localhostServer.address().port;
			var loginUrl = util.format("%s://%s/Mist/ClientLogin?port=%s", this.$config.AB_SERVER_PROTO, this.$config.AB_SERVER, port);

			this.$logger.debug("Login URL is '%s'", loginUrl);
			this.$opener.open(loginUrl);

			var timeoutID: number = undefined;

			if (!helpers.isInteractive()) {
				var timeout = options.hasOwnProperty("timeout")
					? +options.timeout
					: LoginManager.DEFAULT_NONINTERACTIVE_LOGIN_TIMEOUT_MS;

				if (timeout > 0) {
					timeoutID = setTimeout(() => {
						if (!authComplete.isResolved()) {
							this.$logger.debug("Aborting login procedure due to inactivity.");
							process.exit();
						}
					}, timeout);
				}
			}

			var cookieData = authComplete.wait();
			if(timeoutID !== undefined) {
				clearTimeout(timeoutID);
			}

			var cookies = JSON.parse(cookieData);
			this.$userDataStore.setCookies(cookies).wait();

			var userData = this.$server.authentication.getLoggedInUser().wait();
			this.$userDataStore.setUser(userData).wait();

			return userData;
		}).future()();
	}

}
$injector.register("loginManager", LoginManager);

helpers.registerCommand("loginManager", "login", (loginManager, args) => loginManager.login(), {disableAnalytics: true});
helpers.registerCommand("loginManager", "logout", (loginManager, args) => loginManager.logout(), {disableAnalytics: true});
