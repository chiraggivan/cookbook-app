export const readRecipeDetailsQ = `SELECT 
            rc.recipe_component_id,
            rc.display_order as component_display_order,
            rc.component_text,
            ri.display_order as ingredient_display_order,
            COALESCE(i.ingredient_id, ui.user_ingredient_id) as ingredient_id,
            COALESCE(i.name, ui.name) as name,
            ri.recipe_ingredient_id,
            ri.quantity,
            ri.ingredient_source,
            ui.submitted_by as ingredient_by,
            u.unit_id,
            u.unit_name,
            ri.quantity * COALESCE(ui.base_price, COALESCE(up.custom_price, i.default_price))  * u.conversion_factor AS price,
            COALESCE(ui.display_quantity, COALESCE(up.display_quantity, i.display_quantity)) as base_quantity,
            COALESCE(ui.display_price, COALESCE(up.display_price, i.display_price)) AS cost,
            COALESCE(ui.display_unit, COALESCE(up.display_unit, i.display_unit)) AS unit
        FROM recipe_ingredients ri 
        LEFT JOIN recipe_components rc ON rc.recipe_component_id = ri.component_id
        LEFT JOIN ingredients i ON ri.ingredient_id = i.ingredient_id AND ri.ingredient_source = 'main'
        LEFT JOIN user_ingredients ui ON ui.user_ingredient_id = ri.ingredient_id AND ri.ingredient_source = 'user'
        JOIN units u ON ri.unit_id = u.unit_id
        LEFT JOIN user_prices up ON up.user_id = ? 
            AND up.ingredient_id = i.ingredient_id 
            AND up.is_active = TRUE
        WHERE ri.recipe_id = ?
        AND ri.is_active = TRUE
        ORDER BY rc.display_order, ri.display_order`;
