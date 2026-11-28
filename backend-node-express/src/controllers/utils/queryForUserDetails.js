queryForUserDetailsForToken = `
    SELECT u.user_id, u.username, u.display_name, u.password, u.picture_url, u.email, u.email_verified, u.is_active,
    u.role, u.country_id , u.preferred_ingredient_language_id as pil_id, 
    l.name as ing_lang, l.native_script as ing_native_lang,
    c.name as country_name, c.currency_id, cu.symbol as currency_symbol
    FROM users u 
        JOIN countries c ON u.country_id = c.country_id
        JOIN currencies cu ON cu.currency_id = c.currency_id
        JOIN languages l ON l.language_id = u.preferred_ingredient_language_id
`;

module.exports = { queryForUserDetailsForToken };
