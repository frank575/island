const { ParameterErrorException } = require('./ErrorException')
const { ValidatorErrorException } = require('./ErrorException')

// TODO 新增參數匯出文檔功能(可能 Rule 需要多一個寫類型的參數)
// TODO add custom validate
class WeiValidator {
  constructor (ctx) {
    this._state = {
      params: ctx.params,
      query: ctx.request.query,
      headers: ctx.request.headers,
      body: ctx.request.body,
    }
    this._rules = undefined
    // 當調用 validate 後，會將 validate 過的值緩存起來，防止重複遞歸遍歷
    this._cacheVal = {}
  }

  /**
   * key 遞歸遍歷值並緩存數據至 _cacheVal
   * @param key 遍歷的 key 路徑, e.g. 'params.id' [String]
   * @param state? 要遍歷的物件 [Object = this._state]
   * @returns 遍歷結果 [any, null]
   * @private
   */
  _recurGet(key, state = this._state) {
    const keys = key.split('.')
    return (function recurGet(state, i) {
      let result = null
      if (typeof state === 'object') {
        const stateElement = state[keys[i]]
        if (i >= keys.length - 1)
          result = stateElement || null
        else if (state != null)
          return recurGet(stateElement, i + 1)
      }
      return result
    })(state[keys[0]], 1)
  }

  _getCache(key, parsed = true) {
    const cacheValElement = this._cacheVal[key]
    return typeof cacheValElement === 'object' ?
      cacheValElement[parsed ? '1' : '0'] :
      cacheValElement
  }

  _setCache(key, value, parsed = true) {
    const cacheValElement = this._cacheVal[key]
    const parsedStr = parsed ? '1' : '0'
    if (cacheValElement != null)
      cacheValElement[parsedStr] = value
    else
      this._cacheVal[key] = { [parsedStr]: value }
    return value
  }

  /**
   * 取得 http 參數
   * @param key 取得 http 參數的 key, e.g. 'path.id' [String]
   * @param parsed 是否字串轉型(body 不轉型)，比方轉數字、Boolean [Boolean]
   */
  get(key, parsed = true) {
    const _parsed = key.indexOf('body.') === -1 ? parsed : false
    const cache = this._getCache(key, _parsed)
    let val = cache || this._recurGet(key)
    if (val != null &&
      _parsed) {
      if (/^\d+$/.test(val))
        val = parseInt(val)
      else if (/^[\d.]+$/.test(val))
        val = parseFloat(val)
      else if (val === 'true' ||
        val === 'false')
        val = Boolean(val)
    }
    if (cache == null)
      this._setCache(key, val, _parsed)
    return val
  }

  /**
   * 新增校驗規則
   * @param rulesOrCreateRule [{ [key: string]: Rule | Rule[] }, ((r, m, o) => Rule): { [key: string]: Rule | Rule[] }]
   */
  createRules(rulesOrCreateRule) {
    if (typeof rulesOrCreateRule === 'object')
      this._rules = rulesOrCreateRule
    else if (typeof rulesOrCreateRule === 'function')
      this._rules = rulesOrCreateRule((r, m, o) => new Rule(r, m, o))
  }

  async validate() {
    const {_rules} = this
    if (_rules != null) {
      const checkResults = []
      const waitRunRules = []
      const runRule = async (rule, key) => {
        const checkResult = await rule.check(key, this.get(key))
        if (checkResult != null)
          checkResults.push(checkResult)
      }
      const recurPushRunRule = (data, key) => {
        if (typeof data === 'object')
          if (Array.isArray(data))
            data.forEach(rule => {
              if (rule instanceof Rule)
                waitRunRules.push(runRule(rule, key))
              else
                throw new ValidatorErrorException(`[${key}] 規則請使用 Rule 來定義`)
            })
          else if (data instanceof Rule)
            waitRunRules.push(runRule(data, key))
          else
            for (const k in data)
              recurPushRunRule(data[k], `${key}.${k}`)
        else
          throw new ValidatorErrorException()
      }
      for (const k in _rules)
        recurPushRunRule(_rules[k], k)
      await Promise.all(waitRunRules)
      if (checkResults.length > 0)
        throw new ParameterErrorException(checkResults.length === 1 ?
          checkResults[0] :
          checkResults)
    }
    return this
  }

