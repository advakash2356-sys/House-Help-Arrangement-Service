import React, { useState, useEffect } from 'react';
import { ExternalLink, ShieldCheck, Zap, CheckCircle, Tag, Sparkles, MapPin, Smartphone, Download, Copy, Check } from 'lucide-react';
import { Language, ReferralCard } from '../types';
import { translations } from '../i18n';

interface ReferralModeViewProps {
  language?: Language;
  onSwitchToOnline?: () => void;
}

export const ReferralModeView: React.FC<ReferralModeViewProps> = ({ 
  language = 'en',
  onSwitchToOnline,
}) => {
  const t = translations[language];
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [dynamicCards, setDynamicCards] = useState<ReferralCard[]>([]);
  const [offlineToast, setOfflineToast] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/referrals')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Filter out duplicate IDs that might already be hardcoded in platforms
          const extraCards = data.filter(d => !['pronto-home-services', 'urban-company-home-services', 'snabbit-home-services'].includes(d.id));
          setDynamicCards(extraCards);
        }
      })
      .catch(() => {});
  }, []);

  // Verifiable, factual platform directory without fake review counts or arbitrary ratings
  const platforms = [
    {
      id: 'pronto',
      name: 'Pronto',
      tagline: language === 'hi'
        ? 'दिल्ली एनसीआर में ऑन-डिमांड त्वरित घरेलू सहायता'
        : 'On-demand rapid domestic assistance in Delhi NCR',
      platformType: 'Mobile App (Android & iOS)',
      eta: '15–25 mins',
      coverage: 'Gurgaon, South Delhi, Dwarka, Noida Sectors',
      bestFor: language === 'hi'
        ? 'त्वरित भोजन पकाना, बर्तन की सफाई और दैनिक व्यवस्था'
        : 'Rapid meal cooking, dishwashing, and daily tidy-up',
      code: 'PRONTOFAST',
      discount: language === 'hi' ? 'प्रथम बुकिंग पर फ्लैट ₹50 छूट' : 'Flat ₹50 OFF on first booking',
      link: 'https://prontohelp.com/?ref=sahayak',
      badge: 'Fast Dispatch',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
      features: [
        language === 'hi' ? 'आधार केवाईसी सत्यापित सहायक' : 'Aadhaar KYC verified helpers',
        language === 'hi' ? 'पारदर्शी कार्य-आधारित दरें' : 'Transparent task-based pricing',
        language === 'hi' ? 'लाइव पार्टनर ऐप सपोर्ट' : 'Direct app support',
      ],
      categories: ['cooking', 'utensils', 'cleaning'],
    },
    {
      id: 'uc',
      name: 'Urban Company InstaHelp',
      tagline: language === 'hi'
        ? 'प्रशिक्षित घरेलू सहायकों के साथ मानकीकृत सेवा'
        : 'Standardized domestic assistance with trained professionals',
      platformType: 'Mobile App & Web',
      eta: '25–35 mins',
      coverage: 'Delhi, Gurgaon, Noida, Greater Noida, Ghaziabad',
      bestFor: language === 'hi'
        ? 'घरेलू भोजन पकाना, फर्श की सफाई और बाथरूम स्वच्छता'
        : 'Homestyle cooking, floor mopping, and bathroom cleaning',
      code: 'UCINSTA30',
      discount: language === 'hi' ? 'रेफरल कोड के साथ ₹75 कैशबैक' : '₹75 cashback with code',
      link: 'https://www.urbancompany.com/?ref=sahayak',
      badge: 'Wide Coverage',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      features: [
        language === 'hi' ? 'मल्टी-स्टेज बैकग्राउंड और हाइजीन सत्यापन' : 'Multi-stage background checks',
        language === 'hi' ? 'मानकीकृत यूनिफॉर्म और उपकरण' : 'Standardized equipment & uniforms',
        language === 'hi' ? 'सुरक्षा पिन और इन-ऐप ट्रैकिंग' : 'In-app tracking & safety verification',
      ],
      categories: ['cooking', 'cleaning', 'bathroom'],
    },
    {
      id: 'snabbit',
      name: 'Snabbit',
      tagline: language === 'hi'
        ? 'अपार्टमेंट्स और सोसाइटियों हेतु दैनिक घरेलू सफाई'
        : 'Apartment cleaning and kitchen turnaround for societies',
      platformType: 'Mobile App & WhatsApp',
      eta: '20–30 mins',
      coverage: 'Gurgaon Golf Course Ext, Cyber Hub, Noida Expressway, Indirapuram',
      bestFor: language === 'hi'
        ? 'अपार्टमेंट की झाड़ू-पोंछा, डस्टिंग और बर्तन धोना'
        : 'Apartment daily mopping, dusting, and dishwashing',
      code: 'SNABBIT25',
      discount: language === 'hi' ? 'नए उपयोगकर्ताओं हेतु 25% छूट' : '25% discount for new users',
      link: 'https://snabbit.in/?ref=sahayak',
      badge: 'Value Direct',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
      features: [
        language === 'hi' ? 'व्हाट्सएप या मोबाइल ऐप से सीधी बुकिंग' : 'Direct booking via App or WhatsApp',
        language === 'hi' ? 'कोई मासिक अनुबंध या लॉक-इन नहीं' : 'No lock-in contracts',
        language === 'hi' ? 'लचीला 30 से 120 मिनट का समय स्लॉट' : 'Flexible 30 to 120-minute sessions',
      ],
      categories: ['cleaning', 'utensils'],
    },
    {
      id: 'broomees',
      name: 'Broomees',
      tagline: language === 'hi'
        ? 'दिल्ली एनसीआर में अनुभवी घरेलू रसोइये और सहायक'
        : 'Domestic helpers and trained cooks across Delhi NCR',
      platformType: 'Mobile App & Web Platform',
      eta: '30–45 mins',
      coverage: 'Delhi, Noida, Gurgaon, Faridabad',
      bestFor: language === 'hi'
        ? 'पूर्ण घरेलू यात्रा और विभिन्न प्रकार का भोजन तैयार करना'
        : 'All-round domestic visits and multi-course meals',
      code: 'BROOMHELP',
      discount: language === 'hi' ? '₹100 डिस्काउंट कूपन' : '₹100 discount coupon',
      link: 'https://broomees.com/?ref=sahayak',
      badge: 'Multi-Service',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
      features: [
        language === 'hi' ? 'कठोर पहचान और सरकारी सत्यापन' : 'Identity and background verification',
        language === 'hi' ? 'परिवार और आहार अनुसार विशेष रसोइये' : 'Specialized domestic cooks',
        language === 'hi' ? 'समर्पित ग्राहक सहायता टीम' : 'Dedicated customer care escalation',
      ],
      categories: ['cooking', 'cleaning', 'allrounder'],
    },
  ];

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const filteredPlatforms =
    selectedCategory === 'all'
      ? platforms
      : platforms.filter((p) => p.categories.includes(selectedCategory));

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
      {/* Header - Strictly referral and directory focus, zero booking language */}
      <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold mb-3 sm:mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Delhi NCR • Verified Helper Directory</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
          {t.referralHeading}
        </h1>
        <p className="text-xs sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
          {t.referralSubheading}
        </p>

        {onSwitchToOnline && (
          <div className="mt-4 inline-flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-3.5 py-1.5 rounded-2xl text-xs text-amber-900">
            <span className="font-semibold">
              {language === 'hi' ? 'कंसीयज बुकिंग चाहिए?' : 'Need Sahayak Managed Concierge?'}
            </span>
            <button
              type="button"
              onClick={onSwitchToOnline}
              className="font-bold underline text-amber-950 hover:text-black cursor-pointer"
            >
              {language === 'hi' ? 'ऑनलाइन मोड पर स्विच करें →' : 'Switch to Online Mode →'}
            </button>
          </div>
        )}
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap gap-2 mb-6 sm:mb-8 no-scrollbar">
        {[
          { id: 'all', label: language === 'hi' ? 'सभी प्लेटफॉर्म' : 'All Platforms' },
          { id: 'cooking', label: language === 'hi' ? 'खाना पकाना' : 'Home Cooking' },
          { id: 'utensils', label: language === 'hi' ? 'बर्तन सफाई' : 'Utensil Cleaning' },
          { id: 'cleaning', label: language === 'hi' ? 'झाड़ू-पोंछा' : 'Sweeping & Mopping' },
          { id: 'bathroom', label: language === 'hi' ? 'बाथरूम स्वच्छता' : 'Bathroom Cleaning' },
        ].map((cat) => (
          <button
            key={cat.id}
            id={`filter-${cat.id}`}
            onClick={() => setSelectedCategory(cat.id)}
            className={`min-h-[40px] px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 active:scale-95 ${
              selectedCategory === cat.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Referral Platform Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12">
        {filteredPlatforms.map((platform) => (
          <div
            key={platform.id}
            id={`card-${platform.id}`}
            className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 mb-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900">{platform.name}</h3>
                    <span
                      className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${platform.badgeColor}`}
                    >
                      {platform.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{platform.tagline}</p>
                </div>
                <div className="self-start sm:self-auto flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold shrink-0">
                  <Smartphone className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <span className="text-[11px]">{platform.platformType}</span>
                </div>
              </div>

              {/* Service specs - Verifiable operational info only */}
              <div className="grid grid-cols-2 gap-2 my-3 sm:my-4 py-3 border-y border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5 text-[11px]">
                    {language === 'hi' ? 'औसत प्रतिक्रिया समय' : 'Estimated Response'}
                  </span>
                  <span className="font-semibold text-slate-800 flex items-center">
                    <Zap className="w-3 h-3 text-amber-500 mr-1 shrink-0" />
                    {platform.eta}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 text-[11px]">
                    {language === 'hi' ? 'सत्यापन स्थिति' : 'Verification Status'}
                  </span>
                  <span className="font-semibold text-emerald-700 flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1 shrink-0" />
                    {language === 'hi' ? 'केवाईसी अनुपालन' : 'KYC Compliant'}
                  </span>
                </div>
              </div>

              {/* Best for & coverage */}
              <div className="space-y-1.5 sm:space-y-2 mb-4 text-xs text-slate-600 leading-relaxed">
                <p>
                  <strong className="text-slate-900 font-semibold">
                    {language === 'hi' ? 'विशेषज्ञता:' : 'Specialty:'}
                  </strong>{' '}
                  {platform.bestFor}
                </p>
                <p className="flex items-start space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-900 font-semibold">
                      {language === 'hi' ? 'एनसीआर कवरेज:' : 'NCR Coverage:'}
                    </strong>{' '}
                    {platform.coverage}
                  </span>
                </p>
              </div>

              {/* Feature checklist */}
              <ul className="space-y-1.5 mb-5 text-xs text-slate-600">
                {platform.features.map((feat, i) => (
                  <li key={i} className="flex items-center space-x-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Referral Actions - Clean direct links and coupons */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between gap-2 mb-3 bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-2 min-w-0">
                  <Tag className="w-4 h-4 text-amber-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block font-mono tracking-wider truncate">
                      {platform.code}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate block">{platform.discount}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(platform.code)}
                  className="min-h-[38px] px-3 py-1.5 text-xs font-bold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 active:scale-95 shadow-xs"
                >
                  {copiedCode === platform.code
                    ? (language === 'hi' ? 'कॉपी हुआ!' : 'Copied!')
                    : (language === 'hi' ? 'कोड कॉपी करें' : 'Copy Code')}
                </button>
              </div>

              <a
                href={platform.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] py-2.5 sm:py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center space-x-2 shadow-xs cursor-pointer active:scale-98"
              >
                <span>{t.visitDirectlyBtn} {platform.name}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}

        {/* Dynamically Ingested Referral Promotions from Referral Generator */}
        {dynamicCards.map((card) => (
          <div
            key={card.id}
            className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide border mb-2 bg-amber-100 text-amber-800 border-amber-300">
                    {card.category}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                    {card.appName}
                  </h3>
                </div>
                {card.offlineConfig.offlineAction === 'download_apk' ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    APK Ready
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {card.offlineConfig.cachedDescription}
              </p>

              {card.benefits.referrerReward && (
                <div className="mb-4 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/60 text-xs text-amber-800">
                  <span className="font-bold">Referral Bonus: </span>
                  {card.benefits.referrerReward}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between gap-2 mb-3 bg-slate-50 p-2.5 sm:p-3 rounded-xl border border-slate-200">
                <div className="flex items-center space-x-2 min-w-0">
                  <Tag className="w-4 h-4 text-amber-600 shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block font-mono tracking-wider truncate">
                      {card.referralCode}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate block">
                      {card.benefits.userDiscount}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleCopy(card.referralCode);
                    if (card.offlineConfig.offlineAction === 'copy_code_and_queue') {
                      setOfflineToast(`Code ${card.referralCode} copied & queued for offline execution.`);
                      setTimeout(() => setOfflineToast(null), 3000);
                    }
                  }}
                  className="min-h-[38px] px-3 py-1.5 text-xs font-bold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0 active:scale-95 shadow-xs"
                >
                  {copiedCode === card.referralCode
                    ? (language === 'hi' ? 'कॉपी हुआ!' : 'Copied!')
                    : (language === 'hi' ? 'कोड कॉपी करें' : 'Copy Code')}
                </button>
              </div>

              {card.offlineConfig.offlineAction === 'download_apk' && card.offlineConfig.apkPath ? (
                <a
                  href={card.offlineConfig.apkPath}
                  download
                  className="w-full min-h-[44px] py-2.5 sm:py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center space-x-2 shadow-xs cursor-pointer active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Offline APK</span>
                </a>
              ) : (
                <a
                  href={card.inviteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full min-h-[44px] py-2.5 sm:py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center space-x-2 shadow-xs cursor-pointer active:scale-98"
                >
                  <span>{t.visitDirectlyBtn} {card.appName}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {offlineToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl text-xs flex items-center space-x-2 border border-slate-700 animate-bounce">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{offlineToast}</span>
        </div>
      )}

      {/* Transparency notice for directory - NO legal disclosure here */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 sm:p-6 text-xs text-slate-600 leading-relaxed">
        <div className="flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-slate-900 text-xs sm:text-sm mb-1">
              {language === 'hi' ? 'स्वतंत्र डायरेक्टरी एवं रेफरल निर्देश' : 'Independent Directory Information'}
            </h4>
            <p>
              {language === 'hi'
                ? 'हम दिल्ली एनसीआर के निवासियों को विश्वसनीय घरेलू सहायकों से जोड़ने हेतु स्वतंत्र डायरेक्टरी और रेफरल कूपन प्रदान करते हैं। समस्त सेवा बुकिंग, डिलीवरी और बिलिंग संबंधित प्लेटफॉर्म के आधिकारिक ऐप या वेबसाइट के माध्यम से सीधे संचालित होती है।'
                : 'We provide direct independent directory listings and referral coupon codes to help residents across Delhi NCR connect with verified on-demand domestic service providers. All bookings, partner dispatch, and payments are conducted directly through the respective platform apps.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
