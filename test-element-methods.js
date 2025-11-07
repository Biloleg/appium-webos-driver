/**
 * Quick test script to verify element methods work
 * Run this after starting an Appium session
 */

const axios = require('axios');

const APPIUM_URL = 'http://127.0.0.1:4723';
let sessionId = null;

async function createSession() {
  console.log('Creating session...');
  const response = await axios.post(`${APPIUM_URL}/session`, {
    capabilities: {
      alwaysMatch: {
        platformName: 'webos',
        'appium:deviceName': '43UT81006LA.BDRYLJP',
        'appium:deviceHost': '192.168.1.177',
        'appium:appId': 'com.webos.app.home',
        'appium:useSecureWebsocket': true
      }
    }
  });
  sessionId = response.data.value.sessionId;
  console.log('Session created:', sessionId);
  return sessionId;
}

async function findElement() {
  console.log('\nFinding element...');
  const response = await axios.post(`${APPIUM_URL}/session/${sessionId}/element`, {
    using: 'css selector',
    value: 'body'
  });
  const elementId = response.data.value['element-6066-11e4-a52e-4f735466cecf'] || response.data.value.ELEMENT;
  console.log('Found element:', elementId);
  return elementId;
}

async function getElementText(elementId) {
  console.log('\nGetting element text...');
  try {
    const response = await axios.get(`${APPIUM_URL}/session/${sessionId}/element/${elementId}/text`);
    console.log('Text:', response.data.value);
    return response.data.value;
  } catch (error) {
    console.error('Error getting text:', error.response?.data || error.message);
  }
}

async function getElementRect(elementId) {
  console.log('\nGetting element rect...');
  try {
    const response = await axios.get(`${APPIUM_URL}/session/${sessionId}/element/${elementId}/rect`);
    console.log('Rect:', response.data.value);
    return response.data.value;
  } catch (error) {
    console.error('Error getting rect:', error.response?.data || error.message);
  }
}

async function getElementInfo(elementId) {
  console.log('\nGetting comprehensive element info...');
  try {
    const response = await axios.post(`${APPIUM_URL}/session/${sessionId}/execute/sync`, {
      script: 'webos: getElementInfo',
      args: [{elementId}]
    });
    console.log('Element Info:', JSON.stringify(response.data.value, null, 2));
    return response.data.value;
  } catch (error) {
    console.error('Error getting element info:', error.response?.data || error.message);
  }
}

async function clickElement(elementId) {
  console.log('\nClicking element...');
  try {
    const response = await axios.post(`${APPIUM_URL}/session/${sessionId}/element/${elementId}/click`);
    console.log('Click result:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error clicking:', error.response?.data || error.message);
  }
}

async function deleteSession() {
  console.log('\nDeleting session...');
  await axios.delete(`${APPIUM_URL}/session/${sessionId}`);
  console.log('Session deleted');
}

async function main() {
  try {
    await createSession();
    const elementId = await findElement();
    await getElementText(elementId);
    await getElementRect(elementId);
    await getElementInfo(elementId);
    // await clickElement(elementId);
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  } finally {
    if (sessionId) {
      await deleteSession();
    }
  }
}

main();
