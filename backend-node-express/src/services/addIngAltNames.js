const db = require("../config/database.js");
const { translateIngredients } = require("../services/groqService.js");

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
        LIMIT 10
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

    if (result.length === 0) {
      console.log("No data found in db to process");
      return;
    }
    const ing_id_list = result.map((i) => i.ingredient_id);
    const ing_name_list = result.map((i) => i.name);
    const names_string = ing_name_list.join(", ");

    // get the ids of languages from languages table
    const [lang_result] = await db.query(lang_query, languages);
    // console.log("language result :", result);

    if (lang_result.length === 0) {
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

      // start inserting data in ingredient_translations table with the help of ing_id and lang_id
      for (const ingObj of ai_result?.ingredients ?? []) {
        const ing_id = result.find((i) => i.name === ingObj.name)?.ingredient_id;

        if (ing_id) {
          // console.log("ing id found is :", ing_id);
          for (const langObj of ingObj.languages ?? []) {
            // console.log("langObj :", langObj);
            const lang_id = lang_result.find((i) => i.name === langObj.language_name).language_id;
            if (lang_id) {
              // console.log("lang id found is :", lang_id);
              if (ingObj.name === langObj.roman) {
                langObj.same_as_ingredient = true;
              }
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

const x = {
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
          native: "મીઠુ",
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
          roman: "neebu",
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
      name: "mushroom",
      languages: [
        {
          language_name: "Hindi",
          native: "मशरूम",
          roman: "mashroom",
          same_as_ingredient: false,
          status: "confirmed",
        },
        {
          language_name: "Marathi",
          native: "मशरूम",
          roman: "mashroom",
          same_as_ingredient: false,
          status: "confirmed",
        },
        {
          language_name: "Gujarati",
          native: "મશરૂમ",
          roman: "mashroom",
          same_as_ingredient: false,
          status: "confirmed",
        },
      ],
    },
  ],
};

const y = {
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
              required: ["language_name", "native", "roman", "same_as_ingredient", "status"],
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
};

const njson = {
  ingredients: [
    {
      name: "salt",
      languages: {
        Hindi: [{ roman: "namak", native: "नमक", status: "confirmed", same_as_ingredient: false }],
        Marathi: [
          { roman: "meeth", native: "मीठ", status: "confirmed", same_as_ingredient: false },
        ],
        Gujarati: [
          { roman: "mithu", native: "મીઠું", status: "confirmed", same_as_ingredient: false },
        ],
      },
    },
  ],
};

const eg = {
  ingredient: "salt",
  hindi: [
    {
      roman: "namak",
      native: "नमक",
      confirmed: true,
      same_as_ingredient: false,
    },
  ],
  gujarati: [
    {
      roman: "mithu",
      native: "મીઠું",
      confirmed: true,
      same_as_ingredient: false,
    },
  ],
  marathi: [
    {
      roman: "meeth",
      native: "मीठ",
      confirmed: true,
      same_as_ingredient: false,
    },
  ],
};

const awad = {
  content: [
    {
      type: "output_text",
      text: '{"ingredients":[{"name":"salt","languages":{"Hindi":[{"native":"नमक","roman":"namak","same_as_ingredient":false,"status":"confirmed"}],"Marathi":[{"native":"मीठ","roman":"meeth","same_as_ingredient":false,"status":"confirmed"}],"Gujarati":[{"native":"મીઠુ","roman":"mithu","same_as_ingredient":false,"status":"confirmed"}]}},{"name":"lemon","languages":{"Hindi":[{"native":"नींबू","roman":"neebu","same_as_ingredient":false,"status":"confirmed"}],"Marathi":[{"native":"लिंबू","roman":"limbu","same_as_ingredient":false,"status":"confirmed"}],"Gujarati":[{"native":"લીંબુ","roman":"limbu","same_as_ingredient":false,"status":"confirmed"}]}},{"name":"honey","languages":{"Hindi":[{"native":"शहद","roman":"shahad","same_as_ingredient":false,"status":"confirmed"}],"Marathi":[{"native":"मध","roman":"madh","same_as_ingredient":false,"status":"confirmed"}],"Gujarati":[{"native":"મધ","roman":"madh","same_as_ingredient":false,"status":"confirmed"}]}},{"name":"mushroom","languages":{"Hindi":[{"native":"मशरूम","roman":"mashroom","same_as_ingredient":false,"status":"confirmed"}],"Marathi":[{"native":"मशरूम","roman":"mashroom","same_as_ingredient":false,"status":"confirmed"}],"Gujarati":[{"native":"મશરૂમ","roman":"mashroom","same_as_ingredient":false,"status":"confirmed"}]}}]}',
      annotations: [],
      logprobs: null,
    },
  ],
};

const new_data = {
  content: [
    {
      type: "output_text",
      text: '{"ingredients":[{"name":"salt","languages":[{"language_name":"Hindi","native":"नमक","roman":"namak","same_as_ingredient":false,"status":"confirmed"},{"language_name":"Marathi","native":"मीठ","roman":"meeth","same_as_ingredient":false,"status":"confirmed"},{"language_name":"Gujarati","native":"મીઠું","roman":"mithu","same_as_ingredient":false,"status":"confirmed"}]},{"name":"lemon","languages":[{"language_name":"Hindi","native":"नींबू","roman":"neembu","same_as_ingredient":false,"status":"confirmed"},{"language_name":"Marathi","native":"लिंबू","roman":"limbu","same_as_ingredient":false,"status":"confirmed"},{"language_name":"Gujarati","native":"લીંબુ","roman":"limbu","same_as_ingredient":false,"status":"confirmed"}]},{"name":"honey","languages":[{"language_name":"Hindi","native":"शहद","roman":"shahad","same_as_ingredient":false,"status":"confirmed"},{"language_name":"Marathi","native":"मध","roman":"madh","same_as_ingredient":false,"status":"confirmed"},{"language_name":"Gujarati","native":"મધ","roman":"madh","same_as_ingredient":false,"status":"confirmed"}]},{"name":"baking soda","languages":[{"language_name":"Hindi","native":"बेकिंग सोडा","roman":"baking soda","same_as_ingredient":true,"status":"confirmed"},{"language_name":"Marathi","native":"बेकिंग सोडा","roman":"baking soda","same_as_ingredient":true,"status":"confirmed"},{"language_name":"Gujarati","native":"બેકિંગ સોડા","roman":"baking soda","same_as_ingredient":true,"status":"confirmed"}]}]}',
      annotations: [],
      logprobs: null,
    },
  ],
};
const json_ing = JSON.parse(new_data.content[0].text).ingredients;

const sample = {
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
// console.log("json_ing :", json_ing);

// json_ing.forEach((ing) => {
//   console.log("Ingredient name is ", ing.name);
//   ing.languages.forEach((obj) => {
//     console.log(obj);
//   });
// });
