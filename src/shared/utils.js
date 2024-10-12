const os = require('os');


/**
 * Get IP address of system or connected Wi-Fi
 * @returns IP address otherwise localhost
 */
function getIPAddress() {
    const interfaces = os.networkInterfaces();
    for (let name of Object.keys(interfaces)) {
        for (let iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address;
            }
        }
    }
    return 'localhost';
}


module.exports = {
    getIPAddress
}