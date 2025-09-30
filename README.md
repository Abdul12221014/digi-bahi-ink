# DigBahi - Professional Accounting for Indian SMEs

> Tablet-based accounting software with pen input, GST compliance, and offline capability. Built as a Progressive Web App for Indian small businesses.

## 🌟 Features

### Core Functionality
- ✅ **PIN-based Authentication** - Secure role-based access (Owner/Accountant/Employee)
- ✅ **Pen Input Canvas** - Traditional handwriting feel with TensorFlow.js OCR ready
- ✅ **Digital Ledger** - Professional table view for all transactions
- ✅ **GST Compliance** - Automatic calculation with official slabs (0%, 5%, 12%, 18%, 28%)
- ✅ **Transaction Types** - Sales, Purchases, Expenses, Receipts
- ✅ **Dashboard Analytics** - Real-time P&L, GST summary, business insights
- ✅ **Offline-First** - Works without internet using IndexedDB with encryption
- ✅ **Mobile-Optimized** - Responsive design for tablets and phones

### Enhanced Features
- ✅ **PDF Exports** - P&L statements, GST reports, and ledger summaries
- ✅ **CSV Export** - Export ledger data for Tally/Excel import
- ✅ **Multi-lingual** - English and Hindi (हिन्दी) support
- ✅ **UPI Integration** - Payment reconciliation stubs (demo mode)
- ✅ **WhatsApp Billing** - Generate and share invoices via WhatsApp
- ✅ **Credit Management** - Track receivables with OTP-based customer consent

## 🚀 Quick Start

### Demo Credentials
- **Username:** `demo`
- **PIN:** `1234`

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Visit `http://localhost:8080` in your browser.

## 📱 Installing as a PWA

### On Android Tablet/Phone
1. Open the app in Chrome browser
2. Tap the menu (⋮) and select "Add to Home Screen"
3. The app will install like a native app
4. Launch from your home screen for fullscreen experience

### On iOS/iPad
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. The app installs as a web app

### On Desktop (Chrome/Edge)
1. Click the install icon (⊕) in the address bar
2. Or go to Settings → Install DigBahi
3. The app opens as a standalone window

## 🎨 Design System

DigBahi uses a professional Indian business aesthetic:
- **Primary Green** (`#2d7a4a`) - Trust, growth, prosperity
- **Secondary Gold** (`#e8b923`) - Premium, traditional
- **Ledger Paper** - Traditional accounting book feel
- **Touch-Optimized** - 44px minimum touch targets
- **Semantic Tokens** - All colors defined in design system

## 📊 Usage Guide

### Adding Transactions

#### Method 1: Pen Input (Recommended)
1. Click "Pen Input" button
2. Write transaction details on the canvas (e.g., "Sale 1000 2025-09-30")
3. Click "Recognize" to convert handwriting
4. Review and save the entry

#### Method 2: Form Entry
1. Go to "Ledger" tab
2. Click "New Entry"
3. Fill in date, description, amount, type, and GST rate
4. Preview the GST calculation
5. Click "Save Entry"

### Viewing Reports
1. Navigate to "Reports" tab
2. Export professional PDF reports:
   - **P&L Statement** - Income vs. expenses with net profit/loss
   - **GST Report** - Collected vs. paid with net liability for filing
   - **Ledger Summary** - Complete transaction history
3. Export to CSV for Tally/Excel import

### UPI Integration (Demo Mode)
1. Go to "UPI" tab
2. Enter UPI ID and amount
3. Click "Reconcile Transaction" to match with ledger

### WhatsApp Billing
1. Navigate to "WhatsApp" tab
2. Select bill type (Invoice/Receipt)
3. Enter amount and customer 10-digit phone number
4. Click "Share via WhatsApp" to generate PDF and share

### Credit Management
1. Go to "Credit" tab
2. Enter customer name and credit amount
3. Request customer OTP for consent
4. Verify OTP and record credit sale
5. Track pending payments and mark as paid

### Language Switching
1. Click language selector in header (Globe icon)
2. Choose English or हिन्दी (Hindi)
3. All UI labels update instantly

### Managing Ledger
1. Go to "Ledger" tab
2. View all transactions in chronological order
3. Filter by transaction type (colored badges)
4. Edit or delete entries as needed

## 🔒 Security Features

- **Local Storage** - All data stored in encrypted IndexedDB
- **PIN Authentication** - SHA-256 hashed PINs
- **Role-Based Access** - Owner, Accountant, Employee roles
- **Session Management** - Secure session storage
- **No Cloud Dependency** - Data never leaves your device

