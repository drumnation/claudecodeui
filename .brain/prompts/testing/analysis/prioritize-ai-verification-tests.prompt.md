# 🤖 Prioritize AI Verification Tests

**Purpose:** Identify and prioritize tests that enable AI to reliably verify that application functionality is actually working, supporting recursive improvement cycles in AI-assisted development.

**Use when:** You want to optimize your test suite for AI-assisted development, ensure tests provide meaningful functionality verification, or improve the AI feedback loop for code changes.

## 🎯 Core Principle

**AI Verification Goal**: Tests should answer "Is this feature actually working?" not "Is this code implemented correctly?"

When AI fixes code and runs tests, passing tests should guarantee the feature works for real users. Failing tests should indicate actual broken functionality, not implementation details.

## Instructions:

### 1. **AI Verification Test Criteria**

#### **High-Value AI Verification Tests**
Tests that provide clear, reliable signals about actual functionality:

```javascript
// ✅ HIGH VALUE: Verifies actual user workflow
test('user can complete purchase flow', async () => {
  await loginAsUser();
  await addItemToCart();
  await proceedToCheckout();
  await enterPaymentDetails();
  await submitOrder();
  
  // Verifies the feature actually works end-to-end
  expect(await getOrderConfirmation()).toContain('Order confirmed');
  expect(await getUserOrders()).toHaveLength(1);
});

// ✅ HIGH VALUE: Verifies API functionality that matters
test('search returns relevant results', async () => {
  const response = await api.search('laptop');
  
  // Tests actual behavior users care about
  expect(response.results).toHaveLength.greaterThan(0);
  expect(response.results[0]).toMatchObject({
    title: expect.stringContaining('laptop'),
    price: expect.any(Number),
    available: true
  });
});
```

#### **Low-Value AI Verification Tests**
Tests that don't help AI verify functionality:

```javascript
// ❌ LOW VALUE: Tests implementation, not functionality
test('component state updates correctly', () => {
  const component = mount(<SearchComponent />);
  component.setState({ query: 'test' });
  expect(component.state.query).toBe('test');
});

// ❌ LOW VALUE: Everything mocked, no real verification
test('service calls the right method', () => {
  const mockRepo = jest.fn();
  const service = new UserService(mockRepo);
  service.getUser(1);
  expect(mockRepo).toHaveBeenCalledWith(1);
});
```

### 2. **Test Suite Analysis Framework**

#### **Categorize Existing Tests**
Analyze your test suite and categorize each test:

```bash
# Run this analysis on your test files
find . -name "*.test.*" -o -name "*.spec.*" | head -20
```

**Categories:**
1. **🟢 AI Verification Tests**: Verify actual working functionality
2. **🟡 Partial Verification**: Some real verification, but could be improved
3. **🔴 Implementation Tests**: Test code structure, not functionality
4. **🟠 Mock-Heavy Tests**: Too abstracted to verify real behavior

#### **Evaluation Questions for Each Test**
```javascript
// For each test, ask:
// 1. If this test passes, am I confident the feature works for users?
// 2. If this test fails, does it mean users can't use the feature?
// 3. Does this test verify behavior users care about?
// 4. Can AI rely on this test to know if a feature is working?

test('example test', () => {
  // Analysis:
  // ✅ Verifies user-facing behavior? 
  // ✅ Failure indicates broken functionality?
  // ✅ Success indicates working feature?
  // ✅ Minimal mocking of critical paths?
});
```

### 3. **Prioritization Strategy**

#### **Tier 1: Critical AI Verification Tests**
Tests that enable AI to verify core functionality:

- **Authentication flows** (login, logout, permissions)
- **Core business workflows** (purchase, signup, data submission)
- **API endpoints** that power user features
- **Database operations** for critical data
- **Integration points** between services

#### **Tier 2: Feature-Specific Verification**
Tests that verify specific features work:

- **Form submissions** with validation
- **Search and filtering** functionality
- **Data display** and formatting
- **Navigation** and routing
- **Error handling** for user scenarios

#### **Tier 3: Implementation Support**
Tests that support development but don't verify functionality:

