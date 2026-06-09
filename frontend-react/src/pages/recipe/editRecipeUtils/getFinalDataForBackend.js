export function getFinalDataForBackend(recipeInfo, OgData) {
  // console.log("final recipeInfo :", recipeInfo);
  const finalDataToSent = {};
  const recipe = recipeInfo.recipe || {};
  const OgRecipe = OgData.recipe || {};
  const components = recipeInfo.components || [];
  const OgComponents = OgData.components || [];
  const ingredients = components.flatMap((comp) => comp.ingredients) || [];
  const OgIngredients = OgComponents.flatMap((comp) => comp.ingredients) || [];
  const steps = recipeInfo.steps || [];
  const OgSteps = OgData.steps || [];

  if (recipe.name !== OgRecipe.name) {
    finalDataToSent.name = recipe.name;
  }
  if (recipe.portion_size !== OgRecipe.portion_size) {
    finalDataToSent.portion_size = recipe.portion_size;
  }
  if (recipe.privacy !== OgRecipe.privacy) {
    finalDataToSent.privacy = recipe.privacy;
  }
  if (recipe.description !== OgRecipe.description) {
    finalDataToSent.description = recipe.description;
  }

  finalDataToSent.add_components = [];
  finalDataToSent.update_components = [];
  finalDataToSent.remove_components = [];

  // console.log("ingredients :", ingredients);
  // console.log("OgIngredients :", OgIngredients);

  // -------------------------------------------------  Components ---------------------------------------------------------------
  // get add_components and update_components values by comparing OgData and newData(recipeInfo)
  components.forEach((comp) => {
    if (comp.recipeComponentId) {
      // update_components data
      const OgComp = OgComponents.find((c) => c.recipeComponentId === comp.recipeComponentId);
      const updtComp = {};
      if (comp.componentDisplayOrder !== OgComp.componentDisplayOrder) {
        updtComp.recipe_component_id = comp.recipeComponentId;
        updtComp.component_display_order = comp.componentDisplayOrder;
      }
      if (comp.componentText !== OgComp.componentText) {
        updtComp.recipe_component_id = comp.recipeComponentId;
        updtComp.component_text = comp.componentText;
      }
      if (Object.keys(updtComp).length !== 0) {
        finalDataToSent.update_components.push(updtComp);
      }
    } else {
      // add_components logic
      const addComp = {};
      addComp.component_text = comp.componentText;
      addComp.component_display_order = comp.componentDisplayOrder;
      finalDataToSent.add_components.push(addComp);
    }
  });

  // get remove_components values by comparing OgData and recipeInfo
  const rci = components.filter((c) => c.recipeComponentId).map((comp) => comp.recipeComponentId);
  const OgRci = OgComponents.map((comp) => comp.recipeComponentId);
  const removeArrayComp = OgRci.filter((id) => !rci.includes(id));
  removeArrayComp.forEach((value) => {
    const obj = {};
    obj.recipe_component_id = value;
    finalDataToSent.remove_components.push(obj);
  });

  // -------------------------------------------------  ingredients ---------------------------------------------------------------

  finalDataToSent.add_ingredients = [];
  finalDataToSent.update_ingredients = [];
  finalDataToSent.remove_ingredients = [];

  // get remove_ingredients values by comparing OgData and recipeInfo
  const rii = ingredients.filter((i) => i.recipeIngredientId).map((ing) => ing.recipeIngredientId);
  const OgRii = OgIngredients.filter((i) => i.recipeIngredientId).map(
    (ing) => ing.recipeIngredientId,
  );
  const removeArrayIng = OgRii.filter((id) => !rii.includes(id));
  removeArrayIng.forEach((value) => {
    const obj = {};
    obj.recipe_ingredient_id = value;
    finalDataToSent.remove_ingredients.push(obj);
  });

  // get add_ingredients and update_ingredients values by comparing OgData and newData(recipeInfo)
  ingredients.forEach((ing) => {
    if (ing.recipeIngredientId) {
      // ------------------------ update_ingredients data
      const OgIng = OgIngredients.find((c) => c.recipeIngredientId === ing.recipeIngredientId);
      const updtIng = {};
      // check component_display_order
      if (ing.componentDisplayOrder !== OgIng.componentDisplayOrder) {
        updtIng.recipe_ingredient_id = ing.recipeIngredientId;
        updtIng.component_display_order = ing.componentDisplayOrder;
      }
      // check ingredient_display_order
      if (ing.ingredientDisplayOrder !== OgIng.ingredientDisplayOrder) {
        updtIng.recipe_ingredient_id = ing.recipeIngredientId;
        updtIng.ingredient_display_order = ing.ingredientDisplayOrder;
      }
      //  check ingredient_id
      if (ing.ingredientId !== OgIng.ingredientId) {
        updtIng.recipe_ingredient_id = ing.recipeIngredientId;
        updtIng.ingredient_id = ing.ingredientId;
        updtIng.ingredient_source = ing.ingredientSource;
      }
      //  check ingredient_source --> NOT required as dont have direct access, it should show with the change in ingredientID
      // if (ing.ingredientSource !== OgIng.ingredientSource) {
      //   updtIng.recipe_ingredient_id = ing.recipeIngredientId;
      //   updtIng.ingredient_source = ing.ingredientSource;
      // }
      //  check quantity
      if (ing.quantity !== OgIng.quantity) {
        updtIng.recipe_ingredient_id = ing.recipeIngredientId;
        updtIng.quantity = ing.quantity;
      }
      //  check unit
      if (ing.unitId !== OgIng.unitId) {
        updtIng.recipe_ingredient_id = ing.recipeIngredientId;
        updtIng.unit_id = ing.unitId;
      }
      // check if any one of Display : quantity, unit or price has changed then send all
      if (
        ing.displayPrice !== OgIng.displayPrice ||
        ing.displayUnit !== OgIng.displayUnit ||
        ing.displayQuantity !== OgIng.displayQuantity
      ) {
        updtIng.recipe_ingredient_id = ing.recipeIngredientId;
        updtIng.base_price = ing.displayPrice;
        updtIng.base_quantity = ing.displayQuantity;
        updtIng.base_unit = ing.displayUnit;
      }
      if (Object.keys(updtIng).length !== 0) {
        finalDataToSent.update_ingredients.push(updtIng);
      }
    } else {
      // ----------------------------- add_ingredients logic
      const addIng = {};
      addIng.ingredient_id = ing.ingredientId;
      addIng.ingredient_source = ing.ingredientSource;
      addIng.quantity = ing.quantity;
      addIng.unit_id = ing.unitId;
      addIng.component_display_order = ing.componentDisplayOrder;
      addIng.ingredient_display_order = ing.ingredientDisplayOrder;
      if (
        ing.displayPrice !== ing.ogBasePrice ||
        ing.displayUnit !== ing.ogBaseUnit ||
        ing.displayQuantity !== ing.ogBaseQuantity
      ) {
        addIng.base_price = ing.displayPrice;
        addIng.base_quantity = ing.displayQuantity;
        addIng.base_unit = ing.displayUnit;
      }

      if (ing.recipeComponentId) {
        addIng.recipe_component_id = ing.recipeComponentId;
      }

      finalDataToSent.add_ingredients.push(addIng);
    }
  });

  // -------------------------------------------------  Steps ---------------------------------------------------------------
  finalDataToSent.add_steps = [];
  finalDataToSent.update_steps = [];
  finalDataToSent.remove_steps = [];

  // get remove_steps values by comparing
  const pi = steps.filter((s) => s.procedure_id).map((step) => step.procedure_id);
  const OgPi = OgSteps.filter((s) => s.procedure_id).map((step) => step.procedure_id);
  const removeArrayStep = OgPi.filter((id) => !pi.includes(id));
  removeArrayStep.forEach((value) => {
    const obj = {};
    obj.procedure_id = value;
    finalDataToSent.remove_steps.push(obj);
  });

  // get add_components and update_components values by comparing OgData and newData(recipeInfo)
  steps.forEach((step) => {
    if (step.procedure_id) {
      // update_steps data
      const OgStep = OgSteps.find((s) => s.procedure_id === step.procedure_id);
      const updtStep = {};
      if (step.step_order !== OgStep.step_order) {
        updtStep.procedure_id = step.procedure_id;
        updtStep.step_order = step.step_order;
      }
      if (step.step_text !== OgStep.step_text) {
        updtStep.procedure_id = step.procedure_id;
        updtStep.step_text = step.step_text;
      }
      if (Object.keys(updtStep).length !== 0) {
        finalDataToSent.update_steps.push(updtStep);
      }
    } else {
      // add_components logic
      const addStep = {};
      addStep.step_text = step.step_text;
      addStep.step_order = step.step_order;
      finalDataToSent.add_steps.push(addStep);
    }
  });

  return finalDataToSent;
}
