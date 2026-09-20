export type Language = 'en' | 'hi';

export interface TranslationDict {
  // Navigation & Brand
  brandName: string;
  brandTagline: string;
  customerView: string;
  adminPortal: string;
  switchView: string;
  acceptingModeBadge: string;
  referralModeBadge: string;
  pendingBadge: string;
  languageLabel: string;

  // Banner & Intro
  bannerBadge: string;
  bannerTitle: string;
  bannerDesc: string;
  serviceAreas: string;

  // Mode Switch Banner
  referralNoticeTitle: string;
  referralNoticeDesc: string;

  // Step 1: Services
  step1Title: string;
  chooseService: string;
  fetchingLiveRates: string;
  selectAreaPrompt: string;
  checkingAreaRates: string;
  noRatesAvailable: string;
  step1AreaLabel: string;
  chooseAreaPlaceholder: string;
  checkRatesBtn: string;
  paymentPendingAdminSetup: string;

  // Services Catalog
  serviceUtensilsName: string;
  serviceUtensilsDesc: string;
  serviceCookingName: string;
  serviceCookingDesc: string;
  serviceMoppingName: string;
  serviceMoppingDesc: string;
  serviceBathroomName: string;
  serviceBathroomDesc: string;
  serviceAllrounderName: string;
  serviceAllrounderDesc: string;

  // Step 2: Price Scout
  step2Title: string;
  step2Desc: string;
  partnerBasePrice: string;
  convenienceFee: string;
  totalAmountDue: string;
  recommendedBadge: string;
  fastestBadge: string;
  lowestPriceBadge: string;
  etaLabel: string;
  selectOption: string;
  selectedOption: string;

  // Legal Disclosure
  legalDisclosureTitle: string;
  legalDisclosureSubtitle: string;
  legalDisclosureBody: string;
  legalDisclosureAcknowledge: string;
  mustAcknowledgeDisclosure: string;

  // Step 3: Payment & Coordinates
  step3Title: string;
  scanAndPayUpi: string;
  officialUpiId: string;
  beneficiaryName: string;
  copyUpiBtn: string;
  copiedUpiBtn: string;
  // Form fields
  serviceNeededLabel: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  localityLabel: string;
  localityPlaceholder: string;
  preferredTimeLabel: string;
  preferredTimePlaceholder: string;
  paymentRefLabel: string;
  paymentRefPlaceholder: string;
  paymentRefHelp: string;
  submitPaymentBtn: string;
  submittingPaymentBtn: string;
  pendingApprovalNotice: string;

  // Validation & Errors
  fillAllFieldsError: string;
  invalidPhoneError: string;
  invalidUtrError: string;
  closedBookingsError: string;

  // Booking Success Banner
  requestReceivedTitle: string;
  statusPendingApproval: string;
  requestReceivedDesc: string;
  trackBookingBtn: string;
  newRequestBtn: string;

  // Referral Mode View
  referralHeading: string;
  referralSubheading: string;
  filterAll: string;
  filterCooking: string;
  filterCleaning: string;
  filterBathroom: string;
  visitPartnerBtn: string;
  useCouponLabel: string;
  couponCopied: string;
  copyCodeBtn: string;
  directBookingDisclaimer: string;

  // Booking Tracker
  trackerTitle: string;
  trackerSubtitle: string;
  trackerInputPlaceholder: string;
  trackerSearchBtn: string;
  trackerEmptyState: string;
  trackerNotFound: string;
  trackerStatusBooked: string;
  trackerStatusPending: string;
  trackerStatusRejected: string;
  closeBtn: string;

  // Admin Dashboard (Protected - strictly minimal)
  adminTitle: string;
  adminSubtitle: string;
  adminLoginTitle: string;
  adminLoginSubtitle: string;
  adminPasswordLabel: string;
  adminLoginBtn: string;
  adminLogoutBtn: string;
  invalidPasswordError: string;
  acceptingToggleOn: string;
  acceptingToggleOff: string;
  dailyCounterLabel: string;
  resetCounterBtn: string;
  pendingApprovalsHeading: string;
  noPendingRequests: string;
  noPendingSubtext: string;
  approveBtn: string;
  rejectBtn: string;
  markRefundBtn: string;
  refundStatusLabel: string;
  refundRefLabel: string;
  refundInitiated: string;
  refundCompleted: string;
  refundNotesLabel: string;
  saveRefundBtn: string;
  cancelBtn: string;
  themeToggleLabel: string;