- **Utility functions** and helpers
- **Component rendering** (without interaction)
- **Configuration** and setup
- **Edge cases** that don't affect normal usage

### 4. **Test Improvement Patterns**

#### **Convert Implementation Tests to Verification Tests**
```javascript
// ❌ Implementation-focused
test('validates email format', () => {
  expect(isValidEmail('test@example.com')).toBe(true);
  expect(isValidEmail('invalid')).toBe(false);
});

// ✅ Functionality-focused
test('user registration rejects invalid email', async () => {
  const result = await register({
    email: 'invalid-email',
    password: 'password123'
  });
  
  expect(result.success).toBe(false);
  expect(result.errors.email).toContain('valid email');
  
  // Verify user wasn't actually created
  const user = await User.findByEmail('invalid-email');
  expect(user).toBeNull();
});
```

#### **Reduce Mocking in Critical Paths**
```javascript
// ❌ Over-mocked (can't verify real functionality)
test('user service gets user data', () => {
  const mockDb = { findUser: jest.fn().mockReturnValue({ id: 1 }) };
  const service = new UserService(mockDb);
  expect(service.getUser(1)).toEqual({ id: 1 });
});

// ✅ Real verification (using test database)
test('user service retrieves actual user data', async () => {
  // Use real test database with known test data
  const testUser = await createTestUser({ name: 'John', email: 'john@test.com' });
  
  const service = new UserService(testDb);
  const user = await service.getUser(testUser.id);
  
  expect(user.name).toBe('John');
  expect(user.email).toBe('john@test.com');
});
```

#### **Add End-to-End Verification**
```javascript
// ✅ Complete workflow verification
test('user can update their profile', async () => {
  // Real user workflow from start to finish
  const user = await loginTestUser();
  
  await navigateToProfile();
  await updateProfileField('name', 'Updated Name');
  await saveProfile();
  
  // Verify the change persisted and appears in UI
  await refreshPage();
  expect(await getDisplayedName()).toBe('Updated Name');
  
  // Verify it persisted in database
  const updatedUser = await User.findById(user.id);
  expect(updatedUser.name).toBe('Updated Name');
});
```

### 5. **AI Feedback Loop Optimization**

#### **Test-Driven AI Development Cycle**
```bash
# Optimal cycle for AI development:
1. AI runs failing test to understand requirements
2. AI implements/fixes code
3. AI runs test again to verify fix
4. Test passes = feature works, test fails = try again

# Tests must reliably support this cycle
```

#### **Clear Success/Failure Signals**
```javascript
test('payment processing works correctly', async () => {
  const order = await createTestOrder();
  
  const result = await processPayment({
    orderId: order.id,
    amount: order.total,
    paymentMethod: 'test-card'
  });
  
  // Clear success indicators
  expect(result.success).toBe(true);
  expect(result.transactionId).toBeDefined();
  
  // Verify side effects that matter
  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder.status).toBe('paid');
  expect(updatedOrder.paidAt).toBeDefined();
  
  // If this passes, AI knows payment feature actually works
});
```

### 6. **Implementation Roadmap**

#### **Phase 1: Audit Current Tests**
- Categorize all tests using the framework above
- Identify gaps in AI verification coverage
- Find over-mocked tests that provide false confidence

#### **Phase 2: Enhance Existing Tests**
- Convert implementation tests to functional verification
- Reduce mocking in critical user flows
- Add assertions that verify user-facing outcomes

#### **Phase 3: Add Missing Verification**
- Create tests for critical user workflows
- Ensure all major features have AI verification tests
- Add integration tests for key system interactions

## Expected Inputs:
- **Test Suite**: Existing test files and test runner configuration
- **Core Features**: List of critical application functionality
- **User Workflows**: Key user journeys that must work
- **AI Development Goals**: What features AI will be working on

## Expected Outputs:
- **Test Prioritization**: Ranked list of tests by AI verification value
- **Gap Analysis**: Missing tests needed for AI verification
- **Improvement Plan**: Specific steps to enhance existing tests
- **AI Development Strategy**: How to structure AI development cycles around these tests
- **Success Metrics**: How to measure if tests enable effective AI verification 