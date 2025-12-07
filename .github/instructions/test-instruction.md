---
applyTo: '**'
---
# Test Generation Guidelines

## Analysis of Previous Error
The previous attempt to generate `Accounting.test.tsx` likely failed due to **Ambiguous Queries** and **Environment Configuration**. 
1.  **Ambiguity:** Generic queries like `getByText` found multiple matches (e.g., numbers appearing in both "Quick Stats" cards and the "Ledger Table", or inside the "P&L Modal"), causing `Found multiple elements` errors.
2.  **Environment:** The `document is not defined` error occurred because the test environment was not explicitly set to `jsdom` in the configuration or file header.
3.  **Syntax:** Duplicate code blocks were inserted, causing parse errors.

## Component Test Generation Checklist
*   **Rule 1: Environment Configuration [Critical]**
    *   Ensure the test file runs in a browser-like environment. Verify `vite.config.ts` has `environment: 'jsdom'` or add `// @vitest-environment jsdom` at the top of the test file.
*   **Rule 2: Router Context Wrapping [Critical]**
    *   If the component uses `useNavigate`, `Link`, or `useLocation` (like `Dashboard` or `Inventory`), **ALWAYS** wrap the component in `<MemoryRouter>` or `<BrowserRouter>` during rendering: `render(<MemoryRouter><Component /></MemoryRouter>)`.
*   **Rule 3: Robust Mock Data [Critical]**
    *   Define strictly typed mock data (e.g., `const mockGLEntries: GLEntry[] = [...]`) at the top of the file. Ensure it covers diverse scenarios (positive/negative numbers, different account codes) to test logic paths fully.
*   **Rule 4: Scoped Queries with `within`**
    *   **NEVER** rely solely on global `screen.getByText` for common values (like currency amounts). **ALWAYS** use `within(container).getByText(...)` to target specific sections (e.g., `within(statsCard)`, `within(modal)`) to avoid "Found multiple elements" errors.
*   **Rule 5: Semantic Query Priority**
    *   Prioritize queries in this order: `getByRole` (buttons, headings) > `getByLabelText` (inputs) > `getByText` (static content). Avoid `getByTestId` unless absolutely necessary.
*   **Rule 6: Interaction & State Testing**
    *   Test user flows, not just rendering. For `Accounting`, specifically test the **Modal Open/Close** flow using `fireEvent.click`. Verify the modal exists after click, and is removed after closing.
*   **Rule 7: Edge Case Coverage**
    *   Include a specific test case for **Empty States** (e.g., `glEntries={[]}`). Verify that the component renders gracefully (displays '0' or empty tables) without crashing.
*   **Rule 8: Single-Pass Generation**
    *   Generate the file content as a **single, complete code block**. Do not output partial snippets or duplicate the file structure, as this leads to syntax errors when applying the code.
*   **Rule 9: Async & Timing [Critical]**
    *   Use `await waitFor(() => expect(...))` for assertions dependent on async updates (e.g., API calls).
    *   Use `await screen.findBy*` instead of `getBy*` for elements that appear asynchronously.
    *   When using `vi.useFakeTimers()`, wrap `vi.advanceTimersByTime()` inside `act(() => { ... })` to ensure React state updates are processed.
*   **Rule 10: Global Mocks**
    *   Safely mock globals like `navigator.clipboard` or `window.location`. Store the original value in `beforeEach` and restore it in `afterEach` to prevent polluting other tests.
    *   Example: `(globalThis.navigator as any).clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };`
*   **Rule 11: Vitest Compatibility**
    *   Use `vi.spyOn` and `vi.fn()`. Avoid `jest.Mock` types; use `vi.SpyInstance` or `ReturnType<typeof vi.spyOn>` instead.
    *   Use `mockResolvedValue(val)` for async spies to avoid "function does not return a promise" errors.

## Recent Error History & Resolutions

### 1. Element Not Found (Text Broken by Markup)
*   **Error:** `Unable to find an element with the text: /CREATE TABLE test/i`
*   **Cause:** Syntax highlighting or formatting split the text into multiple `<span>` tags, causing exact text matches to fail.
*   **Resolution:** Use a **custom matcher function** with `findByText` to check `element.textContent` on the container (e.g., `<pre>`).
    ```typescript
    await screen.findByText((_, element) => element?.tagName === 'PRE' && element.textContent?.includes('snippet'));
    ```

### 2. Label/Input Association Failures
*   **Error:** `Found a label ... however no form control was found` or `Cannot read properties of undefined` when using `getAllByRole('textbox')`.
*   **Cause:** `getByLabelText` fails if `htmlFor` is missing or nesting is not recognized. `getAllByRole('textbox')` ignores `type="password"`.