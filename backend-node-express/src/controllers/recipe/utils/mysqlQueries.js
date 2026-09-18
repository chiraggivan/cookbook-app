export const readRecipeDetailsQ = `
        SELECT 
            rc.recipe_component_id,
            rc.display_order as component_display_order,
            rc.component_text,
            ri.display_order as ingredient_display_order,
            COALESCE(i.ingredient_id, ui.user_ingredient_id) as ingredient_id,
            COALESCE(i.name, ui.name) as name,
            COALESCE(i.form, '') as form,
            ri.recipe_ingredient_id,
            ri.quantity,
            ri.ingredient_source,
            ui.submitted_by as ingredient_by,
            u.unit_id,
            u.unit_name,
            CASE WHEN ui.base_price IS NOT NULL THEN 
                CASE 
                    WHEN ui.country_id = u2.country_id THEN
                        ui.base_price * u.conversion_factor * ri.quantity
                    WHEN ui.country_id != u2.country_id AND ui.country_id = 182 THEN
                        ui.base_price * crncy.gbp_conversion_rate * u.conversion_factor * ri.quantity
                    WHEN ui.country_id != u2.country_id AND ui.country_id != 182 THEN
                        ui.base_price/crncy2.gbp_conversion_rate * crncy.gbp_conversion_rate * u.conversion_factor * ri.quantity
                END
            ELSE
                COALESCE(up.custom_price, COALESCE(ip.default_price, i.default_price * crncy.gbp_conversion_rate))  * u.conversion_factor * ri.quantity
            END AS price,
            COALESCE(ui.display_quantity, COALESCE(up.display_quantity,COALESCE(ip.display_quantity ,i.display_quantity))) as base_quantity,
            CASE WHEN ui.display_price IS NOT NULL THEN 
                CASE 
                    WHEN ui.country_id = u2.country_id THEN
                        ui.display_price 
                    WHEN ui.country_id != u2.country_id AND ui.country_id = 182 THEN
                        ui.display_price * crncy.gbp_conversion_rate
                    WHEN ui.country_id != u2.country_id AND ui.country_id != 182 THEN
                        ui.display_price/crncy2.gbp_conversion_rate * crncy.gbp_conversion_rate
                END
            ELSE
                COALESCE(up.display_price, COALESCE(ip.display_price ,i.display_price * crncy.gbp_conversion_rate))
            END AS cost,
            COALESCE(ui.display_unit, COALESCE(up.display_unit,COALESCE(ip.display_unit, i.display_unit))) AS unit
        FROM recipe_ingredients ri 
        LEFT JOIN recipe_components rc ON rc.recipe_component_id = ri.component_id
        LEFT JOIN recipes r ON r.recipe_id = rc.recipe_id
        LEFT JOIN users u2 ON u2.user_id = ?
        LEFT JOIN countries cntry ON cntry.country_id = u2.country_id 
        LEFT JOIN currencies crncy  ON crncy.currency_id = cntry.currency_id 
        LEFT JOIN ingredients i ON ri.ingredient_id = i.ingredient_id AND ri.ingredient_source = 'main'
        LEFT JOIN user_ingredients ui ON ui.user_ingredient_id = ri.ingredient_id AND ri.ingredient_source = 'user'
        LEFT JOIN ingredient_prices ip ON ip.ingredient_id = i.ingredient_id AND ip.country_id = u2.country_id 
        JOIN units u ON ri.unit_id = u.unit_id
        LEFT JOIN user_prices up ON up.user_id = ?
            AND up.ingredient_id = i.ingredient_id 
            AND up.country_id  = u2.country_id 
            AND up.is_active = TRUE
        LEFT JOIN countries cntry2 ON cntry2.country_id = ui.country_id
        LEFT JOIN currencies crncy2 ON crncy2.currency_id  = cntry2.currency_id 
        WHERE ri.recipe_id = ?
        AND ri.is_active = TRUE
        ORDER BY rc.display_order, ri.display_order`;

