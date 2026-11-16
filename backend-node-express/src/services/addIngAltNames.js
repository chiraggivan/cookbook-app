const db = require("../config/database.js");

// function to fetch the 10 ingredient_id from ingredients table
//  that are not there in ingredient_alt_names
exports.getAlternativeNamesForIngredients = async () => {
  db_query = `
        SELECT ingredient_id, name 
        FROM ingredients 
        WHERE is_active = 1
        ORDER BY created_at ASC
        LIMIT 10
        `;

  try {
    const [result] = await db.query(db_query);
    // console.log("result :", result);

    if (result.length === 0) {
      console.log("result came as no data");
      return;
    }
    const ing_id_list = result.map((i) => i.ingredient_id);
    const ing_name_list = result.map((i) => i.name);
    // console.log("ingredient names are:", ing_name_list);

    const names_string = ing_name_list.join(", ");
    // console.log("names_string is : ", names_string);
    const languages = `Hindi, Marathi and Gujarati`;

    const prompt = `Convert the ingredient(s) ${names_string} into its commonly used Roman-script transliteration in ${languages}. Return only valid JSON. For each translation, include a type field containing the translated name and a status field containing either confirmed or uncertain. Assess each translation individually.`;
    console.log("Prompt text is:", prompt);

    const sample =
      '{"ingredient": "salt", "languages": {"Hindi": [{"name": "Namak", "status": "confirmed"}], "Marathi": [{"name": "Meeth", "status": "confirmed"}], "Gujarati": [{"name": "Meethu", "status": "confirmed"}]}}';

    const njson = {
      ingredients: [
        {
          ing_name: "salt",
          languages: {
            Hindi: [
              { roman: "namak", native: "नमक", status: "confirmed", same_as_ingredient: false },
            ],
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

    const datatocome = {
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            ingredients: "ARRAY",
            items: "OBJECT",
            properties: {
              ing_name: {
                type: "STRING",
              },
              languages: {
                type: "OBJECT",
                properties: {
                  language1: {
                    type: "ARRAY",
                    items: {
                      type: "OBJECT",
                      properties: {
                        roman: { type: "STRING" },
                        native: { type: "STRING" },
                        same_as_ingredient: { type: "BOOLEAN" },
                        status: {
                          type: "STRING",
                          enum: ["confirmed", "uncertain"],
                        },
                      },
                      required: ["roman", "native", "status", "same_as_ingredient"],
                    },
                  },
                },
              },
            },
            required: ["ing_name", "languages"],
          },
          required: ["ingredients"],
        },
      },
    };

    const awad = {
      content: [
        {
          type: "output_text",
          text: '{\n  "Hindi": [\n    {\n      "roman": "namak",\n      "native": "नमक",\n      "confirmed": true,\n      "same_as_ingredient": false\n    },\n    {\n      "roman": "nimbu",\n      "native": "नींबू",\n      "confirmed": true,\n      "same_as_ingredient": false\n    },\n    {\n      "roman": "shahad",\n      "native": "शहद",\n      "confirmed": true,\n      "same_as_ingredient": false\n    },\n    {\n      "roman": "mushroom",\n      "native": "मशरूम",\n      "confirmed": true,\n      "same_as_ingredient": true\n    }\n  ],\n  "Marathi": [\n    {\n      "roman": "meeth",\n      "native": "मीठ",\n      "confirmed": true,\n      "same_as_ingredient": false\n    },\n    {\n      "roman": "limbu",\n      "native": "लिंबू",\n      "confirmed": true,\n      "same_as_ingredient": false\n    },\n    {\n      "roman": "madh",\n      "native": "मध",\n      "confirmed": true,\n      "same_as_ingredient": false\n    },\n    {\n      "roman": "mushroom",\n      "native": "मशरूम",\n      "confirmed": true,\n      "same_as_ingredient": true\n    }\n  ],\n  "Gujarati": [\n    {\n      "roman": "mithu",\n      "native": "મીઠું",\n      "confirmed": true,\n      "same_as_ingredient": false\n    },\n    {\n      "roman": "limbu",\n      "native": "લીંબુ",\n      "confirmed": true,\n      "same_as_ingredient": false\n    },\n    {\n      "roman": "mad",\n      "native": "મધ",\n      "confirmed": true,\n      "same_as_ingredient": false\n    },\n    {\n      "roman": "mushroom",\n      "native": "મશરુમ",\n      "confirmed": true,\n      "same_as_ingredient": true\n    }\n  ]\n}',
        },
      ],
    };
    console.log("sample json is :", JSON.parse(awad.content[0].text));
    console.log("reached here after sample");
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
