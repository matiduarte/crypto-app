# "@" Alias Usage Examples

## 🎯 Import Examples

### **Before vs After Comparison**

```typescript
// ❌ OLD WAY - Relative imports with complex paths
import { useAuth } from '../../../contexts/AuthContext';
import { api } from '../../../services/api';
import { formatPrice } from '../../../../utils/helpers';
import { Cryptocurrency } from '../../../types/index';
import { Button } from '../../components/ui/Button';

// ✅ NEW WAY - Clean absolute imports with @ alias
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { formatPrice } from '@/utils/helpers';
import { Cryptocurrency } from '@/types';
import { Button } from '@/components/ui/Button';
```

### **Real-World Screen Example**

```typescript
// src/screens/crypto/CryptoListScreen.tsx
import React from 'react';
import { View, Text, FlatList } from 'react-native';

// ✅ Using @ aliases for clean imports
import { useCryptocurrencies } from '@/hooks/useCryptocurrencies';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
import { CryptoListItem } from '@/components/crypto/CryptoListItem';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatPrice, formatPercentage } from '@/utils/helpers';
import { Cryptocurrency } from '@/types';
import { COLORS } from '@/constants/theme';

export const CryptoListScreen: React.FC = () => {
  const { data: cryptos, isLoading } = useCryptocurrencies({
    vs_currency: 'usd',
    per_page: 50,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaWrapper>
      <FlatList
        data={cryptos}
        renderItem={({ item }) => (
          <CryptoListItem
            crypto={item}
            onPress={() => {/* Navigate to detail */}}
          />
        )}
        keyExtractor={(item) => item.id}
      />
    </SafeAreaWrapper>
  );
};
```

### **Service/Hook Example**

```typescript
// src/hooks/useCryptoPortfolio.ts
import { useQuery } from '@tanstack/react-query';

// ✅ Clean imports with @ alias
import { api } from '@/services/api';
import { storageService } from '@/utils/storage';
import { Portfolio, Cryptocurrency } from '@/types';
import { QUERY_KEYS } from '@/constants/config';

export const useCryptoPortfolio = () => {
  return useQuery({
    queryKey: QUERY_KEYS.portfolio,
    queryFn: async (): Promise<Portfolio> => {
      const holdings = await storageService.getItem('portfolio');
      const prices = await api.getCryptocurrencies({ 
        vs_currency: 'usd',
        ids: holdings.map(h => h.id).join(',')
      });
      
      return calculatePortfolioValue(holdings, prices);
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};
```

## 📁 Directory-Specific Aliases

### **Components**
```typescript
// Component imports
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CryptoCard } from '@/components/crypto/CryptoCard';
import { SafeAreaWrapper } from '@/components/common/SafeAreaWrapper';
```

### **Screens**
```typescript
// Screen imports  
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { CryptoListScreen } from '@/screens/crypto/CryptoListScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
```

### **Services & APIs**
```typescript
// Service imports
import { api } from '@/services/api';
import { authService } from '@/services/authService';
import { storageService } from '@/utils/storage';
```

### **Hooks**
```typescript
// Hook imports
import { useAuth } from '@/hooks/useAuth';
import { useCryptocurrencies } from '@/hooks/useCryptocurrencies';
import { useExchange } from '@/hooks/useExchange';
```

### **Types & Constants**
```typescript
// Type and constant imports
import { User, Cryptocurrency, Portfolio } from '@/types';
import { API_ENDPOINTS, COLORS } from '@/constants/config';
import { QUERY_KEYS } from '@/constants/queryKeys';
```

## 🎯 Best Practices

### **✅ Do Use @ Aliases For:**
- Cross-directory imports
- Importing from src/ root level
- Commonly used utilities, services, hooks
- Type definitions and constants
- Deep imports (3+ levels)

### **✅ Keep Relative Imports For:**
- Same directory files (`./Component`)
- Adjacent sibling files (`../utils`)
- Index file exports in same folder

### **Example Mixed Usage:**
```typescript
// src/components/crypto/CryptoCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

// ✅ Relative - same directory
import { CryptoIcon } from './CryptoIcon';
import { PriceChart } from './PriceChart';

// ✅ Alias - cross-directory
import { formatPrice } from '@/utils/helpers';
import { COLORS } from '@/constants/theme';
import { Cryptocurrency } from '@/types';
import { useNavigation } from '@/hooks/useNavigation';

export const CryptoCard: React.FC<{crypto: Cryptocurrency}> = ({ crypto }) => {
  // Component implementation
};
```

## 🚀 Migration Tips

### **Gradual Migration:**
1. Start with new files using @ aliases
2. Update imports when editing existing files
3. Use IDE find/replace for bulk updates

### **IDE Setup:**
Most IDEs automatically support the aliases once configured in `tsconfig.json`, providing:
- Auto-completion
- Go to definition
- Refactoring support

### **Team Guidelines:**
- Establish team convention for when to use aliases
- Include examples in code review guidelines
- Document patterns in team wiki/docs

---

**The "@" alias system makes your imports cleaner, more maintainable, and easier to understand at a glance!** 🎉