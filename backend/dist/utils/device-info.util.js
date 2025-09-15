"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceInfoUtil = void 0;
class DeviceInfoUtil {
    static parseUserAgent(userAgent) {
        const info = {
            userAgent: userAgent,
        };
        if (userAgent.includes('Chrome')) {
            info.browser = 'Chrome';
        }
        else if (userAgent.includes('Firefox')) {
            info.browser = 'Firefox';
        }
        else if (userAgent.includes('Safari')) {
            info.browser = 'Safari';
        }
        else if (userAgent.includes('Edge')) {
            info.browser = 'Edge';
        }
        if (userAgent.includes('Windows')) {
            info.os = 'Windows';
        }
        else if (userAgent.includes('Mac')) {
            info.os = 'macOS';
        }
        else if (userAgent.includes('Linux')) {
            info.os = 'Linux';
        }
        else if (userAgent.includes('Android')) {
            info.os = 'Android';
            info.deviceType = 'mobile';
        }
        else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
            info.os = 'iOS';
            info.deviceType = userAgent.includes('iPad') ? 'tablet' : 'mobile';
        }
        if (!info.deviceType) {
            if (userAgent.includes('Mobile')) {
                info.deviceType = 'mobile';
            }
            else if (userAgent.includes('Tablet')) {
                info.deviceType = 'tablet';
            }
            else {
                info.deviceType = 'desktop';
            }
        }
        return info;
    }
    static getLocationFromIp(ip) {
        return Promise.resolve(ip || 'Unknown location');
    }
    static getBasicInfo(request) {
        const userAgent = request.headers?.['user-agent'] || '';
        const ip = request.ip;
        const info = this.parseUserAgent(userAgent);
        if (ip) {
            info.location = ip;
        }
        return info;
    }
}
exports.DeviceInfoUtil = DeviceInfoUtil;
//# sourceMappingURL=device-info.util.js.map