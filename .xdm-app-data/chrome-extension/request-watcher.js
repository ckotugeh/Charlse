"use strict";
import Logger from './logger.js';

export default class RequestWatcher {
    constructor(callback) {
        this.logger = new Logger();
        this.blockedHosts = [];
        this.mediaExts = [];
        this.fileExts = [];
        this.requestMap = new Map();
        this.callback = callback;
        this.matchingHosts = [];
        this.mediaTypes = [];
        this.onSendHeadersEventCallback = this.onSendHeadersEvent.bind(this);
        this.onHeadersReceivedEventCallback = this.onHeadersReceivedEvent.bind(this);
        this.onErrorOccurredEventCallback = this.onErrorOccurredEvent.bind(this);
        this.urlPatterns = [];
        this.requestFileExts = [];
    }

    updateConfig(config) {
        if (config.blockedHosts) {
            this.blockedHosts = config.blockedHosts
        }
        if (config.fileExts) {
            this.fileExts = config.fileExts
        }
        if (config.mediaExts) {
            this.mediaExts = config.mediaExts
        }
        if (config.matchingHosts) {
            this.matchingHosts = config.matchingHosts
        }
        if (config.mediaTypes) {
            this.mediaTypes = config.mediaTypes
        }
        if (config.requestFileExts) {
            this.requestFileExts = config.requestFileExts
        }
        if (config.urlPatterns) {
            this.urlPatterns = config.urlPatterns.map(pattern => {
                try {
                    return new RegExp(pattern, "i");
                } catch { }
            }).filter(item => item || false);
        }
    }

    isMatchingRequest(res) {
        let u = new URL(res.url);

        let hostName = u.host;
        if (this.blockedHosts.find(h => hostName.indexOf(h) >= 0)) {
            return false;
        }

        let path = u.pathname;
        let upath = path.toUpperCase();
        if (this.mediaExts.find(e => upath.endsWith(e))) {
            return true;
        }

        if (this.requestFileExts.find(e => upath.endsWith(e))) {
            return true;
        }

        try {
            if (this.urlPatterns.find(re => re.test(res.url))) {
                return true;
            }
        } catch { }

        let mediaType = res.responseHeaders.find(h => h["name"].toUpperCase() === "CONTENT-TYPE");
        if (mediaType && this.mediaTypes.find(m => mediaType["value"].indexOf(m) >= 0)) {
            return true;
        }

        if (this.fileExts.find(e => upath.endsWith("." + e))) {
            return true;
        }

        let contentDisposition = res.responseHeaders.find(h => h["name"].toUpperCase() === "CONTENT-DISPOSITION");
        if (contentDisposition && this.fileExts.find(ext => contentDisposition["value"].toUpperCase().indexOf("." + ext) >= 0)) {
            return true;
        }

        if (this.matchingHosts.find(h => hostName.indexOf(h) >= 0)) {
            return true;
        }
    }

    onSendHeadersEvent(info) {
        if (info.method !== "GET" && !(this.matchingHosts
            && this.matchingHosts.find(matchingHost => info.url.indexOf(matchingHost) > 0))) {
            return;
        }
        this.requestMap.set(info.requestId, info);
    }

    onHeadersReceivedEvent(res) {
        let reqId = res.requestId;
        let req = this.requestMap.get(reqId);
        if (req) {
            this.requestMap.delete(reqId);
            if (this.callback && this.isMatchingRequest(res)) {
                if (req.tabId !== -1) {
                    chrome.tabs.get(
                        req.tabId,
                        tab => {
                            this.callback(this.createRequestData(req, res, tab.title, tab.url, req.tabId));
                        }
                    );
                } else {
                    this.callback(this.createRequestData(req, res, null, null, req.tabId));
                }
            }
        }
    }

    onErrorOccurredEvent(info) {
        let reqId = info.requestId;
        this.requestMap.delete(reqId);
    }

    register() {
        chrome.webRequest.onSendHeaders.addListener(
            this.onSendHeadersEventCallback,
            { urls: ["http://*/*", "https://*/*"] },
            ["extraHeaders", "requestHeaders"]
        );

        chrome.webRequest.onHeadersReceived.addListener(
            this.onHeadersReceivedEventCallback,
            { urls: ["http://*/*", "https://*/*"] },
            ["extraHeaders", "responseHeaders"]
        );

        chrome.webRequest.onErrorOccurred.addListener(
            this.onErrorOccurredEventCallback,
            { urls: ["http://*/*", "https://*/*"] }
        );
    }

    unRegister() {
        chrome.webRequest.onSendHeaders.removeListener(this.onSendHeadersEventCallback);
        chrome.webRequest.onHeadersReceived.removeListener(this.onHeadersReceivedEventCallback);
        chrome.webRequest.onErrorOccurred.removeListener(this.onErrorOccurredEventCallback);
    }

    createRequestData(req, res, title, tabUrl, tabId) {
        let data = {
            url: res.url,
            file: title,
            requestHeaders: {},
            responseHeaders: {},
            cookie: undefined,
            method: req.method,
            userAgent: navigator.userAgent,
            tabUrl: tabUrl,
            tabId: tabId + ""
        };

        let cookies = [];

        if (req.extraHeaders) {
            req.extraHeaders.forEach(h => {
                if (h.name === 'Cookie' || h.name === 'cookie') {
                    cookies.push(h.value);
                }
                this.addToDict(data.requestHeaders, h.name, h.value);
            });
        }
        if (req.requestHeaders) {
            req.requestHeaders.forEach(h => {
                if (h.name === 'Cookie' || h.name === 'cookie') {
                    cookies.push(h.value);
                }
                this.addToDict(data.requestHeaders, h.name, h.value);
            });
        }
        if (res.responseHeaders) {
            res.responseHeaders.forEach(h => {
                this.addToDict(data.responseHeaders, h.name, h.value);
            });
        }
        if (cookies.length > 0) {
            data.cookie = cookies.join(";");
        }
        return data;
    }

    addToDict(dict, key, value) {
        let values = dict[key];
        if (values) {
            values.push(value);
        } else {
            dict[key] = [value];
        }
    }
}