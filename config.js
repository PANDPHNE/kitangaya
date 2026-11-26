/* ✏️ Shop details shown on the site. Leave a value empty ('') to hide it. */
window.KA_CONFIG = {
  SHOP_NAME: 'Kitang Aya Phoneshop',
  MESSENGER: 'https://m.me/mainkitangayaphoneshop',
  FACEBOOK: 'https://www.facebook.com/share/1CeWASfwPJ/',
  HUB_GROUP: '',                 // Kitang Aya Inventory Hub (Facebook group) link
  PHONE: '+639692802791',        // Call and Text buttons
  PHONE_SHOW: '0969 280 2791',
  ADDRESS: 'Batasan Hills, Quezon City, Metro Manila',
  // assurance shown on every phone (keep these true)
  PROMISES: ['✅ Checked & tested', '🛡️ Up to 7-day warranty', '🚚 Ships in 24–48 hrs', '💳 GCash · Maya · BDO · Cash'],
  // inquiry form (Google Form → INQUIRIES tab). Filled in by Claude after setup.
  FORM: { action: 'https://docs.google.com/forms/d/e/1FAIpQLSdYt8Zf8fqAzPtGc0ZI1j_s50VfQwGDCIhcG9qcmB9wWVzrjw/formResponse',
    code: 'entry.1861826435', name: 'entry.1895610843', mobile: 'entry.1227015568', fb: 'entry.1216042472', want: 'entry.82969421', msg: 'entry.273748800', page: 'entry.550005977' },
  REVIEWS: 'https://www.facebook.com/mainkitangayaphoneshop/reviews/?id=100083552312933&sk=reviews',   // ✏️ link to the page's Reviews tab
  // GET NOW ordering (Nov 26) — ✏️ fill in the account names / numbers; QR: put the image in assets/ and write its path
  ORDER: {
    URL: 'https://script.google.com/macros/s/AKfycbxFmJxdZWesOuxkmwSth_YbGZWT2OnmVN03HBj4MbsPedfIdd1JKpUaL2GaRq9pbpQM/exec',
    TNC_PREVIEW: 'https://drive.google.com/file/d/1biVzLeoLbPbtP6BYgCHx0muDPukDu2WB/preview',
    PAGE: 'https://www.facebook.com/mainkitangayaphoneshop',
    PAY: [
      { label: 'GCASH 1', kind: 'gcash', name: 'Daphne Joy B. Tan', number: '0935 762 3410', qr: 'assets/qr-gcash1.jpg' },
      { label: 'GCASH 3', kind: 'gcash', name: 'Abdul Raafy Bocua', number: '0931 141 3574', qr: 'assets/qr-gcash3.jpg' },
      { label: 'MAYA 1', kind: 'maya', name: 'Daphne Joy Tan', number: '0935 762 3410', qr: 'assets/qr-maya1.jpg' },
      { label: 'MAYA 2', kind: 'maya', name: 'Abdul Raafy Bocua', number: '0931 141 3574', qr: '' },
      { label: 'BDO', kind: 'bank', name: 'Abdul Raafy M. Bocua', number: '002210564553', qr: '' }
    ],
    VLOGS: []   // ✏️ Facebook video links of your viral vlogs, e.g. 'https://www.facebook.com/watch/?v=123'
  }
};
