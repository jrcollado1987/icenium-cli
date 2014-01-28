///<reference path=".d.ts"/>

export class LoggerStub implements ILogger {
	fatal(formatStr: string, ...args): void {}
	error(formatStr: string, ...args): void {}
	warn(formatStr: string, ...args): void {}
	info(formatStr: string, ...args): void {}
	debug(formatStr: string, ...args): void {}
	trace(formatStr: string, ...args): void {}
}