import {getRequestConfig} from 'next-intl/server';

// Can be imported from a shared config
const locales = ['es'];

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale)) {
    locale = 'es'; // fallback to default
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});