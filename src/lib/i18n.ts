import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Auth
      login: 'Login',
      username: 'Username',
      pin: 'PIN',
      logout: 'Logout',
      
      // Navigation
      dashboard: 'Dashboard',
      ledger: 'Ledger',
      reports: 'Reports',
      penInput: 'Pen Input',
      
      // Ledger
      date: 'Date',
      description: 'Description',
      type: 'Type',
      amount: 'Amount',
      gst: 'GST',
      total: 'Total',
      actions: 'Actions',
      newEntry: 'New Entry',
      addEntry: 'Add Entry',
      
      // Types
      sale: 'Sale',
      purchase: 'Purchase',
      expense: 'Expense',
      receipt: 'Receipt',
      
      // Dashboard
      totalSales: 'Total Sales',
      totalPurchases: 'Total Purchases',
      totalExpenses: 'Total Expenses',
      gstCollected: 'GST Collected',
      gstPaid: 'GST Paid',
      netProfit: 'Net Profit/Loss',
      netGST: 'Net GST Liability',
      
      // Actions
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      export: 'Export',
      share: 'Share',
      
      // Messages
      success: 'Success',
      error: 'Error',
      loading: 'Loading...',
    }
  },
  hi: {
    translation: {
      // Auth
      login: 'लॉगिन',
      username: 'उपयोगकर्ता नाम',
      pin: 'पिन',
      logout: 'लॉगआउट',
      
      // Navigation
      dashboard: 'डैशबोर्ड',
      ledger: 'खाता बही',
      reports: 'रिपोर्ट',
      penInput: 'पेन इनपुट',
      
      // Ledger
      date: 'तारीख',
      description: 'विवरण',
      type: 'प्रकार',
      amount: 'राशि',
      gst: 'जीएसटी',
      total: 'कुल',
      actions: 'कार्य',
      newEntry: 'नई प्रविष्टि',
      addEntry: 'प्रविष्टि जोड़ें',
      
      // Types
      sale: 'बिक्री',
      purchase: 'खरीद',
      expense: 'व्यय',
      receipt: 'रसीद',
      
      // Dashboard
      totalSales: 'कुल बिक्री',
      totalPurchases: 'कुल खरीद',
      totalExpenses: 'कुल व्यय',
      gstCollected: 'जीएसटी एकत्रित',
      gstPaid: 'जीएसटी भुगतान',
      netProfit: 'शुद्ध लाभ/हानि',
      netGST: 'शुद्ध जीएसटी देयता',
      
      // Actions
      save: 'सहेजें',
      cancel: 'रद्द करें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      export: 'निर्यात',
      share: 'साझा करें',
      
      // Messages
      success: 'सफलता',
      error: 'त्रुटि',
      loading: 'लोड हो रहा है...',
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
