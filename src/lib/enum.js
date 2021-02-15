class Enum {
  static create(enums) {
    enums._reverse = {}
    for (const k in enums)
      enums._reverse[enums[k]] = k

    enums.add = (key, val) => {
      enums[key] = val
      enums._reverse[val] = key
    }

    enums.delete = key => {
      delete enums._reverse[enums[key]]
      delete enums[key]
    }

    enums.has = val => enums._reverse[val] != null

    enums.getKey = val => enums._reverse[val]
  }
}

const LoginType = {
  USER_MINI_PROGRAM: 100
}
Enum.create(LoginType)

module.exports = {
  LoginType,
}
