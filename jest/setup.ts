import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      reset: jest.fn(),
      goBack: jest.fn(),
      setParams: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
    useIsFocused: () => true,
  };
});

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  const MockIcon = ({ name, size: _size, color: _color, testID, ..._props }: any) => {
    return React.createElement(View, { testID, accessibilityLabel: name }, name);
  };
  MockIcon.getImageSource = jest.fn(() => Promise.resolve({ uri: 'mocked-icon' }));
  return MockIcon;
});

jest.mock('react-native-vector-icons/Ionicons', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  const MockIcon = ({ name, size: _size, color: _color, testID, ..._props }: any) => {
    return React.createElement(View, { testID, accessibilityLabel: name }, name);
  };
  MockIcon.getImageSource = jest.fn(() => Promise.resolve({ uri: 'mocked-icon' }));
  return MockIcon;
});

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: ({ children }: any) => children,
    SafeAreaView: ({ children }: any) => children,
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

// Mock TanStack Query
jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
  useInfiniteQuery: jest.fn(),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
  QueryClient: jest.fn(),
  QueryClientProvider: ({ children }: any) => children,
}));

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
  get: jest.fn(),
  post: jest.fn(),
}));

// Mock react-native-vision-camera
jest.mock('react-native-vision-camera', () => ({
  Camera: 'Camera',
  useCameraDevices: () => ({}),
  useFrameProcessor: () => {},
}));

// Mock react-native-qrcode-scanner
jest.mock('react-native-qrcode-scanner', () => 'QRCodeScanner');

// Mock Permissions
jest.mock('react-native-permissions', () =>
  require('react-native-permissions/mock'),
);

// Global test utilities
global.fetch = require('jest-fetch-mock');

// Suppress console warnings during tests
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('Warning: ComponentsProvider'))
    ) {
      return;
    }
    return originalWarn.call(console, ...args);
  };

  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render') ||
        args[0].includes('The above error occurred'))
    ) {
      return;
    }
    return originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});