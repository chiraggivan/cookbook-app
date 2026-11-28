const userObjForToken = (user) => {
  return {
    id: user.user_id,
    username: user.username ?? user.email,
    role: user.role,
    country_id: user.country_id,
    country_name: user.country_name,
    currency_id: user.currency_id,
    currency_symbol: user.currency_symbol,
    pil_id: user.pil_id,
    ing_lang: user.ing_lang,
    ing_native_lang: user.ing_native_lang,
  };
};

const userObjForResponse = (user) => {
  return {
    user_id: user.user_id,
    username: user.username ?? user.email,
    role: user.role,
    display_name: user.display_name,
    picture_url: user.picture_url,
    country_id: user.country_id,
    country_name: user.country_name,
    currency_id: user.currency_id,
    currency_symbol: user.currency_symbol,
    pil_id: user.pil_id,
    ing_lang: user.ing_lang,
    ing_native_lang: user.ing_native_lang,
  };
};

module.exports = { userObjForToken, userObjForResponse };
