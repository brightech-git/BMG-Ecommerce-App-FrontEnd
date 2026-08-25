import { Platform } from 'react-native';

const noop = () => {};

const noopAsync = async () => [];

let getHash: () => Promise<string[]>;
let useOtpVerify: (options?: any) => {
    message: string | null;
    timeoutError: boolean;
    startListener: (() => void) | undefined;
    stopListener: (() => void) | undefined;
};
let removeListener: () => void;

if (Platform.OS === 'android') {
    const mod = require('react-native-otp-verify');

    getHash = mod.getHash;
    useOtpVerify = mod.useOtpVerify;
    removeListener = mod.removeListener;
} else {
    // iOS: react-native-otp-verify is not linked/available, use no-op fallbacks
    getHash = noopAsync;

    useOtpVerify = () => ({
        message: null,
        timeoutError: false,
        startListener: undefined,
        stopListener: undefined,
    });

    removeListener = noop;
}

export { getHash, useOtpVerify, removeListener };
