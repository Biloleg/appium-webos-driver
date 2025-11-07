# Appium Inspector - Element Attributes Guide

## Overview

This driver now implements **ALL** W3C WebDriver element inspection endpoints required by Appium Inspector to display complete element information.

## What Was Added/Fixed

### 1. Element State Methods
- ✅ **`elementEnabled(elementId)`** - Checks if element is enabled (not disabled)
- ✅ **`elementSelected(elementId)`** - Checks if checkbox/radio/option is selected  
- ✅ **`elementDisplayed(elementId)`** - Checks if element is visible

### 2. Element Property Methods  
- ✅ **`getAttribute(name, elementId)`** - Gets HTML attributes with smart fallback for x/y/width/height
- ✅ **`getProperty(name, elementId)`** - Gets JavaScript properties (NEW!)
- ✅ **`getName(elementId)`** - Gets element tag name
- ✅ **`getText(elementId)`** - Gets element text content
- ✅ **`getCssProperty(propertyName, elementId)`** - Gets computed CSS values

### 3. Dimensional Methods
- ✅ **`getSize(elementId)`** - Gets element width and height
- ✅ **`getLocation(elementId)`** - Gets element x and y coordinates  
- ✅ **`getElementRect(elementId)`** - Gets complete rect (x, y, width, height)

## Difference: getAttribute vs getProperty

### getAttribute(name, elementId)
- Returns **HTML attributes** as they appear in the HTML source
- Examples: `id`, `class`, `href`, `src`, `data-*` attributes
- Returns `null` if attribute doesn't exist
- For dimensional attributes (`x`, `y`, `width`, `height`), falls back to computed values from `getBoundingClientRect()`

```javascript
// HTML: <button id="btn" class="primary" disabled>
await driver.getAttribute('id', elementId);      // Returns: "btn"
await driver.getAttribute('class', elementId);   // Returns: "primary"
await driver.getAttribute('disabled', elementId); // Returns: "true"
await driver.getAttribute('href', elementId);    // Returns: null (doesn't exist)
```

### getProperty(name, elementId)  
- Returns **JavaScript properties** of the DOM element object
- Examples: `value`, `checked`, `disabled`, `innerHTML`, `textContent`
- Returns `null` if property doesn't exist
- Properties can have different values than attributes

```javascript
// HTML: <input type="text" value="initial">
// User types "hello" in the input

await driver.getAttribute('value', elementId);  // Returns: "initial" (HTML attribute)
await driver.getProperty('value', elementId);   // Returns: "hello" (current JS property)
await driver.getProperty('checked', elementId); // Returns: true/false (for checkboxes)
await driver.getProperty('innerHTML', elementId); // Returns: inner HTML content
```

## What Appium Inspector Will Now Show

When you select an element in Appium Inspector, you should see:

### 📍 Bounds/Position Section
- `x`: Horizontal position (number)
- `y`: Vertical position (number)
- `width`: Element width (number)
- `height`: Element height (number)

### 🏷️ Element Info Section  
- `tagName`: HTML tag (e.g., "div", "button")
- `text`: Visible text content

### ✅ State Section
- `isDisplayed`: Whether element is visible (true/false)
- `isEnabled`: Whether element is enabled (true/false)  
- `isSelected`: Whether element is selected - for checkboxes/radios (true/false)

### 📋 Attributes Section
All HTML attributes like:
- `id`
- `class`  
- `name`
- `href`
- `src`
- `data-*` custom attributes
- Any other HTML attribute

### 🎨 Properties Section (if Inspector supports)
JavaScript properties like:
- `value` (current value for inputs)
- `checked` (checkbox state)
- `disabled` (form control state)
- `innerHTML`
- `textContent`

### 🎨 CSS Section (if Inspector supports)
- `color`
- `font-size`
- `display`
- `background-color`
- Any CSS property via `getCssProperty()`

## How to Use

### 1. Restart Appium Server
```bash
# Stop current server (Ctrl+C)
# Then restart
appium
```

### 2. Start New Inspector Session
- Close existing Inspector session
- Create new session with your capabilities:
```json
{
  "platformName": "webOS",
  "automationName": "webOS",
  "deviceName": "LG TV",
  "app": "com.webos.app.livetv",
  "appium:useSecureWebsocket": true
}
```

### 3. Inspect Elements
- Click on any element in your app
- Inspector will fetch all properties using the methods above
- All sections should now be populated with data

## Example Inspector Data

When you click on a button element:

```
Tag: button
Text: "Click Me"

Bounds:
  x: 100
  y: 200  
  width: 120
  height: 40

State:
  isDisplayed: true
  isEnabled: true
  isSelected: false

Attributes:
  id: "submit-btn"
  class: "primary large"
  type: "button"
  
Properties:
  disabled: false
  innerHTML: "Click Me"
  
CSS:
  color: "rgb(255, 255, 255)"
  background-color: "rgb(0, 123, 255)"
  font-size: "16px"
```

## Troubleshooting

### Still Missing Attributes?

1. **Check which section** you're looking at:
   - Bounds = positional data (x, y, width, height)
   - Attributes = HTML attributes
   - Properties = JavaScript properties  
   - State = enabled/selected/displayed

2. **Verify HTML source**: Some elements simply don't have many attributes. Example:
   ```html
   <div>Text</div>  
   <!-- Only has: tagName="div", text="Text" -->
   
   <button id="btn" class="primary" aria-label="Submit">
   <!-- Has: tagName, id, class, aria-label, text, etc. -->
   ```

3. **Check Appium logs**: Look for method calls from Inspector:
   ```
   [getAttribute] Getting attribute "id" for element ...
   [getProperty] Getting property "value" for element ...
   [getCssProperty] Getting CSS property "color" for element ...
   ```

### Inspector Shows "undefined" or Errors?

- Verify you restarted Appium server after rebuilding the driver
- Check that your Inspector version is recent (2024+)
- Try different elements - some may have more properties than others

## W3C WebDriver Compliance

This driver now implements all required W3C WebDriver endpoints:

| Endpoint | Method | Status |
|----------|--------|--------|
| /element/{id}/text | GET | ✅ Implemented |
| /element/{id}/name | GET | ✅ Implemented |
| /element/{id}/rect | GET | ✅ Implemented |
| /element/{id}/enabled | GET | ✅ Implemented |
| /element/{id}/selected | GET | ✅ Implemented |
| /element/{id}/displayed | GET | ✅ Implemented |
| /element/{id}/attribute/{name} | GET | ✅ Implemented |
| /element/{id}/property/{name} | GET | ✅ Implemented (NEW!) |
| /element/{id}/css/{name} | GET | ✅ Implemented |

## References

- [W3C WebDriver Specification](https://w3c.github.io/webdriver/)
- [W3C Element State Section](https://w3c.github.io/webdriver/#state)
- [Appium Inspector Documentation](https://github.com/appium/appium-inspector)

---

**Last Updated:** 2025-11-07
**Driver Version:** 1.0.1
