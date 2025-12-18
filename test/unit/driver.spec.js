import {expect} from 'chai';
import {WebOSDriver} from '../../lib/driver';

describe('WebOSDriver', () => {
  describe('executeMethodMap', () => {
    it('should have pressKey command', () => {
      expect(WebOSDriver.executeMethodMap).to.have.property('webos: pressKey');
      expect(WebOSDriver.executeMethodMap['webos: pressKey'].command).to.equal('pressKey');
      expect(WebOSDriver.executeMethodMap['webos: pressKey'].params.required).to.include('key');
    });

    it('should have listApps command', () => {
      expect(WebOSDriver.executeMethodMap).to.have.property('webos: listApps');
      expect(WebOSDriver.executeMethodMap['webos: listApps'].command).to.equal('listApps');
    });

    it('should have activeAppInfo command', () => {
      expect(WebOSDriver.executeMethodMap).to.have.property('webos: activeAppInfo');
      expect(WebOSDriver.executeMethodMap['webos: activeAppInfo'].command).to.equal('getCurrentForegroundAppInfo');
    });

    it('should have activateApp command', () => {
      expect(WebOSDriver.executeMethodMap).to.have.property('webos: activateApp');
      expect(WebOSDriver.executeMethodMap['webos: activateApp'].command).to.equal('activateApp');
      expect(WebOSDriver.executeMethodMap['webos: activateApp'].params.required).to.include('appPackage');
      expect(WebOSDriver.executeMethodMap['webos: activateApp'].params.optional).to.include('launchParams');
    });

    it('should have getElementInfo command', () => {
      expect(WebOSDriver.executeMethodMap).to.have.property('webos: getElementInfo');
      expect(WebOSDriver.executeMethodMap['webos: getElementInfo'].command).to.equal('getElementInfo');
      expect(WebOSDriver.executeMethodMap['webos: getElementInfo'].params.required).to.include('elementId');
    });
  });

  describe('isExecuteScript', () => {
    it('should identify valid webos: script names', () => {
      expect(WebOSDriver.isExecuteScript('webos: pressKey')).to.be.true;
      expect(WebOSDriver.isExecuteScript('webos: listApps')).to.be.true;
      expect(WebOSDriver.isExecuteScript('webos: activeAppInfo')).to.be.true;
      expect(WebOSDriver.isExecuteScript('webos: activateApp')).to.be.true;
      expect(WebOSDriver.isExecuteScript('webos: getElementInfo')).to.be.true;
    });

    it('should not identify invalid script names', () => {
      expect(WebOSDriver.isExecuteScript('webos: invalidCommand')).to.be.false;
      expect(WebOSDriver.isExecuteScript('randomScript')).to.be.false;
      expect(WebOSDriver.isExecuteScript('')).to.be.false;
    });
  });
});