  // (舊版 validate) 調用方式採： xxx.xxx: r(...)
  async validateV1() {
    const {_rules} = this
    if (_rules != null) {
      const checkResults = []
      const waitRunRules = []
      const runRule = async (rule, key) => {
        const checkResult = await rule.check(key, this.get(key))
        if (checkResult != null)
          checkResults.push(checkResult)
      }
      for (const k in _rules) {
        const rules = _rules[k]
        if (Array.isArray(rules))
          rules.forEach(rule => waitRunRules.push(runRule(rule, k)))
        else if (rules instanceof Rule)
          waitRunRules.push(runRule(rules, k))
        else
          throw new ValidatorErrorException()
      }
      await Promise.all(waitRunRules)
      if (checkResults.length > 0)
        throw new ParameterErrorException(checkResults.length === 1 ?
          checkResults[0] :
          checkResults)
    }
    return this
  }
}

class Rule {
  /***
   * new
   * @param rule 校驗規則 [(value: any) => Boolean, String(checkXXX)]
   * @param messageOrOptions? 錯誤訊息，若 rule string 會有預設訊息 [String]
   * @param options? 額外選項，rule 為 String 時搭配使用(checkXXX 內處理) [{[key: string]: any}]
   */
  constructor (rule,
    messageOrOptions,
    options,) {
    let _message,
        _options = options
    if (typeof messageOrOptions === 'object')
      _options = messageOrOptions
    else
      _message = messageOrOptions
    this.rule = rule
    this.message = _message
    this.options = _options
    this._param = ''
    this._value = undefined
  }

  _getErrorMessage(message) {
    return `[${this._param}] ${this.message || message}`
  }

  /**
   * 驗證是否必填
   * options
   *   @key min? 字串長度最小值 [number]
   *   @key max? 字串長度最大值 [number]
   *   @key equals? 字串長度符合值 [number]
   * @returns {string|*}
   */
  _checkRequired() {
    const {_value, options} = this
    if (_value == null)
      return this._getErrorMessage('不得為空')
    if (options != null) {
      const { min, max, equals } = options
      const val = typeof _value === 'number' ? String(_value) : _value
      if (typeof val === 'string') {
        const len = val.length
        if (min != null &&
          len < min)
            return this._getErrorMessage(`不得小於 ${min} 個字元`)
        if (max != null &&
          len > max)
            return this._getErrorMessage(`不得大於 ${max} 個字元`)
        if (equals != null &&
          len !== equals)
            return this._getErrorMessage(`必須為 ${equals} 個字元`)
      }
    }
  }

  /**
   * 驗證是否是整數
   * options
   *   @key min? 最小值 [number]
   *   @key max? 最大值 [number]
   * @returns {string|*}
   */
  _checkInt() {
    const {_value, options} = this
    if (typeof _value !== 'number')
      return this._getErrorMessage('必須為正整數')
    if (options != null) {
      const {min, max} = options
      if (min != null &&
        _value < min)
          return this._getErrorMessage(`不能小於 ${min}`)
      if (max != null &&
        _value > max)
          return this._getErrorMessage(`不能大於 ${max}`)
    }
  }

  /**
   * 驗證是否是整數
   * options
   *   @key model sequelize model [Model]
   *   @key key 比對的 db 字段名 [string]
   * @returns {string|*}
   */
  async _checkUnique() {
    const { _value, options } = this
    if (options != null) {
      const { model, key } = options
      if (model != null &&
        key != null) {
        const check = await model.findOne({
          where: {
            [key]: _value,
          }
        })
        if (check != null)
          return this._getErrorMessage(`已存在`)
      }
    }
  }

  /**
   * 驗證是否是布爾值
   * @returns {string|*}
   */
  _checkBoolean() {
    const { _value } = this
    if (typeof _value === 'boolean')
      return
    return this._getErrorMessage(`非布爾值`)
  }

  _checkEmail() {}

  _checkPhone() {}

  /**
   * 執行參數校驗
   * @param param 參數名字, e.g. 'param.id' [String]
   * @param value 參數值 [any]
   * @returns {string|*}
   */
  async check(param, value) {
    const {rule} = this
    this._param = param
    this._value = value
    if (typeof rule === 'string') {
      const firstRuleWord = rule[0].toUpperCase()
      const ruleName = `${firstRuleWord}${rule.substr(1)}`
      const checkFunctionKey = `_check${ruleName}`
      const checkFunction = this[checkFunctionKey]
      if (checkFunction != null)
        return await checkFunction.call(this)
      else
        throw new ValidatorErrorException(`[${rule}] 未定義 check 函數`)
    } else if (typeof rule === 'function' &&
      !(await rule(value)))
      return this._getErrorMessage()
  }
}

module.exports = {
  WeiValidator,
  Rule,
}
