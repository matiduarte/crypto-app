# "@" Alias Troubleshooting Guide

## 🚨 Issue Resolved: Module Resolution Error

### **Problem Encountered:**
```
Unable to resolve module @/hooks/useAuth from /Users/.../LoginScreen.tsx: 
@/hooks/useAuth could not be found within the project or in these directories:
  node_modules
```

### **Root Cause:**
Metro bundler cache was outdated and hadn't picked up the new alias configuration changes in `metro.config.js`.

## ✅ **Solution Applied:**

### **Step 1: Stop Metro Process**
```bash
pkill -f "react-native.*start"
```

### **Step 2: Clear Cache & Restart Metro**
```bash
npx react-native start --reset-cache
```

### **Step 3: Rebuild App**
```bash
npm run ios
# or
npm run android
```

## 🔧 **Why This Happened:**

1. **Metro Cache**: Metro bundler caches module resolution for performance
2. **Configuration Changes**: When `metro.config.js` is updated, cache becomes stale
3. **Alias Resolution**: New aliases aren't recognized until cache is cleared

## 📋 **Complete Fix Checklist:**

- ✅ **Configuration Files Updated**:
  - `tsconfig.json` - TypeScript path mapping
  - `metro.config.js` - Metro resolver aliases

- ✅ **Cache Management**:
  - Stopped existing Metro processes
  - Restarted Metro with `--reset-cache` flag
  - Cleared React Native transform cache

- ✅ **Testing & Validation**:
  - TypeScript compilation: ✅ No errors
  - iOS build: ✅ Successfully built and launched
  - Module resolution: ✅ "@" aliases working correctly

## 🚀 **Prevention for Future Updates:**

### **When to Clear Cache:**
- After updating `metro.config.js`
- After changing TypeScript path mappings
- When adding new alias configurations
- If seeing "module not found" errors with aliases

### **Quick Cache Clear Commands:**
```bash
# Method 1: Reset cache flag
npx react-native start --reset-cache

# Method 2: React Native clean
npm run clean

# Method 3: Manual cache clear
npx react-native clean-project
```

## 🎯 **Best Practices:**

### **Development Workflow:**
1. Update configuration files (`tsconfig.json`, `metro.config.js`)
2. Stop Metro (Ctrl+C or `pkill` command)
3. Restart Metro with cache reset
4. Test import resolution

### **Team Guidelines:**
- Document cache clearing steps in README
- Include cache reset in CI/CD pipeline after config changes
- Share troubleshooting steps with team members

## ✅ **Current Status:**

**All "@" aliases are now working correctly!**

- ✅ `@/hooks/useAuth` - Resolved successfully
- ✅ `@/contexts/AuthContext` - Working
- ✅ `@/components/auth` - Working
- ✅ `@/services/api` - Working
- ✅ `@/utils/storage` - Working

## 📖 **Verification Commands:**

```bash
# Test TypeScript compilation
npx tsc --noEmit

# Test app build
npm run ios
# or
npm run android

# Check Metro status
lsof -i :8081  # See if Metro is running
```

---

**The "@" alias system is now fully functional and cache-optimized!** 🎉

### **Key Takeaway:**
Always clear Metro cache after updating module resolution configuration to ensure proper alias functionality.