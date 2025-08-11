declare module 'react-native-config' {
  export interface NativeConfig {
    COINGECKO_API_KEY: string;
    WEB_CLIENT_ID: string;
    IOS_CLIENT_ID: string;
  }
  
  export const Config: NativeConfig;
  export default Config;
}