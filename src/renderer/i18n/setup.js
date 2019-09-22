
import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)

/**
 * creates and loads a localization.
 *
 * @export
 * @param {string} locale
 * @returns a promise with the instance of vuei18n
 */
export async function createI18n (locale) {
  const { default: localemessages } = await import(`./lang/${locale}.json`)
  const messages = {
    [locale]: localemessages
  }

  const i18n = new VueI18n({
    locale: locale,
    fallbackLocale: locale,
    messages
  })

  return i18n
}