## 🛠️ Technical Stack

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS with custom design system
- **UI Components:** shadcn/ui (customized)
- **Database:** Dexie.js (IndexedDB wrapper) with Web Crypto encryption
- **OCR:** TensorFlow.js (model loading required for production)
- **PDF Generation:** jsPDF for reports and invoices
- **File Export:** FileSaver for CSV downloads
- **Internationalization:** i18next + react-i18next
- **Icons:** Lucide React
- **PWA:** Service Workers + Web Manifest

## 📋 System Requirements

### Minimum Hardware
- **CPU:** Dual-core processor
- **RAM:** 1GB available
- **Storage:** 100MB free space
- **Screen:** 7" display (1024x600)

### Recommended Hardware
- **CPU:** Quad-core processor
- **RAM:** 2GB available
- **Storage:** 500MB free space
- **Screen:** 10" tablet (1920x1200)
- **Input:** Stylus/pen support

### Browser Support
- Chrome/Edge 90+
- Safari 14+
- Firefox 88+

## 🌐 Deployment

### Deploy to Production

```bash
# Build optimized production bundle
npm run build

# Test production build locally
npm run preview

# Deploy to your hosting provider
# (Upload contents of 'dist' folder)
```

### Hosting Options
- **Lovable Cloud** - One-click deployment
- **Netlify** - Drag & drop deployment
- **Vercel** - Git-based deployment
- **GitHub Pages** - Free hosting for public repos

## 📖 GST Compliance

DigBahi implements official Indian GST tax slabs:
- **0%** - Essential goods (grains, dairy, healthcare)
- **5%** - Household necessities (sugar, tea, edible oils)
- **12%** - Processed foods, business services
- **18%** - Most goods and services (standard rate)
- **28%** - Luxury goods (cars, tobacco, premium items)

### GST Features
- Automatic tax calculation on all transactions
- GST-compliant PDF invoice generation
- Separate tracking of Output Tax (collected) vs. Input Tax Credit (paid)
- Net GST liability calculation for portal filing
- Export GST reports to PDF for GSTIN filing
- GSTIN integration (coming in future updates)

## 🧪 Testing

```bash
# Run tests (when available)
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## 🤝 Target Audience

### Personas (from Product Brief)

**Ramesh Kumar** (42, Retail Owner)
- Needs: Simple pen input, GST compliance
- Pain: Desktop software costs and complexity
- Solution: DigBahi's tablet + pen interface

**Priya Sharma** (30, Freelance Consultant)
- Needs: Portable accounting tool
- Pain: Limited mobile app features
- Solution: DigBahi's professional PWA

**Amit Patel** (38, Manufacturing SME)
- Needs: Secure, scalable GST/UPI integration
- Pain: Data security and hardware costs
- Solution: DigBahi's offline-first approach

## 📄 License

© 2025 DigBahi Accounting Solutions LLP. All rights reserved.

## 🗺️ Roadmap

### Completed (MVP)
- ✅ PIN authentication with role management
- ✅ Canvas pen input with OCR stub
- ✅ Digital ledger with CRUD operations
- ✅ GST calculator (0%, 5%, 12%, 18%, 28%)
- ✅ Dashboard analytics (P&L, GST, insights)
- ✅ Offline IndexedDB storage with encryption
- ✅ PWA installable on all platforms
- ✅ TensorFlow.js OCR integration (model loading required)
- ✅ PDF exports (P&L, GST reports, ledger)
- ✅ CSV export for Tally/Excel
- ✅ UPI/WhatsApp/Credit management (demo stubs)
- ✅ English and Hindi localization

### Next Steps
- [ ] Load TensorFlow.js handwriting recognition model (MNIST/IAM)
- [ ] Optimize for low-spec tablets (<2GB RAM, quad-core CPU)
- [ ] Real UPI API integration (PhonePe/GooglePay sandbox)
- [ ] WhatsApp Business API for automated billing
- [ ] Service Worker for advanced offline caching
- [ ] Cloud sync for multi-device (optional Lovable Cloud)
- [ ] Advanced reports (Balance Sheet, Cash Flow Statement)
- [ ] GSTIN management and e-filing portal integration
- [ ] Video tutorials and in-app help documentation
- [ ] Regional languages (Tamil, Telugu, Marathi, Bengali)

## 🆘 Support

For issues or questions:
- Email: support@digbahi.in
- Documentation: [https://docs.digbahi.in](https://docs.digbahi.in)
- Community: [https://community.digbahi.in](https://community.digbahi.in)

---

**Built with ❤️ for Indian SMEs**

*Empowering businesses with affordable, professional accounting.*
