export interface DeviceInfo {
    deviceType?: string;
    browser?: string;
    os?: string;
    userAgent?: string;
    location?: string;
}
export declare class DeviceInfoUtil {
    static parseUserAgent(userAgent: string): DeviceInfo;
    static getLocationFromIp(ip: string): Promise<string>;
    static getBasicInfo(request: {
        headers?: {
            [key: string]: string;
        };
        ip?: string;
    }): DeviceInfo;
}
