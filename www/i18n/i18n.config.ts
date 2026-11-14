import AppHeader from './locales/components/AppHeader'
import AppFooter from './locales/components/AppFooter'
import Forms from './locales/components/Forms'
import Brand from './locales/components/Brand'
import IndexPage from './locales/pages/IndexPage'
import ContactPage from './locales/pages/ContactPage'
import VipPage from './locales/pages/VipPage'
import PrivateEventsPage from './locales/pages/PrivateEventsPage'
import GalleryPage from './locales/pages/GalleryPage'
import TextPage from './locales/pages/TextPage'
import NightPages from './locales/pages/NightPages'

export default defineI18nConfig(() => ({
  legacy: false,
  fallbackLocale: 'en',
  messages: {
    en: {
      AppHeader: AppHeader.en,
      AppFooter: AppFooter.en,
      Forms: Forms.en,
      Brand: Brand.en,
      IndexPage: IndexPage.en,
      ContactPage: ContactPage.en,
      VipPage: VipPage.en,
      PrivateEventsPage: PrivateEventsPage.en,
      GalleryPage: GalleryPage.en,
      TextPage: TextPage.en,
      NightPages: NightPages.en
    },
    es: {
      AppHeader: AppHeader.es,
      AppFooter: AppFooter.es,
      Forms: Forms.es,
      Brand: Brand.es,
      IndexPage: IndexPage.es,
      ContactPage: ContactPage.es,
      VipPage: VipPage.es,
      PrivateEventsPage: PrivateEventsPage.es,
      GalleryPage: GalleryPage.es,
      TextPage: TextPage.es,
      NightPages: NightPages.es
    }
  }
}))
