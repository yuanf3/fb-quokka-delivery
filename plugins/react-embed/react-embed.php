<?php
/**
 * Plugin Name: React Embed
 * Description: Embeds a React App in a page using a shortcode
 * Version: 0.0.2
 * Author: A quokka
 */

if (!defined('ABSPATH')) {
    die('Direct script access disallowed.');
}
 
function react_shortcode() {
    // get username and hash of current logged in user
    // to be used within the react app to get a JWT token
    $user_id = get_current_user_id();
    $user_data = get_userdata($user_id);
    // alternatively: $user_data = wp_get_current_user();
    if ($user_data) {
        $username = $user_data->user_login;
        $hash = $user_data->user_pass;
    }

    $properties = array(
        'username' => $username,
        'hash' => $hash,
        'admin' => current_user_can('administrator'),
    );

    // entry point for the react application
    return '<div id="react-app-embed" properties="' . esc_attr(wp_json_encode($properties)) . '"></div>';
}
 
add_shortcode('react-app-embed', 'react_shortcode');
 
function react_load_assets() {
    // load JS and CSS
    $reactScript  = plugin_dir_url(__FILE__) . 'build/static/js/main.js';
    $reactStyle = plugin_dir_url(__FILE__) . 'build/static/css/main.css';

    $version = (get_file_data( __FILE__, ["Version" => "Version"], false ))['Version'];

    // enqueue JS and CSS
    wp_enqueue_script('react-app-embed', $reactScript, array(), $version, true);         
    wp_enqueue_style('react-app-embed', $reactStyle, array(), $version);
}
 
add_action('wp_enqueue_scripts', 'react_load_assets');