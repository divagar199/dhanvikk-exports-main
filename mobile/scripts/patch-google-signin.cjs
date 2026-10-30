const fs = require('fs');
const path = require('path');

const pkgDir = path.resolve(__dirname, '../node_modules/@react-native-google-signin/google-signin');
const modDir = path.join(pkgDir, 'lib/module');

if (!fs.existsSync(pkgDir)) {
  process.exit(0);
}

try {
  // 1. Ensure package.json exports contains ./app.plugin
  const pkgJsonPath = path.join(pkgDir, 'package.json');
  if (fs.existsSync(pkgJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
    if (pkg.exports && !pkg.exports['./app.plugin']) {
      pkg.exports['./app.plugin'] = './app.plugin.js';
      fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
      console.log('[patch-google-signin] Patched package.json exports to include ./app.plugin');
    }
  }

  if (fs.existsSync(modDir)) {
    // 2. Fix index.js
    const indexPath = path.join(modDir, 'index.js');
    if (fs.existsSync(indexPath)) {
      let indexCode = fs.readFileSync(indexPath, 'utf8');
      indexCode = indexCode
        .replace("from './signIn/GoogleSignin'", "from './signIn/GoogleSignin.js'")
        .replace("from './errors/errorCodes'", "from './errors/errorCodes.js'")
        .replace("from './buttons/GoogleSigninButton'", "from './buttons/GoogleSigninButton.js'");
      fs.writeFileSync(indexPath, indexCode, 'utf8');
    }

    // 3. Fix signIn/GoogleSignin.js
    const googleSigninPath = path.join(modDir, 'signIn/GoogleSignin.js');
    if (fs.existsSync(googleSigninPath)) {
      let googleSigninCode = fs.readFileSync(googleSigninPath, 'utf8');
      googleSigninCode = googleSigninCode.replace("from '../errors/errorCodes'", "from '../errors/errorCodes.js'");
      fs.writeFileSync(googleSigninPath, googleSigninCode, 'utf8');
    }

    // 4. Fix translateNativeRejection.js
    const transPath = path.join(modDir, 'translateNativeRejection.js');
    if (fs.existsSync(transPath)) {
      let transCode = fs.readFileSync(transPath, 'utf8');
      transCode = transCode.replace("from './errors/errorCodes'", "from './errors/errorCodes.js'");
      fs.writeFileSync(transPath, transCode, 'utf8');
    }

    // 5. Create spec/SignInButtonNativeComponent.js if missing
    const specJsPath = path.join(modDir, 'spec/SignInButtonNativeComponent.js');
    if (!fs.existsSync(specJsPath)) {
      const specJsCode = `"use strict";
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
export default codegenNativeComponent('RNGoogleSigninButton');
`;
      fs.writeFileSync(specJsPath, specJsCode, 'utf8');
    }

    // 6. Fix buttons/GoogleSigninButton.js
    const btnPath = path.join(modDir, 'buttons/GoogleSigninButton.js');
    if (fs.existsSync(btnPath)) {
      let btnCode = fs.readFileSync(btnPath, 'utf8');
      btnCode = btnCode.replace("from '../spec/SignInButtonNativeComponent'", "from '../spec/SignInButtonNativeComponent.js'");
      fs.writeFileSync(btnPath, btnCode, 'utf8');
    }
  }

  console.log('[patch-google-signin] Successfully patched @react-native-google-signin/google-signin.');
} catch (err) {
  console.warn('[patch-google-signin] Patch skipped or failed:', err.message);
}
