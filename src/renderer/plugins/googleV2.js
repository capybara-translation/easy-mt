import axios from 'axios'

const googleV2 = {
  /**
   * Base URL
   */
  baseUrl: 'https://translation.googleapis.com/language/translate/v2',

  /**
   * Fetches a list of languages available.
   * @param {Object} options - Includes the following properties:
   *    apiKey: API key,
   *    tgtLang: Language code into which the name field of the response is localized
   */
  async getLanguages (options) {
    try {
      const response = await axios.get(`${this.baseUrl}/languages`, {
        params: {
          key: options.apiKey,
          target: options.tgtLang,
          model: 'nmt'
        }
      })
      return response.data.data.languages.map(x => {
        return {code: x.language, name: x.name}
      })
    } catch (error) {
      console.log(error)
      throw error
    }
  },

  /**
   * private method called from translate().
   * @param {Object} options
   */
  async _translate (options) {
    try {
      const response = await axios.post(this.baseUrl,
        {...options}
        , {
          params: {
            key: options.key
          }
        })
      return response.data.data.translations.map((x, i) => {
        return {srcText: options.q[i], tgtText: x.translatedText}
      })
    } catch (error) {
      console.log(error)
      throw error
    }
  },

  /**
   * Translates an array of strings.
   * @param {Object} options - Includes the following properties:
   *    apiKey: API key,
   *    srcStrings: An array of string to translate
   *    srcLang: Language code from which srcStrings will be translated
   *    tgtLang: Language code into which srcStrings will be translated
   *    format: Format of srcStrings, either "text" (default) or "html"
   */
  async translate (options) {
    const reqBody = {
      source: options.srcLang,
      target: options.tgtLang,
      format: options.format || 'text',
      model: 'nmt',
      q: [],
      key: options.apiKey
    }

    const batchSize = 10 // max number of elements in q array
    let translations = []
    for (const srcString of options.srcStrings) {
      reqBody.q.push(srcString)
      if (reqBody.q.length === batchSize) {
        // Cap the length of q at 10 per request
        const batchTranslations = await this._translate(reqBody)
          .catch(error => {
            throw error
          })
        if (batchTranslations.length) {
          translations.push(...batchTranslations)
          reqBody.q.length = 0
        }
      }
    }
    // If q contains any strings left untranslated, send one more request.
    if (reqBody.q.length) {
      const batchTranslations = await this._translate(reqBody)
        .catch(error => {
          throw error
        })
      if (batchTranslations.length) {
        translations.push(...batchTranslations)
      }
    }

    return translations
  },

  /**
   * Vue plugin requirement
   * @param {Vue} Vue - Vue instance
   */
  install (Vue) {
    Vue.prototype.$googleV2 = googleV2
  }
}

export default googleV2
