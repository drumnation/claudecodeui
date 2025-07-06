# 📊 Generate Test Data

**Purpose:** Create realistic, maintainable test data, fixtures, and mocks for comprehensive testing scenarios.

**Use when:** You need test data for new tests, want to improve existing test data quality, or need to create comprehensive test scenarios.

## Instructions:

### 1. **Test Data Strategy**

#### **Data Types Analysis**
- **Static Fixtures**: Unchanging reference data (countries, categories, etc.)
- **Dynamic Test Data**: User profiles, transactions, time-sensitive data
- **Edge Case Data**: Boundary values, error conditions, unusual inputs
- **Relationship Data**: Connected entities with foreign keys and associations

#### **Data Generation Approaches**
```javascript
// Factory Pattern (Recommended)
const userFactory = {
  build: (overrides = {}) => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    createdAt: faker.date.recent(),
    ...overrides
  }),
  
  buildMany: (count, overrides = {}) => 
    Array.from({ length: count }, () => userFactory.build(overrides))
};

// Builder Pattern for Complex Data
const orderBuilder = {
  default: () => ({
    id: faker.string.uuid(),
    userId: null,
    items: [],
    total: 0,
    status: 'pending'
  }),
  
  withUser: function(user) {
    this.data.userId = user.id;
    return this;
  },
  
  withItems: function(items) {
    this.data.items = items;
    this.data.total = items.reduce((sum, item) => sum + item.price, 0);
    return this;
  },
  
  build: function() {
    return { ...this.data };
  }
};
```

### 2. **Faker.js Integration**

#### **Setup and Configuration**
```javascript
// tests/factories/setup.ts
import { faker } from '@faker-js/faker';

// Seed for reproducible tests
faker.seed(123);

// Custom providers
faker.addProvider({
  name: 'customBusiness',
  module: {
    productSku: () => `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
    businessEmail: () => faker.internet.email({ provider: 'business.com' }),
    department: () => faker.helpers.arrayElement([
      'Engineering', 'Marketing', 'Sales', 'Support', 'HR'
    ])
  }
});
```

#### **Domain-Specific Factories**
```javascript
// tests/factories/user.factory.ts
export const userFactory = {
  admin: () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: 'admin',
    permissions: ['read', 'write', 'delete'],
    isActive: true,
    lastLogin: faker.date.recent()
  }),
  
  customer: () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: 'customer',
    subscriptionTier: faker.helpers.arrayElement(['free', 'pro', 'enterprise']),
    isActive: faker.datatype.boolean(),
    registeredAt: faker.date.past()
  }),
  
  withProfile: (baseUser) => ({
    ...baseUser,
    profile: {
      avatar: faker.image.avatar(),
      bio: faker.lorem.paragraph(),
      location: faker.location.city(),
      website: faker.internet.url()
    }
  })
};
```

### 3. **Database Seeders**

#### **SQL Database Seeding**
```javascript
// tests/seeders/database.seeder.ts
import { db } from '../database-setup';

export class DatabaseSeeder {
  static async seedUsers(count = 10) {
    const users = userFactory.buildMany(count);
    
    return await db.transaction(async (trx) => {
      const insertedUsers = await trx('users').insert(users).returning('*');
      
      // Seed related data
      for (const user of insertedUsers) {
        if (user.role === 'customer') {
          await this.seedUserOrders(trx, user.id, faker.number.int({ min: 0, max: 5 }));
        }
      }
      
      return insertedUsers;
    });
  }
  
  static async seedUserOrders(trx, userId, count) {
    const orders = Array.from({ length: count }, () => ({
      id: faker.string.uuid(),
      userId,
      total: faker.commerce.price({ min: 10, max: 500 }),
      status: faker.helpers.arrayElement(['pending', 'completed', 'cancelled']),
      createdAt: faker.date.past()
    }));
    
    return await trx('orders').insert(orders).returning('*');
  }
  
  static async clearDatabase() {
    await db.raw('TRUNCATE TABLE orders, users RESTART IDENTITY CASCADE');
  }
}
```

#### **MongoDB Test Data**
```javascript
// tests/seeders/mongo.seeder.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

export class MongoSeeder {
  static async setupInMemoryDb() {
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    return mongod;
  }
  
  static async seedCollections() {
    const users = userFactory.buildMany(20);
    const products = productFactory.buildMany(50);
    
    await Promise.all([
      User.insertMany(users),
      Product.insertMany(products)
    ]);
    
    // Create relationships
    const orders = users.slice(0, 10).map(user => ({
      userId: user.id,
      items: faker.helpers.arrayElements(products, { min: 1, max: 5 }),
      total: faker.commerce.price({ min: 20, max: 200 }),
      createdAt: faker.date.recent()
    }));
    
    await Order.insertMany(orders);
  }
}
```

### 4. **API Response Mocks**

#### **MSW (Mock Service Worker) Handlers**
```javascript
// tests/mocks/api.handlers.ts
import { http, HttpResponse } from 'msw';
import { userFactory, productFactory } from '../factories';

