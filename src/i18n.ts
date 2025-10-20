import {getRequestConfig} from 'next-intl/server';

// Can be imported from a shared config
const locales = ['es'];

export default getRequestConfig(async ({requestLocale}) => {
  // Validate that the incoming `locale` parameter is valid
  let locale = await requestLocale;
  
  if (!locale || !locales.includes(locale)) {
    locale = 'es'; // fallback to default
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});