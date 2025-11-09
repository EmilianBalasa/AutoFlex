// Run this script after authenticating with Firebase CLI to deploy new security rules
// This will allow public read access to the services collection

const { exec } = require('child_process');

console.log('Deploying Firestore security rules...');
exec('firebase deploy --only firestore:rules', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.log('Firestore rules successfully deployed!');
});
