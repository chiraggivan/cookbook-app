import groq from "../config/groq.js";

const ingredientSchema = {
  type: "object",
  properties: {
    ingredients: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          languages: {
            type: "array",
            items: {
              type: "object",
              properties: {
                language_name: {
                  type: "string",
                  enum: ["Hindi", "Marathi", "Gujarati"],
                },
                native: { type: "string" },
                roman: { type: "string" },
                same_as_ingredient: { type: "boolean" },
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

export const translateIngredients = async (ingredients, input_text, text_format) => {
  //   console.log("ingredients are :", ingredients);
  //   console.log("input_text is :", input_text);
  //   console.log("response format is :", text_format);
  try {
    const response = await groq.responses.create({
      model: "openai/gpt-oss-120b",
      input: input_text,
      text: text_format,
    });
    return JSON.parse(response.output_text);
  } catch (error) {
    console.error("Error in groq Service - Groq translation error:", error);
    throw error;
  }
};
