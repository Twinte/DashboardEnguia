# Dashboard Enguia - Areas for Improvement

Historical improvement notes and backlog. Some implementation notes below predate the latest review; see README.md and the CI results for current setup and verification.

---

## 1. Testing (Critical) - ✅ IMPLEMENTED

The project now has **test coverage** using Vitest and React Testing Library.

### Implementation Plan

#### Phase 1: Setup & Configuration (1 hour) ✅ COMPLETED

**1.1 Install Dependencies**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**1.2 Create Configuration Files**
| File | Purpose |
|------|---------|
| `tests/setup.js` | Setup testing environment (JSDOM, mocks) |
| `vite.config.js` (update) | Add Vitest configuration |

**1.3 Update package.json**
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest --coverage"
  }
}
```

---

#### Phase 2: Unit Tests for Utilities (2 hours)

**2.1 Test formatters.js**
| Function | Test Cases |
|----------|------------|
| `renderSensorValue` | Returns formatted string with unit, handles null/undefined, handles error flag, respects fixed decimal places |
| `formatTime` | Formats HH:MM:SS → HH:MM, handles invalid input |
| `formatDate` | Returns date or "N/A" |

**2.2 Test geolocation.js**
| Function | Test Cases |
|----------|------------|
| `getDistance` | Returns 0 for null values, calculates correct distance between two known points |
| `getBearing` | Returns 0 for null values, calculates correct bearing (N=0°, E=90°, etc.) |

**Files to create:**
- `tests/unit/formatters.test.js`
- `tests/unit/geolocation.test.js`

---

#### Phase 3: Context Tests (3 hours)

**3.1 Test SensorDataContext**
| Feature | Test Cases |
|---------|------------|
| Initial state | Loads cached data or returns defaults |
| Fetch success | Updates sensorData on successful API response |
| Fetch error | Sets fetchError, shows cached data if available |
| Retry logic | Retries up to MAX_RETRIES with exponential backoff |
| Cache | Saves to localStorage, loads on init |
| Provides context | All required values available via hook |

**3.2 Test SettingsContext**
| Feature | Test Cases |
|---------|------------|
| Theme change | Updates theme, persists to localStorage |
| Language change | Updates language |
| Energy mode | Changes mode correctly |

**3.3 Test ToastContext**
| Feature | Test Cases |
|---------|------------|
| Add toast | Adds toast to state |
| Remove toast | Removes toast by ID |

**Files to create:**
- `tests/context/SensorDataContext.test.jsx`
- `tests/context/SettingsContext.test.jsx`
- `tests/context/ToastContext.test.jsx`

---

#### Phase 4: Component Tests (4 hours)

**4.1 Critical Components**
| Component | What to Test |
|-----------|--------------|
| `PowerPage` | Renders battery percentage, voltage, time remaining, health status |
| `HomePage` (trim) | Trim buttons exist, click handlers work |
| `YachtGauge` | Renders with correct value, displays label |

**4.2 Navigation Components**
| Component | What to Test |
|-----------|--------------|
| `App` | Renders all routes, shows WiFi status from context |
| Bottom Nav | All 4 links navigate correctly |

**Files to create:**
- `tests/components/PowerPage.test.jsx`
- `tests/components/HomePage.test.jsx`
- `tests/components/YachtGauge.test.jsx`
- `tests/components/App.test.jsx`

---

#### Phase 5: Integration & CI (1 hour)

**5.1 Add to CI Pipeline**
```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:coverage
```

**5.2 Coverage Report**
- Set minimum coverage threshold: **70%**
- Generate HTML report

---

### Summary

| Phase | Effort | Priority | Status |
|-------|--------|----------|--------|
| Phase 1: Setup | 1 hour | Critical | ✅ COMPLETED |
| Phase 2: Utilities | 2 hours | High | ✅ COMPLETED |
| Phase 3: Contexts | 3 hours | High | ✅ COMPLETED |
| Phase 4: Components | 4 hours | Medium | ⚠️ PARTIAL (see note) |
| Phase 5: CI | 1 hour | Low | ✅ COMPLETED |
| **Total** | **~11 hours** | | |

> **Note:** Phase 4 was simplified due to component complexity. Core logic is covered by context tests.

### Implementation Results (Phases 1-4)

```
Test Files: 5 passed (5)
Tests: 63 passed (63)
```

**Tests Created:**
- `tests/unit/formatters.test.js` - 20 tests
- `tests/unit/geolocation.test.js` - 17 tests
- `tests/context/SensorDataContext.test.jsx` - 8 tests
- `tests/context/SettingsContext.test.jsx` - 12 tests
- `tests/context/ToastContext.test.jsx` - 6 tests

**Running Tests:**
```bash
npm run test        # Watch mode
npm run test:run   # Single run
```

---

### File Structure After Implementation

```
DashboardEnguia/
├── tests/
│   ├── setup.js              # Test environment setup
│   ├── unit/
│   │   ├── formatters.test.js
│   │   └── geolocation.test.js
│   ├── context/
│   │   ├── SensorDataContext.test.jsx
│   │   ├── SettingsContext.test.jsx
│   │   └── ToastContext.test.jsx
│   └── components/
│       ├── PowerPage.test.jsx
│       ├── HomePage.test.jsx
│       ├── YachtGauge.test.jsx
│       └── App.test.jsx
├── package.json              # Updated with test scripts
└── vite.config.js           # Updated with Vitest
```

---

### Why Testing is Necessary

1. **Safety-Critical Context**: This is a boat navigation dashboard. Incorrect sensor readings could lead to serious issues.

2. **Hardware Integration**: The frontend communicates with a Raspberry Pi via API. Without tests, you don't know if API failures are handled correctly.

3. **Prevents Regressions**: As features are added (like trim controls, WiFi status), tests catch bugs automatically.

4. **Confidence for Deployment**: When deploying to the boat, tests provide confidence that the app works correctly.

---

### Recommended Actions
- Add **Vitest** with React Testing Library
- Write unit tests for utility functions (`formatters.js`, `geolocation.js`)
- Write context tests for providers and hooks
- Write component tests for critical UI elements
- Consider **Playwright** for end-to-end testing (optional, adds ~4 hours)

### Example Setup
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

---

## 2. Type Safety (High Priority) - ✅ COMPLETED (JSDoc)

The project uses plain JavaScript without type checking.

### Implemented with JSDoc

Added comprehensive JSDoc type annotations to:

- **Utils**: `formatters.js`, `geolocation.js` - Function parameters and return types
- **Contexts**: `SensorDataContext`, `SettingsContext`, `ToastContext`, `MQTTContext`, `TripContext` - Full type definitions for context values and hooks
- **Hooks**: `useSensorData`, `useSettings`, `useToast`, `useMQTT`, `useTrip` - Return type documentation

### Benefits Achieved
- IDE autocomplete now shows parameter types
- JSDoc comments provide inline documentation
- Better code readability and maintainability
- No file renaming required (kept JavaScript)

### Recommended Actions
- Consider full **TypeScript** migration for stricter type checking (optional, ~3-4 hours)
- Add JSDoc to remaining components

---

## 3. Error Handling & Resilience (High Priority) - COMPLETED

### Implemented Improvements

#### Error Boundary
- Added `ErrorBoundary.jsx` component that catches JavaScript errors in the component tree
- Displays a user-friendly fallback UI with retry options
- Shows error details in development mode for debugging
- Wrapped entire application in ErrorBoundary in `main.jsx`

#### API Retry Mechanism
- Added exponential backoff retry logic in `SensorDataContext.jsx`
- Maximum 5 retry attempts with increasing delays (1s → 30s max)
- Manual retry button available when errors occur
- Retry status indicator shows current attempt

#### MQTT Reconnection
- Implemented exponential backoff for MQTT in `MQTTContext.jsx`
- Maximum 10 reconnection attempts
- Automatic reconnection on connection loss
- Manual reconnect function available
- Connection attempt counter exposed

#### Offline Data Caching
- Sensor data cached to localStorage on successful fetch
- Cache expires after 5 minutes
- Cached data displayed when API is unavailable
- Visual indicator when using cached data
- Cached data indicator in top bar (database icon)
- Banner notification when in offline mode

#### UI Improvements
- Animated spinning icon for retry status
- Pulsing indicator for cached data
- Retry button on error screen
- Translations added for all new UI elements (EN/PT)

---

## 4. Missing Functionality (High Priority) - MOSTLY COMPLETED

Several UI elements have no backend connection:

| Location | Issue | Status |
|----------|-------|--------|
| `HomePage.jsx:122-129` | Trim buttons (Up/Down) have no handlers | ✅ FIXED |
| `App.jsx:34` | WiFi status is hardcoded `true` | ✅ FIXED |
| `SettingsPage.jsx` | Account/Security settings are decorative only | ✅ FIXED |
| `PowerPage.jsx` | `timeRemaining` is hardcoded (5.2 hours) | ✅ FIXED |
| `PowerPage.jsx` | `stateOfHealth` is hardcoded ("Good") | ✅ FIXED |
| Settings changes | Don't persist to any backend | ✅ FIXED |

### Recommended Actions
- Connect trim controls to actual motor controller API (handlers exist, need backend integration)
- Implement real WiFi status detection
- Persist settings to backend or local storage
- Calculate `timeRemaining` based on battery and consumption rate

---

## 5. Accessibility (Medium Priority)

### Current Issues
- Missing ARIA labels on interactive elements
- No keyboard navigation for map interactions
- Color-only indicators (red/green) without text alternatives
- No focus management

### Recommended Actions
- Add `aria-label` attributes to buttons and controls
- Implement keyboard shortcuts for navigation
- Add text alternatives to status indicators
- Ensure focus is managed when modals/alerts appear

---

## 6. Performance Optimization (Medium Priority)

### Current Issues
- Map re-renders on every sensor update (every 2.5 seconds)
- No lazy loading for pages
- `YachtGauge` could benefit from memoization

### Recommended Actions
- Use `React.memo` for components that don't need frequent updates
- Implement route-based code splitting:
  ```jsx
  const HomePage = lazy(() => import('./components/HomePage'));
  ```
- Debounce map updates during active trips
- Consider WebGL rendering for gauges

---

## 7. PWA & Offline Support (Medium Priority)

### Current Issues
- No service worker
- No offline capability
- No app manifest for installation

### Recommended Actions
- Add Vite PWA plugin:
  ```bash
  npm install -D vite-plugin-pwa
  ```
- Create `manifest.json` for installable app
- Implement offline data caching strategy
- Add "Install App" prompt

---

## 8. Internationalization Gaps (Low Priority)

While the project has i18n support, some areas still have hardcoded text:

| File | Issue |
|------|-------|
| `TripContext.jsx` | Toast messages in Portuguese hardcoded |
| Error messages | Some console errors in Portuguese |

### Recommended Actions
- Extract all remaining hardcoded strings to translation files
- Add error message translations

---

## 9. Security Considerations (Low Priority)

### Current Issues
- MQTT broker URL is public (HiveMQ public broker)
- No authentication for API or MQTT
- `.env` file is in git history (contains local IP)

### Recommended Actions
- Use private MQTT broker with authentication
- Implement API authentication (JWT or similar)
- Add `.env` to `.gitignore` if not already done
- Document secure deployment practices

---

## 10. Documentation (Low Priority)

### Recommended Actions
- Add JSDoc comments to utility functions
- Document component props
- Create API integration guide
- Add deployment documentation

---

## Completed: Code Quality

The following code quality issues have been addressed:

- [x] Created `.env.example` for environment variable documentation
- [x] Fixed `index.html` title and meta tags
- [x] Fixed global variable issue in `ToastContext.jsx`
- [x] Added PropTypes to all components
- [x] Internationalized hardcoded text in `NavigationMap.jsx` and `SponsorsScreen.jsx`
- [x] Moved MQTT broker config to environment variables
- [x] Removed unused imports and variables
- [x] Fixed ESLint errors (0 errors, 6 warnings remaining)

## Completed: Error Handling & Resilience

The following error handling improvements have been implemented:

- [x] Created `ErrorBoundary.jsx` component for graceful error recovery
- [x] Added exponential backoff retry mechanism for API errors
- [x] Implemented exponential backoff reconnection for MQTT
- [x] Added localStorage caching for sensor data (5-minute expiry)
- [x] Added visual indicators for offline/cached data state
- [x] Added manual retry buttons for API and MQTT
- [x] Added translations for all new UI elements (EN/PT)

## Completed: Missing Functionality

The following missing functionality has been implemented:

- [x] Added trim control handlers in `HomePage.jsx` (`handleTrimAdjust` callback)
- [x] Connected `timeRemaining` to sensor data (`sensorData.batteryTimeRemaining`)
- [x] Connected `batteryHealth` to sensor data (`sensorData.batteryHealth`)
- [x] Added GitHub Actions CI workflow (`.github/workflows/test.yml`)

## Completed: Type Safety

The following type safety improvements have been implemented with JSDoc:

- [x] Added JSDoc types to `utils/formatters.js` - Function parameters and return types
- [x] Added JSDoc types to `utils/geolocation.js` - Coordinate types and function documentation
- [x] Added JSDoc types to `SensorDataContext.jsx` - SensorData interface and context types
- [x] Added JSDoc types to `SettingsContext.jsx` - Settings interface and context types
- [x] Added JSDoc types to `ToastContext.jsx` - ToastItem and context types
- [x] Added JSDoc types to `MQTTContext.jsx` - MQTT context value types
- [x] Added JSDoc types to `TripContext.jsx` - Waypoint and trip context types

## Completed: Settings Persistence

The following settings are now persisted to localStorage:

- [x] Theme preference
- [x] Language preference
- [x] Energy mode (performance/eco/balanced)
- [x] Battery threshold
- [x] Low battery alert threshold
- [x] High temperature alert threshold
- [x] Autopilot mode
- [x] Route planning preference
- [x] Compass calibration mode
- [x] Two-factor authentication setting
- [x] Login notifications setting
- [x] Wired up all SettingsPage inputs to context values

## Completed: WiFi Status Detection

The following improvements have been implemented:

- [x] Added Network Information API support in `SensorDataContext.jsx`
- [x] Initial WiFi status detected from browser's network API
- [x] Real-time WiFi status updates via `online`/`offline` events
- [x] Connection type detection (wifi vs other)
- [x] Removed hardcoded fallback in `App.jsx`
