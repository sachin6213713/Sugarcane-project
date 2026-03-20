import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

// IMPORTANT: Replace with your actual RevenueCat API keys
const REVENUECAT_API_KEY_IOS = 'test_WMUQeVzpNMuJbWwWtXqmPHNgKnL'; // Placeholder for iOS
const REVENUECAT_API_KEY_ANDROID = 'test_WMUQeVzpNMuJbWwWtXqmPHNgKnL'; // Placeholder for Android

export const configureRevenueCat = async () => {
    try {
        // Check if we are in Expo Go or if the native module is missing
        // Purchases.configure will throw if the native module is not linked (Expo Go)

        Purchases.setLogLevel(LOG_LEVEL.DEBUG);

        if (Platform.OS === 'ios') {
            await Purchases.configure({ apiKey: REVENUECAT_API_KEY_IOS });
        } else if (Platform.OS === 'android') {
            await Purchases.configure({ apiKey: REVENUECAT_API_KEY_ANDROID });
        }
        console.log('RevenueCat configured successfully');
    } catch (e: any) {
        if (e.message?.includes('native store is not available')) {
            console.warn('RevenueCat: Native store not available in Expo Go. Functions will be mocked.');
        } else {
            console.error('Error configuring Purchases:', e);
        }
    }
};

export const getCustomerInfo = async () => {
    try {
        return await Purchases.getCustomerInfo();
    } catch (e) {
        console.error('Error fetching customer info:', e);
        return null;
    }
};

export const isProMember = async () => {
    const customerInfo = await getCustomerInfo();
    // Replace 'pro' with your actual entitlement ID from RevenueCat dashboard
    return customerInfo?.entitlements.active['pro'] !== undefined;
};
