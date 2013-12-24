///<reference path=".d.ts"/>

"use strict";

interface String {
	startsWith(prefix: string): boolean;
	isEmpty(): boolean;
}

interface Array {
	contains(element: any): boolean;
}

function startsWith(prefix) {
	if (typeof prefix !== "string") {
		throw new Error("prefix must be string");
	}

	return this.length >= prefix.length ? this.substr(0, prefix.length) === prefix : false;
}

function isEmpty() {
	return this === "";
}

String.prototype.startsWith = startsWith;
String.prototype.isEmpty = isEmpty;

Array.prototype.contains = function contains(object) {
	return this.indexOf(object) >= 0;
};
