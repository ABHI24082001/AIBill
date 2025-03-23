// firebaseConfig.js
import {initializeApp} from 'firebase/app';
import {getFirestore} from 'firebase/firestore';


const firebaseConfig = {
  apiKey: 'AIzaSyAyy84NIb5HrUjrnyhWJMPo5EiXovwTXAk',
  authDomain: 'aibilling.firebaseapp.com',
  projectId: 'aibilling',
  storageBucket: 'aibilling.firebasestorage.app',
  messagingSenderId: '12511767522',
  appId: '1:12511767522:android:b3b8213a10a4091d3d27bb',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {db};


