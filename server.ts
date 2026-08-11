import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_PRODUCTS,
  INITIAL_QUOTATIONS,
  INITIAL_ORDERS,
  INITIAL_LEADS,
  INITIAL_BRANDS,
  INITIAL_USER_PROFILES,
  INITIAL_PROMOTIONS,
  INITIAL_CALLBACKS,
  INITIAL_DEMAND_INSIGHTS,
} from './src/data/mockData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory persistent state for B2B demo session
  let productsStore = [...INITIAL_PRODUCTS];
  let quotationsStore = [...INITIAL_QUOTATIONS];
  let ordersStore = [...INITIAL_ORDERS];
  let leadsStore = [...INITIAL_LEADS];
  let brandsStore = [...INITIAL_BRANDS];
  let usersStore = [...INITIAL_USER_PROFILES];
  let promotionsStore = [...INITIAL_PROMOTIONS];
  let callbacksStore = [...INITIAL_CALLBACKS];
  let demandStore = [...INITIAL_DEMAND_INSIGHTS];

  // Initialize Gemini AI Client lazily/safely
  function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  // --- REST API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', company: 'Melala Pharmaceutical Wholesale B2B' });
  });

  // GET Products
  app.get('/api/products', (req, res) => {
    const { category, search, strategic, prescription, coldChain } = req.query;
    let filtered = [...productsStore];

    if (category && category !== 'all') {
      filtered = filtered.filter((p) => p.category === category);
    }
    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.genericName?.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.efdaRegistrationNo.toLowerCase().includes(q)
      );
    }
    if (strategic === 'true') {
      filtered = filtered.filter((p) => p.isStrategic);
    }
    if (prescription === 'true') {
      filtered = filtered.filter((p) => p.prescriptionRequired);
    }
    if (coldChain === 'true') {
      filtered = filtered.filter((p) => p.coldChain);
    }

    res.json(filtered);
  });

  // POST Product (Admin)
  app.post('/api/products', (req, res) => {
    const newProduct = {
      ...req.body,
      id: `prod-${Date.now()}`,
      sku: req.body.sku || `MEL-SKU-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    productsStore.unshift(newProduct);
    res.status(201).json(newProduct);
  });

  // GET Single Product
  app.get('/api/products/:id', (req, res) => {
    const product = productsStore.find((p) => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });

  // GET Brands
  app.get('/api/brands', (req, res) => {
    res.json(brandsStore);
  });

  // GET / POST Quotations (RFQ)
  app.get('/api/quotes', (req, res) => {
    res.json(quotationsStore);
  });

  app.post('/api/quotes', (req, res) => {
    const newQuote = {
      ...req.body,
      id: `quote-${Date.now()}`,
      quoteNumber: `MEL-RFQ-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: req.body.status || 'submitted',
    };
    quotationsStore.unshift(newQuote);
    res.status(201).json(newQuote);
  });

  app.patch('/api/quotes/:id', (req, res) => {
    const index = quotationsStore.findIndex((q) => q.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Quotation not found' });
    }
    quotationsStore[index] = {
      ...quotationsStore[index],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    res.json(quotationsStore[index]);
  });

  // GET / POST Wholesale Orders
  app.get('/api/orders', (req, res) => {
    res.json(ordersStore);
  });

  app.post('/api/orders', (req, res) => {
    const orderNumber = `MEL-ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const proFormaNumber = `PRO-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder = {
      ...req.body,
      id: `ord-${Date.now()}`,
      orderNumber,
      proFormaNumber,
      createdAt: new Date().toISOString(),
      status: req.body.status || 'pending_verification',
      paymentStatus: req.body.paymentStatus || 'pro_forma_issued',
    };
    ordersStore.unshift(newOrder);
    res.status(201).json(newOrder);
  });

  app.patch('/api/orders/:id', (req, res) => {
    const index = ordersStore.findIndex((o) => o.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Order not found' });
    }
    ordersStore[index] = {
      ...ordersStore[index],
      ...req.body,
    };
    res.json(ordersStore[index]);
  });

  // PATCH Product Feature Toggle (Admin)
  app.patch('/api/products/:id/feature', (req, res) => {
    const product = productsStore.find((p) => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const { isFeatured, promotionTag } = req.body;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;
    if (promotionTag !== undefined) product.promotionTag = promotionTag;
    res.json(product);
  });

  // GET / POST / PATCH Promotions
  app.get('/api/promotions', (req, res) => {
    res.json(promotionsStore);
  });

  app.post('/api/promotions', (req, res) => {
    const newPromo = {
      ...req.body,
      id: `promo-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      active: req.body.active ?? true,
    };
    promotionsStore.unshift(newPromo);
    res.status(201).json(newPromo);
  });

  app.patch('/api/promotions/:id', (req, res) => {
    const index = promotionsStore.findIndex((p) => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Promotion not found' });
    }
    promotionsStore[index] = {
      ...promotionsStore[index],
      ...req.body,
    };
    res.json(promotionsStore[index]);
  });

  // GET / POST Customer Leads
  app.get('/api/leads', (req, res) => {
    res.json(leadsStore);
  });

  app.post('/api/leads', (req, res) => {
    const newLead = {
      ...req.body,
      id: `lead-${Date.now()}`,
      lastContacted: new Date().toISOString().split('T')[0],
      leadStatus: req.body.leadStatus || 'NEW',
      notesLog: req.body.notesLog || [],
    };
    leadsStore.unshift(newLead);
    res.status(201).json(newLead);
  });

  app.patch('/api/leads/:id', (req, res) => {
    const index = leadsStore.findIndex((l) => l.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    leadsStore[index] = {
      ...leadsStore[index],
      ...req.body,
      lastContacted: new Date().toISOString().split('T')[0],
    };
    res.json(leadsStore[index]);
  });

  app.post('/api/leads/:id/notes', (req, res) => {
    const lead = leadsStore.find((l) => l.id === req.params.id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    const { author, note, actionType } = req.body;
    if (!note) {
      return res.status(400).json({ error: 'Note text required' });
    }
    const newNote = {
      id: `n-${Date.now()}`,
      author: author || 'Sales Rep',
      note,
      createdAt: new Date().toISOString(),
      actionType: actionType || 'call',
    };
    if (!lead.notesLog) lead.notesLog = [];
    lead.notesLog.unshift(newNote);
    lead.lastContacted = new Date().toISOString().split('T')[0];
    res.status(201).json({ message: 'Sales follow-up note recorded.', lead, newNote });
  });

  // GET / POST / PATCH Wholesale Callback Requests
  app.get('/api/callbacks', (req, res) => {
    res.json(callbacksStore);
  });

  app.post('/api/callbacks', (req, res) => {
    const { facilityName, contactPerson, phone, email, facilityType, preferredTime, notes } = req.body;
    if (!facilityName || !contactPerson || !phone) {
      return res.status(400).json({ error: 'Facility Name, Contact Person, and Phone number are required.' });
    }

    const newCallback = {
      id: `cb-${Date.now()}`,
      facilityName,
      contactPerson,
      phone,
      email: email || '',
      facilityType: facilityType || 'Pharmacy',
      preferredTime: preferredTime || 'Anytime',
      notes: notes || 'Requested wholesale pricing consultation',
      status: 'PENDING' as const,
      createdAt: new Date().toISOString(),
    };
    callbacksStore.unshift(newCallback);

    // Automatically cross-create or link as a Lead for sales follow-up
    const existingLead = leadsStore.find(
      (l) => l.facilityName.toLowerCase() === facilityName.toLowerCase() || l.phone === phone
    );
    if (!existingLead) {
      leadsStore.unshift({
        id: `lead-cb-${Date.now()}`,
        facilityName,
        contactPerson,
        facilityType: facilityType || 'Pharmacy',
        phone,
        email: email || '',
        city: 'Addis Ababa',
        efdaStatus: 'pending_verification',
        leadStatus: 'NEW',
        interestedCategories: ['pharmaceuticals'],
        estimatedMonthlyVolumeEtb: 150000,
        lastContacted: new Date().toISOString().split('T')[0],
        assignedRepName: 'Tewodros Bekele',
        notes: `Callback Requested: ${notes || 'Wholesale pricing consultation'}`,
        source: 'Callback Request',
        notesLog: [
          {
            id: `n-cb-${Date.now()}`,
            author: 'Customer Inbound',
            note: `Callback Request: "${notes || 'Requested wholesale callback'}" (Preferred time: ${preferredTime || 'Anytime'})`,
            createdAt: new Date().toISOString(),
            actionType: 'call',
          },
        ],
      });
    }

    res.status(201).json({ message: 'Callback request received. A Melala wholesale advisor will contact you.', callback: newCallback });
  });

  app.patch('/api/callbacks/:id', (req, res) => {
    const cb = callbacksStore.find((c) => c.id === req.params.id);
    if (!cb) {
      return res.status(404).json({ error: 'Callback request not found' });
    }
    if (req.body.status) cb.status = req.body.status;
    res.json(cb);
  });

  // GET / POST Product Demand Insights
  app.get('/api/demand-insights', (req, res) => {
    res.json(demandStore);
  });

  app.post('/api/demand-insights/log', (req, res) => {
    const { searchTerm, category, isQuoteRequest } = req.body;
    if (!searchTerm || !searchTerm.trim()) {
      return res.json({ status: 'ignored' });
    }
    const term = searchTerm.trim();
    const existing = demandStore.find((d) => d.searchTerm.toLowerCase() === term.toLowerCase());

    if (existing) {
      existing.searchCount += 1;
      if (isQuoteRequest) existing.quoteRequestCount += 1;
      existing.lastSearchedAt = new Date().toISOString();
    } else {
      const isProductInStock = productsStore.some(
        (p) => p.name.toLowerCase().includes(term.toLowerCase()) || p.genericName?.toLowerCase().includes(term.toLowerCase())
      );
      demandStore.unshift({
        id: `demand-${Date.now()}`,
        searchTerm: term,
        searchCount: 1,
        quoteRequestCount: isQuoteRequest ? 1 : 0,
        category: category || 'pharmaceuticals',
        inStock: isProductInStock,
        estimatedDemandValEtb: Math.floor(100000 + Math.random() * 500000),
        lastSearchedAt: new Date().toISOString(),
      });
    }
    res.json({ message: 'Demand log recorded', demand: demandStore });
  });

  // POST Abandoned Order Event
  app.post('/api/abandoned-cart', (req, res) => {
    const { facilityName, contactPerson, phone, email, cartTotalEtb, itemsSummary } = req.body;
    if (!facilityName || !phone) {
      return res.status(400).json({ error: 'Facility details required' });
    }

    const abandonedLead = {
      id: `lead-ab-${Date.now()}`,
      facilityName,
      contactPerson: contactPerson || 'Purchasing Officer',
      facilityType: 'Pharmacy',
      phone,
      email: email || '',
      city: 'Addis Ababa',
      efdaStatus: 'verified' as const,
      leadStatus: 'NEW' as const,
      interestedCategories: ['pharmaceuticals' as const],
      estimatedMonthlyVolumeEtb: cartTotalEtb || 50000,
      lastContacted: new Date().toISOString().split('T')[0],
      assignedRepName: 'Tewodros Bekele',
      notes: `Abandoned Cart Alert: Total ${cartTotalEtb ? cartTotalEtb.toLocaleString() + ' ETB' : 'significant value'}. Items: ${itemsSummary || 'Multiple products'}`,
      source: 'Abandoned Cart' as const,
      abandonedCartAmountEtb: cartTotalEtb,
      abandonedItems: itemsSummary ? [itemsSummary] : [],
      notesLog: [
        {
          id: `n-ab-${Date.now()}`,
          author: 'System Event',
          note: `Customer created significant cart order (${cartTotalEtb?.toLocaleString()} ETB) but did not complete checkout. Flagged for proactive customer assistance.`,
          createdAt: new Date().toISOString(),
          actionType: 'status_change' as const,
        },
      ],
    };

    leadsStore.unshift(abandonedLead);
    res.status(201).json({ message: 'Abandoned order lead created for sales follow-up.', lead: abandonedLead });
  });

  // Helper to strip sensitive fields from user response
  const sanitizeUser = (user: any) => {
    if (!user) return user;
    const { password, ...rest } = user;
    return rest;
  };

  // GET Users Profiles
  app.get('/api/users', (req, res) => {
    res.json(usersStore.map(sanitizeUser));
  });

  // B2B Customer Registration
  app.post('/api/auth/register', (req, res) => {
    const {
      name,
      email,
      password,
      facilityName,
      facilityType,
      phone,
      city,
      region,
      businessAddress,
      efdaLicenseNo,
      tinNumber,
      vatRegistered,
      role,
    } = req.body;

    if (!email || !facilityName || !name || !phone) {
      return res.status(400).json({ error: 'Missing required B2B account registration fields (Name, Email, Facility Name, Phone required).' });
    }

    // Check duplicate email
    const existing = usersStore.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'A business account with this email address already exists. Please login or request a password reset.' });
    }

    // Check duplicate TIN if provided
    if (tinNumber && tinNumber.trim()) {
      const duplicateTin = usersStore.find((u) => u.tinNumber && u.tinNumber.trim() === tinNumber.trim());
      if (duplicateTin) {
        return res.status(400).json({ error: 'A business account with this Taxpayer Identification Number (TIN) is already registered.' });
      }
    }

    const hasLicense = efdaLicenseNo && efdaLicenseNo.trim().length > 3;

    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      password: password || undefined,
      role: (role || (hasLicense ? 'verified_customer' : 'public')) as any,
      facilityName,
      facilityType: facilityType || 'Pharmacy',
      businessAddress: businessAddress || '',
      region: region || 'Addis Ababa',
      city: city || 'Addis Ababa',
      phone,
      efdaLicenseNo: efdaLicenseNo || '',
      tinNumber: tinNumber || '',
      vatRegistered: Boolean(vatRegistered),
      verificationStatus: (role === 'admin' ? 'APPROVED' : (hasLicense ? 'UNDER_REVIEW' : 'PENDING')) as any,
      efdaVerified: role === 'admin' ? true : false,
      creditLimitEtb: 0,
      creditUsedEtb: 0,
      createdAt: new Date().toISOString(),
    };

    usersStore.push(newUser);
    res.status(201).json({
      message: 'B2B Account registered successfully.',
      user: sanitizeUser(newUser),
    });
  });

  // B2B Customer Login
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required to sign in.' });
    }

    const user = usersStore.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ error: 'No registered B2B account found for this email address.' });
    }

    if (password && user.password && user.password !== password) {
      return res.status(401).json({ error: 'Invalid password. Please check your password or reset it.' });
    }

    if (user.verificationStatus === 'SUSPENDED') {
      return res.status(403).json({ error: 'This business account has been suspended by Melala Compliance Operations. Please contact sales support.' });
    }

    res.json({
      message: 'Signed in successfully.',
      user: sanitizeUser(user),
    });
  });

  // B2B Logout
  app.post('/api/auth/logout', (req, res) => {
    res.json({ message: 'Session logged out successfully.' });
  });

  // B2B Password Reset
  app.post('/api/auth/reset-password', (req, res) => {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required for password reset.' });
    }

    const user = usersStore.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(404).json({ error: 'No account registered with this email address.' });
    }

    res.json({ message: `Password reset verification link dispatched to ${email}. Check your email inbox.` });
  });

  // Update Customer Verification Status (Admin/Sales)
  app.patch('/api/auth/users/:id/status', (req, res) => {
    const { status, creditLimitEtb } = req.body;
    const user = usersStore.find((u) => u.id === req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (status) {
      user.verificationStatus = status;
      if (status === 'APPROVED') {
        user.efdaVerified = true;
        user.role = 'verified_customer';
        if (creditLimitEtb !== undefined) user.creditLimitEtb = creditLimitEtb;
        else if (user.creditLimitEtb === 0) user.creditLimitEtb = 250000;
      } else if (status === 'REJECTED' || status === 'SUSPENDED') {
        user.efdaVerified = false;
        user.role = 'public';
      }
    }

    res.json({ message: `User status updated to ${user.verificationStatus}`, user: sanitizeUser(user) });
  });

  app.post('/api/verifications', (req, res) => {
    const { userId, efdaLicenseNo, tinNumber } = req.body;
    const user = usersStore.find((u) => u.id === userId);
    if (user) {
      user.efdaLicenseNo = efdaLicenseNo || user.efdaLicenseNo;
      user.tinNumber = tinNumber || user.tinNumber;
      user.verificationStatus = 'UNDER_REVIEW';
      user.efdaVerified = false;
    }
    res.json({ message: 'EFDA license document submitted for compliance review.', user: sanitizeUser(user) });
  });

  // --- GEMINI AI SERVICES ---

  // 1. AI Smart Quotation Assistant
  app.post('/api/ai/quotation-assistant', async (req, res) => {
    try {
      const { items, facilityName, facilityType, shippingCity } = req.body;

      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          analysis:
            'B2B Wholesale Optimization Note: Quotation verified for EFDA compliance. Quantities qualify for Tier-2 wholesale pricing.',
          suggestedDiscountPercent: 5,
          coldChainAdvice: 'Includes temperature-sensitive items requiring thermal insulated transport.',
          bundleRecommendation: 'Add 10 extra boxes of Paracetamol 500mg to unlock 8% overall invoice discount.',
        });
      }

      const prompt = `You are a B2B Pharmaceutical Sales Strategy & Quotation AI Specialist for Melala Pharmaceutical Wholesale in Ethiopia.
Analyze the following wholesale RFQ (Request for Quotation):
- Facility Name: ${facilityName || 'Healthcare Facility'}
- Facility Type: ${facilityType || 'Pharmacy'}
- Destination City: ${shippingCity || 'Addis Ababa'}
- Items Requested: ${JSON.stringify(items || [])}

Provide a concise, professional B2B advisory JSON object with key fields:
1. "analysis": A 2-3 sentence strategic summary evaluating order volume, EFDA compliance, and recommended price tier.
2. "suggestedDiscountPercent": Recommended custom discount % (between 3% and 12%).
3. "coldChainAdvice": Logistic handling instructions for any cold-chain or prescription drugs included.
4. "bundleRecommendation": High-margin cross-sell or bundle deal tailored to Ethiopian healthcare facility needs.

Return strictly valid JSON without markdown wrapping.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (err: any) {
      console.error('Gemini Quotation Assistant Error:', err);
      res.json({
        analysis:
          'B2B Quotation processed. Qualified for standard healthcare facility wholesale volume discounts.',
        suggestedDiscountPercent: 5,
        coldChainAdvice: 'All items will be packed according to Ethiopian EFDA temperature storage standards.',
        bundleRecommendation: 'Consider bundling with Melala PureCare antiseptics for additional 3% invoice savings.',
      });
    }
  });

  // 2. AI Sales Rep Demand Insights & Stock Assistant
  app.post('/api/ai/demand-insights', async (req, res) => {
    try {
      const { category, region } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          marketTrend:
            'High seasonal demand for respiratory antibiotics and IV crystalloids across regional clinic hubs in Ethiopia.',
          recommendedStockActions: [
            'Maintain at least 60-day buffer stock of Ceftriaxone & Amoxicillin.',
            'Promote Melala PureCare antiseptics to hospital surgical wards.',
            'Reach out to verified pharmacies in Adama & Hawassa for quarterly re-orders.',
          ],
          salesRepScript:
            'Hello Dr., Melala Wholesale has just replenished EFDA-certified Ceftriaxone and Surgical Gloves with guaranteed batch expiries into 2028. Would you like a fast pro-forma invoice for your monthly clinic allocation?',
        });
      }

      const prompt = `You are a B2B Healthcare & Pharma Market Intelligence AI for Melala Pharmaceutical Wholesale in Ethiopia.
Generate demand insights for region: ${region || 'National Ethiopia'} and category: ${category || 'All Categories'}.

Return a JSON object containing:
- "marketTrend": 2 sentence summary of current Ethiopian pharmaceutical wholesale demand drivers.
- "recommendedStockActions": Array of 3 strategic recommendations for inventory management.
- "salesRepScript": A high-converting professional telephone / WhatsApp sales pitch script for a sales rep pitching to a hospital medical director or head pharmacist.

Return strictly valid JSON without markdown wrapping.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      res.json(parsed);
    } catch (err: any) {
      console.error('Gemini Demand Insights Error:', err);
      res.json({
        marketTrend:
          'Steady demand for essential Rx antibiotics and surgical consumables across major regional hubs.',
        recommendedStockActions: [
          'Monitor batch expiry dates for high-volume items.',
          'Offer volume credit terms to verified hospital accounts.',
        ],
        salesRepScript:
          'Greetings from Melala Wholesale! We have fresh stock of EFDA-registered medical supplies ready for express dispatch.',
      });
    }
  });

  // --- VITE / STATIC SERVING SETUP ---
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Melala Wholesale Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
