const db = require("../config/database.js");
const { translateIngredients } = require("../services/groqService.js");

const cleanString = (value) =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ").toLowerCase() : null;

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

// func to normalise data received from ai to our required format
const normalise = (data) => {
  const cleaned = {};

  // data dint come as obj of json
  if (!isObject(data)) {
    return cleaned;
  }

  // first level only has ingredients as array
  const fields = ["ingredients"];
  for (const field of fields) {
    const value = data[field];

    // value of "ingredients" should be array - if NOT then assign empty array
    if (Array.isArray(value)) {
      const ing_array = [];

      for (const obj of value) {
        // each element in an array should be json obj - if NOT then skip that element
        if (!isObject(obj)) continue;

        // each obj should be check for pre defined fields
        const ing_fields = ["name", "languages"];
        const ing_obj = {};

        for (const ifield of ing_fields) {
          const ings_value = obj[ifield];

          if (typeof ings_value === "string") {
            ing_obj[ifield] = cleanString(ings_value);
          } else if (Array.isArray(ings_value)) {
            const ifield_array = [];

            for (const langObj of ings_value) {
              // each element in an array should be json obj - if NOT then skip that element
              if (!isObject(langObj)) continue;

              const lang_fields = [
                "language_name",
                "native",
                "roman",
                "same_as_ingredient",
                "status",
              ];
              const lang_obj = {};

              for (const lfield of lang_fields) {
                const langs_value = langObj[lfield];

                if (typeof langs_value === "string") {
                  lang_obj[lfield] = cleanString(langs_value);
                } else if (typeof langs_value === "boolean") {
                  lang_obj[lfield] = langs_value;
                } else {
                  lang_obj[lfield] = null;
                }
              }

              ifield_array.push(lang_obj);
            }

            ing_obj[ifield] = ifield_array;
          } else {
            ing_obj[field] = null;
          }
        }

        ing_array.push(ing_obj);
      }

      // all elements of array checked, give the array to the field "ingredients"
      cleaned[field] = ing_array;
    } else {
      cleaned[field] = [];
    }
  }

  return cleaned;
};

// CURRENTLY only validates the objects of languages to make sure all the properties are available and valid
const validate = (obj) => {
  if (!obj.language_name || typeof obj.language_name !== "string") {
    return `Language name is required for ingredient: ${ingredient.name}.`;
  }

  if (!obj.native || typeof obj.native !== "string") {
    return `Native translation is required for ${obj.language_name}.`;
  }

  if (!obj.roman || typeof obj.roman !== "string") {
    return `Roman translation is required for ${obj.language_name}.`;
  }

  if (typeof obj.same_as_ingredient !== "boolean") {
    return `same_as_ingredient must be a boolean for ${obj.language_name}.`;
  }

  if (!["confirmed", "uncertain"].includes(obj.status)) {
    return `Invalid translation status (${obj.status}) for ${obj.language_name}.`;
  }

  return null;
};

