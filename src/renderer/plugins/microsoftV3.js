import axios from 'axios'

const microsoftV3 = {
  /**
   * Base URL
   */
  baseUrl: 'https://api.cognitive.microsofttranslator.com',

  /**
   * Fetches a list of languages available
   * @param {Object} options - Includes the following properties:
   *    apiKey: API key,
   *    tgtLang: Language code into which the name field of the response is localized,
   *    scope: Defines the group of languages returned (Default: translation)
   */
  async getLanguages (options) {
    try {
      const scope = options.scope || 'translation'
      const response = await axios.get(`${this.baseUrl}/languages`, {
        params: {
          'api-version': '3.0',
          scope: scope
        },
        headers: {
          'Ocp-Apim-Subscription-Key': options.apiKey,
          'Accept-Language': options.tgtLang
        }
      })
      const langMap = response.data.translation
      return Object.keys(langMap).map(key => {
        return {code: key, name: langMap[key].name}
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
      const response = await axios.post(`${this.baseUrl}/translate`,
        options.srcStrings,
        {
          params: {
            'api-version': '3.0',
            from: options.from,
            to: options.to,
            textType: options.textType,
            category: options.category
          },
          headers: {
            'Ocp-Apim-Subscription-Key': options.apiKey,
            'Content-Type': 'application/json'
          }
        })
      return response.data.map((x, i) => {
        return {srcText: options.srcStrings[i].Text, tgtText: x.translations[0].text}
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
   *    format: Format of srcStrings, either "plain" (default) or "html"
   *    category: Category ID or "general" (default)
   */
  async translate (options) {
    const reqBody = {
      from: options.srcLang,
      to: options.tgtLang,
      textType: options.format || 'plain',
      category: options.category || 'general',
      srcStrings: [],
      apiKey: options.apiKey
    }

    const batchSize = 5 // max number of elements in srcStrings array
    let translations = []
    for (const srcString of options.srcStrings) {
      reqBody.srcStrings.push({Text: srcString})
      if (reqBody.srcStrings.length === batchSize) {
        // Cap the length of srcStrings at 5 per request
        const batchTranslations = await this._translate(reqBody)
          .catch(error => {
            throw error
          })
        if (batchTranslations.length) {
          translations.push(...batchTranslations)
          reqBody.srcStrings.length = 0
        }
      }
    }
    // If srcStrings contains any strings left untranslated, send one more request.
    if (reqBody.srcStrings.length) {
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
    Vue.prototype.$microsoftV3 = microsoftV3
  }
}

export default microsoftV3