export const apiHandlers = [
  // Dynamic user list with query support
  http.get('/api/users', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const role = url.searchParams.get('role');
    
    let users = userFactory.buildMany(limit);
    if (role) {
      users = users.map(user => ({ ...user, role }));
    }
    
    return HttpResponse.json({
      data: users,
      pagination: {
        page,
        limit,
        total: 100,
        pages: Math.ceil(100 / limit)
      }
    });
  }),
  
  // Realistic error responses
  http.get('/api/users/:id', ({ params }) => {
    const { id } = params;
    
    if (id === 'not-found') {
      return HttpResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    if (id === 'server-error') {
      return HttpResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
    
    return HttpResponse.json(userFactory.build({ id }));
  }),
  
  // File upload simulation
  http.post('/api/upload', async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    return HttpResponse.json({
      filename: file.name,
      size: file.size,
      url: `https://example.com/uploads/${faker.string.uuid()}-${file.name}`
    });
  })
];
```

### 5. **Fixture Files**

#### **JSON Fixtures**
```javascript
// tests/fixtures/products.json
{
  "electronics": [
    {
      "id": "prod-001",
      "name": "Laptop Pro 15",
      "category": "electronics",
      "price": 1299.99,
      "inStock": true,
      "specifications": {
        "cpu": "Intel i7",
        "memory": "16GB",
        "storage": "512GB SSD"
      }
    }
  ],
  "clothing": [
    {
      "id": "prod-002",
      "name": "Cotton T-Shirt",
      "category": "clothing",
      "price": 29.99,
      "inStock": true,
      "sizes": ["S", "M", "L", "XL"]
    }
  ]
}
```

#### **Fixture Loading Utilities**
```javascript
// tests/utils/fixtures.ts
import fs from 'fs';
import path from 'path';

export class FixtureLoader {
  static loadJson<T>(filename: string): T {
    const fixturePath = path.join(__dirname, '../fixtures', filename);
    const content = fs.readFileSync(fixturePath, 'utf-8');
    return JSON.parse(content);
  }
  
  static loadProducts(category?: string) {
    const products = this.loadJson('products.json');
    return category ? products[category] : products;
  }
  
  static loadUserScenarios() {
    return this.loadJson('user-scenarios.json');
  }
  
  // Dynamic fixture generation
  static generateOrderHistory(userId: string, count = 5) {
    return Array.from({ length: count }, (_, index) => ({
      id: `order-${userId}-${index + 1}`,
      userId,
      items: this.loadProducts('electronics').slice(0, 2),
      total: faker.commerce.price({ min: 50, max: 500 }),
      status: faker.helpers.arrayElement(['completed', 'pending', 'shipped']),
      orderDate: faker.date.past()
    }));
  }
}
```

### 6. **Advanced Test Scenarios**

#### **State-Based Test Data**
```javascript
// tests/scenarios/user-journey.ts
export const userJourneyScenarios = {
  newUser: () => ({
    user: userFactory.customer(),
    cart: [],
    orders: [],
    preferences: {
      notifications: true,
      newsletter: false
    }
  }),
  
  activeCustomer: () => {
    const user = userFactory.customer();
    return {
      user,
      cart: productFactory.buildMany(2),
      orders: orderFactory.buildMany(3, { userId: user.id, status: 'completed' }),
      preferences: {
        notifications: true,
        newsletter: true,
        favoriteCategories: ['electronics', 'books']
      }
    };
  },
  
  premiumUser: () => {
    const user = userFactory.customer({ subscriptionTier: 'enterprise' });
    return {
      user,
      cart: [],
      orders: orderFactory.buildMany(10, { userId: user.id }),
      subscription: {
        tier: 'enterprise',
        features: ['priority-support', 'advanced-analytics', 'custom-branding'],
        expiresAt: faker.date.future()
      }
    };
  }
};
```

#### **Time-Based Test Data**
```javascript
// tests/utils/time-scenarios.ts
export const timeScenarios = {
  businessHours: () => {
    faker.setDefaultRefDate('2024-01-15T14:30:00Z'); // Monday 2:30 PM
    return {
      currentTime: faker.date.recent(),
      supportAvailable: true,
      expectedResponseTime: '1 hour'
    };
  },
  
  weekend: () => {
    faker.setDefaultRefDate('2024-01-13T20:00:00Z'); // Saturday 8 PM
    return {
      currentTime: faker.date.recent(),
      supportAvailable: false,
      expectedResponseTime: '24 hours'
    };
  },
  
  holiday: () => {
    faker.setDefaultRefDate('2024-12-25T12:00:00Z'); // Christmas
    return {
      currentTime: faker.date.recent(),
      supportAvailable: false,
      shippingDelayed: true,
      expectedResponseTime: '48 hours'
    };
  }
};
```

## Expected Inputs:
- **Data Schema**: Entity types, relationships, and field requirements
- **Test Scenarios**: Specific test cases requiring data
- **Data Volume**: How much test data is needed (small dataset vs. large scale)
- **Data Relationships**: Foreign keys, associations, nested data structures
- **Edge Cases**: Boundary conditions, error states, unusual data patterns

## Expected Outputs:
- **Factory Functions**: Reusable data generators for each entity type
- **Fixture Files**: Static test data in JSON/YAML format
- **Database Seeders**: Scripts for populating test databases
- **API Mocks**: MSW handlers with realistic response data
- **Scenario Builders**: Complex test scenarios with related data
- **Data Utilities**: Helper functions for loading and manipulating test data 