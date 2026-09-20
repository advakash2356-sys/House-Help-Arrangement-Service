import { ReferralCard } from '../src/types';

export function parseReferralInput(input: string): ReferralCard {
  const trimmed = input.trim();

  // 1. Check for shorthand command:
  // /add [App Name] | [Category] | [Referral Code] | [User Discount] | [Invite URL] | [Optional: Local APK Path]
  if (trimmed.startsWith('/add')) {
    const content = trimmed.replace(/^\/add\s*/i, '');
    const parts = content.split('|').map(p => p.trim());

    const appName = parts[0] || 'Unknown App';
    const category = parts[1] || 'Services';
    const referralCode = (parts[2] || '').toUpperCase();
    const userDiscount = parts[3] || 'Discount on first order';
    const inviteUrl = parts[4] || '';
    const apkPath = parts[5] || null;

    const id = `${appName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.replace(/^-|-$/g, '');

    const hasApk = Boolean(apkPath && (apkPath.endsWith('.apk') || apkPath.includes('/apk')));

    return {
      id,
      appName,
      category,
      referralCode,
      inviteUrl,
      benefits: {
        userDiscount,
        referrerReward: null,
      },
      offlineConfig: {
        offlineAction: hasApk ? 'download_apk' : 'copy_code_and_queue',
        apkPath: hasApk ? apkPath : null,
        cachedDescription: hasApk
          ? `On-demand ${category.toLowerCase()} platform. APK installer ready for offline setup.`
          : `On-demand ${category.toLowerCase()} services. Referral code ${referralCode} saved locally.`,
      },
    };
  }

  // 2. Raw promotional text or image transcriptions
  let appName = 'Referral App';
  let category = 'Services';
  let referralCode = '';
  let inviteUrl = '';
  let userDiscount = 'Special promotional offer';
  let referrerReward: string | null = null;
  let apkPath: string | null = null;

  // Extract URLs
  const urlMatch = trimmed.match(/https?:\/\/[^\s\)]+/i);
  if (urlMatch) {
    inviteUrl = urlMatch[0];
  }

  // Detect App Name from text or URL
  if (/pronto/i.test(trimmed)) {
    appName = 'Pronto';
    category = 'Home Services';
  } else if (/urban\s*company|instahelp/i.test(trimmed)) {
    appName = 'Urban Company InstaHelp';
    category = 'Home Services';
  } else if (/swiggy/i.test(trimmed)) {
    appName = 'Swiggy';
    category = 'Food Delivery';
  } else if (/zomato/i.test(trimmed)) {
    appName = 'Zomato';
    category = 'Food Delivery';
  } else if (/blinkit|grofers/i.test(trimmed)) {
    appName = 'Blinkit';
    category = 'Grocery';
  } else if (/zepto/i.test(trimmed)) {
    appName = 'Zepto';
    category = 'Grocery';
  } else if (/snabbit/i.test(trimmed)) {
    appName = 'Snabbit';
    category = 'Home Services';
  } else {
    // Try to extract first capitalized word or name
    const nameMatch = trimmed.match(/using\s+([A-Z][a-zA-Z0-9]+)/i) || trimmed.match(/([A-Z][a-zA-Z0-9]+)\s+app/i);
    if (nameMatch) {
      appName = nameMatch[1];
    }
  }

  // Extract Referral Code
  const codeMatch = 
    trimmed.match(/code\s*[:*]?\s*\*?([A-Z0-9]{4,12})\*?/i) ||
    trimmed.match(/use\s+(?:my\s+)?code\s*\*?([A-Z0-9]{4,12})\*?/i) ||
    trimmed.match(/\*([A-Z0-9]{4,12})\*/);

  if (codeMatch) {
    referralCode = codeMatch[1].toUpperCase();
  } else {
    // Fallback: search for standalone token
    const tokenMatch = trimmed.match(/\b([A-Z0-9]{5,10})\b/);
    if (tokenMatch) {
      referralCode = tokenMatch[1].toUpperCase();
    }
  }

  // Extract User Discount
  const discountMatch = 
    trimmed.match(/(?:flat\s+)?(₹\d+|[\d]+%)\s*(?:off|cashback|discount)[^.\n\(\)]*/i) ||
    trimmed.match(/(get\s+(?:flat\s+)?(?:₹\d+|[\d]+%)[^.\n\(\)]*)/i);
  if (discountMatch) {
    userDiscount = discountMatch[0].replace(/\s+/g, ' ').trim();
  }

  // Extract Referrer Reward
  const referrerMatch = 
    trimmed.match(/refer(?:\s+a\s+friend)?[^:]*:\s*(get\s+₹\d+[^.\n\(\)]*)/i) ||
    trimmed.match(/referrer\s+(?:gets|reward)\s*:?\s*([^.\n\(\)]*)/i) ||
    trimmed.match(/(?:earn|get)\s+(₹\d+)\s*(?:per|for every)[^.\n\(\)]*/i);
  if (referrerMatch) {
    referrerReward = (referrerMatch[1] || referrerMatch[0]).trim();
    if (!referrerReward.toLowerCase().includes('referral') && !referrerReward.toLowerCase().includes('per')) {
      referrerReward = `${referrerReward} per successful referral`;
    }
  }

  // Check for APK path in text
  const apkMatch = trimmed.match(/(\/[a-zA-Z0-9_\-\.\/]+\.apk)/);
  if (apkMatch) {
    apkPath = apkMatch[1];
  }

  const id = `${appName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${category.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.replace(/^-|-$/g, '');
  const hasApk = Boolean(apkPath);

  let cachedDescription = `On-demand ${category.toLowerCase()} services. Referral code ${referralCode || 'PROMO'} saved locally.`;
  if (/cleaning|kitchen/i.test(trimmed)) {
    cachedDescription = `On-demand cleaning and kitchen help services. Referral code ${referralCode || 'PROMO'} saved locally.`;
  } else if (/food|restaurant/i.test(trimmed)) {
    cachedDescription = `On-demand food delivery from local restaurants. Referral code ${referralCode || 'PROMO'} saved locally.`;
  } else if (/grocery/i.test(trimmed)) {
    cachedDescription = `Fast grocery delivery to your doorstep. Referral code ${referralCode || 'PROMO'} saved locally.`;
  }

  return {
    id,
    appName,
    category,
    referralCode: referralCode || 'SAVE50',
    inviteUrl: inviteUrl || `https://${appName.toLowerCase().replace(/\s+/g, '')}.com/invite`,
    benefits: {
      userDiscount,
      referrerReward,
    },
    offlineConfig: {
      offlineAction: hasApk ? 'download_apk' : 'copy_code_and_queue',
      apkPath,
      cachedDescription,
    },
  };
}
