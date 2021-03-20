const { func } = require("@hapi/joi")

const decoratorValidator = (fn, schema, argsType) => {
  return async function (event) {
    const item = event[argsType];
    const data = argsType === 'body' ? JSON.parse(item) : item;

    /* abortEarly: shows all errors in the same message */
    const { error, value } = await schema.validate(data, { abortEarly: false })

    /* change the arguments instance */
    event[argsType] = value

    /*
      The arguments is to get all the params that came
      The apply returs the function that will be executed
    */

    if (!error) return fn.apply(this, arguments)

    return {
      statusCode: 422, //unprocessable entity
      body: error.message
    }
  }
}

module.exports = decoratorValidator