// function to fetch the 10 ingredient_id from ingredients table that are not there in ingredient_translations
exports.getAlternativeNamesForIngredients = async () => {
  console.log("starting ingredient alternative names in crons..........");
  const languages = ["Hindi", "Marathi", "Gujarati"];

  db_query = `
        SELECT i.ingredient_id, i.name 
        FROM ingredients i
        WHERE i.is_active = 1
        AND NOT EXISTS (SELECT 1
                        FROM ingredient_translations it
                        WHERE it.ingredient_id = i.ingredient_id)
        ORDER BY i.created_at ASC
        LIMIT 3
        `;

  lang_query = `
    SELECT language_id, name
    FROM languages 
    WHERE name IN (?,?,?)
  `;

  try {
    // get the 10 ingredients
    const [result] = await db.query(db_query);
    // console.log("result :", result);
    const total_ing = result.length;

    if (total_ing === 0) {
      console.log("No data found in db to process");
      return;
    }
    const ing_id_list = result.map((i) => i.ingredient_id);
    const ing_name_list = result.map((i) => i.name);
    const names_string = ing_name_list.join(", ");

    // get the ids of languages from languages table
    const [lang_result] = await db.query(lang_query, languages);
    // console.log("language result :", result);
    const total_lang = lang_result.length;

    if (total_lang === 0) {
      console.log("No data found in db for languages to process");
      return;
    }

    const lang_name_list = lang_result.map((i) => i.name);
    const lang_string = lang_name_list.join(", ");

    // initialise the prompt for ai
    const prompt = `Translate the following ingredient(s) ${names_string} into their commonly used forms in ${lang_string}. For each translation, provide its Roman transliteration and native script. Set status to confirmed when you are confident about the translation, otherwise uncertain. Set same_as_ingredient to true if the translated name is commonly the same as the original ingredient name, otherwise false , for eg. mushroom as ingredient is commonly called same for hindi gujarati or marathi so same_as_ingredient should be true. Return only the requested structured data.`;

    // set the format of response
    const text_format = {
      format: {
        type: "json_schema",
        name: "ingredient_translations",
        strict: true,
        schema: {
          type: "object",
          properties: {
            ingredients: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                  },
                  languages: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        language_name: {
                          type: "string",
                          enum: ["Hindi", "Marathi", "Gujarati"],
                        },
                        native: {
                          type: "string",
                        },
                        roman: {
                          type: "string",
                        },
                        same_as_ingredient: {
                          type: "boolean",
                        },
                        status: {
                          type: "string",
                          enum: ["confirmed", "uncertain"],
                        },
                      },
                      required: [
                        "language_name",
                        "native",
                        "roman",
                        "same_as_ingredient",
                        "status",
                      ],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["name", "languages"],
                additionalProperties: false,
              },
            },
          },
          required: ["ingredients"],
          additionalProperties: false,
        },
      },
    };

    // call the ai service and get the result
    try {
      const ai_result = await translateIngredients(ing_name_list, prompt, text_format);
      // console.log("ai_result :", ai_result);

      // normalise data received from ai (validation is done at languages insertion level)
      const normalised_data = normalise(ai_result);

      // start inserting data(received via AI) in ingredient_translations table with the help of ing_id and lang_id
      for (const ingObj of normalised_data?.ingredients ?? []) {
        // get ing_id by cross checking the name of ingredient(via ai) with the list of ing we sent to ai
        const ing_id = result.find(
          (i) => i.name.toLowerCase() === ingObj.name?.toLowerCase(),
        )?.ingredient_id;

        // only move forward if ing_id is found (sent ing name and received ing name matches -as ai CANNOT be trusted blindly)
        if (ing_id) {
          // iterate for each language obj within languages
          for (const langObj of Array.isArray(ingObj.languages) ? ingObj.languages : []) {
            const lang_id = lang_result.find(
              (i) => i.name.toLowerCase() === langObj.language_name?.toLowerCase(),
            ).language_id;

            if (lang_id) {
              // forcefully check if roman text and ingredient name is same then flag same_as_ingredient
              if (ingObj.name?.toLowerCase() === langObj.roman?.toLowerCase()) {
                langObj.same_as_ingredient = true;
              }

              // validate languages obj fields.. As all field required.
              // Also if any of the one language obj has missing or wrong data, we will still save languages details of other languages
              const error = validate(langObj);
              if (error) {
                console.log(`language obj result validation failed: ${error}`);
                continue;
              }

              // if NO error during validation, start inserting data
              try {
                await db.query(
                  `INSERT INTO ingredient_translations(ingredient_id, language_id, roman_text, native_text, same_as_english_name, status)
                            VALUES(?,?,?,?,?,?)`,
                  [
                    ing_id,
                    lang_id,
                    langObj.roman,
                    langObj.native,
                    langObj.same_as_ingredient,
                    langObj.status,
                  ],
                );
              } catch (error) {
                console.log("error while inserting data in ingredient_translation table : ", error);
              }
            }
          }
        }
      }
      console.log("completed the process of translating ingredients");
    } catch (error) {
      console.log("Error found ai process :", error);
    }
  } catch (error) {
    console.log("Error found during fetching data from db for 10 ingredeint :", error);
  }
};

// SELECT i.ingredient_id, i.ingredient_name
// FROM ingredients i
// WHERE i.is_active = 1
// AND NOT EXISTS (
//     SELECT 1
//     FROM ingredient_translations it
//     WHERE it.ingredient_id = i.ingredient_id
//     AND it.language_id = ?
// )
// ORDER BY i.created_at ASC
// LIMIT 10;

const sample_ai_reuslt_should_be = {
  ingredients: [
    {
      name: "salt",
      languages: [
        {
          language_name: "Hindi",
          native: "नमक",
          roman: "namak",
          same_as_ingredient: false,
          status: "confirmed",
        },
        {
          language_name: "Marathi",
          native: "मीठ",
          roman: "meeth",
          same_as_ingredient: false,
          status: "confirmed",
        },
        {
          language_name: "Gujarati",
          native: "મીઠું",
          roman: "mithu",
          same_as_ingredient: false,
          status: "confirmed",
        },
      ],
    },
    {
      name: "lemon",
      languages: [
        {
          language_name: "Hindi",
          native: "नींबू",
          roman: "neembu",
          same_as_ingredient: false,
          status: "confirmed",
        },
        {
          language_name: "Marathi",
          native: "लिंबू",
          roman: "limbu",
          same_as_ingredient: false,
          status: "confirmed",
        },
        {
          language_name: "Gujarati",
          native: "લીંબુ",
          roman: "limbu",
          same_as_ingredient: false,
          status: "confirmed",
        },
      ],
    },
    {
      name: "honey",
      languages: [
        {
          language_name: "Hindi",
          native: "शहद",
          roman: "shahad",
          same_as_ingredient: false,
          status: "confirmed",
        },
        {
          language_name: "Marathi",
          native: "मध",
          roman: "madh",
          same_as_ingredient: false,
          status: "confirmed",
        },
        {
          language_name: "Gujarati",
          native: "મધ",
          roman: "madh",
          same_as_ingredient: false,
          status: "confirmed",
        },
      ],
    },
    {
      name: "baking soda",
      languages: [
        {
          language_name: "Hindi",
          native: "बेकिंग सोडा",
          roman: "baking soda",
          same_as_ingredient: true,
          status: "confirmed",
        },
        {
          language_name: "Marathi",
          native: "बेकिंग सोडा",
          roman: "baking soda",
          same_as_ingredient: true,
          status: "confirmed",
        },
        {
          language_name: "Gujarati",
          native: "બેકિંગ સોડા",
          roman: "baking soda",
          same_as_ingredient: true,
          status: "confirmed",
        },
      ],
    },
  ],
};
