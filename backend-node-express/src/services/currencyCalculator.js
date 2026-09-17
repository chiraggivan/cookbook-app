const db = require("../config/database.js");

// function to get and save the xchange rate wrt GBP in db table currencies
exports.getRateOfGBPforCurrencies = async () => {
  try {
    // free api call from frankfurter. gets: [{date:"", base:"", quote:"", rate: }]
    const res = await fetch("https://api.frankfurter.dev/v2/rates?base=gbp");
    const currentXchangeResult = await res.json();

    // save the xchange rate in db depending on currency code
    for (const item of currentXchangeResult) {
      const currency_code = item.quote;
      const x_rate = item.rate;

      const updateQuery = `UPDATE currencies 
                        SET gbp_conversion_rate = ?, rate_updated_at = CURRENT_TIMESTAMP 
                        WHERE code = ?`;

      await db.query(updateQuery, [x_rate, currency_code]);
    }
  } catch (error) {
    console.log("error while fetching currencies data from frankfurter -  error:", error);
  }
};