// export const readRecipeDetailsQ = `SELECT
//             rc.recipe_component_id,
//             rc.display_order as component_display_order,
//             rc.component_text,
//             ri.display_order as ingredient_display_order,
//             COALESCE(i.ingredient_id, ui.user_ingredient_id) as ingredient_id,
//             COALESCE(i.name, ui.name) as name,
//             COALESCE(i.form, '') as form,
//             ri.recipe_ingredient_id,
//             ri.quantity,
//             ri.ingredient_source,
//             ui.submitted_by as ingredient_by,
//             u.unit_id,
//             u.unit_name,
//             ri.quantity * COALESCE(ui.base_price, COALESCE(up.custom_price, COALESCE(ip.default_price, i.default_price * c2.gbp_conversion_rate)))  * u.conversion_factor AS price,
//             COALESCE(ui.display_quantity, COALESCE(up.display_quantity,COALESCE(ip.display_quantity ,i.display_quantity))) as base_quantity,
//             COALESCE(ui.display_price, COALESCE(up.display_price, COALESCE(ip.display_price ,i.display_price * c2.gbp_conversion_rate))) AS cost,
//             COALESCE(ui.display_unit, COALESCE(up.display_unit,COALESCE(ip.display_unit, i.display_unit))) AS unit
//         FROM recipe_ingredients ri
//         LEFT JOIN recipe_components rc ON rc.recipe_component_id = ri.component_id
//         LEFT JOIN recipes r ON r.recipe_id = rc.recipe_id
//         LEFT JOIN users u2 ON u2.user_id = ?
//         LEFT JOIN countries c ON c.country_id = u2.country_id
//         LEFT JOIN currencies c2  ON c2.currency_id = c.currency_id
//         LEFT JOIN ingredients i ON ri.ingredient_id = i.ingredient_id AND ri.ingredient_source = 'main'
//         LEFT JOIN user_ingredients ui ON ui.user_ingredient_id = ri.ingredient_id AND ri.ingredient_source = 'user'
//         LEFT JOIN ingredient_prices ip ON ip.ingredient_id = i.ingredient_id AND ip.country_id = u2.country_id
//         JOIN units u ON ri.unit_id = u.unit_id
//         LEFT JOIN user_prices up ON up.user_id = ?
//             AND up.ingredient_id = i.ingredient_id
//             AND up.country_id  = u2.country_id
//             AND up.is_active = TRUE
//         WHERE ri.recipe_id = ?
//         AND ri.is_active = TRUE
//         ORDER BY rc.display_order, ri.display_order`;

// export const readRecipeDetailsQ = `SELECT
//             rc.recipe_component_id,
//             rc.display_order as component_display_order,
//             rc.component_text,
//             ri.display_order as ingredient_display_order,
//             COALESCE(i.ingredient_id, ui.user_ingredient_id) as ingredient_id,
//             COALESCE(i.name, ui.name) as name,
//             COALESCE(i.form, '') as form,
//             ri.recipe_ingredient_id,
//             ri.quantity,
//             ri.ingredient_source,
//             ui.submitted_by as ingredient_by,
//             u.unit_id,
//             u.unit_name,
//             ri.quantity * COALESCE(ui.base_price, COALESCE(up.custom_price, i.default_price))  * u.conversion_factor AS price,
//             COALESCE(ui.display_quantity, COALESCE(up.display_quantity, i.display_quantity)) as base_quantity,
//             COALESCE(ui.display_price, COALESCE(up.display_price, i.display_price)) AS cost,
//             COALESCE(ui.display_unit, COALESCE(up.display_unit, i.display_unit)) AS unit
//         FROM recipe_ingredients ri
//         LEFT JOIN recipe_components rc ON rc.recipe_component_id = ri.component_id
//         LEFT JOIN ingredients i ON ri.ingredient_id = i.ingredient_id AND ri.ingredient_source = 'main'
//         LEFT JOIN user_ingredients ui ON ui.user_ingredient_id = ri.ingredient_id AND ri.ingredient_source = 'user'
//         JOIN units u ON ri.unit_id = u.unit_id
//         LEFT JOIN user_prices up ON up.user_id = ?
//             AND up.ingredient_id = i.ingredient_id
//             AND up.is_active = TRUE
//         WHERE ri.recipe_id = ?
//         AND ri.is_active = TRUE
//         ORDER BY rc.display_order, ri.display_order`;
