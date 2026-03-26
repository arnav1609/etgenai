
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({path: './backend/.env'});

(async () => {
  try {
    const { getSetuToken } = await import('./backend/utils/setuClient.js');
    const token = await getSetuToken();
    const payload = {
      consentDetail: {
        consentStart: new Date().toISOString(),
        consentExpiry: new Date(Date.now() + 86400000).toISOString(),
        consentMode: 'VIEW',
        fetchType: 'PERIODIC',
        consentTypes: ['TRANSACTIONS'],
        fiTypes: ['DEPOSIT'],
        DataConsumer: { id: process.env.SETU_CLIENT_ID },
        Customer: { id: '8828095695@onemoney' },
        Purpose: { code: '101', text: 'Personal Finance Management' },
        FIDataRange: { from: new Date(Date.now() - 10000000000).toISOString(), to: new Date().toISOString() },
        DataLife: { unit: 'MONTH', value: 6 },
        Frequency: { unit: 'MONTH', value: 1 }
      },
      redirectUrl: 'http://localhost/cb'
    };
    
    const res = await axios.post(process.env.SETU_BASE_URL + '/v2/consents', payload, {
      headers: {
        Authorization: 'Bearer ' + token,
        'x-product-instance-id': process.env.SETU_PRODUCT_ID,
        'Content-Type': 'application/json'
      }
    });
    console.log(res.data);
  } catch(e) {
    console.error('ERROR RESPONSE:', JSON.stringify(e.response?.data, null, 2));
  }
})();

