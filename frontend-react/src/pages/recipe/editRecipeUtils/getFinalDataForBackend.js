export function getFinalDataForBackend(recipeInfo, OgData) {
  const finalDataToSent = {};
  const recipe = recipeInfo.recipe || {};
  const OgRecipe = OgData.recipe || {};
  const components = recipeInfo.components || [];
  const OgComponents = OgData.components || [];
  const steps = recipeInfo.steps || [];
  const OgSteps = OgData.steps || [];

  //   const ingredients = [];
  //   components.forEach((comp) => {
  //     ingredients.push(...comp.ingredients);
  //   });

  const ingredients = components.flatMap((comp) => comp.ingredients);

  console.log("ingredients :", ingredients);
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

  console.log("final recipeInfo :", recipeInfo);
  components.forEach((comp) => {
    if (comp.recipeComponentId) {
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
      finalDataToSent.update_components.push(updtComp);
    } else {
      // add_components logic
      const addComp = {};
      addComp.component_text = comp.componentText;
      addComp.component_display_order = comp.componentDisplayOrder;
      finalDataToSent.add_components.push(addComp);
    }
  });
  return finalDataToSent;
}
