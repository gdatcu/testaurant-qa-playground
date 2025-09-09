<?php
return [
    'db_host' => getenv('DB_HOST') ?: '<<localhost>>',
    'db_name' => getenv('DB_NAME') ?: '<<testaurantqa>>',
    'db_user' => getenv('DB_USER') ?: '<<testaurantuser>>',
    'db_pass' => getenv('DB_PASS') ?: '<<db_password>>',
    'admin_api_key' => getenv('ADMIN_API_KEY') ?: 'changeme-admin-key',
    'allow_origin' => getenv('ALLOW_ORIGIN') ?: '*',
    'delivery_fee' => 12.00,
    'base_currency' => 'RON',
    'supported_currencies' => ['RON','EUR','USD'],
];



