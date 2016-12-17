// Type definitions for couchbase
// Project: https://github.com/gaearon/couchbase
// Definitions by: Sam Tobia <https://github.com/formula1/>
import { Bucket } from "couchbase";

declare module "couchbase" {
  export const Mock: { Bucket: Bucket, Cluster: any, ViewQuery: any };
}

declare module "websocket" {
  type EventFunction = (ev: Event) => any;

  export class w3cwebsocket implements WebSocket {
    public binaryType: string;
    public bufferedAmount: number;
    public extensions: string;
    public protocol: string;
    public url: string;
    public readyState: number;

    public OPEN: number;
    public CONNECTING: number;
    public CLOSING: number;
    public CLOSED: number;

    public onclose: EventFunction;
    public onerror: EventFunction;
    public onmessage: EventFunction;
    public onopen: EventFunction;

    constructor(url: string, otherstring?: string);

    public close();
    public send(str: string | ArrayBuffer);
    public addEventListener(eventname: string, fn);

    public dispatchEvent(evt: Event): boolean;

    public removeEventListener(eventname: string, fn);
  }
}
