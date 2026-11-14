/** Images in /public/images are WebP (originals live in /assets-src/images, not deployed). */
export const IMAGE_EXT = 'webp'
export const img = (name: string) => `/images/${name}.${IMAGE_EXT}`
/** 1200x630 JPG share cards in /public/images/og (JPG for widest preview support). */
export const ogImg = (name: string) => `/images/og/${name}.jpg`

/** Static PDF in /public (old /en/bottle-service-menu/ 301s here). Same file for every locale. */
export const BOTTLE_MENU_URL = '/bottle-service-menu.pdf'

export const SITE = {
  name: 'The Hub Louisville',
  address: '1133 Bardstown Rd, Louisville, KY 40204',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=The+Hub+1133+Bardstown+Rd+Louisville+KY',
  instagram: 'https://www.instagram.com/thehubpm',
  instagramHandle: '@thehubpm',
  facebook: 'https://www.facebook.com/hublouisville/',
  yelp: 'https://www.yelp.com/biz/the-hub-louisville-louisville',
  email: 'info@hublouisville.com',
  phone: '(502) 777-1505',
  phoneHref: 'tel:+15027771505',
  smsHref: 'sms:+15027771505'
}