  // Admin Payment & UPI Configuration
  adminUpiConfigTitle: string;
  adminUpiConfigDesc: string;
  adminUpiIdLabel: string;
  adminUpiIdPlaceholder: string;
  adminPayeeLabel: string;
  adminPayeePlaceholder: string;
  adminFeeLabel: string;
  adminSavePaymentBtn: string;
  adminPaymentSavedSuccess: string;
}

export const translations: Record<Language, TranslationDict> = {
  en: {
    brandName: 'Sahayak Express',
    brandTagline: 'Independent House-Help Arrangement Service',
    customerView: 'Customer View',
    adminPortal: 'Admin Dashboard',
    switchView: 'Switch View',
    acceptingModeBadge: 'Accepting Bookings',
    referralModeBadge: 'Referral Directory Only',
    pendingBadge: 'Pending Approval',
    languageLabel: 'Language',

    bannerBadge: 'AI Price Scout & Smart Arrangement Service',
    bannerTitle: 'Verified House-Help Arranged at the Best Live Rate',
    bannerDesc:
      'Our multi-agent system scouts live availability and transparent rates across Pronto, Urban Company InstaHelp, Snabbit, and Broomees. We coordinate the dispatch, assign verified helpers, and monitor your service in real time across Delhi NCR.',
    serviceAreas: 'Serving Gurgaon • Noida • South Delhi • Dwarka',

    referralNoticeTitle: 'Direct Partner Booking Directory Active',
    referralNoticeDesc:
      'Our daily concierge capacity of 15 bookings has been reached for today. You can still book verified domestic helpers directly through our partner platform directory below with exclusive partner offers.',

    step1Title: 'Select Area & Domestic Service Required',
    chooseService: 'Choose Domestic Service Required',
    fetchingLiveRates: 'Price Scout is checking live partner rates...',
    selectAreaPrompt: 'Select your area to see the best available rates.',
    checkingAreaRates: 'Checking best available rates for your area…',
    noRatesAvailable: 'No direct partner rates currently available for this area. Please browse our partner directory below.',
    step1AreaLabel: 'Select Your Area in Delhi NCR *',
    chooseAreaPlaceholder: 'Choose your sector or locality in NCR...',
    checkRatesBtn: 'Check Live Rates',
    paymentPendingAdminSetup: 'Arrangement bookings currently paused pending administrator payment gateway configuration. Please check back shortly or browse direct partner links below.',

    serviceUtensilsName: 'Utensil Cleaning & Kitchen Sink Clear',
    serviceUtensilsDesc: 'Complete washing, drying & neat stacking of utensils, cooker & cookware.',
    serviceCookingName: 'Instant Meal Cooking (Fresh Homestyle)',
    serviceCookingDesc: 'Verified home cook for fresh, hot homestyle breakfast, lunch, or dinner (3 items).',
    serviceMoppingName: 'Express Floor Sweeping & Wet Mopping',
    serviceMoppingDesc: 'Dust clearing, broom cleaning, and fragrant surface mopping for 1-3 BHK.',
    serviceBathroomName: 'Quick Bathroom Hygiene Cleaning',
    serviceBathroomDesc: 'Floor scrubbing, WC sanitation, mirror wipe & sink descaling.',
    serviceAllrounderName: 'All-in-One Helper Visit (2 Hours)',
    serviceAllrounderDesc: 'Cooking assistance, kitchen turnaround, laundry folding & general tidying.',

    step2Title: 'Live Partner Quotes (Scouted by Price Scout Agent)',
    step2Desc: 'Transparent rate breakdown across verified platforms in your area.',
    partnerBasePrice: 'Partner Base Price',
    convenienceFee: 'Coordination Fee',
    totalAmountDue: 'Total Amount Due',
    recommendedBadge: 'Best Value',
    fastestBadge: 'Fastest ETA',
    lowestPriceBadge: 'Lowest Price',
    etaLabel: 'Arrival ETA',
    selectOption: 'Select Option',
    selectedOption: 'Selected',

    legalDisclosureTitle: 'Mandatory Legal Disclosure',
    legalDisclosureSubtitle: 'Please read before making advance payment',
    legalDisclosureBody: `We are an independent arrangement service.  
We help you find and book verified house-help through partner platforms (including Pronto, Urban Company InstaHelp, Snabbit and similar services).  

We charge a convenience and coordination fee for checking live availability, selecting the best option, and handling the booking process on your behalf.  

The actual service (helper, timing, quality, any rescheduling) is provided by the partner platform and follows their policies.  
We are not an authorised agent or official partner of these platforms.  

Advance full payment is mandatory.  
Once payment is received and we confirm the booking, the amount is non-refundable except if we are unable to assign a helper within the stated time window.  

Please read carefully before paying.`,
    legalDisclosureAcknowledge:
      'I have read, understood, and agreed to the Independent Arrangement Service disclosure above.',
    mustAcknowledgeDisclosure: 'You must read and acknowledge the Legal Disclosure before submitting payment.',

    step3Title: 'Complete Advance UPI Payment & Submit Coordinates',
    scanAndPayUpi: 'Scan & Pay via UPI',
    officialUpiId: 'Official UPI ID',
    beneficiaryName: 'Beneficiary Name',
    copyUpiBtn: 'Copy UPI ID',
    copiedUpiBtn: 'Copied!',
    serviceNeededLabel: 'Type of Service Needed *',
    fullNameLabel: 'Full Name *',
    fullNamePlaceholder: 'Enter your full name',
    phoneLabel: 'Phone Number (WhatsApp) *',
    phonePlaceholder: '10-digit mobile number',
    localityLabel: 'Area / Locality in NCR *',
    localityPlaceholder: 'e.g. Sector 54 Gurgaon, Indirapuram, Saket, Dwarka',
    preferredTimeLabel: 'Preferred Time (Optional)',
    preferredTimePlaceholder: 'e.g. Morning 8–11 AM, Afternoon 12–4 PM, ASAP',
    paymentRefLabel: 'UPI Transaction Reference / 12-Digit UTR *',
    paymentRefPlaceholder: '12-digit UPI transaction reference (UTR)',
    paymentRefHelp: 'Found on your UPI transfer receipt after sending the advance.',
    submitPaymentBtn: 'Submit Request for Verification',
    submittingPaymentBtn: 'Submitting Arrangement Request...',
    pendingApprovalNotice:
      'Submissions enter pending approval state. The Booking Executor runs immediately upon Admin authorization.',

    fillAllFieldsError: 'Please enter your full name, WhatsApp phone number, and locality in NCR.',
    invalidPhoneError: 'Please enter a valid 10-digit mobile number.',
    invalidUtrError: 'Please enter your UPI transaction reference (UTR) after transferring.',
    closedBookingsError: 'Bookings are currently closed. Only referral mode is active.',

    requestReceivedTitle: 'Arrangement Request Received!',
    statusPendingApproval: 'Payment Logged • Awaiting Admin Authorization',
    requestReceivedDesc:
      'Our Payment Watcher Agent has logged your transaction reference. The request is currently in Human-in-the-Loop review. Once authorized by Admin, the Booking Executor Agent will immediately dispatch your helper.',
    trackBookingBtn: 'Track My Request',
    newRequestBtn: 'Submit Another Request',

    referralHeading: 'Direct House-Help Booking Directory',
    referralSubheading:
      'At your location, the current best rates are available on these platforms. Use our referral links to book directly.',
    filterAll: 'All Platforms',
    filterCooking: 'Cooking',
    filterCleaning: 'Cleaning & Sweeping',
    filterBathroom: 'Bathroom Hygiene',
    visitPartnerBtn: 'Book Directly on Platform',
    useCouponLabel: 'Partner Coupon Code',
    couponCopied: 'Coupon Copied!',
    copyCodeBtn: 'Copy Code',
    directBookingDisclaimer:
      'All bookings placed through partner websites are subject to their respective terms, cancellation policies, and customer support.',

    trackerTitle: 'Arrangement Request Tracker',
    trackerSubtitle: 'Check live status of your domestic helper arrangement',
    trackerInputPlaceholder: 'Enter Booking ID (e.g. BK-xxxx) or 10-digit phone...',
    trackerSearchBtn: 'Check Status',
    trackerEmptyState: 'Enter your Booking ID or Phone number to check status.',
    trackerNotFound: 'No arrangement request found matching your details. Please re-check.',
    trackerStatusBooked: 'Confirmed & Helper Assigned',
    trackerStatusPending: 'Awaiting Admin Verification',
    trackerStatusRejected: 'Declined & Refund Processed',
    closeBtn: 'Close',

    adminTitle: 'Admin Operations Control',
    adminSubtitle: 'Restricted Operations • Human-in-the-Loop Supervised',
    adminLoginTitle: 'Admin Authentication',
    adminLoginSubtitle: 'Enter administrator passkey to access operational controls',
    adminPasswordLabel: 'Admin Passkey / Password',
    adminLoginBtn: 'Access Admin Dashboard',
    adminLogoutBtn: 'Log Out',
    invalidPasswordError: 'Incorrect passkey. Access denied.',
    acceptingToggleOn: 'Accepting Bookings: ON',
    acceptingToggleOff: 'Accepting Bookings: OFF (Referral Mode)',
    dailyCounterLabel: 'Daily Counter',
    resetCounterBtn: 'Reset Counter (0 / 15)',
    pendingApprovalsHeading: 'Pending Approvals (Awaiting Decision)',
    noPendingRequests: 'No pending requests awaiting approval.',
    noPendingSubtext: 'When customers submit advance UPI payments, they will appear here for verification and authorization.',
    approveBtn: 'Approve & Dispatch',
    rejectBtn: 'Reject Request',
    markRefundBtn: 'Mark Refund',
    refundStatusLabel: 'Refund Status',
    refundRefLabel: 'Refund Reference / UTR',
    refundInitiated: 'Refund Initiated',
    refundCompleted: 'Refund Completed',
    refundNotesLabel: 'Admin Notes / Reason',
    saveRefundBtn: 'Save Refund Details',
    cancelBtn: 'Cancel',
    themeToggleLabel: 'Toggle Theme',

    adminUpiConfigTitle: 'Admin Payment & UPI Configuration',
    adminUpiConfigDesc: 'Configure your official UPI ID and Payee name for customer advance payments. Only this UPI ID is displayed during checkout.',
    adminUpiIdLabel: 'Official UPI ID *',
    adminUpiIdPlaceholder: 'e.g. yourname@okhdfcbank or business@upi',
    adminPayeeLabel: 'Beneficiary / Account Name',
    adminPayeePlaceholder: 'e.g. Akash Gupta (Sahayak Express)',
    adminFeeLabel: 'Coordination / Convenience Fee (₹)',
    adminSavePaymentBtn: 'Save Payment Coordinates',
    adminPaymentSavedSuccess: 'Payment coordinates saved securely! Only this UPI ID will be shown to paying customers.',
  },
  hi: {
    brandName: 'सहायक एक्सप्रेस',
    brandTagline: 'स्वतंत्र घरेलू सहायक व्यवस्था सेवा',
    customerView: 'ग्राहक दृश्य',
    adminPortal: 'एडमिन डैशबोर्ड',
    switchView: 'दृश्य बदलें',
    acceptingModeBadge: 'बुकिंग चालू है',
    referralModeBadge: 'केवल रेफरल डायरेक्टरी',
    pendingBadge: 'अनुमोदन प्रतीक्षारत',
    languageLabel: 'भाषा',

    bannerBadge: 'एआई प्राइस स्काउट एवं स्मार्ट व्यवस्था सेवा',
    bannerTitle: 'सत्यापित हाउस-हेल्प सर्वश्रेष्ठ लाइव दरों पर उपलब्ध',
    bannerDesc:
      'हमारा मल्टी-एजेंट सिस्टम प्रोंटो, अर्बन कंपनी इंस्टाहेल्प, स्नैबिट और ब्रूमीज में लाइव उपलब्धता और पारदर्शी दरों की जांच करता है। हम दिल्ली एनसीआर में आपकी ओर से बुकिंग समन्वित करते हैं और हेल्पर असाइनमेंट की निगरानी करते हैं।',
    serviceAreas: 'गुड़गांव • नोएडा • दक्षिण दिल्ली • द्वारका में उपलब्ध',

    referralNoticeTitle: 'सीधी पार्टनर बुकिंग डायरेक्टरी सक्रिय',
    referralNoticeDesc:
      'आज के लिए हमारी 15 बुकिंग की दैनिक सीमा पूरी हो चुकी है। आप नीचे दी गई डायरेक्टरी से सीधे हमारे पार्टनर प्लेटफॉर्म्स पर विशेष छूट के साथ हेल्पर बुक कर सकते हैं।',

    step1Title: 'एनसीआर क्षेत्र और आवश्यक घरेलू सेवा चुनें',
    chooseService: 'आवश्यक घरेलू सेवा चुनें',
    fetchingLiveRates: 'प्राइस स्काउट लाइव पार्टनर दरों की जांच कर रहा है...',
    selectAreaPrompt: 'सर्वोत्तम उपलब्ध लाइव दरें देखने के लिए अपना क्षेत्र चुनें।',
    checkingAreaRates: 'आपके क्षेत्र के लिए सर्वोत्तम उपलब्ध दरों की जांच की जा रही है…',
    noRatesAvailable: 'इस विशिष्ट क्षेत्र के लिए कोई सीधी पार्टनर दर उपलब्ध नहीं है। कृपया नीचे दी गई डायरेक्टरी देखें।',
    step1AreaLabel: 'दिल्ली एनसीआर में अपना क्षेत्र चुनें *',
    chooseAreaPlaceholder: 'अपना सेक्टर अथवा इलाका चुनें...',
    checkRatesBtn: 'लाइव दरें जांचें',
    paymentPendingAdminSetup: 'व्यवस्था बुकिंग वर्तमान में एडमिन भुगतान गेटवे सेटअप प्रतीक्षारत है। कृपया थोड़ी देर बाद पुनः देखें या सीधे पार्टनर लिंक देखें।',

    serviceUtensilsName: 'बर्तन धुलाई एवं किचन सिंक सफाई',
    serviceUtensilsDesc: 'बर्तनों, कुकर व कड़ाही की संपूर्ण धुलाई, सुखाई और व्यवस्थित रैक व्यवस्था।',
    serviceCookingName: 'तुरंत भोजन पकाना (ताजा घरेलू खाना)',
    serviceCookingDesc: 'ताजा एवं स्वादिष्ट नाश्ता, दोपहर या रात का खाना (सब्जी, दाल, रोटी/चावल) तैयार करने हेतु।',
    serviceMoppingName: 'झाड़ू एवं पोछा सेवा (एक्सप्रेस)',
    serviceMoppingDesc: '1-3 बीएचके फ्लैट के लिए धूल सफाई, झाड़ू और सुगंधित फर्श पोछा।',
    serviceBathroomName: 'त्वरित बाथरूम स्वच्छता एवं सफाई',
    serviceBathroomDesc: 'फर्श स्क्रबिंग, टाइल्स पोंछना, कमोड सैनिटाइजेशन और सिंक सफाई।',
    serviceAllrounderName: 'ऑल-इन-वन हेल्पर विजिट (2 घंटे)',
    serviceAllrounderDesc: 'रसोई सहयोग, बर्तन, कपड़े समेटना और कमरे की त्वरित व्यवस्था।',

    step2Title: 'लाइव पार्टनर कोट्स (प्राइस स्काउट एजेंट द्वारा खोजी गई)',
    step2Desc: 'आपके क्षेत्र में उपलब्ध सत्यापित प्लेटफॉर्म्स का पारदर्शी दर विवरण।',
    partnerBasePrice: 'पार्टनर बेस शुल्क',
    convenienceFee: 'समन्वय शुल्क',
    totalAmountDue: 'कुल देय राशि',
    recommendedBadge: 'सर्वोत्तम विकल्प',
    fastestBadge: 'सबसे तेज आगमन',
    lowestPriceBadge: 'सबसे कम कीमत',
    etaLabel: 'अनुमानित समय',
    selectOption: 'विकल्प चुनें',
    selectedOption: 'चयनित',

    legalDisclosureTitle: 'अनिवार्य कानूनी प्रकटीकरण (Legal Disclosure)',
    legalDisclosureSubtitle: 'कृपया अग्रिम भुगतान करने से पूर्व ध्यानपूर्वक पढ़ें',
    legalDisclosureBody: `हम एक स्वतंत्र व्यवस्था सेवा (Independent Arrangement Service) हैं।  
हम पार्टनर प्लेटफॉर्म्स (प्रोंटो, अर्बन कंपनी इंस्टाहेल्प, स्नैबिट और इसी प्रकार की सेवाओं) के माध्यम से आपको सत्यापित हाउस-हेल्प ढूंढने और बुक करने में सहायता करते हैं।  

हम लाइव उपलब्धता की जांच करने, सर्वोत्तम विकल्प का चयन करने और आपकी ओर से बुकिंग प्रक्रिया संभालने के लिए सुविधा एवं समन्वय शुल्क (Convenience & Coordination Fee) लेते हैं।  

वास्तविक सेवा (हेल्पर, समय, गुणवत्ता, रिशेड्यूलिंग) संबंधित पार्टनर प्लेटफॉर्म द्वारा प्रदान की जाती है और उन्हीं की नीतियों के अधीन है।  
हम इन प्लेटफॉर्म्स के अधिकृत एजेंट या आधिकारिक पार्टनर नहीं हैं।  

अग्रिम पूर्ण भुगतान अनिवार्य है।  
भुगतान प्राप्त होने और बुकिंग कन्फर्म होने के बाद राशि गैर-वापसी योग्य (non-refundable) है, सिवाय इसके कि यदि हम बताए गए समय में हेल्पर असाइन करने में असमर्थ रहें।  

कृपया भुगतान करने से पहले ध्यानपूर्वक पढ़ें।`,
    legalDisclosureAcknowledge:
      'मैंने ऊपर दिया गया स्वतंत्र व्यवस्था सेवा का कानूनी प्रकटीकरण पढ़ लिया है और मैं इससे सहमत हूँ।',
    mustAcknowledgeDisclosure: 'भुगतान जमा करने से पहले कानूनी प्रकटीकरण स्वीकार करना अनिवार्य है।',

    step3Title: 'अग्रिम यूपीआई भुगतान पूरा करें और पता दर्ज करें',
    scanAndPayUpi: 'स्कैन करें और यूपीआई द्वारा भुगतान करें',
    officialUpiId: 'आधिकारिक यूपीआई आईडी',
    beneficiaryName: 'खाता धारक का नाम',
    copyUpiBtn: 'यूपीआई आईडी कॉपी करें',
    copiedUpiBtn: 'कॉपी हो गई!',
    serviceNeededLabel: 'आवश्यक सेवा का प्रकार *',
    fullNameLabel: 'ग्राहक का पूरा नाम *',
    fullNamePlaceholder: 'अपना पूरा नाम दर्ज करें',
    phoneLabel: 'व्हाट्सएप फोन नंबर *',
    phonePlaceholder: '10-अंकीय मोबाइल नंबर',
    localityLabel: 'दिल्ली एनसीआर क्षेत्र / इलाका *',
    localityPlaceholder: 'उदा. सेक्टर 54 गुड़गांव, इंदिरापुरम, साकेत, द्वारका',
    preferredTimeLabel: 'पसंदीदा समय (वैकल्पिक)',
    preferredTimePlaceholder: 'उदा. सुबह 8–11 बजे, दोपहर 12–4 बजे, तुरंत / ASAP',
    paymentRefLabel: 'यूपीआई ट्रांजेक्शन संदर्भ / 12-अंकीय UTR *',
    paymentRefPlaceholder: '12-अंकीय यूपीआई संदर्भ संख्या (UTR)',
    paymentRefHelp: 'भुगतान करने के तुरंत बाद आपके यूपीआई ऐप की रसीद में उपलब्ध होता है।',
    submitPaymentBtn: 'सत्यापन हेतु व्यवस्था अनुरोध सबमिट करें',
    submittingPaymentBtn: 'व्यवस्था अनुरोध सबमिट किया जा रहा है...',
    pendingApprovalNotice:
      'सबमिशन लंबित अनुमोदन स्थिति में जाता है। एडमिन स्वीकृति के तुरंत बाद बुकिंग एग्जीक्यूटर रन होता है।',

    fillAllFieldsError: 'कृपया अपना पूरा नाम, व्हाट्सएप नंबर और एनसीआर का क्षेत्र दर्ज करें।',
    invalidPhoneError: 'कृपया एक मान्य 10-अंकीय मोबाइल नंबर दर्ज करें।',
    invalidUtrError: 'कृपया ट्रांसफर के बाद 12-अंकीय यूपीआई रेफरेंस (UTR) दर्ज करें।',
    closedBookingsError: 'वर्तमान में बुकिंग बंद हैं। केवल रेफरल मोड सक्रिय है।',

    requestReceivedTitle: 'व्यवस्था अनुरोध प्राप्त हुआ!',
    statusPendingApproval: 'भुगतान दर्ज • एडमिन अनुमोदन प्रतीक्षारत',
    requestReceivedDesc:
      'हमारे पेमेंट वॉचर एजेंट ने आपका ट्रांजेक्शन रेफरेंस दर्ज कर लिया है। यह अनुरोध वर्तमान में ह्यूमन-इन-द-लूप समीक्षा में है। एडमिन द्वारा स्वीकृत होने पर हेल्पर तुरंत डिस्पैच कर दिया जाएगा।',
    trackBookingBtn: 'मेरा अनुरोध ट्रैक करें',
    newRequestBtn: 'एक अन्य अनुरोध सबमिट करें',

    referralHeading: 'प्रत्यक्ष घरेलू सहायक बुकिंग डायरेक्टरी',
    referralSubheading:
      'आपके स्थान पर वर्तमान सर्वोत्तम दरें इन प्लेटफॉर्म्स पर उपलब्ध हैं। सीधे बुक करने के लिए हमारे रेफरल लिंक का उपयोग करें।',
    filterAll: 'सभी प्लेटफॉर्म',
    filterCooking: 'रसोई / खाना बनाना',
    filterCleaning: 'सफाई व झाड़ू-पोछा',
    filterBathroom: 'बाथरूम स्वच्छता',
    visitPartnerBtn: 'प्लेटफॉर्म पर सीधे बुक करें',
    useCouponLabel: 'पार्टनर कूपन कोड',
    couponCopied: 'कूपन कॉपी हो गया!',
    copyCodeBtn: 'कोड कॉपी करें',
    directBookingDisclaimer:
      'पार्टनर वेबसाइटों पर की गई सभी बुकिंग उनकी संबंधित शर्तों और नीतियों के अधीन हैं।',

    trackerTitle: 'व्यवस्था अनुरोध ट्रैकर',
    trackerSubtitle: 'अपनी घरेलू सहायक व्यवस्था का लाइव स्टेटस जांचें',
    trackerInputPlaceholder: 'बुकिंग आईडी (जैसे BK-xxxx) या 10-अंकीय फोन दर्ज करें...',
    trackerSearchBtn: 'स्टेटस देखें',
    trackerEmptyState: 'स्टेटस देखने के लिए अपनी बुकिंग आईडी या फोन नंबर दर्ज करें।',
    trackerNotFound: 'दर्ज किए गए विवरण से मेल खाती कोई व्यवस्था नहीं मिली। कृपया पुनः जांचें।',
    trackerStatusBooked: 'कन्फर्म एवं हेल्पर असाइन किया गया',
    trackerStatusPending: 'एडमिन सत्यापन प्रतीक्षारत',
    trackerStatusRejected: 'अस्वीकृत एवं रिफंड प्रक्रिया पूर्ण',
    closeBtn: 'बंद करें',

    adminTitle: 'एडमिन संचालन नियंत्रण',
    adminSubtitle: 'प्रतिबंधित संचालन • ह्यूमन-इन-द-लूप पर्यवेक्षित',
    adminLoginTitle: 'एडमिन प्रमाणीकरण',
    adminLoginSubtitle: 'संचालन नियंत्रण के लिए एडमिन पासकी दर्ज करें',
    adminPasswordLabel: 'एडमिन पासवर्ड / पासकी',
    adminLoginBtn: 'एडमिन डैशबोर्ड में प्रवेश करें',
    adminLogoutBtn: 'लॉग आउट',
    invalidPasswordError: 'गलत पासकी। एक्सेस अस्वीकृत।',
    acceptingToggleOn: 'बुकिंग स्वीकार: चालू (ON)',
    acceptingToggleOff: 'बुकिंग स्वीकार: बंद (रेफरल मोड)',
    dailyCounterLabel: 'दैनिक काउंटर',
    resetCounterBtn: 'काउंटर रीसेट करें (0 / 15)',
    pendingApprovalsHeading: 'लंबित अनुमोदन (निर्णय प्रतीक्षारत)',
    noPendingRequests: 'समीक्षा हेतु कोई लंबित अनुरोध नहीं है।',
    noPendingSubtext: 'जब ग्राहक अग्रिम यूपीआई भुगतान सबमिट करेंगे, वे सत्यापन के लिए यहां दिखाई देंगे।',
    approveBtn: 'स्वीकृत करें और डिस्पैच करें',
    rejectBtn: 'अनुरोध अस्वीकार करें',
    markRefundBtn: 'रिफंड मार्क करें',
    refundStatusLabel: 'रिफंड स्थिति',
    refundRefLabel: 'रिफंड संदर्भ / UTR',
    refundInitiated: 'रिफंड शुरू किया गया',
    refundCompleted: 'रिफंड पूर्ण',
    refundNotesLabel: 'एडमिन नोट्स / कारण',
    saveRefundBtn: 'रिफंड विवरण सहेजें',
    cancelBtn: 'रद्द करें',
    themeToggleLabel: 'थीम बदलें',

    adminUpiConfigTitle: 'एडमिन भुगतान एवं यूपीआई विन्यास',
    adminUpiConfigDesc: 'ग्राहकों द्वारा अग्रिम भुगतान हेतु अपनी आधिकारिक यूपीआई आईडी और खाता धारक का नाम कॉन्फ़िगर करें। केवल यही यूपीआई आईडी चेकआउट के समय दिखाई देगी।',
    adminUpiIdLabel: 'आधिकारिक यूपीआई आईडी *',
    adminUpiIdPlaceholder: 'उदा. yourname@okhdfcbank या business@upi',
    adminPayeeLabel: 'लाभार्थी / खाता धारक का नाम',
    adminPayeePlaceholder: 'उदा. आकाश गुप्ता (सहायक एक्सप्रेस)',
    adminFeeLabel: 'समन्वय / सुविधा शुल्क (₹)',
    adminSavePaymentBtn: 'भुगतान विवरण सहेजें',
    adminPaymentSavedSuccess: 'भुगतान विन्यास सुरक्षित रूप से सहेज लिया गया है! केवल यही यूपीआई आईडी ग्राहकों को दिखाई देगी।',
  },
};
